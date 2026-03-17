// src/modules/farm.ts

// 假设我们引入了之前设计好的大管家
import { TaskManager } from "./utils/taskManager";

/**
 * 一键操作面板注入“执行所有”按钮
 */
function setupAutoOperateAll() {
  TaskManager.addObserver(
    document.body,
    { childList: true, subtree: true },
    () => {
      const panelTitles = Array.from(
        document.querySelectorAll<HTMLParagraphElement>(
          ".game-panel p.text-accent"
        )
      );

      // 找到那个包含“一键操作”文字的 p 标签
      const targetTitle = panelTitles.find((p) =>
        p.innerText.includes("一键操作")
      );

      // 如果找到了 p 标签，就顺藤摸瓜找父面板；否则就是 null
      const targetPanel = targetTitle
        ? (targetTitle.closest(".game-panel") as HTMLElement)
        : null;

      // 没找到说明弹窗还没出来，或者关掉了，直接退出
      if (!targetPanel) return;

      // 2. 找到放按钮的容器
      const btnContainer = targetPanel.querySelector<HTMLDivElement>(
        ".flex.flex-col.space-y-1\\.5"
      );
      if (!btnContainer) return;

      // 防重复锁：如果已经加过了，绝不重复添加
      if (btnContainer.querySelector("#helper-auto-all-btn")) return;

      // ==========================================
      // 创建并注入我们的专属按钮
      // ==========================================
      const myBtn = document.createElement("button");
      myBtn.className =
        "btn text-xs w-full justify-between border border-blue-500/50 bg-blue-500/10 hover:bg-blue-500/20";
      myBtn.id = "helper-auto-all-btn";
      myBtn.innerHTML = `
            <span class="flex items-center space-x-1 font-bold text-blue-500">
                ⚡ 执行所有可用操作
            </span>
        `;

      // 绑定点击事件（阶梯延迟点击，防封号）
      myBtn.addEventListener("click", () => {
        const originalBtns = btnContainer.querySelectorAll<HTMLButtonElement>(
          "button:not(#helper-auto-all-btn)"
        );

        let delay = 0;
        originalBtns.forEach((btn) => {
          if (!btn.hasAttribute("disabled")) {
            setTimeout(() => {
              btn.click();
            }, delay);
            delay += 600; // 每个操作间隔 0.6 秒
          }
        });
      });

      // 插入到原生按钮列表的最上方
      btnContainer.insertBefore(myBtn, btnContainer.firstChild);
    }
  );
}

// ==========================================
// 农场模块的主入口
// ==========================================
export default function doFarmWork() {
  console.log("🚜 进入农村...");

  // 一键操作面板注入
  setupAutoOperateAll();
}
