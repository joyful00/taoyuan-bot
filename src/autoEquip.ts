// ==========================================
// 桃源乡 - 无限虚拟衣柜引擎
// ==========================================
import { EQUIP_DICT } from "./data/equipDict";
import { logger } from "./utils/logger";
import { configStore } from "./store/config"; // 👈 引入最新的持久化配置中心

// 💡 智能转码：优先查字典，查不到就原样返回
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

// 🔑 骇入背包数据库
function getInventoryStore(): any {
  let vueApp: any = null;
  for (const el of Array.from(document.querySelectorAll("*"))) {
    if ((el as any).__vue_app__) {
      vueApp = (el as any).__vue_app__;
      break;
    }
  }
  if (!vueApp) return null;

  const provides = vueApp._context?.provides;
  if (!provides) return null;

  let pinia: any = null;
  for (const sym of Object.getOwnPropertySymbols(provides)) {
    if (provides[sym]?._s instanceof Map) {
      pinia = provides[sym];
      break;
    }
  }
  return pinia ? pinia._s.get("inventory") : null;
}

// ==========================================
// 散件极速穿戴引擎 (暴露给 main.ts)
// ==========================================
export function autoEquipByVirtualWardrobe(currentPath: string) {
  let targetConfig = null;
  let targetPath = null;

  // 1. 匹配路由 (🚨 关键修改：直接读取本地实时保存的配置)
  for (const [pathKey, config] of Object.entries(
    configStore.data.equipPresets,
  )) {
    if (currentPath.includes(pathKey)) {
      targetConfig = config;
      targetPath = pathKey;
      break;
    }
  }

  // 没匹配到配置，或当前已经穿了这套，直接退出
  if (!targetConfig || currentEquippedPath === targetPath) return;

  const store = getInventoryStore();
  if (!store) {
    logger.error("无法读取背包数据库！");
    return;
  }

  // 2. 依次寻址穿戴
  logger.info(`开始为地图 [${targetPath}] 换上 [${targetConfig.name}]！`);

  if (targetConfig.hat) {
    logger.info("开始穿戴帽子!");
    const trueId = getDefId(targetConfig.hat);
    logger.info(`目标帽子ID: ${trueId}`);

    const idx = store.ownedHats.findIndex((h: any) => h.defId === trueId);
    if (idx !== -1 && store.equippedHatIndex !== idx) {
      store.equipHat(idx);
      logger.info(`成功穿戴帽子: ${targetConfig.hat}`);
    } else {
      logger.warn(`帽子 ${targetConfig.hat} 未找到或已装备`);
    }
  }

  if (targetConfig.weapon) {
    logger.info("开始穿戴武器!");
    const trueId = getDefId(targetConfig.weapon);
    logger.info(`目标武器ID: ${trueId}`);

    const idx = store.ownedWeapons.findIndex((w: any) => w.defId === trueId);
    if (idx !== -1 && store.equippedWeaponIndex !== idx) {
      store.equipWeapon(idx);
      logger.info(`成功穿戴武器: ${targetConfig.weapon}`);
    } else {
      logger.warn(`武器 ${targetConfig.weapon} 未找到或已装备`);
    }
  }

  if (targetConfig.shoe) {
    logger.info("开始穿戴鞋子!");
    const trueId = getDefId(targetConfig.shoe);
    logger.info(`目标鞋子ID: ${trueId}`);

    const idx = store.ownedShoes.findIndex((s: any) => s.defId === trueId);
    if (idx !== -1 && store.equippedShoeIndex !== idx) {
      store.equipShoe(idx);
      logger.info(`成功穿戴鞋子: ${targetConfig.shoe}`);
    } else {
      logger.warn(`鞋子 ${targetConfig.shoe} 未找到或已装备`);
    }
  }

  if (targetConfig.ring1) {
    logger.info("开始穿戴戒指1!");
    const trueId = getDefId(targetConfig.ring1);
    logger.info(`目标戒指1ID: ${trueId}`);

    const idx = store.ownedRings.findIndex((r: any) => r.defId === trueId);
    if (idx !== -1) {
      store.equipRing(idx, 0); // 槽位 1
      logger.info(`成功穿戴戒指1: ${targetConfig.ring1}`);
    } else {
      logger.warn(`戒指1 ${targetConfig.ring1} 未找到或已装备`);
    }
  }

  if (targetConfig.ring2) {
    logger.info("开始穿戴戒指2!");
    const trueId = getDefId(targetConfig.ring2);
    logger.info(`目标戒指2ID: ${trueId}`);

    const idx = store.ownedRings.findIndex((r: any) => r.defId === trueId);
    if (idx !== -1) {
      store.equipRing(idx, 1); // 槽位 2
      logger.info(`成功穿戴戒指2: ${targetConfig.ring2}`);
    } else {
      logger.warn(`戒指2 ${targetConfig.ring2} 未找到或已装备`);
    }
  }

  // 3. 更新状态并弹出 Toast 提示
  currentEquippedPath = targetPath;
  showToast(`👗 已自动换装: ${targetConfig.name}`);
  logger.info(
    `✨ [虚拟衣柜] 成功为地图 [${targetPath}] 换上 [${targetConfig.name}]！`,
  );
}
