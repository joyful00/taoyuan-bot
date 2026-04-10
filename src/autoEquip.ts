// src/autoEquip.ts
import { EQUIP_DICT, REVERSE_EQUIP_DICT } from "./data/equipDict";
import { logger } from "./utils/logger";
import { configStore } from "./store/config";

// 🌟 全场景列表配置
export const SCENE_LIST = [
  { name: "农场", path: "/game/farm" },
  { name: "畜牧", path: "/game/animal" },
  { name: "家园", path: "/game/home" },
  { name: "小屋", path: "/game/cottage" },
  { name: "村庄", path: "/game/village" },
  { name: "商店", path: "/game/shop" },
  { name: "采集", path: "/game/forage" },
  { name: "钓鱼", path: "/game/fishing" },
  { name: "挖矿", path: "/game/mining" },
  { name: "烹饪", path: "/game/cooking" },
  { name: "育种", path: "/game/breeding" },
  { name: "翰海", path: "/game/hanhai" },
  { name: "鱼塘", path: "/game/fishpond" },
];

const getDefId = (name: string) => EQUIP_DICT[name] || name;
let currentEquippedPath: string | null = null;

// ==========================================
// 核心黑客工具与 UI
// ==========================================

// 🚀 轻量级网页提示框 (Toast)
function showToast(message: string) {
  const toast = document.createElement("div");
  toast.innerText = message;
  toast.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        background: rgba(16, 185, 129, 0.9);
        color: white;
        padding: 8px 16px;
        border-radius: 4px;
        font-size: 14px;
        z-index: 99999;
        pointer-events: none;
        box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        transition: opacity 0.3s;
    `;
  document.body.appendChild(toast);
  setTimeout(() => {
    toast.style.opacity = "0";
    setTimeout(() => toast.remove(), 300);
  }, 2000);
}

// 🔑 骇入背包数据库 (究极防弹版)
function getInventoryStore(): any {
  let vueApp: any = null;

  // 1. 极速通道：优先查常用根节点 (瞬间完成，不卡顿)
  const roots = [
    document.querySelector("#app"),
    document.querySelector(".app-wrapper"),
    document.body,
  ];
  for (const root of roots) {
    if (root && (root as any).__vue_app__) {
      vueApp = (root as any).__vue_app__;
      break;
    }
  }

  // 2. 兜底通道：如果根节点没有，开启 DOM 地毯式全图扫描
  if (!vueApp) {
    const allElements = document.querySelectorAll("*");
    for (let i = 0; i < allElements.length; i++) {
      if ((allElements[i] as any).__vue_app__) {
        vueApp = (allElements[i] as any).__vue_app__;
        break;
      }
    }
  }

  if (!vueApp) return null;

  const provides = vueApp._context?.provides;
  if (!provides) return null;

  let pinia: any = null;
  // 🌟 核心修复：完全采用控制台验证成功的提取逻辑，兼容所有 Symbol
  const symbols = Object.getOwnPropertySymbols(provides);
  for (const sym of symbols) {
    const instance = provides[sym];
    if (instance && instance._s && instance._s instanceof Map) {
      pinia = instance;
      break;
    }
  }

  if (!pinia) return null;

  const store = pinia._s.get("inventory");

  // 🌟 双重保险：兼容 Pinia 的 Setup Store 模式，防止属性被隐藏在 $state 里
  if (store) {
    return store;
  }

  return null;
}

// 🌟 核心新增：提取玩家真实拥有的装备，供 UI 渲染下拉框！
export function getOwnedEquipment() {
  const store = getInventoryStore();
  // 如果背包没加载，绝对不要报错，悄悄返回 null 即可
  if (!store) return null;

  const mapToNames = (items: any[]) =>
    items.map((i) => REVERSE_EQUIP_DICT[i.defId] || i.defId);

  return {
    hats: mapToNames(store.ownedHats || []),
    weapons: mapToNames(store.ownedWeapons || []),
    shoes: mapToNames(store.ownedShoes || []),
    rings: mapToNames(store.ownedRings || []),
  };
}

// 🌟 终极强化的换装逻辑
export function autoEquipByVirtualWardrobe(currentPath: string) {
  if (!configStore.data.settings.autoEquipEnabled) return;

  const scene = SCENE_LIST.find((s) => currentPath.includes(s.path));
  if (!scene) return;

  const presetId = configStore.data.sceneMappings[scene.path];
  if (!presetId) return;

  const targetConfig = configStore.data.presets[presetId];
  if (!targetConfig) return;

  if (currentEquippedPath === scene.path) return;

  const store = getInventoryStore();
  if (!store) {
    logger.warn("🎒 背包模块休眠中，跳过本次换装。(建议进游戏先开一次背包)");
    return;
  }

  // 🌟 加入护盾：万一底层函数名变了，也能在控制台抓到，不会导致整个外挂死机
  try {
    logger.info(`开始为 [${scene.name}] 换上套装 [${targetConfig.name}]！`);

    if (targetConfig.hat) {
      const trueId = getDefId(targetConfig.hat);
      const idx = store.ownedHats.findIndex((h: any) => h.defId === trueId);
      if (idx !== -1 && store.equippedHatIndex !== idx) store.equipHat(idx);
    }

    if (targetConfig.weapon) {
      const trueId = getDefId(targetConfig.weapon);
      const idx = store.ownedWeapons.findIndex((w: any) => w.defId === trueId);
      if (idx !== -1 && store.equippedWeaponIndex !== idx)
        store.equipWeapon(idx);
    }

    if (targetConfig.shoe) {
      const trueId = getDefId(targetConfig.shoe);
      const idx = store.ownedShoes.findIndex((s: any) => s.defId === trueId);
      if (idx !== -1 && store.equippedShoeIndex !== idx) store.equipShoe(idx);
    }

    // 💍 极简且完美的戒指换装逻辑
    const ring1Id = targetConfig.ring1 ? getDefId(targetConfig.ring1) : null;
    const ring2Id = targetConfig.ring2 ? getDefId(targetConfig.ring2) : null;

    // 处理一号槽位 (左手)
    if (ring1Id) {
      const idx = store.ownedRings.findIndex((r: any) => r.defId === ring1Id);
      // 如果找到了，且当前左手没装备这枚戒指，则装备
      if (idx !== -1 && store.equippedRingSlot1 !== idx) {
        store.equipRing(idx, 0); 
      }
    } else {
      store.unequipRing(0); // 如果配置没写戒指1，脱掉左手
    }

    // 处理二号槽位 (右手)
    if (ring2Id) {
      // 🌟 核心防坑：游戏明文禁止左右手装备同名戒指！
      if (ring1Id === ring2Id) {
        logger.warn(`⚠️ 游戏规则限制：禁止同时装备两枚 [${targetConfig.ring2}]，已跳过二号槽位。`);
      } else {
        const idx = store.ownedRings.findIndex((r: any) => r.defId === ring2Id);
        // 如果找到了，且当前右手没装备这枚戒指，则装备
        if (idx !== -1 && store.equippedRingSlot2 !== idx) {
          store.equipRing(idx, 1); 
        }
      }
    } else {
      store.unequipRing(1); // 如果配置没写戒指2，脱掉右手
    }

    currentEquippedPath = scene.path;
    showToast(`👗 已自动换装: ${targetConfig.name}`);
  } catch (error) {
    logger.error("❌ 换装执行期间发生异常！", error);
  }
}

// 💡 顺手导出一个重置函数（稍后在 panel.ts 里点“保存配置”时调用，可以让装备立刻刷新）
export function resetEquippedPath() {
  currentEquippedPath = null;
}
