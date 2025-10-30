import { config } from "./config";

const levelPriority: Record<string, number> = {
  error: 0,
  warn: 1,
  info: 2,
  debug: 3
};

function shouldLog(level: keyof typeof levelPriority): boolean {
  const configured = (config.global.default_log_level || "info") as keyof typeof levelPriority;
  return levelPriority[level] <= levelPriority[configured];
}

export const logger = {
  info(message: string, meta?: unknown) {
    if (shouldLog("info")) {
      console.log(JSON.stringify({ level: "info", message, meta }));
    }
  },
  warn(message: string, meta?: unknown) {
    if (shouldLog("warn")) {
      console.warn(JSON.stringify({ level: "warn", message, meta }));
    }
  },
  error(message: string, meta?: unknown) {
    if (shouldLog("error")) {
      console.error(JSON.stringify({ level: "error", message, meta }));
    }
  },
  debug(message: string, meta?: unknown) {
    if (shouldLog("debug")) {
      console.debug(JSON.stringify({ level: "debug", message, meta }));
    }
  }
};
