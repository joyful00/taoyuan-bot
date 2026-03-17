import { TaskManager } from "./utils/taskManager";

let scanInterval: ReturnType<typeof setInterval> | null = null;
let isMining = false;

// ==========================================
// 核心黑客工具：骇入 Pinia 数据库
// ==========================================
function crackPinia(): any[] | null {
  let vueApp: any = null;
  // 遍历网页找根节点 (使用 as any 绕过 TS 类型检查)
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
  const floorGrid = crackPinia();
  if (!floorGrid || floorGrid.length !== 36) return;

  const gridDiv = document.querySelector<HTMLElement>(".grid.grid-cols-6");
  if (!gridDiv) return;

  const buttons = gridDiv.querySelectorAll<HTMLButtonElement>("button");
  if (buttons.length !== 36) return;

  buttons.forEach((btn, index) => {
    const tile = floorGrid[index];

    // 已经点开的，跳过渲染 (防止覆盖游戏自带的样式)
    if (tile.revealed) return;

    const type = tile.type || "unknown";

    // 🛡️ 核心性能优化：防重复渲染锁！
    // 如果这个按钮已经被我们打过当前类型的标记了，直接跳过，防止 DOM 频繁重绘导致卡顿
    if (btn.dataset.xray === type) return;
    btn.dataset.xray = type;

    // 开始染色
    switch (type) {
      case "monster":
      case "boss":
        btn.style.border = "1px solid rgba(239, 68, 68, 0.4)"; // 柔和的红色边框
        btn.style.backgroundColor = "rgba(239, 68, 68, 0.08)"; // 极淡的红色背景
        btn.style.color = "rgba(239, 68, 68, 0.8)";
        btn.innerText = "👿";
        break;
      case "trap":
        btn.style.border = "1px solid rgba(168, 85, 247, 0.4)"; // 柔和的紫色
        btn.style.backgroundColor = "rgba(168, 85, 247, 0.08)";
        btn.innerText = "💣";
        break;
      case "exit":
      case "stairs":
        btn.style.border = "1px solid rgba(16, 185, 129, 0.5)"; // 柔和的翠绿色
        btn.style.backgroundColor = "rgba(16, 185, 129, 0.1)";
        btn.innerText = "🚪";
        break;
      case "treasure":
      case "item":
      case "ore":
        btn.style.border = "1px solid rgba(245, 158, 11, 0.4)"; // 柔和的琥珀金
        btn.style.backgroundColor = "rgba(245, 158, 11, 0.1)";
        btn.innerText = "💎";
        break;
      case "empty":
        btn.style.opacity = "0.15"; // 空地进一步降低透明度，让它几乎融入背景
        btn.style.border = "1px solid rgba(150, 150, 150, 0.1)";
        btn.innerText = "空";
        break;
      default:
        btn.style.opacity = "0.4";
        btn.style.fontSize = "10px"; // 遇到未知的英文名，把字号调小一点免得挤出去
        btn.innerText = type;
        break;
    }
  });
}

// ==========================================
// 模块入口：侦测矿洞面板并控制雷达启停
// ==========================================
function setupXRayRadar() {
  console.log("👁️ [矿洞模块] 上帝之眼雷达已就绪，等待下井...");

  TaskManager.addObserver(
    document.body,
    { childList: true, subtree: true },
    () => {
      // 矿洞特有的 6x6 网格是否存在
      const gridDiv = document.querySelector(".grid.grid-cols-6");

      if (gridDiv && !isMining) {
        console.log("🔥 进入矿洞层！上帝之眼启动！");
        isMining = true;
        renderXRay(); // 立即渲染一次

        // 开启高频扫描（半秒一次，应对你进入下一层时，DOM 不刷新但数组刷新的情况）
        if (scanInterval) clearInterval(scanInterval);
        scanInterval = setInterval(renderXRay, 500);
      } else if (!gridDiv && isMining) {
        console.log("🛑 离开矿洞层，雷达休眠。");
        isMining = false;
        // 及时销毁定时器，保持浏览器极速运行
        if (scanInterval) {
          clearInterval(scanInterval);
          scanInterval = null;
        }
      }
    }
  );
}

// 暴露给主路由
export default function doMineWork() {
  setupXRayRadar();
}
