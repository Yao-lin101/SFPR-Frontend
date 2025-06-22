#!/bin/bash

# 生产环境构建脚本

echo "开始构建 CSList 前端..."

# 设置生产环境变量
export VITE_API_BASE_URL="https://cslist.ineed.asia"
export VITE_MEDIA_URL="https://cslist.ineed.asia/media/"

# 安装依赖
echo "安装依赖..."
npm install

# 构建项目
echo "构建项目..."
npm run build

echo "构建完成！dist 目录已生成，可以部署到服务器。"
echo ""
echo "部署步骤："
echo "1. 将 dist 目录上传到服务器的 /www/wwwroot/cslist/ 目录"
echo "2. 确保 nginx 配置文件 cslist.conf 已加载"
echo "3. 重启 nginx 服务"
echo ""
echo "nginx 配置文件位置: all_nginx/nginx/cslist.conf" 