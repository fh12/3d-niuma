# React + TypeScript + Vite 项目说明

## 项目简介

这是一个使用 Cursor IDE 完全自主创作开发的 3D 射击类游戏项目。项目采用 React、TypeScript 和 Vite 搭建的前端项目框架，结合现代化的 3D 渲染技术，打造沉浸式的游戏体验。

### 技术特性

该模板提供了最基础的项目配置，支持以下特性：

-   快速的热模块替换（HMR）功能
-   TypeScript 类型检查
-   ESLint 代码规范检查
-   现代化的开发体验

## 项目插件

目前项目支持两个官方插件：

-   [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react/README.md) - 使用 Babel 实现快速刷新
-   [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react-swc) - 使用 SWC 实现快速刷新

## ESLint 配置说明

如果你正在开发生产环境的应用，建议更新配置以启用类型感知的 lint 规则。具体配置方法如下：

1. 配置顶层 `parserOptions` 属性
2. 使用推荐的类型检查配置
3. 可选择添加样式类型检查
4. 安装并配置 React ESLint 插件

---

# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

-   [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react/README.md) uses [Babel](https://babeljs.io/) for Fast Refresh
-   [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type aware lint rules:

-   Configure the top-level `parserOptions` property like this:

```js
export default tseslint.config({
    languageOptions: {
        // other options...
        parserOptions: {
            project: ["./tsconfig.node.json", "./tsconfig.app.json"],
            tsconfigRootDir: import.meta.dirname,
        },
    },
});
```

-   Replace `tseslint.configs.recommended` to `tseslint.configs.recommendedTypeChecked` or `tseslint.configs.strictTypeChecked`
-   Optionally add `...tseslint.configs.stylisticTypeChecked`
-   Install [eslint-plugin-react](https://github.com/jsx-eslint/eslint-plugin-react) and update the config:

```js
// eslint.config.js
import react from "eslint-plugin-react";

export default tseslint.config({
    // Set the react version
    settings: { react: { version: "18.3" } },
    plugins: {
        // Add the react plugin
        react,
    },
    rules: {
        // other rules...
        // Enable its recommended rules
        ...react.configs.recommended.rules,
        ...react.configs["jsx-runtime"].rules,
    },
});
```

