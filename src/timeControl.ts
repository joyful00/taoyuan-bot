// src/modules/timeControl.ts
import { configStore } from "./store/config";

function getGameStore(): any {
  const vueApp =
    (document.querySelector("#app") as any)?.__vue_app__ ||
    (document.body as any).__vue_app__;
  if (!vueApp) return null;
  const symbols = Object.getOwnPropertySymbols(vueApp._context.provides);
  for (const sym of symbols) {
    const inst = vueApp._context.provides[sym];
    if (inst?._s instanceof Map) return inst._s.get("game");
  }
  return null;
}

// 在天气右侧（黄历左侧）渲染指示器
function renderPauseIndicator() {
  let el = document.getElementById("ty-pause-marker");
  if (!configStore.data.settings.autoPauseEnabled) {
    el?.remove();
    return;
  }

  const anchor = Array.from(
    document.querySelectorAll("span.text-accent.font-bold"),
  ).find(
    (s) =>
      s.textContent?.includes("桃源乡") && s.getBoundingClientRect().width > 0,
  );

  if (!anchor || !anchor.parentElement) return;
  const weatherEl = Array.from(anchor.parentElement.children).find((c) =>
    ["晴", "雨", "雷", "雪", "风", "绿"].some((w) =>
      c.textContent?.includes(w),
    ),
  );

  if (!weatherEl) return;
  if (!el) {
    el = document.createElement("div");
    el.id = "ty-pause-marker";
    el.innerHTML = "⏸️";
    el.style.cssText = `position:fixed;pointer-events:none;z-index:9999;font-size:12px;opacity:0.8;filter:drop-shadow(0 0 2px rgba(0,0,0,0.5));`;
    document.body.appendChild(el);
  }

  const rect = weatherEl.getBoundingClientRect();
  el.style.left = `${rect.right + 6}px`; // 天气右侧 6px，黄历在 24px
  el.style.top = `${rect.top + rect.height / 2}px`;
  el.style.transform = `translateY(-50%)`;
}

export function setupAutoPauseService() {
  setInterval(() => {
    try {
      renderPauseIndicator();
      if (!configStore.data.settings.autoPauseEnabled) return;

      const store = getGameStore();
      // 🌟 核心逻辑：操作时游戏会将 isPaused 设为 false。
      // 操作结束（或我们每秒轮询时），只要它是 false，就强行把它掰回 true（暂停）。
      if (store && store.isPaused === false) {
        store.isPaused = true;
      }
    } catch (error) {
      console.warn("自动暂停服务异常:", error);
    }
  }, 1000);
}
