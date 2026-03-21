import doFarmWork from "./farm";
import doShopWork from "./shop";
import doVillageWork from "./village";
import doMineWork from "./mine";
import { setupAutoFishing } from "./fishing";
import { autoEquipByVirtualWardrobe } from "./autoEquip";
import { TaskManager } from "./utils/taskManager";
import { runtimeStore, watchRuntime } from "./store/runtime"; // 引入你手搓的响应式引擎
import { configStore } from "./store/config"; // 引入配置中心
import { logger } from "./utils/logger";
import { initPanel } from "./ui/panel";
import { setupAlmanacObserver } from "./almanac";
// ==========================================
// 1. 响应式调度中心 (只负责对状态变化做出反应)
// ==========================================
watchRuntime((key, newValue) => {
  if (key === "currentMap") {
    const currentPath = newValue as string;

    // 1. 换装引擎 (内部已自动读取 configStore 里的方案)
    if (configStore.data.settings.autoEquipEnabled) {
      autoEquipByVirtualWardrobe(currentPath);
      logger.info("✅ 智能换装已启动，当前穿着已更新。");
    } else {
      logger.info("👔 智能换装已关闭，保留当前穿着。");
    }

    // 2. 清理上一个地图的残留任务，防止内存泄漏和串图报错
    TaskManager.clearAll();

    // 3. 延迟 500ms，等待 Vue 完全挂载当前地图的 DOM
    setTimeout(() => {
      if (currentPath.includes("/village")) {
        doVillageWork();
      } else if (currentPath.includes("/farm")) {
        doFarmWork();
      } else if (currentPath.includes("/shop")) {
        doShopWork();
      } else if (currentPath.includes("/fishing")) {
        // 读取本地设置，判断玩家是否开启了自动钓鱼
        if (configStore.data.settings.autoFishEnabled) {
          logger.success("🎣 检测到进入钓鱼场，自动钓鱼模块启动！");
          setupAutoFishing();
        } else {
          logger.info("🎣 进入钓鱼场，已读取到设置：自动钓鱼处于关闭状态。");
        }
      } else if (
        currentPath.includes("/mining") ||
        currentPath.includes("/mine")
      ) {
        // 矿洞的透视开关逻辑，可以传参给 doMineWork，或者在 doMineWork 内部读取 configStore
        doMineWork();
      }
    }, 500);
  }
});

// ==========================================
// 2. 纯粹的路由拦截器 (只负责改状态，绝对不干活)
// ==========================================
function hijackGameRouter() {
  // 兼容 Hash 路由和 History 路由
  const getCurrentPath = () => window.location.hash || window.location.pathname;

  // 1. 劫持 pushState (通常用于点击跳转)
  const originalPushState = history.pushState;
  history.pushState = function (...args: any[]) {
    originalPushState.apply(this, args as any);
    runtimeStore.currentMap = getCurrentPath();
  };

  // 2. 劫持 replaceState (Vue Router 常用，比如重定向)
  const originalReplaceState = history.replaceState;
  history.replaceState = function (...args: any[]) {
    originalReplaceState.apply(this, args as any);
    runtimeStore.currentMap = getCurrentPath();
  };

  // 3. 监听浏览器的前进/后退，以及纯 Hash 变化
  window.addEventListener("popstate", () => {
    runtimeStore.currentMap = getCurrentPath();
  });
  window.addEventListener("hashchange", () => {
    runtimeStore.currentMap = getCurrentPath();
  });

  // 4. 页面刚刷新时的首次派发
  runtimeStore.currentMap = getCurrentPath();
}

// ==========================================
// 3. 插件主入口
// ==========================================
function main() {
  logger.success("桃源助手启动！当前时间：" + new Date().toLocaleString());

  // 挂载 UI 可视化控制台
  initPanel();
  // 🌟 启动老黄历观测局
  setupAlmanacObserver();

  // 启动路由拦截引擎
  hijackGameRouter();
}

main();
