import { logger } from "./utils/logger";
import { TaskManager } from "./utils/taskManager";
import { configStore } from "./store/config"; // 👈 引入持久化配置中心

// ==========================================
// 状态参数区
// ==========================================
let isFishing = false;
let isPressing = false;
let animationFrameId: number | null = null;
let holdLockTimer: ReturnType<typeof setTimeout> | null = null;

// ==========================================
// 核心控制器：带“强制蓄力锁”的键盘模拟
// ==========================================
function pressSpace() {
  // 🌟 动态计算参数：读取 UI 面板里的“收线力度” (假设 1-10 映射到 8-80 毫秒的蓄力锁)
  const tensionSetting = configStore.data.settings.fishTension || 5;
  const minHoldTime = tensionSetting * 8;

  // 只要滑块需要往上飞，每一帧都发送 keydown 事件
  window.dispatchEvent(
    new KeyboardEvent("keydown", {
      key: " ",
      code: "Space",
      keyCode: 32,
      bubbles: true,
    }),
  );

  // 如果状态已经是按下，只需要发送事件，不用再重新上锁了
  if (isPressing) return;

  isPressing = true;

  // 🔒 上锁：强制保持按压状态，给予滑块向上的冲量
  if (holdLockTimer) clearTimeout(holdLockTimer);
  holdLockTimer = setTimeout(() => {
    holdLockTimer = null;
  }, minHoldTime); // 使用实时动态计算的蓄力时间
}

function releaseSpace(force = false) {
  // 如果是强制释放，无视 isPressing 状态强行发 keyup
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
    }),
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
  // 🌟 安全锁：如果中途玩家在面板里关掉了自动钓鱼，立刻熄火并松手
  if (!isFishing || !configStore.data.settings.autoFishEnabled) {
    releaseSpace(true);
    return;
  }

  const waterArea = document.querySelector<HTMLElement>(".bg-water\\/20");

  if (waterArea) {
    const playerBar = waterArea.querySelector<HTMLElement>(
      '[class*="bg-success"]',
    );
    const targetFish = waterArea.querySelector<HTMLElement>(
      '[class*="bg-accent"]',
    );

    if (playerBar && targetFish) {
      const playerTop = parseFloat(playerBar.style.top || "0");
      const playerHeight = parseFloat(playerBar.style.height || "0");
      const playerCenter = playerTop + playerHeight / 2;

      const fishTop = parseFloat(targetFish.style.top || "0");
      const fishHeight = parseFloat(targetFish.style.height || "0");
      const fishCenter = fishTop + fishHeight / 2;

      // 🌟 动态计算参数：读取 UI 面板里的“寻的容错” (直接作为抗重力像素偏移量)
      const antiGravityOffset = configStore.data.settings.fishTolerance || 10;
      const aimTarget = fishCenter - antiGravityOffset;

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

  // 只要还在钓鱼状态，就继续请求下一帧
  animationFrameId = requestAnimationFrame(trackingLoop);
}

// ==========================================
// 模块入口：侦测钓鱼游戏启动
// ==========================================
export function setupAutoFishing() {
  // 如果玩家全局关了自动钓鱼，连观察者都不用挂载了
  if (!configStore.data.settings.autoFishEnabled) return;

  logger.info("🎣 [钓鱼模块] 自动寻的雷达已部署，等待抛竿...");

  TaskManager.addObserver(
    document.body,
    { childList: true, subtree: true },
    () => {
      // 检查钓鱼面板是否存在
      const panel = document.querySelector(".game-panel");
      const isFishingPanelOpen =
        panel && panel.textContent?.includes("实时钓鱼");

      // 如果面板打开了，而且引擎还没转，而且用户确实开启了自动钓鱼
      if (
        isFishingPanelOpen &&
        !isFishing &&
        configStore.data.settings.autoFishEnabled
      ) {
        logger.info(
          `⚡ 鱼漂异动！自瞄挂引擎点火！当前力度:${configStore.data.settings.fishTension}`,
        );
        isFishing = true;
        trackingLoop(); // 启动 60FPS 追踪循环
      }
      // 如果面板关了，或者用户中途把自动钓鱼开关给关了
      else if (
        (!isFishingPanelOpen || !configStore.data.settings.autoFishEnabled) &&
        isFishing
      ) {
        logger.info("🛑 钓鱼结束或已手动停止，引擎熄火，清理现场。");
        isFishing = false;
        releaseSpace(true); // 强制释放按键

        if (animationFrameId) {
          cancelAnimationFrame(animationFrameId);
          animationFrameId = null;
        }
      }
    },
  );
}

// ==========================================
// 暴露给 main.ts 的统帅函数
// ==========================================
export default function doFishingWork() {
  setupAutoFishing();
}
