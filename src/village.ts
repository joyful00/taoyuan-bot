import { TaskManager } from "./utils/taskManager";

// ==========================================
// 辅助工具：休眠函数（让代码“睡”一会儿）
// ==========================================
const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// ==========================================
// 核心动作：全自动聊天机器人
// ==========================================
async function startAutoChat(btn: HTMLButtonElement) {
  btn.disabled = true;
  btn.innerText = "🤖 正在自动聊天中...";
  console.log("🗣️ [村庄模块] 启动全自动聊天循环！");

  let chatCount = 0;
  // 🌟 核心破局点：建一个“已访问黑名单”
  const visitedNames = new Set<string>();

  while (true) {
    // 1. 重新获取全村村民卡片
    const cards = Array.from(
      document.querySelectorAll<HTMLElement>(".grid > .cursor-pointer")
    );

    // 2. 寻找【带有绿色气泡】且【不在黑名单里】的村民
    const targetCard = cards.find((card) => {
      // 提取村民名字
      const name =
        card.querySelector(".text-xs")?.textContent?.trim() || "未知";
      const hasGreenBubble =
        card.querySelector(".lucide-message-circle.text-success") !== null;
      return hasGreenBubble && !visitedNames.has(name);
    });

    // 没找到，说明全都聊完了，安全下班！
    if (!targetCard) {
      console.log(
        `✅ [村庄模块] 聊天完毕！本次共与 ${chatCount} 位村民进行了交谈。`
      );
      break;
    }

    const name =
      targetCard.querySelector(".text-xs")?.textContent?.trim() || "未知村民";
    console.log(`👉 正在和 [${name}] 攀谈...`);

    // 🌟 把他拉入黑名单，防止下一轮由于游戏动画慢而重复点他
    visitedNames.add(name);

    // 3. 打开面板并稍微等待渲染
    targetCard.click();
    await sleep(500);

    // 获取最新打开的面板（防止选中隐藏的老面板）
    const panels = document.querySelectorAll<HTMLElement>(".game-panel");
    const currentPanel = panels[panels.length - 1];

    if (currentPanel) {
      let chatBtn: HTMLButtonElement | undefined;

      // 🌟 智能轮询：如果游戏卡了，按钮没立刻出来，我们最多等它 2 秒
      for (let i = 0; i < 10; i++) {
        const btns = Array.from(
          currentPanel.querySelectorAll<HTMLButtonElement>("button")
        );
        // 用 textContent 替代 innerText，防止 CSS 动画期间读取不到文字
        chatBtn = btns.find((b) => b.textContent?.includes("聊天"));
        if (chatBtn) break;
        await sleep(200);
      }

      // 4. 点击聊天
      if (chatBtn && !chatBtn.disabled) {
        chatBtn.click();
        chatCount++;
        console.log(`💬 成功与 [${name}] 聊天！`);
        await sleep(500); // 留足时间给服务器发奖励
      } else {
        console.log(`⚠️ 面板里没找到 [${name}] 的聊天按钮，已跳过。`);
      }

      // 5. 关门走人
      const closeBtn = Array.from(
        currentPanel.querySelectorAll<HTMLButtonElement>("button")
      ).find((b) => b.textContent?.includes("关闭"));
      if (closeBtn) {
        closeBtn.click();
        await sleep(500); // 等待面板关上的动画
      } else {
        console.log("❌ 找不到关闭按钮，为了安全强行退出循环！");
        break;
      }
    }
  }

  // 循环结束，恢复按钮状态
  btn.disabled = false;
  btn.innerHTML = `
        <span class="flex items-center space-x-1 font-bold text-success">
            ⚡ 一键与全村聊天
        </span>
    `;
}

// ==========================================
// 注入逻辑：把按钮放到页面上
// ==========================================
function setupVillageAutoChat() {
  console.log("🏘️ [村庄模块] 正在挂载雷达...");

  TaskManager.addObserver(
    document.body,
    { childList: true, subtree: true },
    () => {
      // 1. 确认我们在村庄页面
      const villageTitle = document.querySelector("h3.text-accent.text-sm");
      if (!villageTitle || !villageTitle.innerHTML.includes("桃源村")) return;

      // 2. 找到顶部那个放着“村民”、“仙灵”按钮的容器
      const tabContainer = document.querySelector<HTMLElement>(
        ".flex.space-x-1\\.5.mb-3"
      );
      if (!tabContainer) return;

      // 防重复注入锁
      if (tabContainer.querySelector("#helper-auto-chat-btn")) return;

      // 3. 创建一键聊天按钮
      const myBtn = document.createElement("button");
      myBtn.id = "helper-auto-chat-btn";
      // 借用游戏的 class 样式，稍作修改让它显眼一点
      myBtn.className =
        "btn text-xs flex-1 justify-center border border-success/50 bg-success/10 hover:bg-success/20";
      myBtn.innerHTML = `
            <span class="flex items-center space-x-1 font-bold text-success">
                ⚡ 一键与全村聊天
            </span>
        `;

      // 4. 绑定点击事件：调用异步大循环
      myBtn.addEventListener("click", () => {
        startAutoChat(myBtn);
      });

      // 5. 把按钮插到末尾
      tabContainer.appendChild(myBtn);
    }
  );
}

// ==========================================
// 模块主入口
// ==========================================
export default function doVillageWork() {
  console.log("🏃‍♂️ 村庄模块已启动！");
  setupVillageAutoChat();
}
