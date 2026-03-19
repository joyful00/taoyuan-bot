import { defineConfig } from "vite";
import monkey from "vite-plugin-monkey";

export default defineConfig({
  plugins: [
    monkey({
      entry: "src/main.ts", // 指定你的代码入口文件
      userscript: {
        name: "《桃源乡》游戏助手 Pro",
        namespace: "http://tampermonkey.net/",
        version: "0.2.0",
        description: "上班摸鱼必备的《桃源乡》终极外挂！",
        match: ["https://taoyuan.wenzi.games/*"], // 核心：限制脚本只在游戏页面运行
        author: "Joyful",
        // 核心：禁用所有 GM_* 函数，防止脚本权限问题
        grant: "none",
        tag: "桃源乡 游戏助手",
      },
    }),
  ],
});
