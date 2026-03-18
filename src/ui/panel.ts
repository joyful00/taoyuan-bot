// src/ui/panel.ts
import "./css/panel.css";
import layoutHtml from "./html/layout.html?raw";
import equipHtml from "./html/equip.html?raw";
import settingsHtml from "./html/settings.html?raw"; // 引入新的聚合设置页
import { configStore } from "../store/config";

// 拖拽引擎 (保持不变)
function makeDraggable(
  element: HTMLElement,
  handle?: HTMLElement,
  onClick?: () => void,
) {
  let isDragging = false,
    startX = 0,
    startY = 0,
    initialLeft = 0,
    initialTop = 0;
  const dragHandle = handle || element;

  dragHandle.addEventListener("mousedown", (e) => {
    e.preventDefault();
    isDragging = false;
    startX = e.clientX;
    startY = e.clientY;
    const rect = element.getBoundingClientRect();
    initialLeft = rect.left;
    initialTop = rect.top;

    element.style.right = "auto";
    element.style.bottom = "auto";
    element.style.left = initialLeft + "px";
    element.style.top = initialTop + "px";
    element.style.margin = "0";

    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseup", onMouseUp);
  });

  function onMouseMove(e: MouseEvent) {
    const dx = e.clientX - startX,
      dy = e.clientY - startY;
    if (Math.abs(dx) > 3 || Math.abs(dy) > 3) isDragging = true;
    if (isDragging) {
      element.style.left = initialLeft + dx + "px";
      element.style.top = initialTop + dy + "px";
    }
  }

  function onMouseUp() {
    document.removeEventListener("mousemove", onMouseMove);
    document.removeEventListener("mouseup", onMouseUp);
    if (!isDragging && onClick) onClick();
  }
}

// 组装并初始化面板
export function initPanel() {
  const container = document.createElement("div");
  container.innerHTML = layoutHtml;
  document.body.appendChild(container);

  // 注入子组件
  document.getElementById("pane-equip")!.innerHTML = equipHtml;
  document.getElementById("pane-settings")!.innerHTML = settingsHtml;

  const btn = document.querySelector(".ty-helper-btn") as HTMLElement;
  const panel = document.querySelector(".ty-helper-panel") as HTMLElement;
  const header = panel.querySelector(".ty-panel-header") as HTMLElement;
  const closeBtn = panel.querySelector(".ty-panel-close-btn") as HTMLElement;

  makeDraggable(btn, undefined, () => panel.classList.toggle("open"));
  makeDraggable(panel, header);
  closeBtn.addEventListener("click", () => panel.classList.remove("open"));

  // === 绑定选项卡切换逻辑 ===
  const tabBtns = panel.querySelectorAll(".ty-tab-btn");
  const tabPanes = panel.querySelectorAll(".ty-tab-pane");

  tabBtns.forEach((btn) => {
    btn.addEventListener("click", (e) => {
      tabBtns.forEach((b) => b.classList.remove("active"));
      tabPanes.forEach((p) => p.classList.remove("active"));

      const target = e.target as HTMLElement;
      target.classList.add("active");
      const targetPaneId = target.getAttribute("data-target");
      if (targetPaneId)
        document.getElementById(targetPaneId)?.classList.add("active");
    });
  });

  // === 装备页联动逻辑 ===
  const presetSelector = document.getElementById(
    "equip-preset-selector",
  ) as HTMLSelectElement;
  const formTitle = document.getElementById("equip-form-title") as HTMLElement;
  const eqInputs = {
    hat: document.getElementById("eq-hat") as HTMLInputElement,
    weapon: document.getElementById("eq-weapon") as HTMLInputElement,
    ring1: document.getElementById("eq-ring1") as HTMLInputElement,
    ring2: document.getElementById("eq-ring2") as HTMLInputElement,
    shoe: document.getElementById("eq-shoe") as HTMLInputElement,
  };

  // 回显：切换下拉框时渲染数据
  presetSelector.addEventListener("change", (e) => {
    const key = (e.target as HTMLSelectElement)
      .value as keyof typeof configStore.data.equipPresets;
    const data = configStore.data.equipPresets[key];
    if (data) {
      formTitle.innerText = `${data.name} 配置`;
      eqInputs.hat.value = data.hat || "";
      eqInputs.weapon.value = data.weapon || "";
      eqInputs.ring1.value = data.ring1 || "";
      eqInputs.ring2.value = data.ring2 || "";
      eqInputs.shoe.value = data.shoe || "";
    }
  });
  presetSelector.dispatchEvent(new Event("change")); // 初始化触发一次

  // 保存：写入 LocalStorage
  document.getElementById("btn-save-equip")?.addEventListener("click", () => {
    const key =
      presetSelector.value as keyof typeof configStore.data.equipPresets;
    configStore.data.equipPresets[key] = {
      name: configStore.data.equipPresets[key].name, // 名字保持不变
      hat: eqInputs.hat.value.trim(),
      weapon: eqInputs.weapon.value.trim(),
      ring1: eqInputs.ring1.value.trim(),
      ring2: eqInputs.ring2.value.trim(),
      shoe: eqInputs.shoe.value.trim(),
    };
    configStore.save();

    // 搞个按钮反馈动画
    const btn = document.getElementById("btn-save-equip")!;
    btn.innerText = "✅ 保存成功！";
    btn.style.backgroundColor = "#10b981";
    setTimeout(() => {
      btn.innerText = "💾 保存此方案配置";
      btn.style.backgroundColor = "";
    }, 1500);
  });

  // ==========================================
  // ⚙️ 设置页：数据回显与保存
  // ==========================================
  const swAutoEquip = document.getElementById(
    "switch-autoequip",
  ) as HTMLInputElement; //
  const swXray = document.getElementById("switch-xray") as HTMLInputElement;
  const swAutoFish = document.getElementById(
    "switch-autofish",
  ) as HTMLInputElement;
  const slTension = document.getElementById(
    "slider-tension",
  ) as HTMLInputElement;
  const slTolerance = document.getElementById(
    "slider-tolerance",
  ) as HTMLInputElement;
  const valTension = document.getElementById("val-tension") as HTMLElement;
  const valTolerance = document.getElementById("val-tolerance") as HTMLElement;

  // 回显：将 store 数据塞进开关和滑块
  swAutoEquip.checked = configStore.data.settings.autoEquipEnabled ?? true;
  swXray.checked = configStore.data.settings.xrayEnabled;
  swAutoFish.checked = configStore.data.settings.autoFishEnabled;
  slTension.value = configStore.data.settings.fishTension.toString();
  slTolerance.value = configStore.data.settings.fishTolerance.toString();
  valTension.innerText = slTension.value;
  valTolerance.innerText = slTolerance.value;

  // 滑块滑动时实时更新数字
  slTension.addEventListener(
    "input",
    (e) => (valTension.innerText = (e.target as HTMLInputElement).value),
  );
  slTolerance.addEventListener(
    "input",
    (e) => (valTolerance.innerText = (e.target as HTMLInputElement).value),
  );

  // 保存：写入 LocalStorage
  document
    .getElementById("btn-save-settings")
    ?.addEventListener("click", () => {
      configStore.data.settings.autoEquipEnabled = swAutoEquip.checked;
      configStore.data.settings.xrayEnabled = swXray.checked;
      configStore.data.settings.autoFishEnabled = swAutoFish.checked;
      configStore.data.settings.fishTension = parseInt(slTension.value, 10);
      configStore.data.settings.fishTolerance = parseInt(slTolerance.value, 10);
      configStore.save();

      const btn = document.getElementById("btn-save-settings")!;
      btn.innerText = "✅ 设置已生效！";
      btn.style.backgroundColor = "#10b981";
      setTimeout(() => {
        btn.innerText = "💾 保存全局设置";
        btn.style.backgroundColor = "";
      }, 1500);
    });
}
