import { TaskManager } from "./utils/taskManager";

// ==========================================
// 状态与物理参数配置区 (供你随时调教引擎)
// ==========================================
let isFishing = false;
let isPressing = false;
let animationFrameId: number | null = null;
let holdLockTimer: ReturnType<typeof setTimeout> | null = null;

// ⚙️ 引擎参数 1：【蓄力时间锁】（毫秒）
// 作用：按下空格后，至少保持按压多长时间？
// 调校指南：如果滑块冲力不够、老是掉下去，就加大（如 100, 120）；如果冲得太猛压不住，就减小（如 50, 60）。
const MIN_HOLD_TIME = 40;

// ⚙️ 引擎参数 2：【抗重力预瞄准星】（像素）
// 作用：把瞄准点人为往上抬高，抵消游戏里的重力下坠。
// 调校指南：如果滑块整体偏下，就加大（如 18, 20）；如果整体偏上，就减小（如 5, 10）。
const ANTI_GRAVITY_OFFSET = 6;

// ==========================================
// 核心控制器：带“强制蓄力锁”的键盘模拟
// ==========================================
function pressSpace() {
  // 🌟 核心修复 1：不要被 isPressing 拦截！
  // 只要滑块需要往上飞，每一帧（每秒 60 次）都发送 keydown 事件。
  // 这不仅能防止开局游戏没加载好错过按键，还能完美模拟真实物理键盘的“长按连发”机制！
  window.dispatchEvent(
    new KeyboardEvent("keydown", {
      key: " ",
      code: "Space",
      keyCode: 32,
      bubbles: true,
    })
  );

  // 如果状态已经是按下，只需要发送事件，不用再重新上锁了
  if (isPressing) return;

  isPressing = true;

  // 🔒 上锁：强制保持按压状态，给予滑块向上的冲量
  if (holdLockTimer) clearTimeout(holdLockTimer);
  holdLockTimer = setTimeout(() => {
    holdLockTimer = null;
  }, MIN_HOLD_TIME);
}

function releaseSpace(force = false) {
  // 🌟 核心修复 2：如果是强制释放（如面板关闭），无视 isPressing 状态强行发 keyup
  if (!isPressing && !force) return;

  // 🛡️ 核心防抖：如果时间锁还没到期，且不是强制关停命令，直接拒绝松手！
  if (holdLockTimer && !force) return;

  isPressing = false;
  window.dispatchEvent(
    new KeyboardEvent("keyup", {
      key: " ",
      code: "Space",
      keyCode: 32,
      bubbles: true,
    })
  );

  // 清理残留的锁
  if (holdLockTimer) {
    clearTimeout(holdLockTimer);
    holdLockTimer = null;
  }
}

// ==========================================
// 追踪算法：60FPS 极速微操引擎
// ==========================================
function trackingLoop() {
  if (!isFishing) {
    releaseSpace(true);
    return;
  }

  // 🌟 1. 先精准定位到“钓鱼水域”的容器，防止抓错成左边的进度条！
  const waterArea = document.querySelector<HTMLElement>(".bg-water\\/20");

  if (waterArea) {
    // 🌟 2. 在水域内部使用“模糊匹配选择器 (*=)”，无视透明度 40 或 80 的动态切换
    const playerBar = waterArea.querySelector<HTMLElement>(
      '[class*="bg-success"]'
    );
    const targetFish = waterArea.querySelector<HTMLElement>(
      '[class*="bg-accent"]'
    );

    if (playerBar && targetFish) {
      const playerTop = parseFloat(playerBar.style.top || "0");
      const playerHeight = parseFloat(playerBar.style.height || "0");
      const playerCenter = playerTop + playerHeight / 2;

      const fishTop = parseFloat(targetFish.style.top || "0");
      const fishHeight = parseFloat(targetFish.style.height || "0");
      const fishCenter = fishTop + fishHeight / 2;

      const aimTarget = fishCenter - ANTI_GRAVITY_OFFSET;

      if (playerCenter > aimTarget + 1) {
        pressSpace();
      } else if (playerCenter < aimTarget - 1) {
        releaseSpace();
      }
    } else {
      releaseSpace(true);
    }
  } else {
    releaseSpace(true); // 连水池都找不到了，立刻松手退出
  }

  animationFrameId = requestAnimationFrame(trackingLoop);
}

// ==========================================
// 模块入口：侦测钓鱼游戏启动
// ==========================================
export function setupAutoFishing() {
  console.log("🎣 [钓鱼模块] 自动寻的雷达已部署，等待抛竿...");

  TaskManager.addObserver(
    document.body,
    { childList: true, subtree: true },
    () => {
      // 检查钓鱼面板是否存在
      const panel = document.querySelector(".game-panel");
      const isFishingPanelOpen =
        panel && panel.textContent?.includes("实时钓鱼");

      if (isFishingPanelOpen && !isFishing) {
        console.log("⚡ 鱼漂异动！自瞄挂引擎点火！");
        isFishing = true;
        trackingLoop(); // 启动 60FPS 追踪循环
      } else if (!isFishingPanelOpen && isFishing) {
        console.log("🛑 钓鱼结束，引擎熄火，清理现场。");
        isFishing = false;
        releaseSpace(true); // 强制释放按键

        if (animationFrameId) {
          cancelAnimationFrame(animationFrameId);
          animationFrameId = null;
        }
      }
    }
  );
}

// ==========================================
// 暴露给 main.ts 的统帅函数
// ==========================================
export default function doFishingWork() {
  setupAutoFishing();
}
