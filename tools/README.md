# 工具脚本

## shot.mjs

基于 Edge CDP 的截图脚本。原脚本把 Edge 路径、默认输出目录和临时 profile 固定在 Windows 本机，移植到其他机器时请修改：

- `edge` 路径
- 默认 `out` 路径
- `profile` 临时目录

示例：

```bash
node tools/shot.mjs "file:///绝对路径/wallpaper/index.html?t=8&clock=15:28" "out.png" 30000 "@probe.js"
```

## make_ambience.py

重新生成 `assets/ambience.wav`，使用 NumPy 与标准库 wave。

```bash
python tools/make_ambience.py
```

生成后可转 MP3：

```bash
ffmpeg -y -i assets/ambience.wav -codec:a libmp3lame -b:a 160k assets/ambience.mp3
```

请从仓库根目录运行，脚本输出 `assets/ambience.wav`。
