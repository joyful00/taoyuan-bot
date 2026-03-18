import { TaskManager } from "./utils/taskManager";
import { logger } from "./utils/logger";
import { configStore } from "./store/config"; // 👈 引入全局配置中心

let scanInterval: ReturnType<typeof setInterval> | null = null;
let isMining = false;

// ==========================================
// 核心黑客工具：骇入 Pinia 数据库
// ==========================================
function crackPinia(): any[] | null {
  let vueApp: any = null;
  for (const el of Array.from(document.querySelectorAll("*"))) {
    if ((el as any).__vue_app__) {
      vueApp = (el as any).__vue_app__;
      break;
    }
  }
  if (!vueApp) return null;

  const provides = vueApp._context?.provides;
  if (!provides) return null;

  let pinia: any = null;
  for (const sym of Object.getOwnPropertySymbols(provides)) {
    const instance = provides[sym];
    if (instance && instance._s && instance._s instanceof Map) {
      pinia = instance;
      break;
    }
  }
  if (!pinia) return null;

  const miningStore = pinia._s.get("mining");
  if (!miningStore) return null;

  return miningStore.floorGrid;
}

// ==========================================
// 渲染引擎：给方块强制染色
// ==========================================
function renderXRay() {
  // 🌟 动态开关检查：如果面板里关了透视，立刻停止后续渲染
  if (!configStore.data.settings.xrayEnabled) return;

  const floorGrid = crackPinia();
  if (!floorGrid || floorGrid.length !== 36) return;

  const gridDiv = document.querySelector<HTMLElement>(".grid.grid-cols-6");
  if (!gridDiv) return;

  const buttons = gridDiv.querySelectorAll<HTMLButtonElement>("button");
  if (buttons.length !== 36) return;

  buttons.forEach((btn, index) => {
    const tile = floorGrid[index];

    // 已经点开的，跳过渲染
    if (tile.revealed) return;

    const type = tile.type || "unknown";

    // 🛡️ 核心性能优化：防重复渲染锁
    if (btn.dataset.xray === type) return;
    btn.dataset.xray = type;

    // 开始染色
    switch (type) {
      case "monster":
      case "boss":
        btn.style.border = "1px solid rgba(239, 68, 68, 0.4)";
        btn.style.backgroundColor = "rgba(239, 68, 68, 0.08)";
        btn.style.color = "rgba(239, 68, 68, 0.8)";
        btn.innerText = "👿";
        break;
      case "trap":
        btn.style.border = "1px solid rgba(168, 85, 247, 0.4)";
        btn.style.backgroundColor = "rgba(168, 85, 247, 0.08)";
        btn.innerText = "💣";
        break;
      case "exit":
      case "stairs":
        btn.style.border = "1px solid rgba(16, 185, 129, 0.5)";
        btn.style.backgroundColor = "rgba(16, 185, 129, 0.1)";
        btn.innerText = "🚪";
        break;
      case "treasure":
      case "item":
      case "ore":
        btn.style.border = "1px solid rgba(245, 158, 11, 0.4)";
        btn.style.backgroundColor = "rgba(245, 158, 11, 0.1)";
        btn.innerText = "💎";
        break;
      case "empty":
        // 🌟 优化：空的格子什么都不标，保持游戏原样！
        // 清空可能由于 DOM 复用残留的内联样式和文字
        btn.style.border = "";
        btn.style.backgroundColor = "";
        btn.style.opacity = "";
        btn.innerText = "";
        break;
      default:
        btn.style.opacity = "0.4";
        btn.style.fontSize = "10px";
        btn.innerText = type;
        break;
    }
  });
}

// ==========================================
// 模块入口：侦测矿洞面板并控制雷达启停
// ==========================================
function setupXRayRadar() {
  // 如果玩家全局关了透视，不需要挂载观察者
  if (!configStore.data.settings.xrayEnabled) return;

  logger.info("👁️ [矿洞模块] 上帝之眼雷达已部署，等待下井...");

  TaskManager.addObserver(
    document.body,
    { childList: true, subtree: true },
    () => {
      const gridDiv = document.querySelector(".grid.grid-cols-6");

      // 面板打开，且引擎未运行，且总开关处于开启状态
      if (gridDiv && !isMining && configStore.data.settings.xrayEnabled) {
        logger.success("👁️ 进入矿洞层！上帝之眼启动！");
        isMining = true;
        renderXRay(); // 立即渲染一次

        // 开启高频扫描
        if (scanInterval) clearInterval(scanInterval);
        scanInterval = setInterval(renderXRay, 500);
      }
      // 离开矿洞，或者中途玩家在控制面板关掉了透视开关
      else if (
        (!gridDiv || !configStore.data.settings.xrayEnabled) &&
        isMining
      ) {
        logger.info("🛑 离开矿洞层或已手动关闭雷达，透视休眠。");
        isMining = false;
        if (scanInterval) {
          clearInterval(scanInterval);
          scanInterval = null;
        }
      }
    },
  );
}

// 暴露给主路由
export default function doMineWork() {
  setupXRayRadar();
}
