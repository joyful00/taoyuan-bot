// src/modules/almanac.ts
import { logger } from "./utils/logger";

// 定义黄历词条的结构
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

// 🖌️ 渲染引擎：返璞归真防弹版
function renderAlmanacUI() {
  try {
    // 1. 寻找屏幕上的标题栏。
    // 🌟 致命修复：为了对抗节日全屏动画造成的 Vue KeepAlive 节点残留，我们取【DOM树里最后面（最新）】的可见标题！
    const titleSpans = Array.from(
      document.querySelectorAll("span.text-accent.font-bold"),
    ).filter(
      (span) =>
        span.textContent?.includes("桃源乡") &&
        span.getBoundingClientRect().width > 0,
    );

    // 如果在黑屏或者节日动画遮挡中，安静等待，不要报错
    if (titleSpans.length === 0) return;

    // 取最后一个（最上层的现役节点）
    const activeTitleSpan = titleSpans[titleSpans.length - 1];
    const topBar = activeTitleSpan.parentElement;
    if (!topBar) return;

    // 2. 绝对严谨的数据提取
    let season = "";
    let weather = "";

    // 只遍历它的一级亲儿子
    for (const child of Array.from(topBar.children)) {
      // 🌟 避开咱们自己的黄历容器，绝不“我读我自己”
      if (child.id === "ty-almanac-container") continue;

      const text = child.textContent?.trim() || "";
      if (!text) continue;

      // 提取季节
      if (
        (text.includes("春") ||
          text.includes("夏") ||
          text.includes("秋") ||
          text.includes("冬")) &&
        text.includes("第")
      ) {
        season = text;
      }

      // 提取天气（字数很少，且命中词库）
      if (
        ["晴", "雨", "雷", "雪", "风", "绿"].some((w) => text.includes(w)) &&
        text.length <= 5
      ) {
        weather = text;
      }
    }

    // 如果节日当天 UI 发生异变（没文字了），直接退出等第二天
    if (!season || !weather) return;

    // 3. 容器强制清理
    // 扫荡全局，把节日过场动画可能产生的“幽灵黄历”全部超度
    document.querySelectorAll("#ty-almanac-container").forEach((el) => {
      if (el.parentElement !== topBar) el.remove();
    });

    let container = topBar.querySelector(
      "#ty-almanac-container",
    ) as HTMLElement;
    if (!container) {
      container = document.createElement("span");
      container.id = "ty-almanac-container";
      container.style.cssText = `
        margin-left: 10px;
        display: inline-flex;
        gap: 6px;
        font-size: 0.75rem;
        font-weight: 700;
        user-select: none;
      `;
      topBar.appendChild(container);
    }

    // 4. 数据比对：时空没变就不刷新
    const currentKey = `${season}-${weather}`;
    if (container.dataset.key === currentKey && container.innerHTML !== "")
      return;

    // 5. 生成并注入 HTML
    const { yi, ji } = calculateAlmanac(season, weather);
    let html = "";

    if (yi.length > 0) {
      html += `<span style="background: rgba(16, 185, 129, 0.15); padding: 2px 6px; border-radius: 4px; border: 1px solid rgba(16, 185, 129, 0.3); display: inline-flex; align-items: center; gap: 4px;">
          <span style="color: #10b981; border-right: 1px solid rgba(16,185,129,0.3); padding-right: 4px;">宜</span>
          <span style="display: inline-flex; gap: 6px;">`;
      yi.forEach((item) => {
        html += `<span style="color: ${item.color}; text-shadow: 0 0 2px rgba(0,0,0,0.1);">${item.text}</span>`;
      });
      html += `</span></span>`;
    }

    if (ji.length > 0) {
      html += `<span style="background: rgba(239, 68, 68, 0.15); padding: 2px 6px; border-radius: 4px; border: 1px solid rgba(239, 68, 68, 0.3); display: inline-flex; align-items: center; gap: 4px;">
          <span style="color: #ef4444; border-right: 1px solid rgba(239,68,68,0.3); padding-right: 4px;">忌</span>
          <span style="display: inline-flex; gap: 6px;">`;
      ji.forEach((item) => {
        html += `<span style="color: ${item.color}; text-shadow: 0 0 2px rgba(0,0,0,0.1);">${item.text}</span>`;
      });
      html += `</span></span>`;
    }

    container.innerHTML = html;
    container.dataset.key = currentKey;
    logger.success(
      `📅 [天象雷达] 从深渊归来，捕获时空: ${season} | ${weather}`,
    );
  } catch (e) {
    console.error("[桃源助手] 黄历渲染时发生内部错误:", e);
  }
}

// 📡 暴露给主入口
export function setupAlmanacObserver() {
  logger.info("启动黄历观测局 (已切换为 rAF 永动机内核)...");

  let lastTime = 0;

  // 创造一个递归的渲染帧循环
  function almanacLoop(timestamp: number) {
    // 1. 第一时间把自己挂载到下一帧，保证引擎【绝对不可能】停转
    requestAnimationFrame(almanacLoop);

    // 2. 节流防抖：让它每隔 1000 毫秒（1秒）才真正干一次活，不浪费一点点 CPU 性能
    if (timestamp - lastTime < 1000) return;
    lastTime = timestamp;

    // 3. 执行咱们的黄历刷新逻辑
    renderAlmanacUI();
  }

  // 启动永动机！
  requestAnimationFrame(almanacLoop);
}
