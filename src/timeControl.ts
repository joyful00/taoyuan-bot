// src/modules/timeControl.ts
import { configStore } from "./store/config";
import { logger } from "./utils/logger";

let spoofPulseTimer: ReturnType<typeof setInterval> | null = null;

/**
 * 🌟 开启高频欺骗脉冲：持续压制游戏的恢复机制
 */
function startSpoofPulse() {
  if (spoofPulseTimer) return;

  // 1. 永久遮蔽 hidden 属性（在暂停期间，永远告诉游戏我们在后台）
  Object.defineProperty(document, 'hidden', {
    configurable: true,
    get: () => true
  });

  // 2. 启动高频脉冲，频率 (50ms) 必须高于游戏的 TICK_MS (200ms)
  // 这样就算玩家点击触发了 resumeClock，在下一次 tick 到来前，也会被我们重新按死！
  spoofPulseTimer = setInterval(() => {
    document.dispatchEvent(new Event('visibilitychange'));
  }, 50);
  
  logger.info("🛑 开启高频切后台伪装脉冲，时间线已被强行压制！");
}

/**
 * 恢复真实状态
 */
function stopSpoofPulse() {
  if (!spoofPulseTimer) return;

  // 1. 停止高频脉冲
  clearInterval(spoofPulseTimer);
  spoofPulseTimer = null;

  // 2. 归还 document.hidden 的原生控制权
  delete (document as any).hidden;

  // 3. 补发一次真实的可见性事件，唤醒游戏的 resume 逻辑
  document.dispatchEvent(new Event('visibilitychange'));
  
  logger.info("▶️ 伪装脉冲解除，时间恢复流动。");
}

// ---------------- UI 与 循环挂载 (极简通用图标版) ----------------

function renderPauseIndicator(isPaused: boolean) {
  let el = document.getElementById("ty-pause-marker");
  
  // 如果没开自动暂停，或者当前没有暂停，隐藏 UI
  if (!configStore.data.settings.autoPauseEnabled || !isPaused) {
    if (el) el.style.display = "none";
    return;
  }

  // 初始化 UI
  if (!el) {
    el = document.createElement("div");
    el.id = "ty-pause-marker";
    
    // ✨ 极其简洁明了的“圆圈暂停”图标 (完美契合现代 UI 审美)
    el.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="color: #10b981;">
        <circle cx="12" cy="12" r="10"></circle>
        <line x1="10" y1="15" x2="10" y2="9"></line>
        <line x1="14" y1="15" x2="14" y2="9"></line>
      </svg>
    `;
    
    // 🎨 样式设置：精美的半透明小圆点
    el.style.cssText = `
      position: fixed; 
      top: 25px; /* 避开黄历 */
      right: 10px; /* 放右上角 */
      transform: translateX(-50%); 
      pointer-events: none; 
      z-index: 9998; 
      
      /* Flex 居中布局 */
      display: flex;
      align-items: center;
      justify-content: center;
      
      /* 外观 */
      background: rgba(0, 0, 0, 0.65); 
      width: 30px; 
      height: 30px;
      border-radius: 50%; 
      
      /* 质感 */
      backdrop-filter: blur(2px); 
      border: 1px solid rgba(16, 185, 129, 0.3);
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.2);
    `;
    document.body.appendChild(el);
  }
  
  // 🌟 核心细节：显示时必须用 flex，否则 SVG 无法完美居中
  el.style.display = "flex"; 
}

export function setupAutoPauseService() {
  logger.info("⏰ 自动暂停 [高频压制版] 已挂载，接管原生离线保护...");

  // 业务判定循环 (每秒检查一次是否该开启脉冲)
  setInterval(() => {
    const shouldPause = configStore.data.settings.autoPauseEnabled; 

    if (shouldPause && !spoofPulseTimer) {
      startSpoofPulse();
      renderPauseIndicator(true);
    } 
    else if (!shouldPause && spoofPulseTimer) {
      stopSpoofPulse();
      renderPauseIndicator(false);
    }

  }, 1000); 
}