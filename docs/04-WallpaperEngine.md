# Wallpaper Engine 壁纸工程

## 1. 工程类型

本项目是 **Web Wallpaper**，不是 Scene 壁纸。

关键文件：

```text
wallpaper/
├─ project.json
├─ index.html
├─ preview.jpg
└─ assets/
   └─ ambience.mp3
```

`project.json` 关键字段：

```json
{
  "type": "web",
  "file": "index.html",
  "preview": "preview.jpg",
  "title": "Golden Hour Glass Wheel",
  "version": 1
}
```

## 2. 导入

1. 打开 Wallpaper Engine。
2. 选择 **Create Wallpaper → Web**，或 **Open → project.json**。
3. 指向 `wallpaper/`。
4. 项目名为 **Golden Hour Glass Wheel**。
5. 打开右侧属性，可调整 **Balance (Speed & Light)**。

如果编辑器要求放在默认工程目录，可复制整个 `wallpaper/` 到：

```text
...\wallpaper_engine\projects\myprojects\golden-hour-glass-wheel
```

不要拆散 `index.html`、`assets/` 与 `project.json`。

## 3. 用户属性

`project.json`：

```json
"balance": {
  "order": 0,
  "text": "Balance (Speed & Light)",
  "type": "slider",
  "min": 0,
  "max": 1,
  "step": 0.01,
  "value": 0.5
}
```

页面接收：

```js
window.wallpaperPropertyListener = {
  applyUserProperties(properties) {
    if (properties.balance) {
      window.__setWallpaperBalance(properties.balance.value);
    }
  }
};
```

映射：

- 0.0：0.8×，青蓝，45%
- 0.5：1.0×，暖白，100%
- 1.0：1.2×，淡紫，45%

## 4. 鼠标输入

页面使用普通 pointer events。桌面壁纸是否收到鼠标事件取决于 Wallpaper Engine 的鼠标输入设置和桌面焦点。

- 能收到：可直接拖动场景内变阻器。
- 不能收到：使用编辑器 **Balance** 属性。
- 若要发布到 Workshop，建议在说明中提示用户两种操作方式。

## 5. 音频

`index.html` 使用：

```js
new Audio('assets/ambience.mp3')
```

自动播放策略：

- 浏览器通常要求用户手势。
- 页面会在加载后尝试播放，并在 pointerdown/keydown 时再次尝试。
- Wallpaper Engine 的 CEF 可能允许壁纸音频自动播放，也可能不允许；若无声，点击壁纸一次。
- 页面隐藏时暂停，恢复可见时继续。

## 6. 性能

- 场景使用 WebGL，多个透明层与一个后期处理通道。
- 精灵图 3072×3072，内嵌在 HTML 中。
- 音频为 96 秒、约 1.9 MB 的 MP3。
- 新增联动光实际光源共 5 个，另有贴面柔光，不为每颗灯珠创建点光源。
- 未在 Wallpaper Engine 内做 GPU 性能基准；低配机器可在未来增加质量属性。

## 7. 发布

编辑器内：

1. 检查预览图和标题。
2. 选择适当标签（当前为 Abstract）。
3. **Publish** 到 Steam Workshop。
4. 说明中写明 Balance 属性、鼠标输入和音乐启动方式。

## 8. 官方文档

- [Creating a Web Wallpaper](https://docs.wallpaperengine.io/en/web/first/gettingstarted.html)
- [Web User Properties](https://docs.wallpaperengine.io/en/web/customization/properties.html)
- [wallpaperPropertyListener](https://docs.wallpaperengine.io/en/web/api/propertylistener.html)
- [Editing Wallpapers](https://help.wallpaperengine.io/en/functionality/editingwallpapers.html)

本环境无法直接抓取上述文档（DNS 解析被限制），工程结构依据公开 Web Wallpaper 约定与浏览器验证完成。**尚未在 Wallpaper Engine 客户端内实际导入验证。**
