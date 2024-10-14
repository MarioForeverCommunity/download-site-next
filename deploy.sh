#!/usr/bin/env sh

# 确保脚本抛出遇到的错误
set -e

# 设置工作目录和分支
WORK_DIR=/data/mfdownload-next
BRANCH=main # 根据需要修改分支名

# 进入工作目录
cd $WORK_DIR || exit

# 拉取最新代码
git pull origin $BRANCH

# 安装依赖和构建
npm install
npm run build

# 将构建结果复制到目标路径
echo "**************************** 本地部署 *************************"
rsync -av --ignore-times --delete dist/ /data/wwwroot/download.marioforever.net/next/
chown -R www-data:www-data /data/wwwroot/download.marioforever.net/
echo "**************************** 部署成功 *************************"
