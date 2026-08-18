# Buzzy 接手卡

新开一条 Composer，把文末「开场白」贴进去，或 `@docs/HANDOFF.md`。

## 线上 / 仓库

- 本地：`/Users/xun/工作/website/buzzy`
- 站点：https://buzzy.oiiii.studio · https://buzzy-dusky.vercel.app
- GitHub：https://github.com/nuxzar/buzzy
- Vercel 项目：`nuxzars-projects/buzzy`
- 开发：`pnpm dev` → http://localhost:5173/

## 技术栈

Vite + React（JS）+ Three.js（鲶鱼 LiquidObject）+ OGL（波浪 / 光斑）

文案唯一来源：`src/data/copy.js`

## 流程

Loading（真实加载 GLB，画满 2 帧后 ENTER 才亮）→ 问答 10 题 → 鱼开心摇摆 → 填名字 → 鱼游走卸掉 3D → 荣誉证书（FlameWrap）

## 必守

- 不要恢复全站磨砂 / GrainOverlay / 波浪与鱼的 grain
- 不要用 Google CDN Draco；解码器在 `public/draco/`
- 上线模型从 R2 读：`https://pub-1dad2170fdae4bf6906ef4d6dffac632.r2.dev/base_basic_shaded_opt.glb`。Draco 仍用本地 `public/draco/`。CORS 见 `docs/r2-cors.json`。原版 8.3MB 在 `originals/`，勿拷回 `public/`
- 相机位置只在鱼游走时改；平时交给 OrbitControls，否则拖不转
- Loading 遮罩 `pointer-events: none`，只有 ENTER 可点，否则挡旋转
- 证书底图：`/images/cover.jpg`；保存导出用 canvas 合成，不是原图
- BGM 默认 50%，点 ENTER 才播；开关在右上角
- 动态文案改 `src/data/copy.js`

## 视觉层（z 从底到顶）

波浪 → 光斑 → 鲶鱼 → 品牌（左上，可点出礼物弹层）→ 问答/证书 → Loading →（无全屏噪点）

## 开场白

```text
继续 Buzzy《鲶鱼》官网。请先读 @docs/HANDOFF.md。

仓库：/Users/xun/工作/website/buzzy
线上：https://buzzy.oiiii.studio
GitHub：nuxzar/buzzy · Vercel 项目 buzzy

当前已上线。不要加回磨砂 grain。改文案走 src/data/copy.js。
下一步请等我指示。
```
