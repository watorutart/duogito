-- ============================================================================
-- Duogito MVP データベーススキーマ
-- ============================================================================
-- Note: MVPでは主にローカルJSONファイルでの設定管理を想定していますが、
-- 将来的なWeb版やマルチユーザー対応のためのスキーマ設計です。

-- ============================================================================
-- ユーザー設定テーブル
-- ============================================================================

-- ユーザー設定（ローカル設定ファイルのスキーマ）
-- 実際にはJSONファイルとして保存: ~/.duogito/config.json
CREATE TABLE IF NOT EXISTS user_configs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username VARCHAR(255) NOT NULL UNIQUE,
    personal_access_token_encrypted TEXT, -- 暗号化されたPAT
    display_show_longest_streak BOOLEAN DEFAULT true,
    display_show_total_contributions BOOLEAN DEFAULT true,
    display_show_achievements BOOLEAN DEFAULT true,
    display_language VARCHAR(5) DEFAULT 'ja' CHECK (display_language IN ('ja', 'en')),
    display_color_scheme VARCHAR(10) DEFAULT 'auto' CHECK (display_color_scheme IN ('auto', 'light', 'dark')),
    display_date_format VARCHAR(20) DEFAULT 'YYYY-MM-DD',
    cache_enabled BOOLEAN DEFAULT true,
    cache_ttl_minutes INTEGER DEFAULT 30,
    cache_max_size_mb INTEGER DEFAULT 10,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- インデックス
CREATE INDEX IF NOT EXISTS idx_user_configs_username ON user_configs(username);
CREATE INDEX IF NOT EXISTS idx_user_configs_updated_at ON user_configs(updated_at);

-- ============================================================================
-- キャッシュテーブル（オプション機能）
-- ============================================================================

-- contribution データのキャッシュ
CREATE TABLE IF NOT EXISTS contribution_cache (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cache_key VARCHAR(255) NOT NULL UNIQUE, -- username:date_range のハッシュ
    username VARCHAR(255) NOT NULL,
    data_json JSONB NOT NULL, -- ContributionDay[] の配列
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP NOT NULL,
    access_count INTEGER DEFAULT 0,
    last_accessed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- インデックス
CREATE INDEX IF NOT EXISTS idx_contribution_cache_key ON contribution_cache(cache_key);
CREATE INDEX IF NOT EXISTS idx_contribution_cache_username ON contribution_cache(username);
CREATE INDEX IF NOT EXISTS idx_contribution_cache_expires_at ON contribution_cache(expires_at);

-- 期限切れキャッシュのクリーンアップ用インデックス
CREATE INDEX IF NOT EXISTS idx_contribution_cache_cleanup ON contribution_cache(expires_at) WHERE expires_at < CURRENT_TIMESTAMP;

-- ============================================================================
-- アプリケーションログテーブル（デバッグ・分析用）
-- ============================================================================

-- アプリケーションイベントログ
CREATE TABLE IF NOT EXISTS app_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_type VARCHAR(50) NOT NULL,
    username VARCHAR(255),
    event_data JSONB,
    error_code VARCHAR(50),
    error_message TEXT,
    duration_ms INTEGER,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- インデックス
CREATE INDEX IF NOT EXISTS idx_app_logs_event_type ON app_logs(event_type);
CREATE INDEX IF NOT EXISTS idx_app_logs_username ON app_logs(username);
CREATE INDEX IF NOT EXISTS idx_app_logs_timestamp ON app_logs(timestamp);
CREATE INDEX IF NOT EXISTS idx_app_logs_error_code ON app_logs(error_code) WHERE error_code IS NOT NULL;

-- ============================================================================
-- GitHub API レート制限追跡テーブル
-- ============================================================================

-- API使用状況とレート制限の追跡
CREATE TABLE IF NOT EXISTS api_usage (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username VARCHAR(255),
    api_endpoint VARCHAR(255) NOT NULL,
    method VARCHAR(10) NOT NULL,
    status_code INTEGER NOT NULL,
    rate_limit_remaining INTEGER,
    rate_limit_reset_at TIMESTAMP,
    response_time_ms INTEGER,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- インデックス
CREATE INDEX IF NOT EXISTS idx_api_usage_username ON api_usage(username);
CREATE INDEX IF NOT EXISTS idx_api_usage_endpoint ON api_usage(api_endpoint);
CREATE INDEX IF NOT EXISTS idx_api_usage_timestamp ON api_usage(timestamp);

-- ============================================================================
-- ユーザー統計テーブル（将来の分析用）
-- ============================================================================

-- ユーザーの利用統計
CREATE TABLE IF NOT EXISTS user_statistics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username VARCHAR(255) NOT NULL,
    total_checks INTEGER DEFAULT 0,
    last_check_at TIMESTAMP,
    current_streak_record INTEGER DEFAULT 0,
    longest_streak_record INTEGER DEFAULT 0,
    total_contributions_record INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(username)
);

-- インデックス
CREATE INDEX IF NOT EXISTS idx_user_statistics_username ON user_statistics(username);
CREATE INDEX IF NOT EXISTS idx_user_statistics_last_check ON user_statistics(last_check_at);

-- ============================================================================
-- トリガー（自動更新処理）
-- ============================================================================

-- user_configs の updated_at 自動更新
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_user_configs_updated_at 
    BEFORE UPDATE ON user_configs 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_statistics_updated_at 
    BEFORE UPDATE ON user_statistics 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- クリーンアップジョブ用関数
-- ============================================================================

-- 期限切れキャッシュのクリーンアップ
CREATE OR REPLACE FUNCTION cleanup_expired_cache()
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM contribution_cache 
    WHERE expires_at < CURRENT_TIMESTAMP;
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    
    INSERT INTO app_logs (event_type, event_data, timestamp)
    VALUES ('cache_cleanup', jsonb_build_object('deleted_count', deleted_count), CURRENT_TIMESTAMP);
    
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- 古いログのクリーンアップ（30日以上前）
CREATE OR REPLACE FUNCTION cleanup_old_logs()
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM app_logs 
    WHERE timestamp < CURRENT_TIMESTAMP - INTERVAL '30 days';
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    
    INSERT INTO app_logs (event_type, event_data, timestamp)
    VALUES ('log_cleanup', jsonb_build_object('deleted_count', deleted_count), CURRENT_TIMESTAMP);
    
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- 初期データ挿入
-- ============================================================================

-- デフォルト設定の例（開発用）
INSERT INTO user_configs (
    username,
    display_show_longest_streak,
    display_show_total_contributions,
    display_show_achievements,
    display_language,
    display_color_scheme,
    cache_enabled,
    cache_ttl_minutes
) VALUES (
    'example_user',
    true,
    true,
    true,
    'ja',
    'auto', 
    true,
    30
) ON CONFLICT (username) DO NOTHING;

-- ============================================================================
-- ローカルファイル設定のJSONスキーマ（参考）
-- ============================================================================

/*
実際のMVPでは以下のJSONファイル構造を使用します：
~/.duogito/config.json

{
  "username": "example_user",
  "personalAccessToken": "encrypted_token_here",
  "displayOptions": {
    "showLongestStreak": true,
    "showTotalContributions": true,
    "showAchievements": true,
    "language": "ja",
    "colorScheme": "auto",
    "dateFormat": "YYYY-MM-DD"
  },
  "cacheOptions": {
    "enabled": true,
    "ttlMinutes": 30,
    "maxSize": 10
  },
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
*/

-- ============================================================================
-- キャッシュファイル構造（参考）
-- ============================================================================

/*
~/.duogito/cache/{username}_{date_hash}.json

{
  "key": "username:2024-01-01:2024-12-31",
  "data": [
    {
      "date": "2024-01-01",
      "contributionCount": 5,
      "contributionLevel": 2
    }
  ],
  "createdAt": "2024-01-01T00:00:00.000Z",
  "expiresAt": "2024-01-01T00:30:00.000Z",
  "accessCount": 1,
  "lastAccessedAt": "2024-01-01T00:00:00.000Z"
}
*/