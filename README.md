# SFPR 前端

这是 SFPR 项目的前端部分，基于 React 18 和 TypeScript 开发。完整的项目文档请参考[后端仓库](https://github.com/Yao-lin101/SFPR)。

## 技术栈

- React 18
- TypeScript
- TailwindCSS
- shadcn/ui

## 本地开发

1. 安装依赖
```bash
npm install
```

2. 配置环境变量
```bash
cp .env.example .env.local
```

编辑 `.env.local` 文件，配置以下必要参数：
```env
VITE_API_BASE_URL=http://localhost:8000  # 后端API地址
```

3. 启动开发服务器
```bash
npm run dev
```

4. 构建生产版本
```bash
npm run build
```

## 项目结构

```
src/
├── components/         # 通用组件
│   ├── ui/            # UI组件库
├── hooks/             # 自定义Hooks
├── lib/               # 工具函数和常量
├── pages/            # 页面组件
└── services/         # API服务
```


## 相关仓库

- [SFPR 后端](https://github.com/Yao-lin101/SFPR) - 后端服务