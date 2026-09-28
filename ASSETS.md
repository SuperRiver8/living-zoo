# 素材来源与使用方式

本项目的动物 GLB 与金合欢树干来自 [3D Assets](https://3dassets.dev/)，资产 API 标注为 **CC0 1.0 Universal**，AI 生成、静态模型，无原生骨骼动作。下载后本地加载，不运行远程脚本。许可：[CC0](https://creativecommons.org/publicdomain/zero/1.0/)。

为兼容 `/zoom/` 站点的内容安全策略，模型内嵌 WebP 已拆为 `public/models/textures/` 中的静态文件。GLB 的图片 URI 使用相对路径 `textures/...`，GLTFLoader 会从模型所在的同站点目录加载，不再为内嵌图片生成临时 blob 地址。新增或重新下载模型后运行 `npm run assets:externalize`，再构建发布。
当前 GLB 不使用 Draco 或 Meshopt 压缩，因此加载时关闭这两个解码器，避免严格 `script-src` 下初始化 WebAssembly。添加压缩模型前需同步调整加载策略与站点 CSP。

| 本地文件 | 资产 ID |
| --- | --- |
| lion.glb | 30195 |
| tiger.glb | 30200 |
| elephant.glb | 30210 |
| giraffe.glb | 30205 |
| zebra.glb | 30202 |
| panda.glb | 6055 |
| kangaroo.glb | 30220 |
| flamingo.glb | 28083 |
| deer.glb | 30203 |
| peacock.glb | 28094 |
| parrot.glb | 28086 |
| hippo.glb | 30207 |
| acacia.glb | 30221 |

下载地址格式：`https://cdn.3dassets.dev/assets/{ID}/v1/model.glb`。

主要来源包：[Realistic Wild Animals HD](https://3dassets.dev/packs/exotic-wildlife-hd)。现有 `exotic-wildlife-hd.json` 保留来源元数据。新增素材：[孔雀](https://3dassets.dev/assets/birds-and-reptiles-hd-indian-peacock-95e3a0fd)、[金刚鹦鹉](https://3dassets.dev/assets/birds-and-reptiles-hd-scarlet-macaw-2483dfea)、[河马](https://3dassets.dev/assets/exotic-wildlife-hd-hippopotamus-9d28fbee)、[金合欢](https://3dassets.dev/assets/exotic-wildlife-hd-umbrella-acacia-850a62bb)。

树叶与孔雀尾屏贴图由本项目 Canvas 代码生成；地形、围栏、道路、建筑与饲养员由代码生成。动物骨骼及动作由本项目程序生成，没有冒用原始资产具备写实动画的说法。

入口新增大猩猩：资产 ID 30214，Silverback gorilla，CC0；下载地址 https://cdn.3dassets.dev/assets/30214/v1/model.glb 。入口雕像使用大猩猩与狮子网格的铜质材质版本。眼球、虹膜、瞳孔、高光、短绒毛、胡须和皮肤凹凸由本项目代码补充。
