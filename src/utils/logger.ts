import { createConsola } from "consola";

// 🌟 获取 Vite 原生生产环境标识
export const isProd = import.meta.env.PROD;

export const logger = createConsola({
  // 生产环境 = 2 (仅 Warn/Error)，开发环境 = 5 (全开)
  level: isProd ? 2 : 5,
  defaults: {
    tag: "桃源助手",
  },
});