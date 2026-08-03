# 算子地图

AI 数据服务平台的能力目录前端。产品统一使用三层模型：

```text
Handler（算子）= 最小执行单元
Flow = 可登记、可复用的 Handler 组
Pipeline = 已编排的业务链路，可包含 Flow、Handler 和内联步骤
```

当前 tc-hawk 源码中的 `aigc.Flow` 作为 Pipeline 候选导入。多个旧 Flow 是否归并为一个 Pipeline 必须经过业务确认，前端不会自动猜测。

产品与迁移口径见 [迭代说明](docs/迭代说明.md)。

## 当前范围

- 浏览和搜索 Handler、Flow、Pipeline。
- 展示来源状态、成本和资源占位状态。
- 展示 Handler 小批量测试入口和输入校验；后端 API 未配置前不允许提交。
- 自动导入旧源码 Flow 为 Pipeline 候选。
- 保持静态导出，不连接生产服务、不存储凭证。

手动 CRUD、真实测试、权限和成本统计需要外部后端 API，当前界面明确保持只读。

## 本地运行

```bash
cd /Users/isaac/Documents/算子地图/Orbit-Node-LLM-WIKI-iteration
npm ci
npm run dev
```

## 检查

```bash
cd /Users/isaac/Documents/算子地图/Orbit-Node-LLM-WIKI-iteration
npm run lint
npm run typecheck
npm run build
npm run check
```

## 刷新数据

导入旧源码 Flow 为 Pipeline 候选：

```bash
cd /Users/isaac/Documents/算子地图/Orbit-Node-LLM-WIKI-iteration
python3 scripts/export_pipeline_candidates.py \
  --source-root /Users/isaac/Downloads/tc-hawk-master
```

从既有算子快照生成不含源码证据的公开 Handler 数据：

```bash
cd /Users/isaac/Documents/算子地图/Orbit-Node-LLM-WIKI-iteration
python3 scripts/build_public_handler_data.py \
  --source /absolute/path/to/operator-data.ts
```

两个脚本都先完整构建临时文件，成功后才替换当前产物；失败不会覆盖上一次结果。

## 目录

```text
src/components/catalog-workspace.tsx  三类目录、搜索、筛选、移动端主从视图
src/components/catalog-detail.tsx     Handler、Flow、Pipeline 详情和测试入口
src/lib/catalog-types.ts               三层目录数据契约
src/lib/handler-data.ts                生成的公开 Handler 数据
src/lib/flow-data.ts                   已登记 Flow 数据（当前为空）
src/lib/pipeline-data.ts               生成的 Pipeline 候选
scripts/                               可重复执行的数据构建脚本
```
