export type OperatorDomain =
  | "ai-labeling"
  | "audio"
  | "delivery"
  | "hbase"
  | "image"
  | "metadata"
  | "storage"
  | "tabular"
  | "validation"
  | "video";

export type OperatorRecord = {
  id: string;
  displayName: string;
  initial: string;
  domains: OperatorDomain[];
  behavior: string;
  cardinality: string;
  intro: string;
  weeklyRuns: string;
  wiki: string;
};

export const operatorRecords: OperatorRecord[] = [
  {
    "id": "ai-platform.deepseek",
    "displayName": "调用deepseek系列模型",
    "initial": "调",
    "domains": [
      "ai-labeling"
    ],
    "behavior": "enrich",
    "cardinality": "1:1",
    "intro": "该算子用于按配置的系统提示词和输入媒体调用 DeepSeek 多模态生成接口,",
    "weeklyRuns": "593",
    "wiki": "# `ai-platform.deepseek` — 调用deepseek系列模型\n\n> 正式 ID：`ai-platform.deepseek` · 旧别名：`ai_platform_deepseek` · 领域：ai-labeling\n\n## 决策\n\n- **适用**：该算子用于按配置的系统提示词和输入媒体调用 DeepSeek 多模态生成接口,\n- **不适用**：没有可访问的 urls，或无法约束模型输出格式时不要使用。\n- **行为**：`enrich`；基数 `1:1`；执行 `external_model_sync`。\n- **硬依赖**：无硬依赖\n- **替代项**：[ai-platform.gemini](ai-platform.gemini.md), [ai-platform.qwen_tmp1](ai-platform.qwen_tmp1.md)\n\n## 数据输入\n\n| 字段 | 类型 | 必需 | 语义 | 基数 | 可由谁提供 |\n| --- | --- | --- | --- | --- | --- |\n| urls | String | 是 | media_locator.http_list | many | tos.sign（需字段映射） |\n\n## 配置\n\n| 配置 | 类型 | 必需 | 默认值 |\n| --- | --- | --- | --- |\n| 系统提示词 | String | 否 | unknown |\n| 提示词 | String | 否 | unknown |\n| 类型(text / image / video / audio) | String | 否 | unknown |\n| 自动展开 | Boolean | 否 | true |\n| 视频标注每秒抽帧数 | Int | 否 | 2 |\n| 视频标注最大帧数 | Int | 否 | unknown |\n| 使用字段作为提示词 | Boolean | 否 | unknown |\n| 字段名 | String | 否 | unknown |\n| 单一性(尽可能多次输入结果一致) | Boolean | 否 | unknown |\n| 超时时间(秒) | Int | 否 | 600 |\n\n源码默认配置表达式：`Config{ AutoExpand: true, VdieoFps: 2, Timeout: 600, }`\n\n## 输出\n\n| 字段 | 类型 | 语义 | 基数 |\n| --- | --- | --- | --- |\n| deepseek_output | String | field.generic | one |\n\n## 风险\n\n- 依赖外部 AI 平台与 urls 字段，JSON 自动展开要求模型输出可解析，不负责事实校验或存储文件\n\n## 证据\n\n- 源码：`stages/ai_paltform/deepseek/deepseek.go` @ `f90386e38508`\n- 源码输入：`urls`\n- 源码输出：`deepseek_output`\n- QPS：`unknown`；并发：`64`\n- 可信度：`high`；冲突：无"
  },
  {
    "id": "ai-platform.gemini",
    "displayName": "调用gemini系列模型",
    "initial": "调",
    "domains": [
      "ai-labeling",
      "video",
      "image"
    ],
    "behavior": "enrich",
    "cardinality": "1:1",
    "intro": "该算子用于读取 TOS 媒体并调用 Gemini 生成文本或结构化结果,",
    "weeklyRuns": "777",
    "wiki": "# `ai-platform.gemini` — 调用gemini系列模型\n\n> 正式 ID：`ai-platform.gemini` · 旧别名：`ai_platform_gemini` · 领域：ai-labeling, video, image\n\n## 决策\n\n- **适用**：该算子用于读取 TOS 媒体并调用 Gemini 生成文本或结构化结果,\n- **不适用**：输入不是单个 tos_path，或任务要求一次直接处理未展开的路径列表时不要使用。\n- **行为**：`enrich`；基数 `1:1`；执行 `external_model_sync`。\n- **硬依赖**：无硬依赖\n- **替代项**：[ai-platform.deepseek](ai-platform.deepseek.md), [ai-platform.qwen_tmp1](ai-platform.qwen_tmp1.md)\n\n## 数据输入\n\n| 字段 | 类型 | 必需 | 语义 | 基数 | 可由谁提供 |\n| --- | --- | --- | --- | --- | --- |\n| tos_path | String | 是 | media_locator.tos | one | tos.list, vod.upload.tos, csv.expand（需字段映射）, csv.merge（需字段映射）, csv.unique（需字段映射）, image.resize（需字段映射） |\n\n## 配置\n\n| 配置 | 类型 | 必需 | 默认值 |\n| --- | --- | --- | --- |\n| 提示词 | String | 否 | unknown |\n| 自动展开 | Boolean | 否 | unknown |\n\n源码默认配置表达式：`Config{}`\n\n## 输出\n\n| 字段 | 类型 | 语义 | 基数 |\n| --- | --- | --- | --- |\n| gemini_output | String | field.generic | one |\n\n## 风险\n\n- 仅处理 tos_path 指向的单个媒体，依赖 CDN 签名和外部模型，AutoExpand 要求返回合法 JSON\n\n## 证据\n\n- 源码：`stages/ai_paltform/gemini/gemini.go` @ `f90386e38508`\n- 源码输入：`tos_path`\n- 源码输出：`gemini_output`\n- QPS：`unknown`；并发：`64`\n- 可信度：`high`；冲突：无"
  },
  {
    "id": "ai-platform.qwen",
    "displayName": "获取标题和关键词信息",
    "initial": "获",
    "domains": [
      "ai-labeling",
      "image"
    ],
    "behavior": "enrich",
    "cardinality": "1:1",
    "intro": "该算子用于对图片生成中文标题和关键词,",
    "weeklyRuns": "950",
    "wiki": "# `ai-platform.qwen` — 获取标题和关键词信息\n\n> 正式 ID：`ai-platform.qwen` · 旧别名：`ai_platform_qwen` · 领域：ai-labeling, image\n\n## 决策\n\n- **适用**：该算子用于对图片生成中文标题和关键词,\n- **不适用**：输入固定依赖 tos_path，能力局限于预置提示词的标题关键词抽取，不支持任意结构化任务\n- **行为**：`enrich`；基数 `1:1`；执行 `external_model_sync`。\n- **硬依赖**：无硬依赖\n- **替代项**：无已确认替代项\n\n## 数据输入\n\n| 字段 | 类型 | 必需 | 语义 | 基数 | 可由谁提供 |\n| --- | --- | --- | --- | --- | --- |\n| tos_path | String | 是 | media_locator.tos | one | tos.list, vod.upload.tos, csv.expand（需字段映射）, csv.merge（需字段映射）, csv.unique（需字段映射）, image.resize（需字段映射） |\n\n## 配置\n\n| 配置 | 类型 | 必需 | 默认值 |\n| --- | --- | --- | --- |\n| is_internal_model | Boolean | 否 | unknown |\n\n源码默认配置表达式：`Qwen3vl8b{}`\n\n## 输出\n\n| 字段 | 类型 | 语义 | 基数 |\n| --- | --- | --- | --- |\n| keywords | String | collection.generic | one |\n| title | String | field.generic | one |\n| source | String | field.generic | one |\n\n## 风险\n\n- 输入固定依赖 tos_path，能力局限于预置提示词的标题关键词抽取，不支持任意结构化任务\n\n## 证据\n\n- 源码：`stages/ai_paltform/qwen/qwen.go` @ `f90386e38508`\n- 源码输入：`dynamic/unknown`\n- 源码输出：`none/dynamic`\n- QPS：`unknown`；并发：`100`\n- 可信度：`high`；冲突：无"
  },
  {
    "id": "ai-platform.qwen_tmp1",
    "displayName": "调用qwen系列模型",
    "initial": "调",
    "domains": [
      "ai-labeling"
    ],
    "behavior": "enrich",
    "cardinality": "1:1",
    "intro": "需要自定义输入字段、输出字段和结构化多模态打标时使用。",
    "weeklyRuns": "735",
    "wiki": "# `ai-platform.qwen_tmp1` — 调用qwen系列模型\n\n> 正式 ID：`ai-platform.qwen_tmp1` · 旧别名：`ai_platform_qwen_tmp1` · 领域：ai-labeling\n\n## 决策\n\n- **适用**：需要自定义输入字段、输出字段和结构化多模态打标时使用。\n- **不适用**：尚未确定输出字段或无法保证模型返回合法结构化 JSON 时不要使用。\n- **行为**：`enrich`；基数 `1:1`；执行 `external_model_sync`。\n- **硬依赖**：无硬依赖\n- **替代项**：[ai-platform.deepseek](ai-platform.deepseek.md), [ai-platform.gemini](ai-platform.gemini.md)\n\n## 数据输入\n\n无固定数据输入；按配置动态指定。\n\n## 配置\n\n| 配置 | 类型 | 必需 | 默认值 |\n| --- | --- | --- | --- |\n| 模型 | String | 否 | unknown |\n| 类型 | String | 否 | unknown |\n| 提示词 | String | 否 | unknown |\n| 系统提示词 | String | 否 | unknown |\n| 输入字段 | List | 否 | unknown |\n| 输出字段 | List | 否 | unknown |\n| 抽帧数 | Int | 否 | unknown |\n| 最大帧数 | Int | 否 | unknown |\n| 提示词字段名 | String | 否 | unknown |\n| 单一性 | Boolean | 否 | unknown |\n| 阶段并发 | Int | 否 | unknown |\n| 超时时间 | Int | 否 | unknown |\n\n源码默认配置表达式：`Config1{}`\n\n## 输出\n\n无数据字段输出；该算子主要执行校验、过滤、等待或外部写入。\n\n## 风险\n\n- 要求模型返回可解析 JSON，依赖 RPM 限流和外部 AI 平台，不适合未定义输出 schema 的自由文本任务\n\n## 证据\n\n- 源码：`stages/ai_paltform/qwen/qwen_tmp1.go` @ `f90386e38508`\n- 源码输入：`dynamic/unknown`\n- 源码输出：`none/dynamic`\n- QPS：`2`；并发：`128`\n- 可信度：`high`；冲突：无"
  },
  {
    "id": "ai-platform.seedream.img2img",
    "displayName": "调用seedream系列模型(图生图)",
    "initial": "调",
    "domains": [
      "ai-labeling",
      "image"
    ],
    "behavior": "enrich",
    "cardinality": "1:1",
    "intro": "该算子用于调用 Seedream 图生图模型生成图片并输出结果路径,",
    "weeklyRuns": "405",
    "wiki": "# `ai-platform.seedream.img2img` — 调用seedream系列模型(图生图)\n\n> 正式 ID：`ai-platform.seedream.img2img` · 旧别名：`ai_platform_seedream_img2img` · 领域：ai-labeling, image\n\n## 决策\n\n- **适用**：该算子用于调用 Seedream 图生图模型生成图片并输出结果路径,\n- **不适用**：依赖输入 tos_path 和外部生成服务，会写入新图片，不处理文本到图或复杂批量合成逻辑\n- **行为**：`enrich`；基数 `1:1`；执行 `external_model_sync`。\n- **硬依赖**：无硬依赖\n- **替代项**：无已确认替代项\n\n## 数据输入\n\n| 字段 | 类型 | 必需 | 语义 | 基数 | 可由谁提供 |\n| --- | --- | --- | --- | --- | --- |\n| tos_path | String | 是 | media_locator.tos | one | tos.list, vod.upload.tos, csv.expand（需字段映射）, csv.merge（需字段映射）, csv.unique（需字段映射）, image.resize（需字段映射） |\n\n## 配置\n\n| 配置 | 类型 | 必需 | 默认值 |\n| --- | --- | --- | --- |\n| 提示词 | String | 否 | unknown |\n| 自动展开 | Boolean | 否 | unknown |\n\n源码默认配置表达式：`Config{}`\n\n## 输出\n\n| 字段 | 类型 | 语义 | 基数 |\n| --- | --- | --- | --- |\n| seedream_output | String | field.generic | one |\n\n## 风险\n\n- 依赖输入 tos_path 和外部生成服务，会写入新图片，不处理文本到图或复杂批量合成逻辑\n\n## 证据\n\n- 源码：`stages/ai_paltform/seedream/seedream.go` @ `f90386e38508`\n- 源码输入：`tos_path`\n- 源码输出：`seedream_output`\n- QPS：`unknown`；并发：`64`\n- 可信度：`high`；冲突：无"
  },
  {
    "id": "cn_clip.artimuse",
    "displayName": "通过tos地址得到artimuse分数",
    "initial": "通",
    "domains": [
      "ai-labeling",
      "image"
    ],
    "behavior": "enrich",
    "cardinality": "1:1",
    "intro": "该算子用于调用 ArtiMuse 模型识别图片艺术风格/艺术性分数,",
    "weeklyRuns": "445",
    "wiki": "# `cn_clip.artimuse` — 通过tos地址得到artimuse分数\n\n> 正式 ID：`cn_clip.artimuse` · 旧别名：`cn_clip_artimuse` · 领域：ai-labeling, image\n\n## 决策\n\n- **适用**：该算子用于调用 ArtiMuse 模型识别图片艺术风格/艺术性分数,\n- **不适用**：仅处理 tos_path 指向的图片，依赖 CN-CLIP 服务，不做内容审核或多图聚合\n- **行为**：`enrich`；基数 `1:1`；执行 `sync`。\n- **硬依赖**：无硬依赖\n- **替代项**：无已确认替代项\n\n## 数据输入\n\n| 字段 | 类型 | 必需 | 语义 | 基数 | 可由谁提供 |\n| --- | --- | --- | --- | --- | --- |\n| tos_path | String | 是 | media_locator.tos | one | tos.list, vod.upload.tos, csv.expand（需字段映射）, csv.merge（需字段映射）, csv.unique（需字段映射）, image.resize（需字段映射） |\n\n## 配置\n\n无用户配置。\n\n源码默认配置表达式：`unknown`\n\n## 输出\n\n| 字段 | 类型 | 语义 | 基数 |\n| --- | --- | --- | --- |\n| artimuse | String | field.generic | one |\n\n## 风险\n\n- 仅处理 tos_path 指向的图片，依赖 CN-CLIP 服务，不做内容审核或多图聚合\n\n## 证据\n\n- 源码：`stages/cn_clip/artimuse/artimuse.go` @ `f90386e38508`\n- 源码输入：`tos_path`\n- 源码输出：`artimuse`\n- QPS：`unknown`；并发：`100`\n- 可信度：`high`；冲突：无"
  },
  {
    "id": "cn_clip.iqa.video",
    "displayName": "通过tos地址得到iqa分数",
    "initial": "通",
    "domains": [
      "ai-labeling",
      "video"
    ],
    "behavior": "enrich",
    "cardinality": "1:1",
    "intro": "该算子用于直接调用视频 IQA 服务评估视频质量分,",
    "weeklyRuns": "1,129",
    "wiki": "# `cn_clip.iqa.video` — 通过tos地址得到iqa分数\n\n> 正式 ID：`cn_clip.iqa.video` · 旧别名：`cn_clip_iqa_video` · 领域：ai-labeling, video\n\n## 决策\n\n- **适用**：该算子用于直接调用视频 IQA 服务评估视频质量分,\n- **不适用**：依赖 tos_path 和外部模型，不抽帧也不解释具体质量缺陷\n- **行为**：`enrich`；基数 `1:1`；执行 `sync`。\n- **硬依赖**：无硬依赖\n- **替代项**：无已确认替代项\n\n## 数据输入\n\n| 字段 | 类型 | 必需 | 语义 | 基数 | 可由谁提供 |\n| --- | --- | --- | --- | --- | --- |\n| tos_path | String | 是 | media_locator.tos | one | tos.list, vod.upload.tos, csv.expand（需字段映射）, csv.merge（需字段映射）, csv.unique（需字段映射）, image.resize（需字段映射） |\n\n## 配置\n\n无用户配置。\n\n源码默认配置表达式：`unknown`\n\n## 输出\n\n| 字段 | 类型 | 语义 | 基数 |\n| --- | --- | --- | --- |\n| score | String | field.generic | one |\n\n## 风险\n\n- 依赖 tos_path 和外部模型，不抽帧也不解释具体质量缺陷\n\n## 证据\n\n- 源码：`stages/cn_clip/iqa/iqa.go` @ `f90386e38508`\n- 源码输入：`tos_path`\n- 源码输出：`score`\n- QPS：`unknown`；并发：`50`\n- 可信度：`high`；冲突：无"
  },
  {
    "id": "cn_clip.scbg",
    "displayName": "通过tos地址得到纯色背景分类",
    "initial": "通",
    "domains": [
      "ai-labeling",
      "image"
    ],
    "behavior": "enrich",
    "cardinality": "1:1",
    "intro": "该算子用于识别图片是否偏纯色背景并输出背景类型与分数,",
    "weeklyRuns": "1,084",
    "wiki": "# `cn_clip.scbg` — 通过tos地址得到纯色背景分类\n\n> 正式 ID：`cn_clip.scbg` · 旧别名：`cn_clip_scbg` · 领域：ai-labeling, image\n\n## 决策\n\n- **适用**：该算子用于识别图片是否偏纯色背景并输出背景类型与分数,\n- **不适用**：仅处理单张 TOS 图片，依赖 CN-CLIP 服务，不负责抠图或背景替换\n- **行为**：`enrich`；基数 `1:1`；执行 `sync`。\n- **硬依赖**：无硬依赖\n- **替代项**：无已确认替代项\n\n## 数据输入\n\n| 字段 | 类型 | 必需 | 语义 | 基数 | 可由谁提供 |\n| --- | --- | --- | --- | --- | --- |\n| tos_path | String | 是 | media_locator.tos | one | tos.list, vod.upload.tos, csv.expand（需字段映射）, csv.merge（需字段映射）, csv.unique（需字段映射）, image.resize（需字段映射） |\n\n## 配置\n\n无用户配置。\n\n源码默认配置表达式：`unknown`\n\n## 输出\n\n| 字段 | 类型 | 语义 | 基数 |\n| --- | --- | --- | --- |\n| scbg_score | String | field.generic | one |\n| background_type | String | field.generic | one |\n\n## 风险\n\n- 仅处理单张 TOS 图片，依赖 CN-CLIP 服务，不负责抠图或背景替换\n\n## 证据\n\n- 源码：`stages/cn_clip/scbg/scbg.go` @ `f90386e38508`\n- 源码输入：`tos_path`\n- 源码输出：`scbg_score, background_type`\n- QPS：`unknown`；并发：`100`\n- 可信度：`high`；冲突：无"
  },
  {
    "id": "cnclip.watermark",
    "displayName": "通过vid进行视频水印打标，使用qwen35-9b模型",
    "initial": "通",
    "domains": [
      "ai-labeling",
      "video"
    ],
    "behavior": "enrich",
    "cardinality": "1:1",
    "intro": "该算子用于通过 vid 判断视频水印、字幕和 logo 状态,",
    "weeklyRuns": "556",
    "wiki": "# `cnclip.watermark` — 通过vid进行视频水印打标，使用qwen35-9b模型\n\n> 正式 ID：`cnclip.watermark` · 旧别名：`cnclip_watermark` · 领域：ai-labeling, video\n\n## 决策\n\n- **适用**：该算子用于通过 vid 判断视频水印、字幕和 logo 状态,\n- **不适用**：依赖 VOD 下载与 Qwen3VL 服务，只做模型打标，不实际去水印或裁剪视频\n- **行为**：`enrich`；基数 `1:1`；执行 `sync`。\n- **硬依赖**：无硬依赖\n- **替代项**：无已确认替代项\n\n## 数据输入\n\n| 字段 | 类型 | 必需 | 语义 | 基数 | 可由谁提供 |\n| --- | --- | --- | --- | --- | --- |\n| vid | String | 是 | media_locator.vod_id | one | vod.local_split.tos, vod.upload, vod.local_split（需字段映射） |\n\n## 配置\n\n无用户配置。\n\n源码默认配置表达式：`unknown`\n\n## 输出\n\n| 字段 | 类型 | 语义 | 基数 |\n| --- | --- | --- | --- |\n| subtitle_status | String | collection.generic | one |\n| manipulate | String | field.generic | one |\n| logo | String | field.generic | one |\n\n## 风险\n\n- 依赖 VOD 下载与 Qwen3VL 服务，只做模型打标，不实际去水印或裁剪视频\n\n## 证据\n\n- 源码：`stages/cn_clip/qwen3vl9b/watermark/video_watermark_label.go` @ `f90386e38508`\n- 源码输入：`vid`\n- 源码输出：`subtitle_status, manipulate, logo`\n- QPS：`unknown`；并发：`50`\n- 可信度：`high`；冲突：无"
  },
  {
    "id": "video_cls.url",
    "displayName": "经过vid得到分类结果",
    "initial": "经",
    "domains": [
      "ai-labeling",
      "video"
    ],
    "behavior": "enrich",
    "cardinality": "1:1",
    "intro": "该算子用于根据视频 URL 调用分类模型并输出 top 分类标签,",
    "weeklyRuns": "1,207",
    "wiki": "# `video_cls.url` — 经过vid得到分类结果\n\n> 正式 ID：`video_cls.url` · 旧别名：`video_cls_url` · 领域：ai-labeling, video\n\n## 决策\n\n- **适用**：该算子用于根据视频 URL 调用分类模型并输出 top 分类标签,\n- **不适用**：输入是可访问 url，不负责 VOD 解析或视频下载，分类结果需由下游业务解释\n- **行为**：`enrich`；基数 `1:1`；执行 `sync`。\n- **硬依赖**：无硬依赖\n- **替代项**：无已确认替代项\n\n## 数据输入\n\n| 字段 | 类型 | 必需 | 语义 | 基数 | 可由谁提供 |\n| --- | --- | --- | --- | --- | --- |\n| url | String | 是 | media_locator.http | one | vod_workflow, tos.external_sign（需字段映射）, vod.audio.asr.submit（需字段映射）, vod.transcoding.get（需字段映射） |\n\n## 配置\n\n无用户配置。\n\n源码默认配置表达式：`unknown`\n\n## 输出\n\n| 字段 | 类型 | 语义 | 基数 |\n| --- | --- | --- | --- |\n| lr_label_top | String | field.generic | one |\n| zs_label_top | String | field.generic | one |\n\n## 风险\n\n- 输入是可访问 url，不负责 VOD 解析或视频下载，分类结果需由下游业务解释\n\n## 证据\n\n- 源码：`stages/cn_clip/video_cls/url.go` @ `f90386e38508`\n- 源码输入：`url`\n- 源码输出：`none/dynamic`\n- QPS：`unknown`；并发：`50`\n- 可信度：`high`；冲突：无"
  },
  {
    "id": "vod.audio.asr.query",
    "displayName": "ASR转写查询",
    "initial": "A",
    "domains": [
      "audio",
      "ai-labeling"
    ],
    "behavior": "enrich",
    "cardinality": "1:1",
    "intro": "该算子用于根据 ASR task_id 查询转写结果并写出 asr 字段,",
    "weeklyRuns": "1,023",
    "wiki": "# `vod.audio.asr.query` — ASR转写查询\n\n> 正式 ID：`vod.audio.asr.query` · 旧别名：`vod_audio_asr_query` · 领域：audio, ai-labeling\n\n## 决策\n\n- **适用**：该算子用于根据 ASR task_id 查询转写结果并写出 asr 字段,\n- **不适用**：只查询已提交任务，不提交音频或轮询到完成\n- **行为**：`enrich`；基数 `1:1`；执行 `async_poll`。\n- **硬依赖**：[vod.audio.asr.submit](vod.audio.asr.submit.md)\n- **替代项**：无已确认替代项\n\n## 数据输入\n\n| 字段 | 类型 | 必需 | 语义 | 基数 | 可由谁提供 |\n| --- | --- | --- | --- | --- | --- |\n| asr_task_id | String | 是 | task.id | one | vod.audio.asr.submit, vod.transcoding.start（需字段映射） |\n\n## 配置\n\n无用户配置。\n\n源码默认配置表达式：`unknown`\n\n## 输出\n\n| 字段 | 类型 | 语义 | 基数 |\n| --- | --- | --- | --- |\n| asr | String | field.generic | one |\n\n## 风险\n\n- 只查询已提交任务，不提交音频或轮询到完成\n\n## 证据\n\n- 源码：`stages/vod/audio/asr/query.go` @ `f90386e38508`\n- 源码输入：`asr_task_id`\n- 源码输出：`asr`\n- QPS：`20`；并发：`unknown`\n- 可信度：`high`；冲突：无"
  },
  {
    "id": "vod.audio.asr.submit",
    "displayName": "ASR转写提交",
    "initial": "A",
    "domains": [
      "audio",
      "ai-labeling"
    ],
    "behavior": "enrich",
    "cardinality": "1:1",
    "intro": "该算子用于把音频 TOS 路径提交到 VOD/ASR 并返回任务 ID,",
    "weeklyRuns": "848",
    "wiki": "# `vod.audio.asr.submit` — ASR转写提交\n\n> 正式 ID：`vod.audio.asr.submit` · 旧别名：`vod_audio_asr_submit` · 领域：audio, ai-labeling\n\n## 决策\n\n- **适用**：该算子用于把音频 TOS 路径提交到 VOD/ASR 并返回任务 ID,\n- **不适用**：只提交任务，不解析最终转写文本\n- **行为**：`enrich`；基数 `1:1`；执行 `async_submit`。\n- **硬依赖**：无硬依赖\n- **替代项**：无已确认替代项\n\n## 数据输入\n\n| 字段 | 类型 | 必需 | 语义 | 基数 | 可由谁提供 |\n| --- | --- | --- | --- | --- | --- |\n| audio_tos_path | String | 是 | media_locator.tos | one | csv.expand（需字段映射）, csv.merge（需字段映射）, csv.unique（需字段映射）, image.resize（需字段映射）, jsonl.agg（需字段映射）, string.replace_prefix（需字段映射） |\n\n## 配置\n\n无用户配置。\n\n源码默认配置表达式：`unknown`\n\n## 输出\n\n| 字段 | 类型 | 语义 | 基数 |\n| --- | --- | --- | --- |\n| asr_task_id | String | task.id | one |\n| audio_url | String | media_locator.http | one |\n\n## 风险\n\n- 只提交任务，不解析最终转写文本\n\n## 证据\n\n- 源码：`stages/vod/audio/asr/sumbit.go` @ `f90386e38508`\n- 源码输入：`audio_tos_path`\n- 源码输出：`asr_task_id, audio_url`\n- QPS：`20`；并发：`unknown`\n- 可信度：`high`；冲突：无"
  },
  {
    "id": "ap_v25.filter",
    "displayName": "视频美学打分",
    "initial": "视",
    "domains": [
      "validation",
      "video"
    ],
    "behavior": "validate_or_filter",
    "cardinality": "1:1",
    "intro": "该算子用于抽取视频关键帧并用 AestheticPredictorV2.5 计算美学分后过滤,",
    "weeklyRuns": "540",
    "wiki": "# `ap_v25.filter` — 视频美学打分\n\n> 正式 ID：`ap_v25.filter` · 旧别名：`ap_v25_filter` · 领域：validation, video\n\n## 决策\n\n- **适用**：该算子用于抽取视频关键帧并用 AestheticPredictorV2.5 计算美学分后过滤,\n- **不适用**：依赖视频可下载和模型服务，低于阈值会中止 Job，不提供人工审美解释\n- **行为**：`validate_or_filter`；基数 `1:1`；执行 `sync`。\n- **硬依赖**：无硬依赖\n- **替代项**：无已确认替代项\n\n## 数据输入\n\n| 字段 | 类型 | 必需 | 语义 | 基数 | 可由谁提供 |\n| --- | --- | --- | --- | --- | --- |\n| tos_path | String | 是 | media_locator.tos | one | tos.list, vod.upload.tos, csv.expand（需字段映射）, csv.merge（需字段映射）, csv.unique（需字段映射）, image.resize（需字段映射） |\n\n## 配置\n\n| 配置 | 类型 | 必需 | 默认值 |\n| --- | --- | --- | --- |\n| 最低分数 | Float | 否 | unknown |\n| 是否开启 | Boolean | 否 | unknown |\n\n源码默认配置表达式：`Config{}`\n\n## 输出\n\n| 字段 | 类型 | 语义 | 基数 |\n| --- | --- | --- | --- |\n| average_ap_score | String | field.generic | one |\n\n## 风险\n\n- 依赖视频可下载和模型服务，低于阈值会中止 Job，不提供人工审美解释\n\n## 证据\n\n- 源码：`stages/cn_clip/AestheticsPredictorV25/ap_v25.go` @ `f90386e38508`\n- 源码输入：`tos_path`\n- 源码输出：`none/dynamic`\n- QPS：`unknown`；并发：`200`\n- 可信度：`high`；冲突：无"
  },
  {
    "id": "ffmpeg.diy",
    "displayName": "自定义执行ffmpeg命令",
    "initial": "自",
    "domains": [
      "video"
    ],
    "behavior": "enrich",
    "cardinality": "1:1",
    "intro": "该算子用于下载单个 TOS 媒体并按配置执行自定义 ffmpeg 参数,",
    "weeklyRuns": "1,217",
    "wiki": "# `ffmpeg.diy` — 自定义执行ffmpeg命令\n\n> 正式 ID：`ffmpeg.diy` · 旧别名：`ffmpeg_diy` · 领域：video\n\n## 决策\n\n- **适用**：该算子用于下载单个 TOS 媒体并按配置执行自定义 ffmpeg 参数,\n- **不适用**：命令能力开放且依赖配置正确性，可能耗时并产生新 TOS 文件，不做安全语义校验\n- **行为**：`enrich`；基数 `1:1`；执行 `sync`。\n- **硬依赖**：无硬依赖\n- **替代项**：[ffmpeg.diy.list](ffmpeg.diy.list.md)\n\n## 数据输入\n\n| 字段 | 类型 | 必需 | 语义 | 基数 | 可由谁提供 |\n| --- | --- | --- | --- | --- | --- |\n| <原始文件tos路径值> | File | 是 | field.generic | dynamic | ai-platform.deepseek（需字段映射）, ai-platform.gemini（需字段映射）, ai-platform.qwen（需字段映射）, ai-platform.seedream.img2img（需字段映射）, ap_v25.filter（需字段映射）, cn_clip.artimuse（需字段映射） |\n\n## 配置\n\n| 配置 | 类型 | 必需 | 默认值 |\n| --- | --- | --- | --- |\n| 原始文件tos路径键名 | String | 是 | unknown |\n| 目标文件tos路径键名 | String | 是 | unknown |\n| 参数 | List | 是 | unknown |\n| 是否使用内存缓存 | Boolean | 否 | unknown |\n\n源码默认配置表达式：`DiyConfig{}`\n\n## 输出\n\n| 字段 | 类型 | 语义 | 基数 |\n| --- | --- | --- | --- |\n| <目标文件tos路径值> | File | field.generic | dynamic |\n\n## 风险\n\n- 命令能力开放且依赖配置正确性，可能耗时并产生新 TOS 文件，不做安全语义校验\n\n## 证据\n\n- 源码：`stages/ffmpeg/ffmpeg.go` @ `f90386e38508`\n- 源码输入：`dynamic/unknown`\n- 源码输出：`none/dynamic`\n- QPS：`unknown`；并发：`50`\n- 可信度：`high`；冲突：无"
  },
  {
    "id": "ffmpeg.diy.list",
    "displayName": "自定义执行ffmpeg命令",
    "initial": "自",
    "domains": [
      "video"
    ],
    "behavior": "fanout",
    "cardinality": "1:N",
    "intro": "该算子用于对 JSON 列表中的多个 TOS 媒体批量执行自定义 ffmpeg,",
    "weeklyRuns": "1,237",
    "wiki": "# `ffmpeg.diy.list` — 自定义执行ffmpeg命令\n\n> 正式 ID：`ffmpeg.diy.list` · 旧别名：`ffmpeg_diy_list` · 领域：video\n\n## 决策\n\n- **适用**：该算子用于对 JSON 列表中的多个 TOS 媒体批量执行自定义 ffmpeg,\n- **不适用**：输入必须是合法路径数组，失败会影响当前 Job，不负责片段顺序语义校验\n- **行为**：`fanout`；基数 `1:N`；执行 `sync`。\n- **硬依赖**：无硬依赖\n- **替代项**：[ffmpeg.diy](ffmpeg.diy.md)\n\n## 数据输入\n\n| 字段 | 类型 | 必需 | 语义 | 基数 | 可由谁提供 |\n| --- | --- | --- | --- | --- | --- |\n| <原始文件tos路径值> | List | 是 | collection.generic | many | ai-platform.qwen（需字段映射）, cnclip.watermark（需字段映射）, exif.get（需字段映射）, vod.audio.get（需字段映射）, vod.crop.scene.detect_and_split（需字段映射）, vod.video.get（需字段映射） |\n\n## 配置\n\n| 配置 | 类型 | 必需 | 默认值 |\n| --- | --- | --- | --- |\n| 原始文件tos路径键名 | String | 是 | unknown |\n| 目标文件tos路径键名 | String | 是 | unknown |\n| 参数 | List | 是 | unknown |\n| 是否使用内存缓存 | Boolean | 否 | unknown |\n\n源码默认配置表达式：`DiyConfig{}`\n\n## 输出\n\n| 字段 | 类型 | 语义 | 基数 |\n| --- | --- | --- | --- |\n| <目标文件tos路径值> | List | collection.generic | many |\n\n## 风险\n\n- 输入必须是合法路径数组，失败会影响当前 Job，不负责片段顺序语义校验\n\n## 证据\n\n- 源码：`stages/ffmpeg/ffmpeg.go` @ `f90386e38508`\n- 源码输入：`dynamic/unknown`\n- 源码输出：`none/dynamic`\n- QPS：`unknown`；并发：`50`\n- 可信度：`high`；冲突：无"
  },
  {
    "id": "hdr.filter",
    "displayName": "HDR格式过滤",
    "initial": "H",
    "domains": [
      "validation",
      "video"
    ],
    "behavior": "validate_or_filter",
    "cardinality": "1:1",
    "intro": "该算子用于识别并过滤 HDR 格式视频,",
    "weeklyRuns": "1,360",
    "wiki": "# `hdr.filter` — HDR格式过滤\n\n> 正式 ID：`hdr.filter` · 旧别名：`hdr_filter` · 领域：validation, video\n\n## 决策\n\n- **适用**：该算子用于识别并过滤 HDR 格式视频,\n- **不适用**：依赖 tos_path 和视频元数据规则，只做格式过滤，不执行 SDR/HDR 转换\n- **行为**：`validate_or_filter`；基数 `1:1`；执行 `sync`。\n- **硬依赖**：无硬依赖\n- **替代项**：无已确认替代项\n\n## 数据输入\n\n| 字段 | 类型 | 必需 | 语义 | 基数 | 可由谁提供 |\n| --- | --- | --- | --- | --- | --- |\n| tos_path | String | 是 | media_locator.tos | one | tos.list, vod.upload.tos, csv.expand（需字段映射）, csv.merge（需字段映射）, csv.unique（需字段映射）, image.resize（需字段映射） |\n\n## 配置\n\n无用户配置。\n\n源码默认配置表达式：`unknown`\n\n## 输出\n\n无数据字段输出；该算子主要执行校验、过滤、等待或外部写入。\n\n## 风险\n\n- 依赖 tos_path 和视频元数据规则，只做格式过滤，不执行 SDR/HDR 转换\n\n## 证据\n\n- 源码：`stages/vod/hdr/filter.go` @ `f90386e38508`\n- 源码输入：`dynamic/unknown`\n- 源码输出：`none/dynamic`\n- QPS：`unknown`；并发：`1000`\n- 可信度：`high`；冲突：无"
  },
  {
    "id": "tos.compress.360p",
    "displayName": "压缩到360p",
    "initial": "压",
    "domains": [
      "storage",
      "video"
    ],
    "behavior": "transform_or_write",
    "cardinality": "1:1",
    "intro": "该算子用于把 TOS 视频压缩为 360p 并上传新路径,",
    "weeklyRuns": "553",
    "wiki": "# `tos.compress.360p` — 压缩到360p\n\n> 正式 ID：`tos.compress.360p` · 旧别名：`tos_compress_360p` · 领域：storage, video\n\n## 决策\n\n- **适用**：该算子用于把 TOS 视频压缩为 360p 并上传新路径,\n- **不适用**：依赖 ffmpeg 和对象存储，会生成派生文件，不保留完整清晰度\n- **行为**：`transform_or_write`；基数 `1:1`；执行 `external_service_sync`。\n- **硬依赖**：无硬依赖\n- **替代项**：无已确认替代项\n\n## 数据输入\n\n| 字段 | 类型 | 必需 | 语义 | 基数 | 可由谁提供 |\n| --- | --- | --- | --- | --- | --- |\n| tos_path | String | 是 | media_locator.tos | one | tos.list, vod.upload.tos, csv.expand（需字段映射）, csv.merge（需字段映射）, csv.unique（需字段映射）, image.resize（需字段映射） |\n\n## 配置\n\n| 配置 | 类型 | 必需 | 默认值 |\n| --- | --- | --- | --- |\n| 自动重命名 | Boolean | 否 | unknown |\n\n源码默认配置表达式：`CompressConfig{}`\n\n## 输出\n\n| 字段 | 类型 | 语义 | 基数 |\n| --- | --- | --- | --- |\n| 360p_tos_path | String | media_locator.tos | one |\n\n## 风险\n\n- 依赖 ffmpeg 和对象存储，会生成派生文件，不保留完整清晰度\n\n## 证据\n\n- 源码：`stages/tos/compress.go` @ `f90386e38508`\n- 源码输入：`tos_path`\n- 源码输出：`360p_tos_path`\n- QPS：`unknown`；并发：`128`\n- 可信度：`high`；冲突：无"
  },
  {
    "id": "vod.audio.get",
    "displayName": "音频信息获取",
    "initial": "音",
    "domains": [
      "audio",
      "metadata",
      "video"
    ],
    "behavior": "enrich",
    "cardinality": "1:1",
    "intro": "该算子用于从媒体文件中提取音频编码、声道、时长、码率等信息,",
    "weeklyRuns": "1,294",
    "wiki": "# `vod.audio.get` — 音频信息获取\n\n> 正式 ID：`vod.audio.get` · 旧别名：`vod_audio_get` · 领域：audio, metadata, video\n\n## 决策\n\n- **适用**：该算子用于从媒体文件中提取音频编码、声道、时长、码率等信息,\n- **不适用**：只读取首个音频流元数据，不转码或检测人声\n- **行为**：`enrich`；基数 `1:1`；执行 `external_service_sync`。\n- **硬依赖**：无硬依赖\n- **替代项**：无已确认替代项\n\n## 数据输入\n\n| 字段 | 类型 | 必需 | 语义 | 基数 | 可由谁提供 |\n| --- | --- | --- | --- | --- | --- |\n| tos_path | String | 是 | media_locator.tos | one | tos.list, vod.upload.tos, csv.expand（需字段映射）, csv.merge（需字段映射）, csv.unique（需字段映射）, image.resize（需字段映射） |\n\n## 配置\n\n| 配置 | 类型 | 必需 | 默认值 |\n| --- | --- | --- | --- |\n| 输出字段 | List | 否 | unknown |\n| 自动重命名 | Boolean | 否 | unknown |\n\n源码默认配置表达式：`Config{}`\n\n## 输出\n\n| 字段 | 类型 | 语义 | 基数 |\n| --- | --- | --- | --- |\n| audio_codec_name | String | field.generic | one |\n| audio_codec_long_name | String | field.generic | one |\n| audio_channels | String | collection.generic | one |\n| audio_channel_layout | String | field.generic | one |\n| audio_duration | String | media.duration | one |\n| audio_bit_rate | String | field.generic | one |\n| audio_sample_rate | String | field.generic | one |\n\n## 风险\n\n- 只读取首个音频流元数据，不转码或检测人声\n\n## 证据\n\n- 源码：`stages/vod/audio/get/get.go` @ `f90386e38508`\n- 源码输入：`tos_path`\n- 源码输出：`audio_format, audio_codec_name, audio_codec_long_name, audio_channels, audio_channel_layout, audio_duration, audio_bit_rate, audio_sample_rate, audio_bit_depth`\n- QPS：`unknown`；并发：`128`\n- 可信度：`medium`；冲突：输出差异 table=['audio_bit_rate', 'audio_channel_layout', 'audio_channels', 'audio_codec_long_name', 'audio_codec_name', 'audio_duration', 'audio_sample_rate'] source=['audio_bit_depth', 'audio_bit_rate', 'audio_channel_layout', 'audio_channels', 'audio_codec_long_name', 'audio_codec_name', 'audio_duration', 'audio_format', 'audio_sample_rate']"
  },
  {
    "id": "vod.crop.blackborder.crop",
    "displayName": "通过黑边剪裁参数进行黑边剪裁",
    "initial": "通",
    "domains": [
      "video"
    ],
    "behavior": "transform_or_write",
    "cardinality": "1:1",
    "intro": "该算子用于按 black_border_crop 参数裁剪视频黑边并上传结果,",
    "weeklyRuns": "446",
    "wiki": "# `vod.crop.blackborder.crop` — 通过黑边剪裁参数进行黑边剪裁\n\n> 正式 ID：`vod.crop.blackborder.crop` · 旧别名：`vod_crop_blackborder_crop` · 领域：video\n\n## 决策\n\n- **适用**：该算子用于按 black_border_crop 参数裁剪视频黑边并上传结果,\n- **不适用**：依赖上游裁剪参数和 ffmpeg，参数为空时透传原路径\n- **行为**：`transform_or_write`；基数 `1:1`；执行 `external_service_sync`。\n- **硬依赖**：[vod.crop.blackborder.get](vod.crop.blackborder.get.md)\n- **替代项**：无已确认替代项\n\n## 数据输入\n\n| 字段 | 类型 | 必需 | 语义 | 基数 | 可由谁提供 |\n| --- | --- | --- | --- | --- | --- |\n| tos_path | String | 是 | media_locator.tos | one | tos.list, vod.upload.tos, csv.expand（需字段映射）, csv.merge（需字段映射）, csv.unique（需字段映射）, image.resize（需字段映射） |\n| black_border_crop | String | 是 | field.generic | one | vod.crop.blackborder.get, ai-platform.deepseek（需字段映射）, ai-platform.gemini（需字段映射）, ai-platform.qwen（需字段映射）, ai-platform.seedream.img2img（需字段映射）, ap_v25.filter（需字段映射） |\n\n## 配置\n\n| 配置 | 类型 | 必需 | 默认值 |\n| --- | --- | --- | --- |\n| 命令执行超时时间(分钟) | Int | 否 | 30 |\n\n源码默认配置表达式：`CropConfig{ Timeout: 30, }`\n\n## 输出\n\n| 字段 | 类型 | 语义 | 基数 |\n| --- | --- | --- | --- |\n| black_border_cropped_tos_path | String | media_locator.tos | one |\n\n## 风险\n\n- 依赖上游裁剪参数和 ffmpeg，参数为空时透传原路径\n\n## 证据\n\n- 源码：`stages/vod/crop/black_border/crop.go` @ `f90386e38508`\n- 源码输入：`tos_path, black_border_crop`\n- 源码输出：`black_border_cropped_tos_path`\n- QPS：`unknown`；并发：`128`\n- 可信度：`high`；冲突：无"
  },
  {
    "id": "vod.crop.blackborder.get",
    "displayName": "获取黑边的剪裁参数",
    "initial": "获",
    "domains": [
      "video"
    ],
    "behavior": "transform_or_write",
    "cardinality": "1:1",
    "intro": "该算子用于用 ffmpeg cropdetect 获取视频黑边裁剪参数,",
    "weeklyRuns": "1,088",
    "wiki": "# `vod.crop.blackborder.get` — 获取黑边的剪裁参数\n\n> 正式 ID：`vod.crop.blackborder.get` · 旧别名：`vod_crop_blackborder_get` · 领域：video\n\n## 决策\n\n- **适用**：该算子用于用 ffmpeg cropdetect 获取视频黑边裁剪参数,\n- **不适用**：只输出检测参数，不执行裁剪或判断内容构图\n- **行为**：`transform_or_write`；基数 `1:1`；执行 `external_service_sync`。\n- **硬依赖**：无硬依赖\n- **替代项**：无已确认替代项\n\n## 数据输入\n\n| 字段 | 类型 | 必需 | 语义 | 基数 | 可由谁提供 |\n| --- | --- | --- | --- | --- | --- |\n| tos_path | String | 是 | media_locator.tos | one | tos.list, vod.upload.tos, csv.expand（需字段映射）, csv.merge（需字段映射）, csv.unique（需字段映射）, image.resize（需字段映射） |\n\n## 配置\n\n无用户配置。\n\n源码默认配置表达式：`unknown`\n\n## 输出\n\n| 字段 | 类型 | 语义 | 基数 |\n| --- | --- | --- | --- |\n| black_border_crop | String | field.generic | one |\n\n## 风险\n\n- 只输出检测参数，不执行裁剪或判断内容构图\n\n## 证据\n\n- 源码：`stages/vod/crop/black_border/get.go` @ `f90386e38508`\n- 源码输入：`tos_path`\n- 源码输出：`black_border_crop`\n- QPS：`unknown`；并发：`128`\n- 可信度：`high`；冲突：无"
  },
  {
    "id": "vod.crop.scene.detect_and_split",
    "displayName": "检测视频场景并切分视频",
    "initial": "检",
    "domains": [
      "video"
    ],
    "behavior": "fanout",
    "cardinality": "1:N",
    "intro": "需要按镜头或场景边界检测并切分视频时使用。",
    "weeklyRuns": "1,167",
    "wiki": "# `vod.crop.scene.detect_and_split` — 检测视频场景并切分视频\n\n> 正式 ID：`vod.crop.scene.detect_and_split` · 旧别名：`vod_crop_scene_detect_and_split` · 领域：video\n\n## 决策\n\n- **适用**：需要按镜头或场景边界检测并切分视频时使用。\n- **不适用**：客户要求严格固定 10–15 秒片段时不要单独依赖场景切分。\n- **行为**：`fanout`；基数 `1:N`；执行 `sync_fanout`。\n- **硬依赖**：无硬依赖\n- **替代项**：[vod.local_split](vod.local_split.md), [vod.local_split.tos](vod.local_split.tos.md), [vod.split](vod.split.md)\n\n## 数据输入\n\n| 字段 | 类型 | 必需 | 语义 | 基数 | 可由谁提供 |\n| --- | --- | --- | --- | --- | --- |\n| tos_path | String | 是 | media_locator.tos | one | tos.list, vod.upload.tos, csv.expand（需字段映射）, csv.merge（需字段映射）, csv.unique（需字段映射）, image.resize（需字段映射） |\n\n## 配置\n\n| 配置 | 类型 | 必需 | 默认值 |\n| --- | --- | --- | --- |\n| 自动切分(true:开启/false:关闭) | Boolean | 否 | true |\n| 过滤最小场景时长(秒) 0:不进行过滤 | Int | 否 | 0 |\n| 跳过视频开头多少秒进行场景检测 0:不进行跳过 | Int | 否 | 0 |\n| 忽略视频结尾多少秒进行场景检测 0:不进行忽略 | Int | 否 | 0 |\n\n源码默认配置表达式：`Config{ AutoSplit: true, MinSceneDuration: 0, SkipedStartingSeconds: 0, OmitEndingSeconds: 0, }`\n\n## 输出\n\n| 字段 | 类型 | 语义 | 基数 |\n| --- | --- | --- | --- |\n| scene_split_paths | String | collection.generic | many |\n| scene_split_count | String | field.generic | one |\n| scene_count | String | field.generic | one |\n\n## 风险\n\n- 依赖配置阈值和 ffmpeg，场景检测不是语义分镜识别\n\n## 证据\n\n- 源码：`stages/vod/scene/detect_and_split/detect_and_split.go` @ `f90386e38508`\n- 源码输入：`tos_path`\n- 源码输出：`scene_split_paths, scene_split_count, scene_count`\n- QPS：`unknown`；并发：`8`\n- 可信度：`high`；冲突：无"
  },
  {
    "id": "vod.frame.extract",
    "displayName": "视频抽帧",
    "initial": "视",
    "domains": [
      "video"
    ],
    "behavior": "fanout",
    "cardinality": "1:N",
    "intro": "该算子用于按 FPS、秒、总数或中间帧策略抽取视频帧并上传 TOS,",
    "weeklyRuns": "807",
    "wiki": "# `vod.frame.extract` — 视频抽帧\n\n> 正式 ID：`vod.frame.extract` · 旧别名：`vod_frame_extract` · 领域：video\n\n## 决策\n\n- **适用**：该算子用于按 FPS、秒、总数或中间帧策略抽取视频帧并上传 TOS,\n- **不适用**：依赖 ffmpeg 和策略配置，会产生图片文件，不做图像识别\n- **行为**：`fanout`；基数 `1:N`；执行 `external_service_sync`。\n- **硬依赖**：无硬依赖\n- **替代项**：无已确认替代项\n\n## 数据输入\n\n| 字段 | 类型 | 必需 | 语义 | 基数 | 可由谁提供 |\n| --- | --- | --- | --- | --- | --- |\n| tos_path | String | 是 | media_locator.tos | one | tos.list, vod.upload.tos, csv.expand（需字段映射）, csv.merge（需字段映射）, csv.unique（需字段映射）, image.resize（需字段映射） |\n\n## 配置\n\n| 配置 | 类型 | 必需 | 默认值 |\n| --- | --- | --- | --- |\n| 策略 | String | 否 | StrategySecond |\n| 值 | Int | 否 | 1 |\n| 输出格式 | String | 否 | \"%04d.jpg\" |\n| 超时时间(秒) | Int | 否 | unknown |\n| 阶段并发 | Int | 否 | unknown |\n| 阶段QPS | Int | 否 | unknown |\n\n源码默认配置表达式：`Config{ Strategy: StrategySecond, Value: 1, OutputFormat: \"%04d.jpg\", }`\n\n## 输出\n\n| 字段 | 类型 | 语义 | 基数 |\n| --- | --- | --- | --- |\n| extract_frame_count | String | field.generic | one |\n| extract_frame_tos_paths | String | media_locator.tos_list | many |\n\n## 风险\n\n- 依赖 ffmpeg 和策略配置，会产生图片文件，不做图像识别\n\n## 证据\n\n- 源码：`stages/vod/frame/extract/extract.go` @ `f90386e38508`\n- 源码输入：`tos_path`\n- 源码输出：`extract_frame_count, extract_frame_tos_paths`\n- QPS：`unknown`；并发：`32`\n- 可信度：`high`；冲突：无"
  },
  {
    "id": "vod.local_split",
    "displayName": "获取vod视频进行本地切分",
    "initial": "获",
    "domains": [
      "video"
    ],
    "behavior": "fanout",
    "cardinality": "1:N",
    "intro": "该算子用于通过 vid 下载 VOD 视频并本地切分后上传片段到 VOD,",
    "weeklyRuns": "1,317",
    "wiki": "# `vod.local_split` — 获取vod视频进行本地切分\n\n> 正式 ID：`vod.local_split` · 旧别名：`vod_local_split` · 领域：video\n\n## 决策\n\n- **适用**：该算子用于通过 vid 下载 VOD 视频并本地切分后上传片段到 VOD,\n- **不适用**：依赖 VOD 下载/上传和 ffmpeg，会拆分成多个 vid，不处理 TOS 输入\n- **行为**：`fanout`；基数 `1:N`；执行 `external_service_sync`。\n- **硬依赖**：无硬依赖\n- **替代项**：[vod.crop.scene.detect_and_split](vod.crop.scene.detect_and_split.md), [vod.local_split.tos](vod.local_split.tos.md), [vod.split](vod.split.md)\n\n## 数据输入\n\n| 字段 | 类型 | 必需 | 语义 | 基数 | 可由谁提供 |\n| --- | --- | --- | --- | --- | --- |\n| vid | String | 是 | media_locator.vod_id | one | vod.local_split.tos, vod.upload |\n\n## 配置\n\n| 配置 | 类型 | 必需 | 默认值 |\n| --- | --- | --- | --- |\n| 切割时长 | Int | 否 | unknown |\n| 阶段并发 | Int | 否 | unknown |\n| 使用内存工作目录 | Boolean | 否 | unknown |\n\n源码默认配置表达式：`Config{}`\n\n## 输出\n\n| 字段 | 类型 | 语义 | 基数 |\n| --- | --- | --- | --- |\n| split_vid | String | media_locator.vod_id | one |\n\n## 风险\n\n- 依赖 VOD 下载/上传和 ffmpeg，会拆分成多个 vid，不处理 TOS 输入\n\n## 证据\n\n- 源码：`stages/vod/local_split/local_split.go` @ `f90386e38508`\n- 源码输入：`dynamic/unknown`\n- 源码输出：`split_vid`\n- QPS：`unknown`；并发：`50`\n- 可信度：`high`；冲突：无"
  },
  {
    "id": "vod.local_split.tos",
    "displayName": "获取tos视频进行本地切分",
    "initial": "获",
    "domains": [
      "video"
    ],
    "behavior": "fanout",
    "cardinality": "1:N",
    "intro": "该算子用于从 TOS 视频本地切分并把片段上传到 VOD,",
    "weeklyRuns": "1,214",
    "wiki": "# `vod.local_split.tos` — 获取tos视频进行本地切分\n\n> 正式 ID：`vod.local_split.tos` · 旧别名：`vod_local_split_tos` · 领域：video\n\n## 决策\n\n- **适用**：该算子用于从 TOS 视频本地切分并把片段上传到 VOD,\n- **不适用**：依赖 rowkey、tos_path 和 ffmpeg，只输出片段 vid\n- **行为**：`fanout`；基数 `1:N`；执行 `external_service_sync`。\n- **硬依赖**：无硬依赖\n- **替代项**：[vod.crop.scene.detect_and_split](vod.crop.scene.detect_and_split.md), [vod.local_split](vod.local_split.md), [vod.split](vod.split.md)\n\n## 数据输入\n\n| 字段 | 类型 | 必需 | 语义 | 基数 | 可由谁提供 |\n| --- | --- | --- | --- | --- | --- |\n| tos_path | String | 是 | media_locator.tos | one | tos.list, vod.upload.tos, csv.expand（需字段映射）, csv.merge（需字段映射）, csv.unique（需字段映射）, image.resize（需字段映射） |\n| rowkey | String | 是 | record.rowkey | one | rowkey |\n\n## 配置\n\n| 配置 | 类型 | 必需 | 默认值 |\n| --- | --- | --- | --- |\n| 切割时长 | Int | 否 | unknown |\n| 阶段并发 | Int | 否 | unknown |\n| 使用内存工作目录 | Boolean | 否 | unknown |\n\n源码默认配置表达式：`Config{}`\n\n## 输出\n\n| 字段 | 类型 | 语义 | 基数 |\n| --- | --- | --- | --- |\n| vid | String | media_locator.vod_id | one |\n\n## 风险\n\n- 依赖 rowkey、tos_path 和 ffmpeg，只输出片段 vid\n\n## 证据\n\n- 源码：`stages/vod/local_split/tos.go` @ `f90386e38508`\n- 源码输入：`dynamic/unknown`\n- 源码输出：`vid`\n- QPS：`unknown`；并发：`50`\n- 可信度：`high`；冲突：无"
  },
  {
    "id": "vod.split",
    "displayName": "视频分割",
    "initial": "视",
    "domains": [
      "video"
    ],
    "behavior": "fanout",
    "cardinality": "1:N",
    "intro": "已有 tos_path，需要按固定时长把一个视频切成多个 TOS 片段时使用。",
    "weeklyRuns": "833",
    "wiki": "# `vod.split` — 视频分割\n\n> 正式 ID：`vod.split` · 旧别名：`vod_split` · 领域：video\n\n## 决策\n\n- **适用**：已有 tos_path，需要按固定时长把一个视频切成多个 TOS 片段时使用。\n- **不适用**：只有 vid 且不希望转回 TOS 时优先评估 vod.local_split；按镜头切分使用 vod.crop.scene.detect_and_split。\n- **行为**：`fanout`；基数 `1:N`；执行 `sync_fanout`。\n- **硬依赖**：无硬依赖\n- **替代项**：[vod.crop.scene.detect_and_split](vod.crop.scene.detect_and_split.md), [vod.local_split](vod.local_split.md), [vod.local_split.tos](vod.local_split.tos.md)\n\n## 数据输入\n\n| 字段 | 类型 | 必需 | 语义 | 基数 | 可由谁提供 |\n| --- | --- | --- | --- | --- | --- |\n| tos_path | String | 是 | media_locator.tos | one | tos.list, vod.upload.tos, csv.expand（需字段映射）, csv.merge（需字段映射）, csv.unique（需字段映射）, image.resize（需字段映射） |\n\n## 配置\n\n| 配置 | 类型 | 必需 | 默认值 |\n| --- | --- | --- | --- |\n| 编码模式 | String | 否 | EncodeModeCopy |\n| 片段时长(秒) | Int | 否 | 60 |\n| 超时时间(分钟) | Int | 否 | unknown |\n| 阶段并发 | Int | 否 | unknown |\n| 使用内存加速 | Boolean | 否 | unknown |\n| 分割类型 | String | 否 | unknown |\n\n源码默认配置表达式：`Config{ EncodeMode: EncodeModeCopy, SegmentTime: 60, }`\n\n## 输出\n\n| 字段 | 类型 | 语义 | 基数 |\n| --- | --- | --- | --- |\n| split_segment_count | String | field.generic | one |\n| split_segment_tos_paths | String | media_locator.tos_list | many |\n\n## 风险\n\n- 输出 split_segment_tos_paths 是列表语义，进入单媒体算子前必须展开为逐条 tos_path。\n- 要保证每段不超过目标时长时，分割类型应使用 max；默认合并尾段逻辑可能产生长于目标的片段。\n- copy 编码更快但切点可能受关键帧影响；需要精确切点时使用 encode。\n\n## 证据\n\n- 源码：`stages/vod/split/split.go` @ `f90386e38508`\n- 源码输入：`tos_path`\n- 源码输出：`split_segment_count, split_segment_tos_paths`\n- QPS：`unknown`；并发：`unknown`\n- 可信度：`high`；冲突：无"
  },
  {
    "id": "vod.transcoding.get",
    "displayName": "获取预览视频",
    "initial": "获",
    "domains": [
      "video",
      "delivery"
    ],
    "behavior": "enrich",
    "cardinality": "1:1",
    "intro": "已有 vid 且需要人工平台可访问的预览 URL 时使用。",
    "weeklyRuns": "1,092",
    "wiki": "# `vod.transcoding.get` — 获取预览视频\n\n> 正式 ID：`vod.transcoding.get` · 旧别名：`vod_transcoding_get` · 领域：video, delivery\n\n## 决策\n\n- **适用**：已有 vid 且需要人工平台可访问的预览 URL 时使用。\n- **不适用**：只查询已有转码结果，不触发转码或等待任务\n- **行为**：`enrich`；基数 `1:1`；执行 `external_service_sync`。\n- **硬依赖**：无硬依赖\n- **替代项**：无已确认替代项\n\n## 数据输入\n\n| 字段 | 类型 | 必需 | 语义 | 基数 | 可由谁提供 |\n| --- | --- | --- | --- | --- | --- |\n| vid | String | 是 | media_locator.vod_id | one | vod.local_split.tos, vod.upload, vod.local_split（需字段映射） |\n\n## 配置\n\n| 配置 | 类型 | 必需 | 默认值 |\n| --- | --- | --- | --- |\n| 清晰度(选填240p/360p/480p/720p) | String | 否 | \"360p\" |\n\n源码默认配置表达式：`GetConfig{ Clarity: \"360p\", }`\n\n## 输出\n\n| 字段 | 类型 | 语义 | 基数 |\n| --- | --- | --- | --- |\n| preview_url | String | media_locator.http | one |\n\n## 风险\n\n- 只查询已有转码结果，不触发转码或等待任务\n\n## 证据\n\n- 源码：`stages/vod/transcoding/get.go` @ `f90386e38508`\n- 源码输入：`vid`\n- 源码输出：`preview_url`\n- QPS：`8`；并发：`unknown`\n- 可信度：`high`；冲突：无"
  },
  {
    "id": "vod.transcoding.query",
    "displayName": "vod视频转码查询是否成功",
    "initial": "V",
    "domains": [
      "video",
      "delivery"
    ],
    "behavior": "enrich",
    "cardinality": "1:1",
    "intro": "该算子用于查询 VOD 工作流转码任务状态,",
    "weeklyRuns": "1,106",
    "wiki": "# `vod.transcoding.query` — vod视频转码查询是否成功\n\n> 正式 ID：`vod.transcoding.query` · 旧别名：`vod_transcoding_query` · 领域：video, delivery\n\n## 决策\n\n- **适用**：该算子用于查询 VOD 工作流转码任务状态,\n- **不适用**：需要单节点阻塞到转码完成时优先使用 vod.transcoding.query.v2。\n- **行为**：`enrich`；基数 `1:1`；执行 `async_poll_once`。\n- **硬依赖**：[vod.transcoding.start](vod.transcoding.start.md)\n- **替代项**：[vod.transcoding.query.v2](vod.transcoding.query.v2.md)\n\n## 数据输入\n\n| 字段 | 类型 | 必需 | 语义 | 基数 | 可由谁提供 |\n| --- | --- | --- | --- | --- | --- |\n| runid | String | 是 | task.id | one | vod.transcoding.start, vod.audio.asr.submit（需字段映射） |\n\n## 配置\n\n无用户配置。\n\n源码默认配置表达式：`unknown`\n\n## 输出\n\n无数据字段输出；该算子主要执行校验、过滤、等待或外部写入。\n\n## 风险\n\n- 只做单次查询，不阻塞等待完成或获取播放地址\n\n## 证据\n\n- 源码：`stages/vod/transcoding/query.go` @ `f90386e38508`\n- 源码输入：`runid`\n- 源码输出：`none/dynamic`\n- QPS：`8`；并发：`unknown`\n- 可信度：`high`；冲突：无"
  },
  {
    "id": "vod.transcoding.query.v2",
    "displayName": "vod视频转码查询是否成功，阻塞直到完成或超时",
    "initial": "V",
    "domains": [
      "video",
      "delivery"
    ],
    "behavior": "enrich",
    "cardinality": "1:1",
    "intro": "该算子用于阻塞轮询 VOD 转码任务直到完成或超时,",
    "weeklyRuns": "706",
    "wiki": "# `vod.transcoding.query.v2` — vod视频转码查询是否成功，阻塞直到完成或超时\n\n> 正式 ID：`vod.transcoding.query.v2` · 旧别名：`vod_transcoding_query_v2` · 领域：video, delivery\n\n## 决策\n\n- **适用**：该算子用于阻塞轮询 VOD 转码任务直到完成或超时,\n- **不适用**：调用方已有独立轮询调度时不要占用节点阻塞等待。\n- **行为**：`enrich`；基数 `1:1`；执行 `async_wait_until_done`。\n- **硬依赖**：[vod.transcoding.start](vod.transcoding.start.md)\n- **替代项**：[vod.transcoding.query](vod.transcoding.query.md)\n\n## 数据输入\n\n| 字段 | 类型 | 必需 | 语义 | 基数 | 可由谁提供 |\n| --- | --- | --- | --- | --- | --- |\n| runid | String | 是 | task.id | one | vod.transcoding.start, vod.audio.asr.submit（需字段映射） |\n\n## 配置\n\n| 配置 | 类型 | 必需 | 默认值 |\n| --- | --- | --- | --- |\n| 超时实际单位秒 | Int | 否 | 30 * 60 |\n\n源码默认配置表达式：`QueryV2Config{ Timeout: 30 * 60, }`\n\n## 输出\n\n无数据字段输出；该算子主要执行校验、过滤、等待或外部写入。\n\n## 风险\n\n- 会占用执行时间，依赖 runid，不返回预览 URL\n\n## 证据\n\n- 源码：`stages/vod/transcoding/query.go` @ `f90386e38508`\n- 源码输入：`runid`\n- 源码输出：`none/dynamic`\n- QPS：`20`；并发：`unknown`\n- 可信度：`high`；冲突：无"
  },
  {
    "id": "vod.transcoding.start",
    "displayName": "vod视频触发转码",
    "initial": "V",
    "domains": [
      "video",
      "delivery"
    ],
    "behavior": "enrich",
    "cardinality": "1:1",
    "intro": "该算子用于对 vid 启动 VOD 转码工作流并返回 runid,",
    "weeklyRuns": "999",
    "wiki": "# `vod.transcoding.start` — vod视频触发转码\n\n> 正式 ID：`vod.transcoding.start` · 旧别名：`vod_transcoding_start` · 领域：video, delivery\n\n## 决策\n\n- **适用**：该算子用于对 vid 启动 VOD 转码工作流并返回 runid,\n- **不适用**：只触发任务，不等待完成或下载结果\n- **行为**：`enrich`；基数 `1:1`；执行 `async_submit`。\n- **硬依赖**：[vod.upload](vod.upload.md)\n- **替代项**：无已确认替代项\n\n## 数据输入\n\n| 字段 | 类型 | 必需 | 语义 | 基数 | 可由谁提供 |\n| --- | --- | --- | --- | --- | --- |\n| vid | String | 是 | media_locator.vod_id | one | vod.local_split.tos, vod.upload, vod.local_split（需字段映射） |\n\n## 配置\n\n| 配置 | 类型 | 必需 | 默认值 |\n| --- | --- | --- | --- |\n| 清晰度(选填240p/360p/480p/720p) | String | 否 | \"360p\" |\n| 阶段QPS | Int | 否 | unknown |\n\n源码默认配置表达式：`StartConfig{ Clarity: \"360p\", }`\n\n## 输出\n\n| 字段 | 类型 | 语义 | 基数 |\n| --- | --- | --- | --- |\n| runid | String | task.id | one |\n\n## 风险\n\n- 只触发任务，不等待完成或下载结果\n\n## 证据\n\n- 源码：`stages/vod/transcoding/start.go` @ `f90386e38508`\n- 源码输入：`vid`\n- 源码输出：`runid`\n- QPS：`128`；并发：`unknown`\n- 可信度：`high`；冲突：无"
  },
  {
    "id": "vod.upload",
    "displayName": "tos视频上传vod",
    "initial": "T",
    "domains": [
      "video",
      "storage"
    ],
    "behavior": "transform_or_write",
    "cardinality": "1:1",
    "intro": "只有 tos_path，而下游算子需要 vid 时使用。",
    "weeklyRuns": "982",
    "wiki": "# `vod.upload` — tos视频上传vod\n\n> 正式 ID：`vod.upload` · 旧别名：`vod_upload` · 领域：video, storage\n\n## 决策\n\n- **适用**：只有 tos_path，而下游算子需要 vid 时使用。\n- **不适用**：下游直接接受 tos_path 时不要为转换而转换。\n- **行为**：`transform_or_write`；基数 `1:1`；执行 `external_service_sync`。\n- **硬依赖**：无硬依赖\n- **替代项**：无已确认替代项\n\n## 数据输入\n\n| 字段 | 类型 | 必需 | 语义 | 基数 | 可由谁提供 |\n| --- | --- | --- | --- | --- | --- |\n| tos_path | String | 是 | media_locator.tos | one | tos.list, vod.upload.tos, csv.expand（需字段映射）, csv.merge（需字段映射）, csv.unique（需字段映射）, image.resize（需字段映射） |\n\n## 配置\n\n| 配置 | 类型 | 必需 | 默认值 |\n| --- | --- | --- | --- |\n| 自动重命名 | Boolean | 否 | false |\n\n源码默认配置表达式：`Config{ AutoRename: false, }`\n\n## 输出\n\n| 字段 | 类型 | 语义 | 基数 |\n| --- | --- | --- | --- |\n| vid | String | media_locator.vod_id | one |\n\n## 风险\n\n- 会产生 VOD 资产，依赖对象可读，不做转码质量控制\n\n## 证据\n\n- 源码：`stages/vod/upload/upload.go` @ `f90386e38508`\n- 源码输入：`tos_path`\n- 源码输出：`vid`\n- QPS：`200`；并发：`unknown`\n- 可信度：`high`；冲突：无"
  },
  {
    "id": "vod.upload.tos",
    "displayName": "vod视频传到tos",
    "initial": "V",
    "domains": [
      "video",
      "storage"
    ],
    "behavior": "transform_or_write",
    "cardinality": "1:1",
    "intro": "只有 vid，而下游算子需要 tos_path 时使用。",
    "weeklyRuns": "1,179",
    "wiki": "# `vod.upload.tos` — vod视频传到tos\n\n> 正式 ID：`vod.upload.tos` · 旧别名：`vod_upload_tos` · 领域：video, storage\n\n## 决策\n\n- **适用**：只有 vid，而下游算子需要 tos_path 时使用。\n- **不适用**：已有可用 tos_path 时不要重复传输。\n- **行为**：`transform_or_write`；基数 `1:1`；执行 `external_service_sync`。\n- **硬依赖**：无硬依赖\n- **替代项**：无已确认替代项\n\n## 数据输入\n\n| 字段 | 类型 | 必需 | 语义 | 基数 | 可由谁提供 |\n| --- | --- | --- | --- | --- | --- |\n| vid | String | 是 | media_locator.vod_id | one | vod.local_split.tos, vod.upload, vod.local_split（需字段映射） |\n\n## 配置\n\n无用户配置。\n\n源码默认配置表达式：`unknown`\n\n## 输出\n\n| 字段 | 类型 | 语义 | 基数 |\n| --- | --- | --- | --- |\n| tos_path | String | media_locator.tos | one |\n\n## 风险\n\n- 会产生对象存储文件，依赖 VOD 下载地址，不做视频内容处理\n\n## 证据\n\n- 源码：`stages/vod/upload/upload.go` @ `f90386e38508`\n- 源码输入：`vid`\n- 源码输出：`tos_path`\n- QPS：`200`；并发：`unknown`\n- 可信度：`high`；冲突：无"
  },
  {
    "id": "vod.video.get",
    "displayName": "视频信息获取",
    "initial": "视",
    "domains": [
      "video",
      "metadata"
    ],
    "behavior": "enrich",
    "cardinality": "1:1",
    "intro": "视频已有 tos_path，需要一次获取宽高、时长、帧率、码率和编码格式时使用。",
    "weeklyRuns": "674",
    "wiki": "# `vod.video.get` — 视频信息获取\n\n> 正式 ID：`vod.video.get` · 旧别名：`vod_video_get` · 领域：video, metadata\n\n## 决策\n\n- **适用**：视频已有 tos_path，需要一次获取宽高、时长、帧率、码率和编码格式时使用。\n- **不适用**：图片元数据应使用 exif.get；本算子不会计算宽高比。\n- **行为**：`enrich`；基数 `1:1`；执行 `external_service_sync`。\n- **硬依赖**：无硬依赖\n- **替代项**：无已确认替代项\n\n## 数据输入\n\n| 字段 | 类型 | 必需 | 语义 | 基数 | 可由谁提供 |\n| --- | --- | --- | --- | --- | --- |\n| tos_path | String | 是 | media_locator.tos | one | tos.list, vod.upload.tos, csv.expand（需字段映射）, csv.merge（需字段映射）, csv.unique（需字段映射）, image.resize（需字段映射） |\n\n## 配置\n\n| 配置 | 类型 | 必需 | 默认值 |\n| --- | --- | --- | --- |\n| 输出字段 | List | 否 | unknown |\n| 自动重命名 | Boolean | 否 | unknown |\n\n源码默认配置表达式：`Config{}`\n\n## 输出\n\n| 字段 | 类型 | 语义 | 基数 |\n| --- | --- | --- | --- |\n| duration | String | media.duration | one |\n| height | String | media.dimension_px | one |\n| width | String | media.dimension_px | one |\n| bit_rate | String | field.generic | one |\n| r_frame_rate | String | video.frame_rate | one |\n| avg_frame_rate | String | video.frame_rate | one |\n| fps | String | video.frame_rate | one |\n| pix_fmt | String | field.generic | one |\n| color_range | String | field.generic | one |\n| color_primaries | String | collection.generic | one |\n| format_name | String | field.generic | one |\n| format_long_name | String | field.generic | one |\n| bits_per_raw_sample | String | field.generic | one |\n| nb_frames | String | collection.generic | one |\n\n## 风险\n\n- 只读首个视频流/格式信息，不做质量评分或合规过滤\n\n## 证据\n\n- 源码：`stages/vod/video/get/get.go` @ `f90386e38508`\n- 源码输入：`tos_path`\n- 源码输出：`duration, height, width, bit_rate, r_frame_rate, avg_frame_rate, fps, pix_fmt, color_range, color_primaries, format_name, format_long_name, bits_per_raw_sample, nb_frames`\n- QPS：`unknown`；并发：`128`\n- 可信度：`high`；冲突：无"
  },
  {
    "id": "vod.video.merge",
    "displayName": "合并多个视频文件",
    "initial": "合",
    "domains": [
      "video"
    ],
    "behavior": "aggregate",
    "cardinality": "N:1",
    "intro": "该算子用于把多个视频 TOS 路径下载后合并并上传合并结果,",
    "weeklyRuns": "864",
    "wiki": "# `vod.video.merge` — 合并多个视频文件\n\n> 正式 ID：`vod.video.merge` · 旧别名：`vod_video_merge` · 领域：video\n\n## 决策\n\n- **适用**：该算子用于把多个视频 TOS 路径下载后合并并上传合并结果,\n- **不适用**：输入顺序和编码兼容性由上游保证，不做内容对齐\n- **行为**：`aggregate`；基数 `N:1`；执行 `external_service_sync`。\n- **硬依赖**：无硬依赖\n- **替代项**：无已确认替代项\n\n## 数据输入\n\n| 字段 | 类型 | 必需 | 语义 | 基数 | 可由谁提供 |\n| --- | --- | --- | --- | --- | --- |\n| tos_paths | String | 是 | media_locator.tos_list | many | vod.frame.extract（需字段映射）, vod.split（需字段映射） |\n\n## 配置\n\n| 配置 | 类型 | 必需 | 默认值 |\n| --- | --- | --- | --- |\n| 命令执行超时时间(分钟) | Int | 否 | 30 |\n\n源码默认配置表达式：`Config{ Timeout: 30, // 默认超时60分钟 }`\n\n## 输出\n\n| 字段 | 类型 | 语义 | 基数 |\n| --- | --- | --- | --- |\n| merged_tos_path | String | media_locator.tos | one |\n\n## 风险\n\n- 输入顺序和编码兼容性由上游保证，不做内容对齐\n\n## 证据\n\n- 源码：`stages/vod/merge/merge.go` @ `f90386e38508`\n- 源码输入：`tos_paths`\n- 源码输出：`merged_tos_path`\n- QPS：`unknown`；并发：`32`\n- 可信度：`high`；冲突：无"
  },
  {
    "id": "exif.get",
    "displayName": "获取图片meta信息",
    "initial": "获",
    "domains": [
      "image",
      "metadata"
    ],
    "behavior": "enrich",
    "cardinality": "1:1",
    "intro": "图片已有 tos_path，需要读取宽高、拍摄参数、定位或版式等元数据时使用。",
    "weeklyRuns": "1,428",
    "wiki": "# `exif.get` — 获取图片meta信息\n\n> 正式 ID：`exif.get` · 旧别名：`exif_get` · 领域：image, metadata\n\n## 决策\n\n- **适用**：图片已有 tos_path，需要读取宽高、拍摄参数、定位或版式等元数据时使用。\n- **不适用**：视频宽高应使用 vod.video.get；本算子不会计算 width/height 比值。\n- **行为**：`enrich`；基数 `1:1`；执行 `sync`。\n- **硬依赖**：无硬依赖\n- **替代项**：无已确认替代项\n\n## 数据输入\n\n| 字段 | 类型 | 必需 | 语义 | 基数 | 可由谁提供 |\n| --- | --- | --- | --- | --- | --- |\n| tos_path | String | 是 | media_locator.tos | one | tos.list, vod.upload.tos, csv.expand（需字段映射）, csv.merge（需字段映射）, csv.unique（需字段映射）, image.resize（需字段映射） |\n\n## 配置\n\n| 配置 | 类型 | 必需 | 默认值 |\n| --- | --- | --- | --- |\n| 输出字段 | List | 否 | unknown |\n\n源码默认配置表达式：`Config{}`\n\n## 输出\n\n| 字段 | 类型 | 语义 | 基数 |\n| --- | --- | --- | --- |\n| width | String | media.dimension_px | one |\n| height | String | media.dimension_px | one |\n| exposure_program | String | field.generic | one |\n| exposure_time | String | field.generic | one |\n| f_number | String | field.generic | one |\n| focal_length | String | field.generic | one |\n| flash | String | field.generic | one |\n| metering_mode | String | field.generic | one |\n| white_balance | String | field.generic | one |\n| color_space | String | field.generic | one |\n| lens | String | collection.generic | one |\n| make | String | field.generic | one |\n| model | String | field.generic | one |\n| gps_latitude | String | field.generic | one |\n| gps_longitude | String | field.generic | one |\n| gps_altitude | String | field.generic | one |\n| datetime_original | String | field.generic | one |\n| content_creator | String | field.generic | one |\n| dpi | String | field.generic | one |\n| exposure_compensation | String | field.generic | one |\n| iso | String | field.generic | one |\n| layout | String | field.generic | one |\n\n## 风险\n\n- 仅静态解析 TOS 图片，不修改或脱敏 EXIF，缺失字段会为空\n\n## 证据\n\n- 源码：`stages/exif/get/exif.go` @ `f90386e38508`\n- 源码输入：`tos_path`\n- 源码输出：`width, height, exposure_program, exposure_time, f_number, focal_length, flash, metering_mode, white_balance, color_space, lens, make, model, gps_latitude, gps_longitude, gps_altitude, datetime_original, content_creator, dpi, exposure_compensation, iso`\n- QPS：`unknown`；并发：`128`\n- 可信度：`medium`；冲突：输出差异 table=['color_space', 'content_creator', 'datetime_original', 'dpi', 'exposure_compensation', 'exposure_program', 'exposure_time', 'f_number', 'flash', 'focal_length', 'gps_altitude', 'gps_latitude', 'gps_longitude', 'height', 'iso', 'layout', 'lens', 'make', 'metering_mode', 'model', 'white_balance', 'width'] source=['color_space', 'content_creator', 'datetime_original', 'dpi', 'exposure_compensation', 'exposure_program', 'exposure_time', 'f_number', 'flash', 'focal_length', 'gps_altitude', 'gps_latitude', 'gps_longitude', 'height', 'iso', 'lens', 'make', 'metering_mode', 'model', 'white_balance', 'width']"
  },
  {
    "id": "image.resize",
    "displayName": "图片压缩(resize)",
    "initial": "图",
    "domains": [
      "image"
    ],
    "behavior": "transform_or_write",
    "cardinality": "1:1",
    "intro": "该算子用于按配置缩放/压缩图片并上传新的 TOS 路径,",
    "weeklyRuns": "918",
    "wiki": "# `image.resize` — 图片压缩(resize)\n\n> 正式 ID：`image.resize` · 旧别名：`image_resize` · 领域：image\n\n## 决策\n\n- **适用**：该算子用于按配置缩放/压缩图片并上传新的 TOS 路径,\n- **不适用**：当前主要支持最大边等比压缩，不做裁剪、增强或格式智能选择\n- **行为**：`transform_or_write`；基数 `1:1`；执行 `sync`。\n- **硬依赖**：无硬依赖\n- **替代项**：无已确认替代项\n\n## 数据输入\n\n| 字段 | 类型 | 必需 | 语义 | 基数 | 可由谁提供 |\n| --- | --- | --- | --- | --- | --- |\n| tos_path | File | 是 | media_locator.tos | one | tos.list, vod.upload.tos, csv.expand（需字段映射）, csv.merge（需字段映射）, csv.unique（需字段映射）, jsonl.agg（需字段映射） |\n\n## 配置\n\n| 配置 | 类型 | 必需 | 默认值 |\n| --- | --- | --- | --- |\n| 类型(1: 等比压缩) | Int | 否 | 1 |\n| 最大边长 | Int | 否 | 512 |\n| 超时时间(秒) | Int | 否 | 60 * 3 |\n\n源码默认配置表达式：`Config{ Type: 1, Max: 512, Timeout: 60 * 3, }`\n\n## 输出\n\n| 字段 | 类型 | 语义 | 基数 |\n| --- | --- | --- | --- |\n| image_resize_tos_path | File | media_locator.tos | one |\n\n## 风险\n\n- 当前主要支持最大边等比压缩，不做裁剪、增强或格式智能选择\n\n## 证据\n\n- 源码：`stages/image/resize/resize.go` @ `f90386e38508`\n- 源码输入：`tos_path`\n- 源码输出：`image_resize_tos_path`\n- QPS：`unknown`；并发：`32`\n- 可信度：`high`；冲突：无"
  },
  {
    "id": "object_storage.transfer",
    "displayName": "对象存储间传输",
    "initial": "对",
    "domains": [
      "storage"
    ],
    "behavior": "transform_or_write",
    "cardinality": "1:1",
    "intro": "该算子用于在配置的对象存储源和目标之间流式搬运对象,",
    "weeklyRuns": "1,243",
    "wiki": "# `object_storage.transfer` — 对象存储间传输\n\n> 正式 ID：`object_storage.transfer` · 旧别名：`object_storage_transfer` · 领域：storage\n\n## 决策\n\n- **适用**：该算子用于在配置的对象存储源和目标之间流式搬运对象,\n- **不适用**：缺少源端或目标端凭证时不能使用；不得在建议结果中输出真实 AK/SK。\n- **行为**：`transform_or_write`；基数 `1:1`；执行 `external_storage_write`。\n- **硬依赖**：无硬依赖\n- **替代项**：无已确认替代项\n\n## 数据输入\n\n| 字段 | 类型 | 必需 | 语义 | 基数 | 可由谁提供 |\n| --- | --- | --- | --- | --- | --- |\n| src_path | String | 是 | media_locator.tos | one | csv.expand（需字段映射）, csv.merge（需字段映射）, csv.unique（需字段映射）, image.resize（需字段映射）, jsonl.agg（需字段映射）, string.replace_prefix（需字段映射） |\n| dst_path | String | 是 | media_locator.tos | one | string.replace_prefix, csv.expand（需字段映射）, csv.merge（需字段映射）, csv.unique（需字段映射）, image.resize（需字段映射）, jsonl.agg（需字段映射） |\n\n## 配置\n\n| 配置 | 类型 | 必需 | 默认值 |\n| --- | --- | --- | --- |\n| src.ak | String | 否 | unknown |\n| src.sk | String | 否 | unknown |\n| src.endpoint | String | 否 | unknown |\n| src.region | String | 否 | unknown |\n| dst.ak | String | 否 | unknown |\n| dst.sk | String | 否 | unknown |\n| dst.endpoint | String | 否 | unknown |\n| dst.region | String | 否 | unknown |\n\n源码默认配置表达式：`UploadConfig{}`\n\n## 输出\n\n无数据字段输出；该算子主要执行校验、过滤、等待或外部写入。\n\n## 风险\n\n- 只做 src_path 到 dst_path 的复制，依赖 AK/SK 配置，会写入目标存储\n\n## 证据\n\n- 源码：`stages/object_storage/put.go` @ `f90386e38508`\n- 源码输入：`src_path, dst_path`\n- 源码输出：`none/dynamic`\n- QPS：`32`；并发：`128`\n- 可信度：`high`；冲突：无"
  },
  {
    "id": "tos.exist",
    "displayName": "检查文件是否存在",
    "initial": "检",
    "domains": [
      "storage",
      "validation"
    ],
    "behavior": "validate_or_filter",
    "cardinality": "1:1",
    "intro": "该算子用于校验配置输入字段中的 TOS 对象是否存在且可读取头信息,",
    "weeklyRuns": "1,017",
    "wiki": "# `tos.exist` — 检查文件是否存在\n\n> 正式 ID：`tos.exist` · 旧别名：`tos_exist` · 领域：storage, validation\n\n## 决策\n\n- **适用**：该算子用于校验配置输入字段中的 TOS 对象是否存在且可读取头信息,\n- **不适用**：只做存在性检查，失败会中止，不校验文件内容\n- **行为**：`validate_or_filter`；基数 `1:1`；执行 `external_service_sync`。\n- **硬依赖**：无硬依赖\n- **替代项**：无已确认替代项\n\n## 数据输入\n\n| 字段 | 类型 | 必需 | 语义 | 基数 | 可由谁提供 |\n| --- | --- | --- | --- | --- | --- |\n| <动态输入字段> | String | 是 | field.generic | dynamic | ai-platform.deepseek（需字段映射）, ai-platform.gemini（需字段映射）, ai-platform.qwen（需字段映射）, ai-platform.seedream.img2img（需字段映射）, ap_v25.filter（需字段映射）, cn_clip.artimuse（需字段映射） |\n\n## 配置\n\n无用户配置。\n\n源码默认配置表达式：`unknown`\n\n## 输出\n\n无数据字段输出；该算子主要执行校验、过滤、等待或外部写入。\n\n## 风险\n\n- 只做存在性检查，失败会中止，不校验文件内容\n\n## 证据\n\n- 源码：`stages/tos/validator/eixst_validator.go` @ `f90386e38508`\n- 源码输入：`dynamic/unknown`\n- 源码输出：`none/dynamic`\n- QPS：`unknown`；并发：`128`\n- 可信度：`high`；冲突：无"
  },
  {
    "id": "tos.external_sign",
    "displayName": "生成第三方TOS签名(直签)",
    "initial": "生",
    "domains": [
      "storage",
      "delivery"
    ],
    "behavior": "enrich",
    "cardinality": "1:1",
    "intro": "需要使用指定 TOS 账号生成第三方可访问的直签 URL 时使用。",
    "weeklyRuns": "1,664",
    "wiki": "# `tos.external_sign` — 生成第三方TOS签名(直签)\n\n> 正式 ID：`tos.external_sign` · 旧别名：`tos_external_sign` · 领域：storage, delivery\n\n## 决策\n\n- **适用**：需要使用指定 TOS 账号生成第三方可访问的直签 URL 时使用。\n- **不适用**：可以使用内部 CDN 签名时优先考虑 tos.sign，避免在配置中散落 AK/SK。\n- **行为**：`enrich`；基数 `1:1`；执行 `external_service_sync`。\n- **硬依赖**：无硬依赖\n- **替代项**：[tos.sign](tos.sign.md)\n\n## 数据输入\n\n| 字段 | 类型 | 必需 | 语义 | 基数 | 可由谁提供 |\n| --- | --- | --- | --- | --- | --- |\n| <field值> | String | 是 | field.generic | dynamic | ai-platform.deepseek（需字段映射）, ai-platform.gemini（需字段映射）, ai-platform.qwen（需字段映射）, ai-platform.seedream.img2img（需字段映射）, ap_v25.filter（需字段映射）, cn_clip.artimuse（需字段映射） |\n\n## 配置\n\n| 配置 | 类型 | 必需 | 默认值 |\n| --- | --- | --- | --- |\n| region | String | 否 | unknown |\n| endpoint | String | 否 | unknown |\n| AK | String | 否 | unknown |\n| SK | String | 否 | unknown |\n| field | String | 否 | unknown |\n\n源码默认配置表达式：`ExternalSignConfig{}`\n\n## 输出\n\n| 字段 | 类型 | 语义 | 基数 |\n| --- | --- | --- | --- |\n| tos_external_sign_url | String | media_locator.http | one |\n\n## 风险\n\n- 依赖 AK/SK/region 配置和字段路径，不检查业务授权范围\n\n## 证据\n\n- 源码：`stages/tos/external_sign.go` @ `f90386e38508`\n- 源码输入：`dynamic/unknown`\n- 源码输出：`tos_external_sign_url`\n- QPS：`unknown`；并发：`128`\n- 可信度：`high`；冲突：无"
  },
  {
    "id": "tos.list",
    "displayName": "遍历TOS目录，输出指定的后缀、文件名等",
    "initial": "遍",
    "domains": [
      "storage"
    ],
    "behavior": "fanout",
    "cardinality": "1:N",
    "intro": "该算子用于遍历 TOS 目录并按后缀过滤后拆分输出对象路径,",
    "weeklyRuns": "1,497",
    "wiki": "# `tos.list` — 遍历TOS目录，输出指定的后缀、文件名等\n\n> 正式 ID：`tos.list` · 旧别名：`tos_list` · 领域：storage\n\n## 决策\n\n- **适用**：该算子用于遍历 TOS 目录并按后缀过滤后拆分输出对象路径,\n- **不适用**：只列举对象，不读取内容或递归处理复杂目录语义\n- **行为**：`fanout`；基数 `1:N`；执行 `external_service_sync`。\n- **硬依赖**：无硬依赖\n- **替代项**：无已确认替代项\n\n## 数据输入\n\n| 字段 | 类型 | 必需 | 语义 | 基数 | 可由谁提供 |\n| --- | --- | --- | --- | --- | --- |\n| dir | String | 是 | field.generic | one | ai-platform.deepseek（需字段映射）, ai-platform.gemini（需字段映射）, ai-platform.qwen（需字段映射）, ai-platform.seedream.img2img（需字段映射）, ap_v25.filter（需字段映射）, cn_clip.artimuse（需字段映射） |\n\n## 配置\n\n| 配置 | 类型 | 必需 | 默认值 |\n| --- | --- | --- | --- |\n| 允许的文件后缀(例如.mp4),使用,分隔 | String | 否 | unknown |\n| 允许的文件名 | String | 否 | unknown |\n\n源码默认配置表达式：`ListTosCfg{}`\n\n## 输出\n\n| 字段 | 类型 | 语义 | 基数 |\n| --- | --- | --- | --- |\n| tos_path | String | media_locator.tos | one |\n\n## 风险\n\n- 只列举对象，不读取内容或递归处理复杂目录语义\n\n## 证据\n\n- 源码：`stages/tos/list.go` @ `f90386e38508`\n- 源码输入：`dir`\n- 源码输出：`tos_path`\n- QPS：`unknown`；并发：`1`\n- 可信度：`high`；冲突：无"
  },
  {
    "id": "tos.sign",
    "displayName": "生成TOS签名(cdn)",
    "initial": "生",
    "domains": [
      "storage",
      "delivery"
    ],
    "behavior": "enrich",
    "cardinality": "1:1",
    "intro": "已有一个或多个 TOS 字段，需要生成有时效的 CDN 访问链接时使用。",
    "weeklyRuns": "1,300",
    "wiki": "# `tos.sign` — 生成TOS签名(cdn)\n\n> 正式 ID：`tos.sign` · 旧别名：`tos_sign` · 领域：storage, delivery\n\n## 决策\n\n- **适用**：已有一个或多个 TOS 字段，需要生成有时效的 CDN 访问链接时使用。\n- **不适用**：依赖域名/过期时间配置，不校验内容合规性或长期可用性\n- **行为**：`enrich`；基数 `1:1`；执行 `external_service_sync`。\n- **硬依赖**：无硬依赖\n- **替代项**：[tos.external_sign](tos.external_sign.md)\n\n## 数据输入\n\n| 字段 | 类型 | 必需 | 语义 | 基数 | 可由谁提供 |\n| --- | --- | --- | --- | --- | --- |\n| <Fields中各字段值> | String | 是 | field.generic | dynamic | ai-platform.deepseek（需字段映射）, ai-platform.gemini（需字段映射）, ai-platform.qwen（需字段映射）, ai-platform.seedream.img2img（需字段映射）, ap_v25.filter（需字段映射）, cn_clip.artimuse（需字段映射） |\n\n## 配置\n\n| 配置 | 类型 | 必需 | 默认值 |\n| --- | --- | --- | --- |\n| 字段(英文逗号分割多个字段名) | String | 否 | \"tos_path\" |\n| 过期时间(秒) | Int | 否 | 3600 * 24 * 7 |\n| 域名 | String | 否 | unknown |\n| 别名 | String | 否 | \"common\" |\n\n源码默认配置表达式：`SignConfig{ Fields: \"tos_path\", Expire: 3600 * 24 * 7, Alias: \"common\", }`\n\n## 输出\n\n| 字段 | 类型 | 语义 | 基数 |\n| --- | --- | --- | --- |\n| tos_sign_urls | String | media_locator.http_list | many |\n\n## 风险\n\n- 依赖域名/过期时间配置，不校验内容合规性或长期可用性\n\n## 证据\n\n- 源码：`stages/tos/sign.go` @ `f90386e38508`\n- 源码输入：`dynamic/unknown`\n- 源码输出：`tos_sign_urls`\n- QPS：`unknown`；并发：`128`\n- 可信度：`high`；冲突：无"
  },
  {
    "id": "tos.unzip",
    "displayName": "解压tos的压缩包",
    "initial": "解",
    "domains": [
      "storage"
    ],
    "behavior": "transform_or_write",
    "cardinality": "1:1",
    "intro": "该算子用于解压 TOS 压缩包并上传解压结果路径,",
    "weeklyRuns": "1,148",
    "wiki": "# `tos.unzip` — 解压tos的压缩包\n\n> 正式 ID：`tos.unzip` · 旧别名：`tos_unzip` · 领域：storage\n\n## 决策\n\n- **适用**：该算子用于解压 TOS 压缩包并上传解压结果路径,\n- **不适用**：依赖压缩格式和并发配置，会写入多个对象，不做病毒扫描\n- **行为**：`transform_or_write`；基数 `1:1`；执行 `external_service_sync`。\n- **硬依赖**：无硬依赖\n- **替代项**：无已确认替代项\n\n## 数据输入\n\n| 字段 | 类型 | 必需 | 语义 | 基数 | 可由谁提供 |\n| --- | --- | --- | --- | --- | --- |\n| tos_path | String | 是 | media_locator.tos | one | tos.list, vod.upload.tos, csv.expand（需字段映射）, csv.merge（需字段映射）, csv.unique（需字段映射）, image.resize（需字段映射） |\n\n## 配置\n\n| 配置 | 类型 | 必需 | 默认值 |\n| --- | --- | --- | --- |\n| 最大并发处理数 | Int | 否 | 8 |\n\n源码默认配置表达式：`UnzipConfig{ Concurrency: 8, }`\n\n## 输出\n\n| 字段 | 类型 | 语义 | 基数 |\n| --- | --- | --- | --- |\n| unzip_tos_path | String | media_locator.tos | one |\n\n## 风险\n\n- 依赖压缩格式和并发配置，会写入多个对象，不做病毒扫描\n\n## 证据\n\n- 源码：`stages/tos/unzip.go` @ `f90386e38508`\n- 源码输入：`dynamic/unknown`\n- 源码输出：`unzip_tos_path`\n- QPS：`unknown`；并发：`128`\n- 可信度：`high`；冲突：无"
  },
  {
    "id": "tos.validate",
    "displayName": "检查文件格式",
    "initial": "检",
    "domains": [
      "storage",
      "validation"
    ],
    "behavior": "validate_or_filter",
    "cardinality": "1:1",
    "intro": "该算子用于按字段校验 TOS 文件格式是否符合预期,",
    "weeklyRuns": "1,425",
    "wiki": "# `tos.validate` — 检查文件格式\n\n> 正式 ID：`tos.validate` · 旧别名：`tos_validate` · 领域：storage, validation\n\n## 决策\n\n- **适用**：该算子用于按字段校验 TOS 文件格式是否符合预期,\n- **不适用**：主要依赖路径/验证器规则，不做深度媒体解码或内容审核\n- **行为**：`validate_or_filter`；基数 `1:1`；执行 `external_service_sync`。\n- **硬依赖**：无硬依赖\n- **替代项**：无已确认替代项\n\n## 数据输入\n\n| 字段 | 类型 | 必需 | 语义 | 基数 | 可由谁提供 |\n| --- | --- | --- | --- | --- | --- |\n| macro_events_tos_path | String | 是 | media_locator.tos | one | csv.expand（需字段映射）, csv.merge（需字段映射）, csv.unique（需字段映射）, image.resize（需字段映射）, jsonl.agg（需字段映射）, string.replace_prefix（需字段映射） |\n| mouse_move_by_macro_events_tos_path | String | 是 | media_locator.tos | one | csv.expand（需字段映射）, csv.merge（需字段映射）, csv.unique（需字段映射）, image.resize（需字段映射）, jsonl.agg（需字段映射）, string.replace_prefix（需字段映射） |\n| mouse_move_to_macro_events_tos_path | String | 是 | media_locator.tos | one | csv.expand（需字段映射）, csv.merge（需字段映射）, csv.unique（需字段映射）, image.resize（需字段映射）, jsonl.agg（需字段映射）, string.replace_prefix（需字段映射） |\n| system_info_tos_path | String | 是 | media_locator.tos | one | csv.expand（需字段映射）, csv.merge（需字段映射）, csv.unique（需字段映射）, image.resize（需字段映射）, jsonl.agg（需字段映射）, string.replace_prefix（需字段映射） |\n| video_km_frames_tos_path | String | 是 | media_locator.tos | one | csv.expand（需字段映射）, csv.merge（需字段映射）, csv.unique（需字段映射）, image.resize（需字段映射）, jsonl.agg（需字段映射）, string.replace_prefix（需字段映射） |\n| fps_tos_path | String | 是 | media_locator.tos | one | csv.expand（需字段映射）, csv.merge（需字段映射）, csv.unique（需字段映射）, image.resize（需字段映射）, jsonl.agg（需字段映射）, string.replace_prefix（需字段映射） |\n| pc_tos_path | String | 是 | media_locator.tos | one | csv.expand（需字段映射）, csv.merge（需字段映射）, csv.unique（需字段映射）, image.resize（需字段映射）, jsonl.agg（需字段映射）, string.replace_prefix（需字段映射） |\n\n## 配置\n\n无用户配置。\n\n源码默认配置表达式：`unknown`\n\n## 输出\n\n无数据字段输出；该算子主要执行校验、过滤、等待或外部写入。\n\n## 风险\n\n- 主要依赖路径/验证器规则，不做深度媒体解码或内容审核\n\n## 证据\n\n- 源码：`stages/tos/validator/file_type_validator.go` @ `f90386e38508`\n- 源码输入：`macro_events_tos_path, mouse_move_by_macro_events_tos_path, mouse_move_to_macro_events_tos_path, system_info_tos_path, video_km_frames_tos_path, fps_tos_path, pc_tos_path`\n- 源码输出：`none/dynamic`\n- QPS：`unknown`；并发：`128`\n- 可信度：`high`；冲突：无"
  },
  {
    "id": "vod_workflow",
    "displayName": "经过vid工作流得到视频下载链接",
    "initial": "经",
    "domains": [
      "storage"
    ],
    "behavior": "enrich",
    "cardinality": "1:1",
    "intro": "该算子用于通过 vid 启动/查询 VOD 工作流并获取下载 URL,",
    "weeklyRuns": "1,027",
    "wiki": "# `vod_workflow` — 经过vid工作流得到视频下载链接\n\n> 正式 ID：`vod_workflow` · 旧别名：`vod_workflow` · 领域：storage\n\n## 决策\n\n- **适用**：该算子用于通过 vid 启动/查询 VOD 工作流并获取下载 URL,\n- **不适用**：强依赖 VOD 工作流状态，不下载媒体或生成新文件\n- **行为**：`enrich`；基数 `1:1`；执行 `sync`。\n- **硬依赖**：无硬依赖\n- **替代项**：无已确认替代项\n\n## 数据输入\n\n| 字段 | 类型 | 必需 | 语义 | 基数 | 可由谁提供 |\n| --- | --- | --- | --- | --- | --- |\n| vid | String | 是 | media_locator.vod_id | one | vod.local_split.tos, vod.upload, vod.local_split（需字段映射） |\n\n## 配置\n\n| 配置 | 类型 | 必需 | 默认值 |\n| --- | --- | --- | --- |\n| work_flow_id | String | 否 | unknown |\n| definitions | String | 否 | unknown |\n\n源码默认配置表达式：`VodWorkflow{}`\n\n## 输出\n\n| 字段 | 类型 | 语义 | 基数 |\n| --- | --- | --- | --- |\n| url | String | media_locator.http | one |\n\n## 风险\n\n- 强依赖 VOD 工作流状态，不下载媒体或生成新文件\n\n## 证据\n\n- 源码：`stages/vod/workflow/workflow.go` @ `f90386e38508`\n- 源码输入：`vid`\n- 源码输出：`url`\n- QPS：`50`；并发：`unknown`\n- 可信度：`high`；冲突：无"
  },
  {
    "id": "csv.expand",
    "displayName": "CSV展开",
    "initial": "C",
    "domains": [
      "tabular"
    ],
    "behavior": "fanout",
    "cardinality": "1:N",
    "intro": "该算子用于把 CSV 单字段按分隔符展开成多行字段,",
    "weeklyRuns": "961",
    "wiki": "# `csv.expand` — CSV展开\n\n> 正式 ID：`csv.expand` · 旧别名：`csv_expand` · 领域：tabular\n\n## 决策\n\n- **适用**：该算子用于把 CSV 单字段按分隔符展开成多行字段,\n- **不适用**：只处理配置指定字段的字符串拆分，不做 CSV 文件读取、类型转换或去重\n- **行为**：`fanout`；基数 `1:N`；执行 `sync`。\n- **硬依赖**：无硬依赖\n- **替代项**：无已确认替代项\n\n## 数据输入\n\n| 字段 | 类型 | 必需 | 语义 | 基数 | 可由谁提供 |\n| --- | --- | --- | --- | --- | --- |\n| <待展开字段值> | String | 是 | field.generic | dynamic | ai-platform.deepseek（需字段映射）, ai-platform.gemini（需字段映射）, ai-platform.qwen（需字段映射）, ai-platform.seedream.img2img（需字段映射）, ap_v25.filter（需字段映射）, cn_clip.artimuse（需字段映射） |\n\n## 配置\n\n| 配置 | 类型 | 必需 | 默认值 |\n| --- | --- | --- | --- |\n| 待展开字段 | String | 否 | unknown |\n| 展开后字段 | String | 否 | unknown |\n| 分隔符 | String | 否 | unknown |\n\n源码默认配置表达式：`ExpandConfig{}`\n\n## 输出\n\n| 字段 | 类型 | 语义 | 基数 |\n| --- | --- | --- | --- |\n| <展开后字段值> | String | field.generic | dynamic |\n| split_tos_path | String | media_locator.tos | one |\n\n## 风险\n\n- 只处理配置指定字段的字符串拆分，不做 CSV 文件读取、类型转换或去重\n\n## 证据\n\n- 源码：`stages/csv/expand.go` @ `f90386e38508`\n- 源码输入：`dynamic/unknown`\n- 源码输出：`none/dynamic`\n- QPS：`unknown`；并发：`128`\n- 可信度：`high`；冲突：无"
  },
  {
    "id": "csv.merge",
    "displayName": "CSV合并",
    "initial": "C",
    "domains": [
      "tabular"
    ],
    "behavior": "aggregate",
    "cardinality": "N:1",
    "intro": "该算子用于遍历 TOS 目录下 CSV 并合并为一个文件,",
    "weeklyRuns": "1,574",
    "wiki": "# `csv.merge` — CSV合并\n\n> 正式 ID：`csv.merge` · 旧别名：`csv_merge` · 领域：tabular\n\n## 决策\n\n- **适用**：该算子用于遍历 TOS 目录下 CSV 并合并为一个文件,\n- **不适用**：依赖 tos_dir 和对象存储读写，只做表头级合并，不解决字段语义冲突\n- **行为**：`aggregate`；基数 `N:1`；执行 `sync`。\n- **硬依赖**：无硬依赖\n- **替代项**：无已确认替代项\n\n## 数据输入\n\n| 字段 | 类型 | 必需 | 语义 | 基数 | 可由谁提供 |\n| --- | --- | --- | --- | --- | --- |\n| tos_dir | String | 是 | field.generic | one | ai-platform.deepseek（需字段映射）, ai-platform.gemini（需字段映射）, ai-platform.qwen（需字段映射）, ai-platform.seedream.img2img（需字段映射）, ap_v25.filter（需字段映射）, cn_clip.artimuse（需字段映射） |\n\n## 配置\n\n无用户配置。\n\n源码默认配置表达式：`unknown`\n\n## 输出\n\n| 字段 | 类型 | 语义 | 基数 |\n| --- | --- | --- | --- |\n| merge_tos_path | String | media_locator.tos | one |\n\n## 风险\n\n- 依赖 tos_dir 和对象存储读写，只做表头级合并，不解决字段语义冲突\n\n## 证据\n\n- 源码：`stages/csv/merge.go` @ `f90386e38508`\n- 源码输入：`tos_dir`\n- 源码输出：`merge_tos_path`\n- QPS：`unknown`；并发：`128`\n- 可信度：`high`；冲突：无"
  },
  {
    "id": "csv.unique",
    "displayName": "CSV去重",
    "initial": "C",
    "domains": [
      "tabular"
    ],
    "behavior": "enrich",
    "cardinality": "1:1",
    "intro": "该算子用于按配置字段对 CSV 文件去重并可维护历史 key 文件,",
    "weeklyRuns": "1,222",
    "wiki": "# `csv.unique` — CSV去重\n\n> 正式 ID：`csv.unique` · 旧别名：`csv_unique` · 领域：tabular\n\n## 决策\n\n- **适用**：该算子用于按配置字段对 CSV 文件去重并可维护历史 key 文件,\n- **不适用**：会读写 TOS 文件，去重粒度完全依赖配置字段，不做内容相似度判断\n- **行为**：`enrich`；基数 `1:1`；执行 `sync`。\n- **硬依赖**：无硬依赖\n- **替代项**：无已确认替代项\n\n## 数据输入\n\n| 字段 | 类型 | 必需 | 语义 | 基数 | 可由谁提供 |\n| --- | --- | --- | --- | --- | --- |\n| tos_path | String | 是 | media_locator.tos | one | tos.list, vod.upload.tos, csv.expand（需字段映射）, csv.merge（需字段映射）, image.resize（需字段映射）, jsonl.agg（需字段映射） |\n\n## 配置\n\n| 配置 | 类型 | 必需 | 默认值 |\n| --- | --- | --- | --- |\n| 历史key存储地址 | String | 否 | unknown |\n| 去重字段 | String | 否 | unknown |\n| 排除批次(batch_id多个用逗号分隔) | String | 否 | unknown |\n| 保存到历史key存储地址 | Boolean | 否 | unknown |\n| 去重后文件存储地址 | String | 否 | unknown |\n\n源码默认配置表达式：`UniqueConfig{}`\n\n## 输出\n\n| 字段 | 类型 | 语义 | 基数 |\n| --- | --- | --- | --- |\n| unique_tos_path | String | media_locator.tos | one |\n\n## 风险\n\n- 会读写 TOS 文件，去重粒度完全依赖配置字段，不做内容相似度判断\n\n## 证据\n\n- 源码：`stages/csv/unique.go` @ `f90386e38508`\n- 源码输入：`tos_path`\n- 源码输出：`unique_tos_path`\n- QPS：`unknown`；并发：`1`\n- 可信度：`high`；冲突：无"
  },
  {
    "id": "jsonl.agg",
    "displayName": "jsonl聚合",
    "initial": "J",
    "domains": [
      "tabular"
    ],
    "behavior": "aggregate",
    "cardinality": "N:1",
    "intro": "该算子用于把多个 JSONL 文件按配置字段聚合并上传结果,",
    "weeklyRuns": "1,754",
    "wiki": "# `jsonl.agg` — jsonl聚合\n\n> 正式 ID：`jsonl.agg` · 旧别名：`jsonl_agg` · 领域：tabular\n\n## 决策\n\n- **适用**：该算子用于把多个 JSONL 文件按配置字段聚合并上传结果,\n- **不适用**：依赖 tos_path 文件内容和输出路径配置，不做 JSON schema 深度校验\n- **行为**：`aggregate`；基数 `N:1`；执行 `sync`。\n- **硬依赖**：无硬依赖\n- **替代项**：无已确认替代项\n\n## 数据输入\n\n| 字段 | 类型 | 必需 | 语义 | 基数 | 可由谁提供 |\n| --- | --- | --- | --- | --- | --- |\n| tos_path | File | 是 | media_locator.tos | one | tos.list, vod.upload.tos, csv.expand（需字段映射）, csv.merge（需字段映射）, csv.unique（需字段映射）, image.resize（需字段映射） |\n\n## 配置\n\n| 配置 | 类型 | 必需 | 默认值 |\n| --- | --- | --- | --- |\n| field | String | 是 | unknown |\n| output_path | String | 否 | unknown |\n\n源码默认配置表达式：`AggConfig{}`\n\n## 输出\n\n| 字段 | 类型 | 语义 | 基数 |\n| --- | --- | --- | --- |\n| agg_tos_path | File | media_locator.tos | one |\n\n## 风险\n\n- 依赖 tos_path 文件内容和输出路径配置，不做 JSON schema 深度校验\n\n## 证据\n\n- 源码：`stages/jsonl/agg.go` @ `f90386e38508`\n- 源码输入：`tos_path`\n- 源码输出：`agg_tos_path`\n- QPS：`unknown`；并发：`128`\n- 可信度：`high`；冲突：无"
  },
  {
    "id": "rowkey",
    "displayName": "根据tos路径生成rowkey",
    "initial": "根",
    "domains": [
      "tabular"
    ],
    "behavior": "enrich",
    "cardinality": "1:1",
    "intro": "该算子用于根据 TOS 路径或配置输入字段生成稳定 rowkey,",
    "weeklyRuns": "1,247",
    "wiki": "# `rowkey` — 根据tos路径生成rowkey\n\n> 正式 ID：`rowkey` · 旧别名：`rowkey` · 领域：tabular\n\n## 决策\n\n- **适用**：该算子用于根据 TOS 路径或配置输入字段生成稳定 rowkey,\n- **不适用**：依赖对象存在性/内容信息或字段组合，不保证业务主键跨策略兼容\n- **行为**：`enrich`；基数 `1:1`；执行 `sync`。\n- **硬依赖**：无硬依赖\n- **替代项**：无已确认替代项\n\n## 数据输入\n\n| 字段 | 类型 | 必需 | 语义 | 基数 | 可由谁提供 |\n| --- | --- | --- | --- | --- | --- |\n| tos_path | File | 是 | media_locator.tos | one | tos.list, vod.upload.tos, csv.expand（需字段映射）, csv.merge（需字段映射）, csv.unique（需字段映射）, image.resize（需字段映射） |\n\n## 配置\n\n| 配置 | 类型 | 必需 | 默认值 |\n| --- | --- | --- | --- |\n| 阶段并发 | Int | 否 | unknown |\n| 输入字段 | List | 否 | unknown |\n| 超时时间 | Int | 否 | unknown |\n\n源码默认配置表达式：`Config{}`\n\n## 输出\n\n| 字段 | 类型 | 语义 | 基数 |\n| --- | --- | --- | --- |\n| rowkey | String | record.rowkey | one |\n\n## 风险\n\n- 依赖对象存在性/内容信息或字段组合，不保证业务主键跨策略兼容\n\n## 证据\n\n- 源码：`stages/rowkey/rowkey.go` @ `f90386e38508`\n- 源码输入：`tos_path`\n- 源码输出：`rowkey`\n- QPS：`unknown`；并发：`128`\n- 可信度：`high`；冲突：无"
  },
  {
    "id": "string.replace_prefix",
    "displayName": "替换前缀并添加字段",
    "initial": "替",
    "domains": [
      "tabular"
    ],
    "behavior": "enrich",
    "cardinality": "1:1",
    "intro": "该算子用于把 src_path 的前缀替换为目标前缀并写入 dst_path,",
    "weeklyRuns": "1,927",
    "wiki": "# `string.replace_prefix` — 替换前缀并添加字段\n\n> 正式 ID：`string.replace_prefix` · 旧别名：`string_replace_prefix` · 领域：tabular\n\n## 决策\n\n- **适用**：该算子用于把 src_path 的前缀替换为目标前缀并写入 dst_path,\n- **不适用**：只做字符串前缀替换，匹配失败可中止，不检查目标对象存在\n- **行为**：`enrich`；基数 `1:1`；执行 `sync`。\n- **硬依赖**：无硬依赖\n- **替代项**：无已确认替代项\n\n## 数据输入\n\n| 字段 | 类型 | 必需 | 语义 | 基数 | 可由谁提供 |\n| --- | --- | --- | --- | --- | --- |\n| src_path | String | 是 | media_locator.tos | one | csv.expand（需字段映射）, csv.merge（需字段映射）, csv.unique（需字段映射）, image.resize（需字段映射）, jsonl.agg（需字段映射）, tos.compress.360p（需字段映射） |\n\n## 配置\n\n| 配置 | 类型 | 必需 | 默认值 |\n| --- | --- | --- | --- |\n| 替换前的前缀名 | String | 否 | unknown |\n| 替换后的前缀名 | String | 否 | unknown |\n| 前缀匹配不上是否丢弃 | Boolean | 否 | unknown |\n\n源码默认配置表达式：`PrefixConfig{}`\n\n## 输出\n\n| 字段 | 类型 | 语义 | 基数 |\n| --- | --- | --- | --- |\n| dst_path | String | media_locator.tos | one |\n\n## 风险\n\n- 只做字符串前缀替换，匹配失败可中止，不检查目标对象存在\n\n## 证据\n\n- 源码：`stages/string/replace_prefix.go` @ `f90386e38508`\n- 源码输入：`src_path`\n- 源码输出：`dst_path`\n- QPS：`10000`；并发：`unknown`\n- 可信度：`high`；冲突：无"
  },
  {
    "id": "eval.filter",
    "displayName": "过滤表达式计算",
    "initial": "过",
    "domains": [
      "validation"
    ],
    "behavior": "validate_or_filter",
    "cardinality": "1:1",
    "intro": "该算子用于按配置构造简单比较表达式并过滤 Job,",
    "weeklyRuns": "1,685",
    "wiki": "# `eval.filter` — 过滤表达式计算\n\n> 正式 ID：`eval.filter` · 旧别名：`eval_filter` · 领域：validation\n\n## 决策\n\n- **适用**：该算子用于按配置构造简单比较表达式并过滤 Job,\n- **不适用**：仅支持字段与整数阈值的比较，表达式为 false 会中止，不做复杂规则编排\n- **行为**：`validate_or_filter`；基数 `1:1`；执行 `sync`。\n- **硬依赖**：无硬依赖\n- **替代项**：无已确认替代项\n\n## 数据输入\n\n| 字段 | 类型 | 必需 | 语义 | 基数 | 可由谁提供 |\n| --- | --- | --- | --- | --- | --- |\n| <比较字段值> | String | 是 | field.generic | dynamic | ai-platform.deepseek（需字段映射）, ai-platform.gemini（需字段映射）, ai-platform.qwen（需字段映射）, ai-platform.seedream.img2img（需字段映射）, ap_v25.filter（需字段映射）, cn_clip.artimuse（需字段映射） |\n\n## 配置\n\n| 配置 | 类型 | 必需 | 默认值 |\n| --- | --- | --- | --- |\n| 比较字段 | String | 否 | unknown |\n| 操作符号(> < >= <= =) | String | 否 | unknown |\n| 比较值 | Int | 否 | unknown |\n\n源码默认配置表达式：`FilterConfig{}`\n\n## 输出\n\n无数据字段输出；该算子主要执行校验、过滤、等待或外部写入。\n\n## 风险\n\n- 仅支持字段与整数阈值的比较，表达式为 false 会中止，不做复杂规则编排\n\n## 证据\n\n- 源码：`stages/eval/filter.go` @ `f90386e38508`\n- 源码输入：`dynamic/unknown`\n- 源码输出：`none/dynamic`\n- QPS：`unknown`；并发：`128`\n- 可信度：`high`；冲突：无"
  },
  {
    "id": "expr.check",
    "displayName": "使用表达式检查",
    "initial": "使",
    "domains": [
      "validation"
    ],
    "behavior": "validate_or_filter",
    "cardinality": "1:1",
    "intro": "该算子用于基于配置表达式检查输入字段并过滤 Job,",
    "weeklyRuns": "1,791",
    "wiki": "# `expr.check` — 使用表达式检查\n\n> 正式 ID：`expr.check` · 旧别名：`expr_check` · 领域：validation\n\n## 决策\n\n- **适用**：该算子用于基于配置表达式检查输入字段并过滤 Job,\n- **不适用**：表达式依赖字段可解析和 expr 引擎，失败会中止，不负责修正数据\n- **行为**：`validate_or_filter`；基数 `1:1`；执行 `sync`。\n- **硬依赖**：无硬依赖\n- **替代项**：无已确认替代项\n\n## 数据输入\n\n| 字段 | 类型 | 必需 | 语义 | 基数 | 可由谁提供 |\n| --- | --- | --- | --- | --- | --- |\n| <输入字段值> | String | 是 | field.generic | dynamic | ai-platform.deepseek（需字段映射）, ai-platform.gemini（需字段映射）, ai-platform.qwen（需字段映射）, ai-platform.seedream.img2img（需字段映射）, ap_v25.filter（需字段映射）, cn_clip.artimuse（需字段映射） |\n\n## 配置\n\n| 配置 | 类型 | 必需 | 默认值 |\n| --- | --- | --- | --- |\n| 表达式 | String | 否 | unknown |\n| 输入字段 | List | 否 | unknown |\n| 禁用 | Boolean | 否 | unknown |\n\n源码默认配置表达式：`CheckConfig{}`\n\n## 输出\n\n无数据字段输出；该算子主要执行校验、过滤、等待或外部写入。\n\n## 风险\n\n- 表达式依赖字段可解析和 expr 引擎，失败会中止，不负责修正数据\n\n## 证据\n\n- 源码：`stages/expr/check.go` @ `f90386e38508`\n- 源码输入：`dynamic/unknown`\n- 源码输出：`none/dynamic`\n- QPS：`unknown`；并发：`128`\n- 可信度：`high`；冲突：无"
  },
  {
    "id": "hbase.get",
    "displayName": "从hbase获取",
    "initial": "从",
    "domains": [
      "hbase"
    ],
    "behavior": "enrich",
    "cardinality": "1:1",
    "intro": "该算子用于按 rowkey 从 AI Dataset/HBase 读取配置字段,",
    "weeklyRuns": "1,466",
    "wiki": "# `hbase.get` — 从hbase获取\n\n> 正式 ID：`hbase.get` · 旧别名：`hbase_get` · 领域：hbase\n\n## 决策\n\n- **适用**：该算子用于按 rowkey 从 AI Dataset/HBase 读取配置字段,\n- **不适用**：依赖外部数据服务和字段配置，只做读取，不校验业务含义\n- **行为**：`enrich`；基数 `1:1`；执行 `external_service_sync`。\n- **硬依赖**：无硬依赖\n- **替代项**：无已确认替代项\n\n## 数据输入\n\n| 字段 | 类型 | 必需 | 语义 | 基数 | 可由谁提供 |\n| --- | --- | --- | --- | --- | --- |\n| rowkey | String | 是 | record.rowkey | one | rowkey |\n\n## 配置\n\n| 配置 | 类型 | 必需 | 默认值 |\n| --- | --- | --- | --- |\n| fields | String | 否 | unknown |\n| data_type | String | 否 | unknown |\n| 输出字段 | List | 否 | unknown |\n\n源码默认配置表达式：`GetHbaseConfig{}`\n\n## 输出\n\n| 字段 | 类型 | 语义 | 基数 |\n| --- | --- | --- | --- |\n| <hbase列名(动态)> | String | field.generic | dynamic |\n\n## 风险\n\n- 依赖外部数据服务和字段配置，只做读取，不校验业务含义\n\n## 证据\n\n- 源码：`stages/hbase/get.go` @ `f90386e38508`\n- 源码输入：`rowkey`\n- 源码输出：`none/dynamic`\n- QPS：`unknown`；并发：`500`\n- 可信度：`high`；冲突：无"
  },
  {
    "id": "hbase.set",
    "displayName": "写入hbase",
    "initial": "写",
    "domains": [
      "hbase"
    ],
    "behavior": "transform_or_write",
    "cardinality": "1:1",
    "intro": "该算子用于把配置字段以字符串形式写入 AI Dataset/HBase,",
    "weeklyRuns": "1,051",
    "wiki": "# `hbase.set` — 写入hbase\n\n> 正式 ID：`hbase.set` · 旧别名：`hbase_set` · 领域：hbase\n\n## 决策\n\n- **适用**：该算子用于把配置字段以字符串形式写入 AI Dataset/HBase,\n- **不适用**：依赖 rowkey 和外部服务，会产生持久化副作用，不支持复杂类型\n- **行为**：`transform_or_write`；基数 `1:1`；执行 `external_service_sync`。\n- **硬依赖**：无硬依赖\n- **替代项**：[hbase.set.v2](hbase.set.v2.md)\n\n## 数据输入\n\n| 字段 | 类型 | 必需 | 语义 | 基数 | 可由谁提供 |\n| --- | --- | --- | --- | --- | --- |\n| rowkey | String | 是 | record.rowkey | one | rowkey |\n| <fields中每个字段名> | String | 是 | field.generic | dynamic | ai-platform.deepseek（需字段映射）, ai-platform.gemini（需字段映射）, ai-platform.qwen（需字段映射）, ai-platform.seedream.img2img（需字段映射）, ap_v25.filter（需字段映射）, cn_clip.artimuse（需字段映射） |\n\n## 配置\n\n| 配置 | 类型 | 必需 | 默认值 |\n| --- | --- | --- | --- |\n| fields | String | 是 | unknown |\n| data_type | String | 否 | unknown |\n\n源码默认配置表达式：`WriteHbaseConfig{}`\n\n## 输出\n\n无数据字段输出；该算子主要执行校验、过滤、等待或外部写入。\n\n## 风险\n\n- 依赖 rowkey 和外部服务，会产生持久化副作用，不支持复杂类型\n\n## 证据\n\n- 源码：`stages/hbase/set.go` @ `f90386e38508`\n- 源码输入：`rowkey`\n- 源码输出：`none/dynamic`\n- QPS：`unknown`；并发：`500`\n- 可信度：`high`；冲突：无"
  },
  {
    "id": "hbase.set.v2",
    "displayName": "写入hbase",
    "initial": "写",
    "domains": [
      "hbase"
    ],
    "behavior": "transform_or_write",
    "cardinality": "1:1",
    "intro": "该算子用于按字段类型把多类型数据写入 AI Dataset/HBase,",
    "weeklyRuns": "1,468",
    "wiki": "# `hbase.set.v2` — 写入hbase\n\n> 正式 ID：`hbase.set.v2` · 旧别名：`hbase_set_v2` · 领域：hbase\n\n## 决策\n\n- **适用**：该算子用于按字段类型把多类型数据写入 AI Dataset/HBase,\n- **不适用**：依赖字段类型配置和 rowkey，会产生持久化副作用，类型不匹配会失败\n- **行为**：`transform_or_write`；基数 `1:1`；执行 `external_service_sync`。\n- **硬依赖**：无硬依赖\n- **替代项**：[hbase.set](hbase.set.md)\n\n## 数据输入\n\n| 字段 | 类型 | 必需 | 语义 | 基数 | 可由谁提供 |\n| --- | --- | --- | --- | --- | --- |\n| rowkey | String | 是 | record.rowkey | one | rowkey |\n| <fields中每个字段名> | String | 是 | field.generic | dynamic | ai-platform.deepseek（需字段映射）, ai-platform.gemini（需字段映射）, ai-platform.qwen（需字段映射）, ai-platform.seedream.img2img（需字段映射）, ap_v25.filter（需字段映射）, cn_clip.artimuse（需字段映射） |\n\n## 配置\n\n| 配置 | 类型 | 必需 | 默认值 |\n| --- | --- | --- | --- |\n| fields | List | 是 | unknown |\n| fields_type | List | 是 | unknown |\n| data_type | String | 否 | unknown |\n\n源码默认配置表达式：`WriteHbaseConfigV2{}`\n\n## 输出\n\n无数据字段输出；该算子主要执行校验、过滤、等待或外部写入。\n\n## 风险\n\n- 依赖字段类型配置和 rowkey，会产生持久化副作用，类型不匹配会失败\n\n## 证据\n\n- 源码：`stages/hbase/set_v2.go` @ `f90386e38508`\n- 源码输入：`rowkey`\n- 源码输出：`none/dynamic`\n- QPS：`unknown`；并发：`500`\n- 可信度：`high`；冲突：无"
  }
];
