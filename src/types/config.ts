export interface Config {
  github?: {
    username?: string;
    token?: string;
  };
  display?: {
    language: 'ja' | 'en';
    colorOutput: boolean;
    format: 'text' | 'json';
  };
  cache?: {
    enabled: boolean;
    ttl: number; // minutes
  };
}

export const DEFAULT_CONFIG: Config = {
  display: {
    language: 'ja',
    colorOutput: true,
    format: 'text',
  },
  cache: {
    enabled: true,
    ttl: 60, // 60 minutes
  },
};
