# Golden Hour Glass Wheel — Wallpaper Engine 工程

这是可直接导入 Wallpaper Engine 的 **Web Wallpaper** 目录。

## 文件

- `project.json`：工程元数据与 Balance 属性
- `index.html`：构建产物，自包含精灵图
- `preview.jpg`：1920×1080 预览
- `assets/ambience.mp3`：96 秒原创氛围纯音乐

## 导入

1. Wallpaper Engine → **Create Wallpaper → Web**。
2. 或 **Open → project.json**，指向本目录。
3. 项目名 **Golden Hour Glass Wheel**。
4. 编辑器属性 **Balance (Speed & Light)**：
   - 0.0：0.8×，青蓝，45%
   - 0.5：1.0×，暖白，100%
   - 1.0：1.2×，淡紫，45%

## 鼠标与音频

- 桌面鼠标输入取决于 Wallpaper Engine 设置；不可用时使用 Balance 属性。
- 音频在浏览器中需要一次点击；Wallpaper Engine 是否允许无手势自动播放未验证。

## 重建

在仓库根目录：

```bash
node build.mjs
```

会重写本目录的 `index.html` 并复制音频。

完整说明见 [../docs/04-WallpaperEngine.md](../docs/04-WallpaperEngine.md)。
