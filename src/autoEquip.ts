// ==========================================
// 桃源乡 - 无限虚拟衣柜引擎 (全物品图鉴+纯中文+UI提示版)
// ==========================================

// 1. 📖 装备中英文转码词典 (已录入游戏全图鉴数据)
const EQUIP_DICT: Record<string, string> = {
  // === 🎩 帽子 ===
  草帽: "straw_hat",
  竹笠: "bamboo_hat",
  矿工帽: "miner_helmet",
  渔夫帽: "fisher_hat",
  铁盔: "iron_helm",
  文士帽: "scholar_hat",
  药师帽: "herbalist_hat",
  商人帽: "merchant_hat",
  金冠: "golden_crown",
  龙角盔: "dragon_helm",
  霜寒兜帽: "frost_hood",
  暗影面具: "shadow_mask",
  虚空面甲: "void_visor",
  石魔帽: "golem_stone_cap",
  晶王冠: "crystal_king_crown",
  幸运小帽: "lucky_cap",
  莲花帽: "lotus_hat",
  皮毛帽: "fur_cap",
  丝绸头巾: "silk_turban",
  翡翠簪: "jade_hairpin",
  黑曜盔: "obsidian_helm",
  凤冠: "phoenix_crown",
  冰后冠冕: "frost_queen_tiara",
  龙王角冠: "abyss_dragon_horns",
  熔岩兜帽: "lava_helm",
  淘金帽: "treasure_cap",
  公会战盔: "guild_war_helm",

  // === 💍 戒指 ===
  翠玉护身环: "jade_guard_ring",
  石英明环: "quartz_ring",
  农人青环: "farmers_ring",
  碧灵指环: "jade_spirit_ring",
  渔翁碧环: "anglers_ring",
  善缘指环: "friendship_ring",
  赤焰指环: "ruby_flame_ring",
  矿工金环: "miners_ring",
  商贾金环: "merchants_ring",
  月华指环: "moonlight_ring",
  丰月指环: "harvest_moon_ring",
  悟道指环: "exp_ring",
  暗影指环: "shadow_ring",
  寻宝指环: "treasure_hunter_ring",
  坚磐指环: "stalwart_ring",
  龙脉指环: "dragon_ring",
  福运指环: "fortune_ring",
  战神指环: "warlord_ring",
  五彩天环: "prismatic_ring",
  泥岩护带: "mud_golem_band",
  冰后指环: "frost_queen_circlet",
  熔岩君印: "lava_lord_seal",
  持久指环: "endurance_ring",
  渔获碧环: "fish_jade_ring",
  催生指环: "growth_ring",
  行路指环: "travel_ring",
  晶王之印: "crystal_king_seal",
  暗影君戒: "shadow_sovereign_ring",
  龙王指环: "abyss_dragon_ring",
  浅矿护环: "shallow_guard",
  棱晶护带: "crystal_prism_band",
  古玉指环: "ancient_jade_ring",
  公会战戒: "guild_war_ring",

  // === 👟 鞋子 ===
  草鞋: "straw_sandals",
  布鞋: "cloth_shoes",
  皮靴: "leather_boots",
  矿工靴: "miner_boots",
  疾风靴: "gale_boots",
  铁甲靴: "iron_greaves",
  丝绸绣鞋: "silk_slippers",
  商旅靴: "merchant_boots",
  月步靴: "moon_step_boots",
  龙鳞靴: "dragon_scale_boots",
  霜行靴: "frost_treads",
  暗影行者: "shadow_striders",
  虚空战靴: "void_treads",
  熔岩铠靴: "lava_lord_greaves",
  暗王之靴: "shadow_sovereign_treads",
  福运鞋: "fortune_slippers",
  棉鞋: "cotton_shoes",
  钓鱼靴: "fishing_waders",
  玉底鞋: "jade_slippers",
  黑曜甲靴: "obsidian_greaves",
  风行靴: "wind_walker",
  凤鸣靴: "phoenix_boots",
  冰后舞靴: "frost_queen_slippers",
  龙王战靴: "abyss_dragon_treads",
  晶矿踏靴: "crystal_treads",
  幸运长靴: "lucky_boots",
  公会战靴: "guild_war_boots",

  // === ⚔️ 武器 ===
  木棒: "wooden_stick",
  铜剑: "copper_sword",
  铁刀: "iron_blade",
  战锤: "war_hammer",
  金戟: "gold_halberd",
  骨匕: "bone_dagger",
  冰锋匕: "frost_dagger",
  暗影之刃: "shadow_blade",
  泥王之牙: "mud_king_fang",
  冰霜之刺: "frost_queen_sting",
  熔岩之锤: "lava_lord_maul",
  晶棘匕: "crystal_shard_dagger",
  暗影太刀: "shadow_katana",
  虚空战锤: "void_hammer",
  水晶长剑: "crystal_blade",
  暗影锤: "shadow_mace",
  虚空太刀: "void_katana",
  晶王圣剑: "crystal_king_blade",
  暗影之牙: "shadow_sovereign_fang",
  龙王权杖: "abyss_dragon_mace",
  竹杖: "bamboo_staff",
  铁匕: "iron_dagger",
  金扇: "golden_fan",
  黑曜刀: "obsidian_blade",
  粘液锤: "slime_mace",
  熔岩刃: "magma_blade",
  棱晶匕: "prism_dagger",
  虚空之牙: "void_fang_dagger",
  翡翠长剑: "jade_sword",
  古神剑: "ancient_blade",
  公会战刃: "guild_war_blade",
};

// 💡 智能转码：优先查字典，查不到就原样返回
const getDefId = (name: string) => EQUIP_DICT[name] || name;

// 2. 👗 虚拟衣柜配置表 (请根据你实际拥有的装备自由调整！)
const VIRTUAL_WARDROBE: Record<string, any> = {
  "/farm": {
    name: "农民套",
    hat: "草帽",
    weapon: "金戟",
    ring1: "农人青环",
    ring2: "持久指环",
    shoe: "疾风靴",
  },
  "/fish": {
    name: "钓鱼套",
    hat: "渔夫帽",
    weapon: "竹杖",
    ring1: "渔翁碧环",
    ring2: "渔获碧环",
    shoe: "钓鱼靴",
  },
  "/shop": {
    name: "商人套",
    hat: "商人帽",
    weapon: "金扇",
    ring1: "商贾金环",
    ring2: "古玉指环",
    shoe: "商旅靴",
  },
  "/mining": {
    name: "矿工套",
    hat: "矿工帽",
    weapon: "战锤",
    ring1: "矿工金环",
    ring2: "翠玉护身环",
    shoe: "矿工靴",
  },
};

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

  // 1. 匹配路由
  for (const [pathKey, config] of Object.entries(VIRTUAL_WARDROBE)) {
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
    console.error("❌ 无法读取背包数据库！");
    return;
  }

  // 2. 依次寻址穿戴
  if (targetConfig.hat) {
    console.log("开始穿戴帽子!");

    const trueId = getDefId(targetConfig.hat);
    console.log(`目标帽子ID: ${trueId}`);

    const idx = store.ownedHats.findIndex((h: any) => h.defId === trueId);
    if (idx !== -1 && store.equippedHatIndex !== idx) {
      store.equipHat(idx);
      console.log(`成功穿戴帽子: ${targetConfig.hat}`);
    } else {
      console.log(`帽子 ${targetConfig.hat} 未找到或已装备`);
    }
  }

  if (targetConfig.weapon) {
    console.log("开始穿戴武器!");

    const trueId = getDefId(targetConfig.weapon);
    console.log(`目标武器ID: ${trueId}`);

    const idx = store.ownedWeapons.findIndex((w: any) => w.defId === trueId);
    if (idx !== -1 && store.equippedWeaponIndex !== idx) {
      store.equipWeapon(idx);
      console.log(`成功穿戴武器: ${targetConfig.weapon}`);
    } else {
      console.log(`武器 ${targetConfig.weapon} 未找到或已装备`);
    }
  }

  if (targetConfig.shoe) {
    console.log("开始穿戴鞋子!");

    const trueId = getDefId(targetConfig.shoe);
    console.log(`目标鞋子ID: ${trueId}`);

    const idx = store.ownedShoes.findIndex((s: any) => s.defId === trueId);
    if (idx !== -1 && store.equippedShoeIndex !== idx) {
      store.equipShoe(idx);
      console.log(`成功穿戴鞋子: ${targetConfig.shoe}`);
    } else {
      console.log(`鞋子 ${targetConfig.shoe} 未找到或已装备`);
    }
  }

  if (targetConfig.ring1) {
    console.log("开始穿戴戒指1!");

    const trueId = getDefId(targetConfig.ring1);
    console.log(`目标戒指1ID: ${trueId}`);

    const idx = store.ownedRings.findIndex((r: any) => r.defId === trueId);
    if (idx !== -1) {
      store.equipRing(idx, 0); // 槽位 1
      console.log(`成功穿戴戒指1: ${targetConfig.ring1}`);
    } else {
      console.log(`戒指1 ${targetConfig.ring1} 未找到或已装备`);
    }
  }

  if (targetConfig.ring2) {
    const trueId = getDefId(targetConfig.ring2);
    const idx = store.ownedRings.findIndex((r: any) => r.defId === trueId);
    if (idx !== -1) {
      store.equipRing(idx, 1); // 槽位 2
      console.log(`成功穿戴戒指2: ${targetConfig.ring2}`);
    } else {
      console.log(`戒指2 ${targetConfig.ring2} 未找到或已装备`);
    }
  }

  // 3. 更新状态并弹出 Toast 提示
  currentEquippedPath = targetPath;
  showToast(`👗 已自动换装: ${targetConfig.name}`);
  console.log(
    `✨ [虚拟衣柜] 成功为地图 [${targetPath}] 换上 [${targetConfig.name}]！`
  );
}
