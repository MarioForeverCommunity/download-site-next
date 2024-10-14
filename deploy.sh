#!/usr/bin/env sh

# 确保脚本抛出遇到的错误
set -e

# 生成静态文件
npm run build

# 进入生成的文件夹
cd docs/.vuepress/dist

# 拷贝到本地 nginx 文件夹下面 \cp 是覆盖源文件
echo "**************************** 本地部署 *************************"
rsync -av --ignore-times --delete ./ /data/wwwroot/smwp.marioforever.net/
chown -R www-data:www-data /data/wwwroot/smwp.marioforever.net/
echo "**************************** 部署成功 *************************"

cd -
rm -rf docs/.vuepress/dist
