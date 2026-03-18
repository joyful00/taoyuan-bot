// src/utils/logger.ts

const IS_DEBUG = true;

export const logger = {
  info: (msg: string, ...args: any[]) => {
    if (!IS_DEBUG) return;
    console.log(`%c[桃源助手] ${msg}`, "color: #3b82f6;", ...args);
  },

  success: (msg: string, ...args: any[]) => {
    if (!IS_DEBUG) return;
    console.log(
      `%c[桃源助手] ✨ ${msg}`,
      "color: #10b981; font-weight: bold;",
      ...args
    );
  },

  warn: (msg: string, ...args: any[]) => {
    if (!IS_DEBUG) return;
    console.warn(`[桃源助手] ⚠️ ${msg}`, ...args);
  },

  error: (msg: string, ...args: any[]) => {
    // Error 级别通常保留，哪怕是生产环境也需要知道哪里崩了
    console.error(`[桃源助手] ❌ ${msg}`, ...args);
  },
};
