# 解锁引体向上——力训私教课

这是一个纯静态、手机优先的引体向上自适应训练 Web App。

## 功能

- 第一次填写基线：体重、悬垂、肩胛引体、屈臂悬垂、离心下降、标准引体
- 自动估计当前引体准备度与预计解锁时间
- 每天自动生成训练任务
- 每张任务卡独立用 5 级完成度打卡
- 根据最近完成情况自动调整下一次同类任务难度
- 记录累计打卡天数、连续打卡天数、最近 14 天
- 单日状态下降不会让前台成长进度倒退
- 只有真正完成至少 1 个标准引体才显示“解锁”
- 数据保存在当前设备浏览器的 localStorage 中，不需要数据库

## 上传 GitHub

1. 新建一个 GitHub 仓库，例如 `pullup-coach`
2. 把本文件夹里的全部文件和 `images` 文件夹上传到仓库根目录
3. 进入仓库：
   - `Settings`
   - `Pages`
   - `Build and deployment`
   - Source 选择 `Deploy from a branch`
   - Branch 选择 `main`
   - Folder 选择 `/ (root)`
   - 点击 `Save`
4. 等待 GitHub Pages 部署完成
5. GitHub 会生成类似下面的网址：

   `https://你的用户名.github.io/pullup-coach/`

## 手机使用

请直接用 Safari、Chrome、华为浏览器等打开 GitHub Pages 网址。

iPhone 可以在 Safari 中：
- 点“分享”
- 选择“添加到主屏幕”

这样使用体验会接近一个独立 App。

## 数据说明

目前所有训练数据都保存在浏览器本地。

这意味着：
- 同一台手机、同一个浏览器再次打开，数据会保留
- 换手机或清除浏览器网站数据后，记录不会自动同步
- 当前版本不需要登录，也不会把儿童训练数据上传到服务器

如果以后需要多设备同步，可以再接入云数据库。

## 文件结构

```text
pullup-coach/
├── index.html
├── style.css
├── app.js
├── manifest.json
├── README.md
└── images/
    ├── hero.webp
    ├── hang.webp
    ├── scap.webp
    ├── row.webp
    ├── top.webp
    ├── ecc.webp
    ├── plank.webp
    ├── recovery.webp
    ├── success.webp
    ├── icon-192.png
    └── icon-512.png
```
