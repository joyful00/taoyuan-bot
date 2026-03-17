# 🍑 桃源乡 (Taoyuan) 究极摸鱼辅助脚本

[![版本](https://img.shields.io/badge/版本-1.0.0-blue.svg)]()
[![平台](https://img.shields.io/badge/平台-ScriptCat%20%7C%20Tampermonkey-orange.svg)]()
[![作者](https://img.shields.io/badge/作者-Yanxi-success.svg)]()
[![原版游戏](https://img.shields.io/badge/原版游戏-Taoyuan-FF1493.svg?style=for-the-badge&logo=github)](https://github.com/setube/taoyuan)

> 上班摸鱼无意间迷上了《桃源乡》，点点点太费鼠标，还容易被老板抓包？这能忍？没忍住顺手撸了这个“摸鱼专属”辅助脚本！🐟💨
>
> 这可不是那种傻乎乎的按键精灵，而是直接扒了游戏底层 (Vue 3 / Pinia) 的底裤！通过内存级读写，实现了真正的 **零延迟、无弹窗、全后台静默** 换装与操作。让你解放双手，安心带薪修仙，摸鱼爽到飞起！

---

## ✨ 核心功能 (Features)

### 👗 1. 突破限制：无限虚拟衣柜 (全静默秒切)

- **场景自动识别**：进入农场自动换“农民套”，进入矿洞瞬间切“战斗套”，去商店秒换“商人套”。
- **0 毫秒内存封包**：直接调用底层 API `applyEquipmentPreset` 与单件寻址，无视游戏 UI 动画，**全程无弹窗、不卡顿**。
- **纯中文配置**：内置全物品中英文汉化词典，直接在代码顶部用中文配置你的专属神装，轻松突破官方 3 套衣服的限制！

### 👁️ 2. 降维打击：矿洞上帝之眼 (全图透视)

- 彻底穿透 Vite 混淆，精准骇入 Pinia 状态机。
- **动态寻址染色**：在不点击方块的情况下，直接读取 `floorGrid` 内存数组。
- 👿 怪物标红、🚪 出口标绿、💎 宝藏标黄。安全扫雷，绝不翻车！

### 🎣 3. 极速引擎：60FPS 满级钓鱼自瞄

- 摒弃低效的 `setInterval`，采用 `requestAnimationFrame` 打造电竞级 60FPS 追踪循环。
- **抗重力算法 & 模糊寻的**：精准计算滑块与鱼的中心 Y 轴差值，自动模拟物理键盘高频连发，完美咬死变色目标！

### 👨‍🌾 4. 彻底解放双手：全场景自动化

- **农场/村庄**：利用异步队列 (`async/await`) 处理繁琐的连续交互。
- **商店**：内置收益计算器，全自动扫货与抛售，做无情的赛博资本家。

---

## 🚀 安装指南 (Installation)

1. 安装浏览器脚本管理器插件：推荐使用 [ScriptCat (脚本猫)](https://docs.scriptcat.org/) 或 [Tampermonkey (油猴)](https://www.tampermonkey.net/)。
2. 点击本页面的 **“安装脚本”** 按钮。
3. 刷新游戏页面，即可在控制台 (F12) 或页面角落看到加载成功的提示。

---

## ⚙️ 进阶配置 (Configuration)

本脚本秉承**“配置与逻辑分离”**的极客精神。如果你需要修改自动换装的搭配，只需在脚本源码顶部找到 `VIRTUAL_WARDROBE` 对象，使用纯中文修改即可：

```javascript
const VIRTUAL_WARDROBE = {
  "/farm": {
    name: "农民套",
    hat: "草帽", // 支持纯中文，脚本底层会自动翻译！
    weapon: "金戟",
    ring1: "农人青环",
    ring2: "持久指环",
    shoe: "疾风靴",
  },
  // 你可以无限添加新套装...
};
```
