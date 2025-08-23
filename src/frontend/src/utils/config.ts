import config from '../config/clypr-config.json';

export interface TelegramConfig {
  botUsername: string;
  botName: string;
  botDescription: string;
  webhookUrl: string;
}

export interface AppConfig {
  canisterId: string;
  api: {
    baseUrl: string;
    identityProvider: string;
  };
  telegram: TelegramConfig;
  rateLimits: {
    perUser: number;
    perCanister: number;
    global: number;
    timeWindow: string;
  };
  contentTypes: string[];
  priorityLevels: Record<string, string>;
  metadata: {
    maxKeys: number;
    maxKeyLength: number;
    maxValueLength: number;
  };
  messageLimits: {
    titleMaxLength: number;
    bodyMaxLength: number;
    metadataMaxCount: number;
  };
}

export const appConfig: AppConfig = config as AppConfig;

export const getTelegramConfig = (): TelegramConfig => {
  return appConfig.telegram;
};

export const getTelegramBotUrl = (): string => {
  const { botUsername } = getTelegramConfig();
  return `https://t.me/${botUsername}`;
};

export const getTelegramBotStartUrl = (token: string): string => {
  const { botUsername } = getTelegramConfig();
  return `https://t.me/${botUsername}?start=${encodeURIComponent(token)}`;
};
