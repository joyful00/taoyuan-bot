// src/store/config.ts

const STORAGE_KEY = "taoyuan_helper_config";

// 默认出厂设置
const defaultConfig = {
  equipPresets: {
    "/farm": {
      name: "🌾 农场专属",
      hat: "草帽",
      weapon: "金戟",
      ring1: "农人青环",
      ring2: "持久指环",
      shoe: "疾风靴",
    },
    "/fish": {
      name: "🎣 钓鱼专属",
      hat: "渔夫帽",
      weapon: "竹杖",
      ring1: "渔翁碧环",
      ring2: "渔获碧环",
      shoe: "钓鱼靴",
    },
    "/shop": {
      name: "💰 商人专属",
      hat: "商人帽",
      weapon: "金扇",
      ring1: "商贾金环",
      ring2: "古玉指环",
      shoe: "商旅靴",
    },
    "/mine": {
      name: "⛏️ 矿工专属",
      hat: "矿工帽",
      weapon: "战锤",
      ring1: "矿工金环",
      ring2: "翠玉护身环",
      shoe: "矿工靴",
    },
  },
  settings: {
    autoEquipEnabled: true, //自动换装总开关
    xrayEnabled: true, // 矿洞透视
    autoFishEnabled: true, // 自动钓鱼
    fishTension: 5, // 收线力度
    fishTolerance: 10, // 寻的容错
  },
};

// 极简状态管理器 (单例)
export const configStore = {
  data: { ...defaultConfig },

  // 从浏览器本地读取数据
  load() {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // 深度合并：保留用户设置，若有新加的默认字段也能补充进去
        this.data = {
          equipPresets: {
            ...defaultConfig.equipPresets,
            ...parsed.equipPresets,
          },
          settings: { ...defaultConfig.settings, ...parsed.settings },
        };
      } catch (e) {
        console.error("配置读取失败，使用默认配置");
      }
    }
  },

  // 存入浏览器本地
  save() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(this.data));
  },
};

// 脚本一启动就加载数据
configStore.load();
