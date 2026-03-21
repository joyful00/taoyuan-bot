// src/modules/almanac.ts
import { logger } from "./utils/logger";

interface AlmanacItem {
  text: string;
  weight: number;
  color?: string;
}

// 🧠 核心推算引擎：保持完全不变
function calculateAlmanac(season: string, weather: string) {
  if (weather.includes("晴")) {
    return {
      yi: [{ text: "诸事皆宜", weight: 100, color: "#f59e0b" }],
      ji: [],
    };
  }

  const yi: AlmanacItem[] = [];
  const ji: AlmanacItem[] = [];

  if (
    weather.includes("雨") &&
    !weather.includes("雷") &&
    !weather.includes("绿")
  ) {
    yi.push(
      { text: "农田免浇", weight: 40 },
      { text: "鱼类提质", weight: 30 },
      { text: "淘金", weight: 20 },
      { text: "采集(+15%)", weight: 15 },
    );
    if (season.includes("春")) yi.push({ text: "钓翠龙", weight: 25 });
    else if (season.includes("秋")) yi.push({ text: "钓鲈/鳗", weight: 25 });
    else if (season.includes("冬")) yi.push({ text: "钓岩鳗", weight: 25 });
    else yi.push({ text: "钓泥鳅", weight: 10 });
  }

  if (weather.includes("雷")) {
    ji.push(
      { text: "矿洞探索", weight: 30 },
      { text: "采集(-20%)", weight: 20 },
      { text: "出远门", weight: 10 },
    );
    if (season.includes("夏")) yi.push({ text: "钓龙鱼/江龙", weight: 30 });
    else yi.push({ text: "钓龙鱼", weight: 15 });
  }

  if (weather.includes("雪")) {
    ji.push({ text: "采集(-10%)", weight: 10 });
    if (season.includes("冬")) yi.push({ text: "钓冰/娃鱼", weight: 30 });
    else yi.push({ text: "钓冰鱼", weight: 15 });
  }

  if (weather.includes("风")) {
    yi.push({ text: "采集(+10%)", weight: 10 });
    if (season.includes("夏")) yi.push({ text: "钓飞鱼", weight: 25 });
    else yi.push({ text: "钓溪鲑", weight: 15 });
  }

  if (weather.includes("绿")) {
    yi.push({ text: "采集(+50%)", weight: 50 });
  }

  yi.sort((a, b) => b.weight - a.weight);
  ji.sort((a, b) => b.weight - a.weight);

  yi.forEach((item) => {
    if (item.weight >= 40) item.color = "#f59e0b";
    else if (item.weight >= 25) item.color = "#10b981";
    else item.color = "#34d399";
  });

  ji.forEach((item) => {
    if (item.weight >= 30) item.color = "#ef4444";
    else item.color = "#f87171";
  });

  return { yi, ji };
}

// 🖌️ 渲染引擎：悬浮幽灵版 (对 Vue 绝对安全)
function renderAlmanacUI() {
  try {
    const titleSpans = document.querySelectorAll("span.text-accent.font-bold");
    let activeTitleSpan = null;
    for (const span of Array.from(titleSpans)) {
      if (
        span.textContent?.includes("桃源乡") &&
        span.getBoundingClientRect().width > 0
      ) {
        activeTitleSpan = span;
        break;
      }
    }

    let container = document.getElementById("ty-almanac-container");

    // 找不到标题，说明在黑屏过场，先把黄历隐藏起来保护视力
    if (!activeTitleSpan || !activeTitleSpan.parentElement) {
      if (container) container.style.display = "none";
      return;
    }

    const topBar = activeTitleSpan.parentElement;

    let season = "";
    let weather = "";
    let weatherSpan: Element | null = null;

    // 提取时空数据并锁定【天气】标签的物理位置
    for (const child of Array.from(topBar.children)) {
      const text = child.textContent?.trim() || "";

      if (
        (text.includes("春") ||
          text.includes("夏") ||
          text.includes("秋") ||
          text.includes("冬")) &&
        text.includes("第")
      ) {
        season = text;
      }

      if (
        ["晴", "雨", "雷", "雪", "风", "绿"].some((w) => text.includes(w)) &&
        text.length <= 4
      ) {
        weather = text;
        weatherSpan = child; // 锁定它！
      }
    }

    if (!season || !weather || !weatherSpan) {
      if (container) container.style.display = "none";
      return;
    }

    // 🌟 核心破局：把容器挂在 body 上，而不是原版游戏的盒子里！
    if (!container) {
      container = document.createElement("div");
      container.id = "ty-almanac-container";
      container.style.cssText = `
        position: fixed; /* 绝对悬浮，无视页面滚动 */
        pointer-events: none; /* 绝对不能阻挡玩家鼠标点击 */
        display: inline-flex;
        gap: 6px;
        font-size: 0.75rem;
        font-weight: 700;
        user-select: none;
        z-index: 9999; /* 保证不被其他东西挡住 */
        transition: opacity 0.2s; /* 切换时更平滑 */
      `;
      document.body.appendChild(container); // 丢进全局
    }

    // 🌟 动态追踪：获取天气标签在屏幕上的真实坐标，让黄历一直“贴”在它右边
    const rect = weatherSpan.getBoundingClientRect();
    if (rect.width > 0) {
      container.style.display = "inline-flex";
      container.style.left = `${rect.right + window.scrollX + 10}px`; // 紧贴右侧 10px，加上滚动偏移
      container.style.top = `${rect.top + window.scrollY + rect.height / 2}px`; // 加上滚动偏移
      container.style.transform = `translateY(-50%)`; // 完美垂直居中
    } else {
      container.style.display = "none";
    }

    // 只有在节气变化时才重新渲染内部 HTML
    const currentKey = `${season}-${weather}`;
    if (container.dataset.key === currentKey && container.innerHTML !== "")
      return;

    container.dataset.key = currentKey;

    const { yi, ji } = calculateAlmanac(season, weather);
    let html = "";

    if (yi.length > 0) {
      html += `<span style="background: rgba(16, 185, 129, 0.15); padding: 2px 6px; border-radius: 4px; border: 1px solid rgba(16, 185, 129, 0.3); display: inline-flex; align-items: center; gap: 4px; backdrop-filter: blur(2px);">
          <span style="color: #10b981; border-right: 1px solid rgba(16,185,129,0.3); padding-right: 4px;">宜</span>
          <span style="display: inline-flex; gap: 6px;">`;
      yi.forEach(
        (item) =>
          (html += `<span style="color: ${item.color}; text-shadow: 0 0 2px rgba(0,0,0,0.1);">${item.text}</span>`),
      );
      html += `</span></span>`;
    }

    if (ji.length > 0) {
      html += `<span style="background: rgba(239, 68, 68, 0.15); padding: 2px 6px; border-radius: 4px; border: 1px solid rgba(239, 68, 68, 0.3); display: inline-flex; align-items: center; gap: 4px; backdrop-filter: blur(2px);">
          <span style="color: #ef4444; border-right: 1px solid rgba(239,68,68,0.3); padding-right: 4px;">忌</span>
          <span style="display: inline-flex; gap: 6px;">`;
      ji.forEach(
        (item) =>
          (html += `<span style="color: ${item.color}; text-shadow: 0 0 2px rgba(0,0,0,0.1);">${item.text}</span>`),
      );
      html += `</span></span>`;
    }

    container.innerHTML = html;
  } catch (e) {
    console.error("[桃源助手] 黄历渲染错误:", e);
  }
}

// 📡 rAF 永动机内核
export function setupAlmanacObserver() {
  logger.info("启动黄历观测局 (已开启绝对物理隔离模式)...");

  let lastTime = 0;
  function almanacLoop(timestamp: number) {
    requestAnimationFrame(almanacLoop);

    // 我们把频率稍微提高一点到 500ms，这样黄历追踪目标位置时会更跟手
    if (timestamp - lastTime < 500) return;
    lastTime = timestamp;

    renderAlmanacUI();
  }
  requestAnimationFrame(almanacLoop);
}
