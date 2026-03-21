// src/ui/panel.ts
import "./css/panel.css";
import layoutHtml from "./html/layout.html?raw";
import equipHtml from "./html/equip.html?raw";
import settingsHtml from "./html/settings.html?raw";

import { makeDraggable } from "./draggable";
import { initEquipTab } from "./parts/equip";
import { initSettingsTab } from "./parts/settings";

export function initPanel() {
  if (document.getElementById("ty-bot-container")) return;

  const container = document.createElement("div");
  container.id = "ty-bot-container";
  container.innerHTML = layoutHtml;
  document.body.appendChild(container);

  container.querySelector("#pane-equip")!.innerHTML = equipHtml;
  container.querySelector("#pane-settings")!.innerHTML = settingsHtml;

  const equipModule = initEquipTab(container);
  initSettingsTab(container);

  const btn = container.querySelector(".ty-helper-btn") as HTMLElement;
  const panel = container.querySelector(".ty-helper-panel") as HTMLElement;

  makeDraggable(btn, undefined, () => {
    panel.classList.toggle("open");
    if (panel.classList.contains("open")) {
      equipModule.refreshInv(); // 刷新背包下拉框
      equipModule.refreshScenes(); // 刷新场景绑定列表
    }
  });

  makeDraggable(
    panel,
    container.querySelector(".ty-panel-header") as HTMLElement,
  );

  container
    .querySelector(".ty-panel-close-btn")
    ?.addEventListener("click", (e) => {
      e.stopPropagation();
      panel.classList.remove("open");
    });

  // Tab 切换逻辑
  container.querySelectorAll(".ty-tab-btn").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      const targetId = (e.currentTarget as HTMLElement).dataset.target!;
      container
        .querySelectorAll(".ty-tab-btn, .ty-tab-pane")
        .forEach((el) => el.classList.remove("active"));
      btn.classList.add("active");
      container.querySelector(`#${targetId}`)!.classList.add("active");
    });
  });
}
