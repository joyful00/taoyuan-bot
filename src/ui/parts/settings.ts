// src/ui/parts/settings.ts
import { configStore } from "../../store/config";

export function initSettingsTab(container: HTMLElement) {
  const swAutoPause = container.querySelector(
    "#switch-autopause",
  ) as HTMLInputElement;
  const swAutoEquip = container.querySelector(
    "#switch-autoequip",
  ) as HTMLInputElement;
  const swXRay = container.querySelector("#switch-xray") as HTMLInputElement;
  const swAutoFish = container.querySelector(
    "#switch-autofish",
  ) as HTMLInputElement;
  const sliderTension = container.querySelector(
    "#slider-tension",
  ) as HTMLInputElement;
  const sliderTolerance = container.querySelector(
    "#slider-tolerance",
  ) as HTMLInputElement;
  const valTension = container.querySelector("#val-tension") as HTMLElement;
  const valTolerance = container.querySelector("#val-tolerance") as HTMLElement;
  const btnSave = container.querySelector("#btn-save-settings");

  // 同步显示 slider 值
  const syncSliderValues = () => {
    if (valTension && sliderTension) {
      valTension.textContent = sliderTension.value;
    }
    if (valTolerance && sliderTolerance) {
      valTolerance.textContent = sliderTolerance.value;
    }
  };

  // 添加 slider 事件监听
  if (sliderTension) {
    sliderTension.addEventListener("input", syncSliderValues);
  }
  if (sliderTolerance) {
    sliderTolerance.addEventListener("input", syncSliderValues);
  }

  const load = () => {
    const s = configStore.data.settings;
    if (swAutoPause) swAutoPause.checked = s.autoPauseEnabled || false;
    if (swAutoEquip) swAutoEquip.checked = s.autoEquipEnabled || true;
    if (swXRay) swXRay.checked = s.xrayEnabled || true;
    if (swAutoFish) swAutoFish.checked = s.autoFishEnabled || true;
    if (sliderTension) sliderTension.value = s.fishTension.toString();
    if (sliderTolerance) sliderTolerance.value = s.fishTolerance.toString();
    syncSliderValues();
  };

  btnSave?.addEventListener("click", () => {
    configStore.data.settings.autoPauseEnabled = swAutoPause.checked;
    configStore.data.settings.autoEquipEnabled = swAutoEquip.checked;
    configStore.data.settings.xrayEnabled = swXRay.checked;
    configStore.data.settings.autoFishEnabled = swAutoFish.checked;
    configStore.data.settings.fishTension = parseInt(sliderTension.value, 10);
    configStore.data.settings.fishTolerance = parseInt(
      sliderTolerance.value,
      10,
    );
    configStore.save();
  });

  load();
}
