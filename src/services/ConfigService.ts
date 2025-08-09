import { promises as fs } from 'fs';
import { join } from 'path';
import { homedir } from 'os';
import { Config, DEFAULT_CONFIG } from '../types/config';
import { ConfigValidationError } from '../types/errors';

export class ConfigService {
  private configDir: string;
  private configFile: string;
  private cachedConfig: Config | null = null;

  constructor(customConfigDir?: string) {
    this.configDir = customConfigDir || join(homedir(), '.duogito');
    this.configFile = join(this.configDir, 'config.json');
  }

  async getConfig(): Promise<Config> {
    // Return cached config if available
    if (this.cachedConfig) {
      return { ...this.cachedConfig };
    }

    try {
      // Ensure config directory exists
      await this.ensureConfigDir();

      // Try to read config file
      const configContent = await fs.readFile(this.configFile, 'utf-8');
      const parsedConfig = JSON.parse(configContent);

      // Validate and cache config
      this.cachedConfig = this.validateConfig(parsedConfig);
      return { ...this.cachedConfig };
    } catch (error) {
      // If file doesn't exist or is corrupted, use and cache default config
      this.cachedConfig = { ...DEFAULT_CONFIG };
      return { ...this.cachedConfig };
    }
  }

  async setConfig(partialConfig: Partial<Config>): Promise<void> {
    // Ensure config directory exists
    await this.ensureConfigDir();

    // Get current config and merge with new values
    let currentConfig: Config;
    try {
      currentConfig = await this.getConfig();
    } catch {
      currentConfig = { ...DEFAULT_CONFIG };
    }

    // Deep merge configs
    const mergedConfig = this.mergeConfigs(currentConfig, partialConfig);

    // Validate merged config
    const validatedConfig = this.validateConfig(mergedConfig);

    // Update cache
    this.cachedConfig = validatedConfig;

    // Write to file
    await fs.writeFile(this.configFile, JSON.stringify(validatedConfig, null, 2));
  }

  async resetConfig(): Promise<void> {
    await this.ensureConfigDir();

    // Update cache
    this.cachedConfig = { ...DEFAULT_CONFIG };

    // Write to file
    await fs.writeFile(this.configFile, JSON.stringify(DEFAULT_CONFIG, null, 2));
  }

  validateConfig(config: unknown): Config {
    if (!config || typeof config !== 'object') {
      throw new ConfigValidationError('Config must be an object');
    }

    const configObj = config as Record<string, unknown>;

    // Start with default config and override with validated values
    const result: Config = {
      ...DEFAULT_CONFIG,
    };

    // Validate github config
    if ('github' in configObj && configObj['github']) {
      if (typeof configObj['github'] !== 'object' || configObj['github'] === null) {
        throw new ConfigValidationError('GitHub config must be an object');
      }
      const githubConfig = configObj['github'] as Record<string, unknown>;
      result.github = {};
      if ('username' in githubConfig && typeof githubConfig['username'] === 'string') {
        result.github.username = githubConfig['username'];
      }
      if ('token' in githubConfig && typeof githubConfig['token'] === 'string') {
        result.github.token = githubConfig['token'];
      }
    }

    // Validate display config
    if ('display' in configObj && configObj['display']) {
      if (typeof configObj['display'] !== 'object' || configObj['display'] === null) {
        throw new ConfigValidationError('Display config must be an object');
      }
      const displayConfig = configObj['display'] as Record<string, unknown>;

      if ('language' in displayConfig && displayConfig['language']) {
        if (!['ja', 'en'].includes(displayConfig['language'] as string)) {
          throw new ConfigValidationError('Language must be "ja" or "en"');
        }
        result.display!.language = displayConfig['language'] as 'ja' | 'en';
      }

      if ('colorOutput' in displayConfig && typeof displayConfig['colorOutput'] === 'boolean') {
        result.display!.colorOutput = displayConfig['colorOutput'];
      }

      if ('format' in displayConfig && displayConfig['format']) {
        if (!['text', 'json'].includes(displayConfig['format'] as string)) {
          throw new ConfigValidationError('Format must be "text" or "json"');
        }
        result.display!.format = displayConfig['format'] as 'text' | 'json';
      }
    }

    // Validate cache config
    if ('cache' in configObj && configObj['cache']) {
      if (typeof configObj['cache'] !== 'object' || configObj['cache'] === null) {
        throw new ConfigValidationError('Cache config must be an object');
      }
      const cacheConfig = configObj['cache'] as Record<string, unknown>;

      if ('enabled' in cacheConfig && typeof cacheConfig['enabled'] === 'boolean') {
        result.cache!.enabled = cacheConfig['enabled'];
      }

      if ('ttl' in cacheConfig && typeof cacheConfig['ttl'] === 'number') {
        if (cacheConfig['ttl'] < 0) {
          throw new ConfigValidationError('Cache TTL must be non-negative');
        }
        result.cache!.ttl = cacheConfig['ttl'];
      }
    }

    return result;
  }

  /**
   * Clear cached config (useful for testing or when config file changes externally)
   */
  clearCache(): void {
    this.cachedConfig = null;
  }

  /**
   * Get config file path for debugging purposes
   */
  getConfigPath(): string {
    return this.configFile;
  }

  private async ensureConfigDir(): Promise<void> {
    try {
      await fs.mkdir(this.configDir, { recursive: true });
    } catch (error) {
      // Directory already exists or permission error
      // We'll handle permission errors when trying to write files
    }
  }

  private mergeConfigs(current: Config, partial: Partial<Config>): Config {
    const result = { ...current };

    if (partial.github) {
      result.github = {
        ...current.github,
        ...partial.github,
      };
    }

    if (partial.display) {
      result.display = {
        ...current.display!,
        ...partial.display,
      };
    }

    if (partial.cache) {
      result.cache = {
        ...current.cache!,
        ...partial.cache,
      };
    }

    return result;
  }
}
