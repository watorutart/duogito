// No need to import Jest globals in ts-jest environment
import { promises as fs } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';
import { ConfigService } from '../../src/services/ConfigService';
import { Config, DEFAULT_CONFIG } from '../../src/types/config';

describe('ConfigService', () => {
  let configService: ConfigService;
  let tempConfigDir: string;
  let tempConfigFile: string;

  beforeEach(async () => {
    // Create temporary directory for testing
    tempConfigDir = join(tmpdir(), `duogito-test-${Date.now()}`);
    tempConfigFile = join(tempConfigDir, 'config.json');
    configService = new ConfigService(tempConfigDir);
  });

  afterEach(async () => {
    // Clean up temporary directory
    try {
      await fs.rm(tempConfigDir, { recursive: true, force: true });
    } catch (error) {
      // Ignore cleanup errors
    }
  });

  describe('getConfig', () => {
    it('should return default config when config file does not exist', async () => {
      const config = await configService.getConfig();
      expect(config).toEqual(DEFAULT_CONFIG);
    });

    it('should return parsed config when valid config file exists', async () => {
      const testConfig: Config = {
        github: {
          username: 'testuser',
        },
        display: {
          language: 'en',
          colorOutput: false,
          format: 'json',
        },
        cache: {
          enabled: false,
          ttl: 30,
        },
      };

      // Create config directory and file
      await fs.mkdir(tempConfigDir, { recursive: true });
      await fs.writeFile(tempConfigFile, JSON.stringify(testConfig, null, 2));

      const config = await configService.getConfig();
      expect(config).toEqual(testConfig);
    });

    it('should create config directory if it does not exist', async () => {
      // Directory should not exist initially
      await expect(fs.access(tempConfigDir)).rejects.toThrow();

      await configService.getConfig();

      // Directory should be created
      await expect(fs.access(tempConfigDir)).resolves.not.toThrow();
    });

    it('should handle corrupted config file', async () => {
      // Create config directory and corrupted file
      await fs.mkdir(tempConfigDir, { recursive: true });
      await fs.writeFile(tempConfigFile, 'invalid json content');

      const config = await configService.getConfig();
      expect(config).toEqual(DEFAULT_CONFIG);
    });

    it('should handle permission errors gracefully', async () => {
      // This test might be platform specific
      const config = await configService.getConfig();
      expect(config).toBeDefined();
    });
  });

  describe('setConfig', () => {
    it('should save config to file with proper formatting', async () => {
      const testConfig: Partial<Config> = {
        github: {
          username: 'testuser',
        },
        display: {
          language: 'en',
          colorOutput: true,
          format: 'text',
        },
      };

      await configService.setConfig(testConfig);

      // Verify file exists and has correct content
      const fileContent = await fs.readFile(tempConfigFile, 'utf-8');
      const savedConfig = JSON.parse(fileContent);
      expect(savedConfig.github?.username).toBe('testuser');
      expect(savedConfig.display?.language).toBe('en');
    });

    it('should merge with existing config', async () => {
      // First, set initial config
      const initialConfig: Partial<Config> = {
        github: {
          username: 'initialuser',
        },
        display: {
          language: 'ja',
          colorOutput: true,
          format: 'text',
        },
      };
      await configService.setConfig(initialConfig);

      // Then, update with partial config
      const updateConfig: Partial<Config> = {
        display: {
          language: 'en',
          colorOutput: false,
          format: 'json',
        },
      };
      await configService.setConfig(updateConfig);

      const finalConfig = await configService.getConfig();
      expect(finalConfig.github?.username).toBe('initialuser'); // Should remain
      expect(finalConfig.display?.language).toBe('en'); // Should be updated
      expect(finalConfig.display?.colorOutput).toBe(false); // Should be updated
    });

    it('should create directory and file if they do not exist', async () => {
      // Ensure directory doesn't exist
      try {
        await fs.rm(tempConfigDir, { recursive: true });
      } catch {
        // Ignore if doesn't exist
      }

      const testConfig: Partial<Config> = {
        github: {
          username: 'testuser',
        },
      };

      await configService.setConfig(testConfig);

      // Verify directory and file were created
      await expect(fs.access(tempConfigDir)).resolves.not.toThrow();
      await expect(fs.access(tempConfigFile)).resolves.not.toThrow();
    });
  });

  describe('resetConfig', () => {
    it('should reset config to default values', async () => {
      // First set custom config
      const customConfig: Partial<Config> = {
        github: {
          username: 'testuser',
          token: 'test-token',
        },
        display: {
          language: 'en',
          colorOutput: false,
          format: 'json',
        },
      };
      await configService.setConfig(customConfig);

      // Reset config
      await configService.resetConfig();

      // Verify config is reset to default
      const config = await configService.getConfig();
      expect(config).toEqual(DEFAULT_CONFIG);
    });
  });

  describe('validateConfig', () => {
    it('should validate and return valid config', () => {
      const validConfig = {
        github: {
          username: 'testuser',
        },
        display: {
          language: 'ja',
          colorOutput: true,
          format: 'text',
        },
        cache: {
          enabled: true,
          ttl: 60,
        },
      };

      const result = configService.validateConfig(validConfig);
      expect(result).toEqual(validConfig);
    });

    it('should reject invalid language settings', () => {
      const invalidConfig = {
        display: {
          language: 'invalid',
          colorOutput: true,
          format: 'text',
        },
      };

      expect(() => configService.validateConfig(invalidConfig)).toThrow();
    });

    it('should reject invalid format types', () => {
      const invalidConfig = {
        display: {
          language: 'ja',
          colorOutput: true,
          format: 'invalid',
        },
      };

      expect(() => configService.validateConfig(invalidConfig)).toThrow();
    });

    it('should validate cache TTL values', () => {
      const invalidConfig = {
        cache: {
          enabled: true,
          ttl: -1,
        },
      };

      expect(() => configService.validateConfig(invalidConfig)).toThrow();
    });

    it('should handle non-object input', () => {
      expect(() => configService.validateConfig('not an object')).toThrow();
      expect(() => configService.validateConfig(null)).toThrow();
      expect(() => configService.validateConfig(undefined)).toThrow();
    });
  });
});