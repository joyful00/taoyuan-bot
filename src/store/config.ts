// src/store/config.ts

const STORAGE_KEY = "taoyuan_helper_config";

// 🌟 1. 明确定义套装的数据结构，治愈 TS 的类型推导强迫症
export interface EquipPreset {
  id: string;
  name: string;
  hat: string;
  weapon: string;
  ring1: string;
  ring2: string;
  shoe: string;
}

// 默认出厂设置
const defaultConfig = {
  // 🌟 2. 告诉 TS：这是一个字典，Key 是普通字符串，Value 是 EquipPreset
  presets: {
    preset_1: {
      id: "preset_1",
      name: "🌾 默认农场套",
      hat: "草帽",
      weapon: "金戟",
      ring1: "农人青环",
      ring2: "持久指环",
      shoe: "疾风靴",
    },
  } as Record<string, EquipPreset>, // 👈 关键就是这行 as 声明！

  // 场景映射表
  sceneMappings: {
    "/game/farm": "preset_1",
  } as Record<string, string>,

  settings: {
    autoEquipEnabled: true,
    xrayEnabled: true,
    autoFishEnabled: true,
    autoPauseEnabled: false,
    fishTension: 5,
    fishTolerance: 10,
  },
};

export const configStore = {
  data: { ...defaultConfig },

  load() {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        this.data = {
          presets: parsed.presets || defaultConfig.presets,
          sceneMappings: {
            ...defaultConfig.sceneMappings,
            ...parsed.sceneMappings,
          },
          settings: { ...defaultConfig.settings, ...parsed.settings },
        };
      } catch (e) {
        console.error("配置读取失败，使用默认配置");
      }
    }
  },

  save() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(this.data));
  },
};

configStore.load();
