import doFarmWork from "./farm";
import doShopWork from "./shop";
import doVillageWork from "./village";
import { autoEquipByVirtualWardrobe } from "./autoEquip";
import { TaskManager } from "./utils/taskManager";
import { useStore } from "./store";
import { setupAutoFishing } from "./fishing";
import doMineWork from "./mine";
function handleRouteChange() {
  const currentPath = window.location.hash;
  if (useStore.currentMap === currentPath) return;

  useStore.currentMap = currentPath;
  console.log(`🗺️ 地图切换 -> ${currentPath}`);
  autoEquipByVirtualWardrobe(currentPath);
  TaskManager.clearAll();

  //延迟 500ms，给 Vue 渲染 DOM 的时间
  setTimeout(() => {
    if (currentPath.includes("/village")) {
      doVillageWork();
    }
    if (currentPath.includes("/farm")) {
      doFarmWork();
    }
    if (currentPath.includes("/shop")) {
      doShopWork();
    }
    if (currentPath.includes("/fishing")) {
      setupAutoFishing();
    }
    if (currentPath.includes("/mining")) {
      doMineWork();
    }
  }, 500);
}

function main() {
  console.log("桃园助手启动！现在游戏时间：" + new Date().toLocaleString());

  const originalPushState = history.pushState;
  history.pushState = function (...args: any[]) {
    originalPushState.apply(this, args as any);
    handleRouteChange();
  };
}

main();
