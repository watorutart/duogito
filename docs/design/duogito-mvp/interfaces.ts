// ====================
// Core Domain Types
// ====================

/**
 * ユーザーの基本情報
 */
export interface User {
  username: string;
  displayName?: string;
  avatarUrl?: string;
  publicRepos: number;
  followers: number;
  following: number;
  createdAt: Date;
}

/**
 * GitHub Contribution データ
 */
export interface ContributionDay {
  date: string; // YYYY-MM-DD format
  contributionCount: number;
  contributionLevel: 0 | 1 | 2 | 3 | 4; // GitHub's contribution levels
}

/**
 * 連続記録の結果
 */
export interface ContributionStreak {
  currentStreak: number;
  currentStreakStartDate: string | null;
  currentStreakEndDate: string | null;
  longestStreak: number;
  longestStreakStartDate: string | null;
  longestStreakEndDate: string | null;
  totalContributions: number;
  lastContributionDate: string | null;
  achievementMessages: string[];
}

/**
 * アプリケーション設定
 */
export interface DuogitoConfig {
  username: string;
  personalAccessToken?: string;
  displayOptions: DisplayOptions;
  cacheOptions: CacheOptions;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * 表示オプション
 */
export interface DisplayOptions {
  showLongestStreak: boolean;
  showTotalContributions: boolean;
  showAchievements: boolean;
  language: 'ja' | 'en';
  colorScheme: 'auto' | 'light' | 'dark';
  dateFormat: 'YYYY-MM-DD' | 'MM/DD/YYYY' | 'DD/MM/YYYY';
}

/**
 * キャッシュオプション
 */
export interface CacheOptions {
  enabled: boolean;
  ttlMinutes: number; // Time to live in minutes
  maxSize: number; // Maximum cache size in MB
}

// ====================
// API Response Types
// ====================

/**
 * 標準APIレスポンス
 */
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: ApiError;
  metadata?: ResponseMetadata;
}

/**
 * APIエラー情報
 */
export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, any>;
  timestamp: string;
}

/**
 * レスポンスメタデータ
 */
export interface ResponseMetadata {
  requestId: string;
  timestamp: string;
  duration: number; // milliseconds
  rateLimit?: RateLimitInfo;
}

/**
 * レート制限情報
 */
export interface RateLimitInfo {
  limit: number;
  remaining: number;
  resetTime: Date;
}

// ====================
// GitHub API Types
// ====================

/**
 * GitHub API ユーザー情報レスポンス
 */
export interface GitHubUserResponse {
  login: string;
  id: number;
  node_id: string;
  avatar_url: string;
  gravatar_id: string | null;
  url: string;
  html_url: string;
  name: string | null;
  company: string | null;
  blog: string | null;
  location: string | null;
  email: string | null;
  bio: string | null;
  public_repos: number;
  public_gists: number;
  followers: number;
  following: number;
  created_at: string;
  updated_at: string;
}

/**
 * GitHub Contributions Collection (GraphQL)
 */
export interface GitHubContributionsCollection {
  totalCommitContributions: number;
  restrictedContributionsCount: number;
  contributionCalendar: {
    totalContributions: number;
    weeks: Array<{
      firstDay: string;
      contributionDays: Array<{
        date: string;
        contributionCount: number;
        contributionLevel: 'NONE' | 'FIRST_QUARTILE' | 'SECOND_QUARTILE' | 'THIRD_QUARTILE' | 'FOURTH_QUARTILE';
      }>;
    }>;
  };
}

// ====================
// CLI Command Types
// ====================

/**
 * CLIコマンドオプション
 */
export interface CliOptions {
  username?: string;
  token?: string;
  verbose?: boolean;
  json?: boolean;
  noCache?: boolean;
  config?: string; // config file path
}

/**
 * CLIコマンド結果
 */
export interface CliResult {
  success: boolean;
  output: string;
  exitCode: number;
  error?: string;
}

// ====================
// Cache Types
// ====================

/**
 * キャッシュエントリ
 */
export interface CacheEntry<T = any> {
  key: string;
  data: T;
  createdAt: Date;
  expiresAt: Date;
  accessCount: number;
  lastAccessedAt: Date;
}

/**
 * キャッシュ統計
 */
export interface CacheStats {
  totalEntries: number;
  totalSize: number; // bytes
  hitRate: number; // percentage
  totalHits: number;
  totalMisses: number;
}

// ====================
// Event Types
// ====================

/**
 * アプリケーションイベント
 */
export type DuogitoEvent = 
  | UserConfigUpdatedEvent
  | StreakCalculatedEvent
  | CacheUpdatedEvent
  | ErrorOccurredEvent;

export interface UserConfigUpdatedEvent {
  type: 'user_config_updated';
  timestamp: Date;
  previousConfig: Partial<DuogitoConfig>;
  newConfig: DuogitoConfig;
}

export interface StreakCalculatedEvent {
  type: 'streak_calculated';
  timestamp: Date;
  username: string;
  streak: ContributionStreak;
  calculationDuration: number;
}

export interface CacheUpdatedEvent {
  type: 'cache_updated';
  timestamp: Date;
  key: string;
  operation: 'set' | 'delete' | 'clear';
}

export interface ErrorOccurredEvent {
  type: 'error_occurred';
  timestamp: Date;
  error: ApiError;
  context: Record<string, any>;
}

// ====================
// Utility Types
// ====================

/**
 * 日付範囲
 */
export interface DateRange {
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
}

/**
 * ページネーション情報
 */
export interface Pagination {
  page: number;
  limit: number;
  total: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

/**
 * ソート情報
 */
export interface SortOptions {
  field: string;
  direction: 'asc' | 'desc';
}

// ====================
// Feature Flags
// ====================

/**
 * 機能フラグ
 */
export interface FeatureFlags {
  enableWebUI: boolean;
  enableCache: boolean;
  enableAnalytics: boolean;
  enableNotifications: boolean;
  enableGraphQLAPI: boolean;
  debugMode: boolean;
}

// ====================
// Web UI Types (Future)
// ====================

/**
 * Web UI コンポーネントプロパティ
 */
export interface StreakDisplayProps {
  streak: ContributionStreak;
  user: User;
  loading?: boolean;
  error?: string;
  onRefresh?: () => void;
}

export interface ConfigFormProps {
  config: DuogitoConfig;
  onSave: (config: DuogitoConfig) => void;
  onCancel: () => void;
  loading?: boolean;
}

/**
 * Web UI の状態管理
 */
export interface AppState {
  user: User | null;
  streak: ContributionStreak | null;
  config: DuogitoConfig | null;
  loading: boolean;
  error: string | null;
}

export type AppAction = 
  | { type: 'SET_USER'; payload: User }
  | { type: 'SET_STREAK'; payload: ContributionStreak }
  | { type: 'SET_CONFIG'; payload: DuogitoConfig }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'RESET_STATE' };

// ====================
// Service Interface Types
// ====================

/**
 * GitHub API サービスインターフェース
 */
export interface GitHubService {
  getUserInfo(username: string): Promise<User>;
  getContributions(username: string, dateRange?: DateRange): Promise<ContributionDay[]>;
  validateToken(token: string): Promise<boolean>;
  getRateLimit(): Promise<RateLimitInfo>;
}

/**
 * 連続記録計算サービスインターフェース
 */
export interface StreakCalculatorService {
  calculateStreak(contributions: ContributionDay[]): ContributionStreak;
  getAchievementMessages(streak: ContributionStreak): string[];
}

/**
 * 設定管理サービスインターフェース
 */
export interface ConfigService {
  loadConfig(): Promise<DuogitoConfig | null>;
  saveConfig(config: DuogitoConfig): Promise<void>;
  resetConfig(): Promise<void>;
  validateConfig(config: Partial<DuogitoConfig>): boolean;
}

/**
 * キャッシュサービスインターフェース
 */
export interface CacheService {
  get<T>(key: string): Promise<T | null>;
  set<T>(key: string, data: T, ttlMinutes?: number): Promise<void>;
  delete(key: string): Promise<boolean>;
  clear(): Promise<void>;
  getStats(): Promise<CacheStats>;
}