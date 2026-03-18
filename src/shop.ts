import { TaskManager } from "./utils/taskManager";
import { logger } from "./utils/logger";

// ==========================================
// 核心算法层：只负责算账，绝对不碰 DOM
// ==========================================
interface ProfitResult {
  dailyProfit: number;
  calcType: string;
}

function calculateSeedProfit(
  detailText: string,
  costText: string
): ProfitResult | null {
  const costMatch = costText.match(/(\d+)文/);
  const priceMatch = detailText.match(/售(\d+)文/);

  if (!costMatch || !priceMatch) return null;

  const cost = parseInt(costMatch[1], 10);
  const price = parseInt(priceMatch[1], 10);

  const multiMatch = detailText.match(/(\d+)天\s*·\s*每(\d+)天再收/);
  if (multiMatch) {
    const firstDays = parseInt(multiMatch[1], 10);
    const regrowDays = parseInt(multiMatch[2], 10);

    const remainingDays = 28 - firstDays;
    const regrowTimes =
      remainingDays >= 0 ? Math.floor(remainingDays / regrowDays) : 0;
    const totalHarvests = 1 + regrowTimes;

    const totalProfit = totalHarvests * price - cost;
    return {
      dailyProfit: totalProfit / 28,
      calcType: `季收${totalHarvests}次`,
    };
  }

  const singleMatch = detailText.match(/(\d+)天\s*→/);
  if (singleMatch) {
    const days = parseInt(singleMatch[1], 10);
    return {
      dailyProfit: (price - cost) / days,
      calcType: "单茬",
    };
  }

  return null; // 无法解析的商品
}

// ==========================================
// 视图渲染层：只负责画 UI，不操心怎么算
// ==========================================
function renderProfitTag(
  nameElem: HTMLElement,
  profit: number,
  calcType: string
): HTMLElement {
  const tag = document.createElement("span");
  tag.className = "profit-tag text-xs font-bold ml-2";

  if (profit >= 20) {
    tag.classList.add("text-red-500");
  } else if (profit >= 13) {
    tag.classList.add("text-orange-500");
  } else {
    tag.classList.add("text-blue-500");
  }

  tag.innerText = `日赚:${profit.toFixed(1)}文 (${calcType})`;
  nameElem.appendChild(tag);

  return tag;
}

// ==========================================
// 业务逻辑层：调度算法和视图，选出最优解
// ==========================================
function setupSeedProfitAnalyzer() {
  logger.info("[商店模块] 正在挂载‘万物铺算账’雷达...");

  TaskManager.addObserver(
    document.body,
    { childList: true, subtree: true },
    () => {
      // 1. 确认我们在商店页面，且“万物铺”已渲染出来
      const shopTitle = document.querySelector("h3.text-accent.text-sm");
      if (!shopTitle || !shopTitle.innerHTML.includes("万物铺")) return;

      // 2. 获取所有商品列表
      const items = document.querySelectorAll<HTMLElement>(
        ".flex.items-center.justify-between.cursor-pointer"
      );
      if (items.length === 0) return;

      let maxProfit = 0; // 只要正收益
      let bestItem: HTMLElement | null = null;
      let bestTag: HTMLElement | null = null;

      // 3. 遍历商品，调用算法
      for (const item of Array.from(items)) {
        // 防重复渲染锁
        if (item.querySelector(".profit-tag")) continue;

        const nameElem = item.querySelector<HTMLElement>("p.text-sm");
        if (!nameElem || !nameElem.innerText.includes("种子")) continue;

        const detailText =
          item.querySelector<HTMLElement>(".text-muted")?.innerText || "";
        const costText =
          item.querySelector<HTMLElement>("span.text-accent")?.innerText || "";

        // 🚀 调用独立的算账函数
        const result = calculateSeedProfit(detailText, costText);
        if (!result || result.dailyProfit <= 0) continue;

        // 🚀 调用独立的渲染函数
        const tag = renderProfitTag(
          nameElem,
          result.dailyProfit,
          result.calcType
        );

        // 记录最高收益
        if (result.dailyProfit > maxProfit) {
          maxProfit = result.dailyProfit;
          bestItem = item;
          bestTag = tag;
        }
      }

      // 4. 为收益之王加冕（每次打开商店只会加冕一次，因为前面有 profit-tag 锁住了整个流程的重复执行）
      if (
        bestItem &&
        bestTag &&
        !bestItem.classList.contains("border-yellow-500")
      ) {
        bestItem.classList.replace("border-accent/20", "border-yellow-500");
        bestItem.classList.replace("hover:bg-accent/5", "bg-yellow-500/20");

        const crown = document.createElement("span");
        crown.className = "ml-1 text-yellow-600";
        crown.innerText = "👑最优";
        bestTag.appendChild(crown);
      }
    }
  );
}

// ==========================================
// 模块主入口：暴露给 main.ts 路由调用
// ==========================================
export default function doShopWork() {
  logger.info("商店模块已启动，开始分配任务...");

  // 启动算账专家
  setupSeedProfitAnalyzer();

  // 以后还可以加自动购买、自动讨价还价等功能
  // setupAutoBuy();
}
