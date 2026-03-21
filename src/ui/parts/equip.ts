// src/ui/parts/equip.ts
import { configStore, type EquipPreset } from "../../store/config";
import {
  getOwnedEquipment,
  SCENE_LIST,
  resetEquippedPath,
} from "../../autoEquip";

export function initEquipTab(container: HTMLElement) {
  // === 1. DOM 元素获取 ===
  const presetSelector = container.querySelector(
    "#equip-preset-selector",
  ) as HTMLSelectElement;
  const presetNameInput = container.querySelector(
    "#eq-preset-name",
  ) as HTMLInputElement;
  const btnAddPreset = container.querySelector("#btn-add-preset");
  const btnDelPreset = container.querySelector("#btn-del-preset");
  const btnRefreshInv = container.querySelector("#btn-refresh-inv");
  const btnSaveEquip = container.querySelector(
    "#btn-save-equip",
  ) as HTMLButtonElement;
  const sceneContainer = container.querySelector("#scene-mapping-container");

  const eqSelectors = {
    hat: container.querySelector("#eq-hat") as HTMLSelectElement,
    weapon: container.querySelector("#eq-weapon") as HTMLSelectElement,
    ring1: container.querySelector("#eq-ring1") as HTMLSelectElement,
    ring2: container.querySelector("#eq-ring2") as HTMLSelectElement,
    shoe: container.querySelector("#eq-shoe") as HTMLSelectElement,
  };

  // === 2. 核心渲染逻辑 ===

  /**
   * 渲染装备下拉选项 (支持真实背包数据与缓存回显)
   */
  const renderOptions = () => {
    const inv = getOwnedEquipment();

    Object.entries(eqSelectors).forEach(([key, sel]) => {
      const savedVal = sel.dataset.val || ""; // 从 dataset 获取当前套装应选中的值
      let html = "";

      if (!inv) {
        // 模式 A: 背包未加载 (懒加载中) -> 显示当前缓存值 + 刷新提示
        html = `<option value="">-- 请点 🔄 刷新背包 --</option>`;
        if (savedVal) {
          html = `<option value="${savedVal}">${savedVal}</option>` + html;
        }
      } else {
        // 模式 B: 背包已就绪 -> 渲染真实拥有的装备列表
        html = `<option value="">-- 脱下/不穿 --</option>`;
        const items = (inv as any)[key + "s"] || [];
        const uniqueItems = Array.from(new Set(items)) as string[];

        // 确保即使装备在仓库里，也能显示在选项中防止保存时丢失
        if (savedVal && !uniqueItems.includes(savedVal)) {
          uniqueItems.unshift(savedVal);
        }

        uniqueItems.forEach((item) => {
          html += `<option value="${item}">${item}</option>`;
        });
      }

      sel.innerHTML = html;
      sel.value = savedVal;
    });

    // 状态反馈
    if (btnRefreshInv) {
      (btnRefreshInv as HTMLElement).style.color = inv ? "#10b981" : "#ef4444";
    }
  };

  /**
   * 刷新并渲染套装列表
   */
  const renderPresetList = (selectId?: string) => {
    presetSelector.innerHTML = "";
    Object.entries(configStore.data.presets).forEach(([id, preset]) => {
      const opt = document.createElement("option");
      opt.value = id;
      opt.textContent = preset.name;
      presetSelector.appendChild(opt);
    });

    if (selectId) presetSelector.value = selectId;
    loadPresetToForm();
    renderSceneMappings();
  };

  /**
   * 将当前选中的套装数据加载到表单中
   */
  const loadPresetToForm = () => {
    const id = presetSelector.value;
    const preset = configStore.data.presets[id];
    if (!preset) return;

    presetNameInput.value = preset.name;
    // 将数据暂存在 dataset 中，供 renderOptions 使用
    eqSelectors.hat.dataset.val = preset.hat || "";
    eqSelectors.weapon.dataset.val = preset.weapon || "";
    eqSelectors.ring1.dataset.val = preset.ring1 || "";
    eqSelectors.ring2.dataset.val = preset.ring2 || "";
    eqSelectors.shoe.dataset.val = preset.shoe || "";

    renderOptions();
  };

  /**
   * 渲染全场景绑定列表
   */
  const renderSceneMappings = () => {
    if (!sceneContainer) return;
    sceneContainer.innerHTML = "";

    const presetOptions =
      `<option value="">-- 到达时不换装 --</option>` +
      Object.entries(configStore.data.presets)
        .map(([id, p]) => `<option value="${id}">${p.name}</option>`)
        .join("");

    SCENE_LIST.forEach((scene) => {
      const row = document.createElement("div");
      row.className = "ty-config-row";
      row.innerHTML = `
        <label style="width: 50px;">${scene.name}</label>
        <select data-path="${scene.path}" style="flex: 1;">
          ${presetOptions}
        </select>
      `;

      const select = row.querySelector("select") as HTMLSelectElement;
      select.value = configStore.data.sceneMappings[scene.path] || "";

      select.addEventListener("change", (e) => {
        const val = (e.target as HTMLSelectElement).value;
        if (val) configStore.data.sceneMappings[scene.path] = val;
        else delete configStore.data.sceneMappings[scene.path];
        configStore.save();
        // 场景映射改变后，重置换装锁定，确保立即触发
        resetEquippedPath();
      });

      sceneContainer.appendChild(row);
    });
  };

  // === 3. 事件绑定 ===

  // 切换套装
  presetSelector.addEventListener("change", loadPresetToForm);

  // 刷新背包
  btnRefreshInv?.addEventListener("click", () => renderOptions());

  // 新增套装
  btnAddPreset?.addEventListener("click", () => {
    const newId = "preset_" + Date.now();
    configStore.data.presets[newId] = {
      id: newId,
      name: "新方案 " + Math.floor(Math.random() * 1000),
      hat: "",
      weapon: "",
      ring1: "",
      ring2: "",
      shoe: "",
    };
    configStore.save();
    renderPresetList(newId);
  });

  // 删除套装
  btnDelPreset?.addEventListener("click", () => {
    const id = presetSelector.value;
    if (Object.keys(configStore.data.presets).length <= 1)
      return alert("至少保留一个方案");
    if (!confirm(`确认删除方案 [${configStore.data.presets[id].name}]？`))
      return;

    delete configStore.data.presets[id];
    // 同步清理映射关系
    Object.keys(configStore.data.sceneMappings).forEach((path) => {
      if (configStore.data.sceneMappings[path] === id)
        delete configStore.data.sceneMappings[path];
    });

    configStore.save();
    renderPresetList(Object.keys(configStore.data.presets)[0]);
  });

  // 保存当前方案
  btnSaveEquip?.addEventListener("click", () => {
    const id = presetSelector.value;
    const updatedPreset: EquipPreset = {
      id,
      name: presetNameInput.value.trim() || "未命名方案",
      hat: eqSelectors.hat.value,
      weapon: eqSelectors.weapon.value,
      ring1: eqSelectors.ring1.value,
      ring2: eqSelectors.ring2.value,
      shoe: eqSelectors.shoe.value,
    };

    configStore.data.presets[id] = updatedPreset;
    configStore.save();

    // UI 反馈
    btnSaveEquip.innerText = "✅ 已保存";
    btnSaveEquip.style.backgroundColor = "#10b981";
    setTimeout(() => {
      btnSaveEquip.innerText = "💾 保存当前套装";
      btnSaveEquip.style.backgroundColor = "";
    }, 1500);

    renderPresetList(id);
    resetEquippedPath(); // 强制重置换装状态，使设置立刻对当前地图生效
  });

  // === 4. 初始化运行 ===
  renderPresetList();

  // 返回给 panel.ts 的接口
  return {
    refreshInv: renderOptions,
    refreshScenes: renderSceneMappings,
  };
}
