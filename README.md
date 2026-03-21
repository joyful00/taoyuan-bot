# 🍑 桃源乡 (Taoyuan) 究极摸鱼辅助脚本

🔗 **项目开源地址：** [https://github.com/joyful00/taoyuan-bot](https://github.com/joyful00/taoyuan-bot)

[![版本](https://img.shields.io/badge/版本-0.3.1-blue.svg)]()

[![平台](https://img.shields.io/badge/平台-ScriptCat%20%7C%20Tampermonkey-orange.svg)]()

[![作者](https://img.shields.io/badge/作者-Joyful00-success.svg)]()

[![原版游戏](https://img.shields.io/badge/原版游戏-Taoyuan-FF1493.svg?style=for-the-badge&logo=github)](https://github.com/setube/taoyuan)

**让修仙更优雅，让摸鱼更纯粹。**

[📦 立即安装](https://scriptcat.org/zh-CN/script-show-page/5627) | [💬 提交反馈](https://github.com/joyful00/taoyuan-bot/issues) | [📖 开源地址](https://github.com/joyful00/taoyuan-bot)

---

## 📖 简介

《桃源乡》点点点太费鼠标？担心在公司肝进度被老板抓包？
**桃源助手 (Taoyuan Bot)** 是一款专为《桃源乡》玩家打造的深度辅助工具。它通过注入游戏底层逻辑，实现了**全场景自动化换装、高频钓鱼压制以及内存级矿洞透视**。

> 💡 **核心哲学：** 拒绝低效点击，实现降维打击。

---

## ✨ 核心神技 (Core Features)

### 👗 1. 无限虚空衣柜 `[全静默秒切]`

- **场景感知**：进入农场自动穿“农民套”，进入矿洞瞬切“战斗套”，进商店秒变“商人套”。
- **突破极限**：彻底打破官方仅 3 套预设的限制，支持**无限量**自定义套装方案。
- **中文词典**：直接输入装备中文名即可配置，换装逻辑在切图瞬间完成，**零延迟、无感官弹窗**。

### 👁️ 2. 矿洞上帝之眼 `[全图透视]`

- **战争迷雾消除**：踏入矿洞即刻洞悉全局，无需浪费体力点击方块。
- **智能标识**：👿 怪物/陷阱标红、🚪 出口标绿、💎 宝藏矿点标黄。
- **效率至上**：拒绝无效探索，直奔核心资源。

### 🎣 3. 极速垂钓引擎 `[全自动满级]`

- **物理自瞄**：自动抛竿、自动辨识鱼讯。
- **高频压制**：动态追踪变色目标，以 50ms 级频率死死咬住判定区域，**百发百中，绝不脱钩**。

### ⏳ 4. 零感知时空冻结 `[摸鱼保护]`

- **智能暂停**：支持在特定配置下自动冻结游戏时间流逝。
- **底层伪装**：采用 `visibilitychange` 模拟技术，实现**UI零入侵**的物理级暂停，摸鱼时不必担心角色体力空耗。

---

## ⚙️ 现代化控制台 (Configuration)

我们拒绝生硬的代码改参，为你准备了丝滑的交互体验：

- **专属悬浮面板**：内置蓝色小机器人悬浮球，支持全屏自由拖拽。
- **配置永久保存**：所有参数（套装方案、滑块力度、开关状态）均自动持久化，刷新不丢失。
- **响应式调参**：进度条与开关即时生效，无需重启脚本。
- **纯净日志系统**：生产环境下自动静默所有调试日志，仅保留一行艺术化的启动提醒，绝不污染控制台。

---

## 🚀 安装指南

### 1. 前置要求

确保你的浏览器已安装以下任一脚本管理器：

- [ScriptCat (脚本猫)](https://docs.scriptcat.org/) **(强烈推荐)**
- [Tampermonkey (油猴)](https://www.tampermonkey.net/)

### 2. 安装步骤

1. 前往项目的 [GitHub Releases](https://github.com/joyful00/taoyuan-bot) 页面。
2. 点击 **“安装脚本”** (通常为 `dist/index.user.js`)。
3. 刷新游戏页面，点击右侧出现的**助手悬浮球**即可开启你的修仙之旅！

---

## 🛠️ 技术栈 (Tech Stack)

- **Core:** TypeScript + Vue 3 (Composition API)
- **Build:** Vite + `vite-plugin-monkey`
- **Store:** Pinia (Persistence)
- **Logger:** Consola (Production Silent Mode)
- **Styles:** Flexbox Layout + Inline SVG

---

## 🤝 贡献与反馈

如果你有更好的想法，欢迎提 Issue 或 PR！

- **Bug 反馈**: 请注明你的浏览器版本与脚本管理器类型。
- **新功能提案**: 欢迎分享更有趣的“摸鱼逻辑”。

---

## 📜 免责声明

本脚本仅供学习交流使用，请勿用于任何商业用途。使用本脚本产生的任何后果由使用者自行承担。**摸鱼虽好，可不要贪杯哦！**
