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
// 渲染引擎：给方块强制染色 (文本节点嗅探版)
// ==========================================
function renderXRay() {
  if (!configStore.data.settings.xrayEnabled) {
    document.querySelectorAll(".ty-xray-marker").forEach((el) => el.remove());
    return;
  }

  const floorGrid = crackPinia();
  if (!floorGrid || floorGrid.length !== 36) return;

  const gridDiv = document.querySelector<HTMLElement>(".grid.grid-cols-6");
  if (!gridDiv) return;

  const buttons = gridDiv.querySelectorAll<HTMLButtonElement>("button");
  if (buttons.length !== 36) return;

  buttons.forEach((btn, index) => {
    const tile = floorGrid[index];

    // 🌟 终极防伪嗅探：提取原版游戏渲染的【纯文本】
    // 我们过滤掉我们自己加的 span 图层，只看按钮本身的字
    let rawText = "";
    btn.childNodes.forEach((node) => {
      // Node.TEXT_NODE (值为 3) 代表纯文本节点
      if (node.nodeType === 3) {
        rawText += node.nodeValue?.trim() || "";
      }
    });

    // 🌟 多维联合判定：只要字不是 "?"，或者底层有死亡标记，统统判定为【已处理】！
    const isRevealed =
      tile.revealed ||
      tile.cleared ||
      tile.isDead ||
      tile.defeated ||
      (tile.hp !== undefined && tile.hp <= 0) ||
      (rawText !== "" && rawText !== "?"); // 👈 破局核心：游戏把它变成了 '·' 或 '×'

    let marker = btn.querySelector(".ty-xray-marker") as HTMLElement;

    // 如果格子被点开了，强制执行大扫除
    if (isRevealed) {
      if (marker) marker.remove();
      // 必须清空内联样式，消除残留的彩色边框和背景
      if (btn.dataset.xray) {
        btn.style.border = "";
        btn.style.backgroundColor = "";
        delete btn.dataset.xray;
      }
      return;
    }

    const type = tile.type || "unknown";

    if (btn.dataset.xray === type && marker) return;
    btn.dataset.xray = type;
    btn.style.position = "relative";

    if (!marker) {
      marker = document.createElement("span");
      marker.className = "ty-xray-marker";
      marker.style.cssText = `
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        pointer-events: none;
        z-index: 10;
        display: flex;
        align-items: center;
        justify-content: center;
        width: 100%;
        height: 100%;
        font-size: 16px;
      `;
      btn.appendChild(marker);
    }

    // 开始染色
    switch (type) {
      case "monster":
      case "boss":
        btn.style.border = "1px solid rgba(239, 68, 68, 0.4)";
        btn.style.backgroundColor = "rgba(239, 68, 68, 0.08)";
        marker.style.color = "rgba(239, 68, 68, 0.8)";
        marker.innerText = "👿";
        break;
      case "trap":
        btn.style.border = "1px solid rgba(168, 85, 247, 0.4)";
        btn.style.backgroundColor = "rgba(168, 85, 247, 0.08)";
        marker.innerText = "💣";
        break;
      case "exit":
      case "stairs":
        btn.style.border = "1px solid rgba(16, 185, 129, 0.5)";
        btn.style.backgroundColor = "rgba(16, 185, 129, 0.1)";
        marker.innerText = "🚪";
        break;
      case "mushroom":
        btn.style.border = "1px solid rgba(217, 70, 239, 0.4)"; // 骚气的粉紫色边框
        btn.style.backgroundColor = "rgba(217, 70, 239, 0.1)";
        marker.innerText = "🍄";
        break;
      case "treasure":
      case "item":
      case "ore":
        btn.style.border = "1px solid rgba(245, 158, 11, 0.4)";
        btn.style.backgroundColor = "rgba(245, 158, 11, 0.1)";
        marker.innerText = "💎";
        break;
      case "empty":
        btn.style.border = "";
        btn.style.backgroundColor = "";
        marker.innerText = "";
        break;
      default:
        btn.style.border = "";
        btn.style.backgroundColor = "";
        marker.style.opacity = "0.4";
        marker.style.fontSize = "10px";
        marker.innerText = type;
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
