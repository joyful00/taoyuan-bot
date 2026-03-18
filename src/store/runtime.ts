// src/store/runtime.ts
import { logger } from "../utils/logger";

interface BaseStore {
  currentMap: string;
  isFishing: boolean; // 可以随时扩展其他运行时状态
}

const rawState: BaseStore = {
  currentMap: "",
  isFishing: false,
};

type Listener = (key: keyof BaseStore, newValue: any) => void;
const listeners: Listener[] = [];

// 导出响应式对象
export const runtimeStore = new Proxy(rawState, {
  set(target, property: keyof BaseStore, value, receiver) {
    if (target[property] === value) return true;

    Reflect.set(target, property, value, receiver);
    logger.info(`[运行时状态] ${property} 变更为:`, value);

    listeners.forEach((listener) => listener(property, value));

    return true;
  },
});

// 导出监听器注册函数
export function watchRuntime(callback: Listener) {
  listeners.push(callback);
}
