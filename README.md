# @cpcpo/miaoxiang-sdk

东方财富妙想 API 的 TypeScript SDK，支持金融问答、股票诊断、宏观数据查询等多种金融分析能力。

## 目录

- [安装](#安装)
- [快速开始](#快速开始)
- [API 方法](#api-方法)
- [类型定义](#类型定义)
- [错误处理](#错误处理)
- [许可](#许可)

## 安装

```bash
npm install @cpcpo/miaoxiang-sdk
```

## 快速开始

```typescript
import { MiaoxiangSDK, MiaoxiangError } from '@cpcpo/miaoxiang-sdk';

const sdk = new MiaoxiangSDK({ apiKey: process.env.EM_API_KEY || 'your_api_key' });

async function main() {
  try {
    const answer = await sdk.financialAssistant('贵州茅台当前估值如何？');
    console.log(answer);
  } catch (error) {
    if (error instanceof MiaoxiangError) {
      console.error(`错误 [${error.code}]: ${error.message}`);
    }
  }
}

main();
```

**配置 API Key**：在 `.env` 文件中设置 `EM_API_KEY=your_api_key`，或在初始化时直接传入。

## API 方法

### financialAssistant(query, options?)

金融问答，支持标准模式和深度思考模式。

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `query` | `string` | 是 | 自然语言问题 |
| `options.deepThink` | `boolean` | 否 | 启用深度思考模式 |

返回：`Promise<string>` - Markdown 格式的回答

```typescript
const answer = await sdk.financialAssistant('贵州茅台当前估值如何？');
// 返回: "贵州茅台当前估值处于历史低位区间..."
```

---

### stockDiagnosis(query)

股票综合诊断。

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `query` | `string` | 是 | 股票相关问题 |

返回：`Promise<string>` - Markdown 格式的诊断结果

```typescript
const diagnosis = await sdk.stockDiagnosis('贵州茅台股票分析');
// 返回基本面、技术面、资金面、估值等多维度分析
```

---

### financialSearch(query)

金融资讯搜索（研报、公告、新闻等）。

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `query` | `string` | 是 | 搜索关键词 |

返回：`Promise<string>` - JSON 字符串格式的搜索结果

```typescript
const news = await sdk.financialSearch('寒武纪 688256 最新研报');
// 返回 JSON 格式研报列表
```

---

### macroData(query)

宏观数据查询。

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `query` | `string` | 是 | 自然语言查询，如"中国GDP" |

返回：`Promise<MacroDataResult>` - 结构化宏观数据

```typescript
const result = await sdk.macroData('中国近三年GDP');
// 返回:
// {
//   csvPaths: [],
//   rowCounts: { quarterly: 13, yearly: 4 },
//   message: "检测到您的数据范围较大...",
//   data: [{ entityName: "中国GDP", frequency: "yearly", headers: [...], rows: [...] }]
// }
```

---

### stockScreener(query)

智能选股。

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `query` | `string` | 是 | 选股条件 |

返回：`Promise<string>` - Markdown 表格格式的选股结果

```typescript
const stocks = await sdk.stockScreener('市盈率低于15的银行股');
// 返回 Markdown 表格
```

---

### stockHotspot(query)

市场热点发现。

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `query` | `string` | 是 | 热点查询 |

返回：`Promise<string>` - 热点分析结果

```typescript
const hotspot = await sdk.stockHotspot('今日AI概念股热度');
// 返回板块涨跌、概念题材、资金流向等分析
```

---

### fundDiagnosis(query)

基金诊断。

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `query` | `string` | 是 | 基金相关问题 |

返回：`Promise<string>` - 基金诊断结果

```typescript
const result = await sdk.fundDiagnosis('招商银行基金怎么样？');
// 返回基金经理、规模、业绩表现、持仓配置等分析
```

---

### earningsReview(query, reportDate?)

业绩点评。

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `query` | `string` | 是 | 查询内容 |
| `reportDate` | `string` | 否 | 报告期，格式如 '2024-12-31' |

返回：`Promise<EarningsReviewResult>`

```typescript
const review = await sdk.earningsReview('贵州茅台2024年业绩', '2024-12-31');
// 返回: { title: "...", content: "...", shareUrl: "...", files: { pdf: "...", word: "..." } }
```

---

### industryResearch(query)

行业研究报告（生成时间较长，约20分钟）。

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `query` | `string` | 是 | 行业查询 |

返回：`Promise<string>` - 行业研究报告内容

```typescript
const report = await sdk.industryResearch('半导体行业研究报告');
// 返回行业概况、竞争格局、发展趋势、投资建议等
```

---

### industryTracker(query)

行业个股追踪（生成时间较长，约20分钟）。

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `query` | `string` | 是 | 行业追踪查询 |

返回：`Promise<string>` - 行业追踪报告内容

```typescript
const tracker = await sdk.industryTracker('新能源汽车行业追踪');
// 返回行业动态、个股追踪、数据统计等
```

---

### comparableAnalysis(query)

可比公司分析。

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `query` | `string` | 是 | 对比分析查询 |

返回：`Promise<string>` - 可比公司分析结果

```typescript
const analysis = await sdk.comparableAnalysis('宁德时代与比亚迪对比分析');
// 返回财务指标、市值、估值、业绩等对比
```

---

### initiationCoverage(query)

首发覆盖。

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `query` | `string` | 是 | 首发覆盖查询 |

返回：`Promise<string>` - 首发覆盖报告内容

```typescript
const report = await sdk.initiationCoverage('首发覆盖：某新股分析');
// 返回公司概况、业务分析、财务数据、估值定价等
```

---

### topicResearch(query)

主题研究（生成时间较长，约20分钟）。

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `query` | `string` | 是 | 主题研究查询 |

返回：`Promise<string>` - 主题研究报告内容

```typescript
const report = await sdk.topicResearch('AI算力主题研究');
// 返回主题概述、产业链分析、相关标的、投资风险等
```

---

## 类型定义

主要类型定义：

```typescript
// SDK 配置
interface SDKConfig {
  apiKey: string;
}

// 业绩点评返回结果 (src/methods/earningsReview.ts)
interface EarningsReviewResult {
  title: string;
  content: string;
  shareUrl?: string;
  files?: {
    pdf?: string;
    word?: string;
    dataSheet?: string;
  };
}

// 宏观数据返回结果 (src/methods/macroData.ts)
interface MacroDataResult {
  csvPaths: string[];
  descriptionPath?: string;
  rowCounts: Record<string, number>;
  message?: string;
  error?: string;
  data?: Array<{
    entityName: string;
    frequency: string;
    headers: string[];
    rows: Array<Record<string, string>>;
  }>;
}
```

---

## 错误处理

所有方法在失败时会抛出 `MiaoxiangError`：

```typescript
import { MiaoxiangSDK, MiaoxiangError } from '@cpcpo/miaoxiang-sdk';

try {
  const result = await sdk.stockDiagnosis('东方财富怎么样？');
} catch (error) {
  if (error instanceof MiaoxiangError) {
    console.log(error.code);    // 例如: 'API_ERROR'
    console.log(error.message); // 例如: '该skill暂时不支持此类场景分析'
    console.log(error.details); // 额外信息
  }
}
```

### 错误码

| 错误码 | 说明 | 常见原因 |
|--------|------|----------|
| `BAD_REQUEST` | 缺少必要参数 | apiKey 为空、参数格式错误 |
| `API_ERROR` | API 返回错误 | 服务端拒绝请求、不支持的查询类型 |
| `HTTP_ERROR` | HTTP 请求失败 | 网络问题、服务器响应错误状态码 |
| `TIMEOUT` | 请求超时 | 查询耗时过长（报告类任务建议等待20分钟） |
| `NETWORK_ERROR` | 网络错误 | DNS 解析失败、连接被拒绝 |
| `EMPTY_RESPONSE` | 响应为空 | 查询无结果返回 |

### 常见问题

**Q: 报告类任务（如 industryResearch）响应很慢？**
A: 正常现象。行业研究报告、主题研究等任务涉及大量数据处理和 AI 生成，通常需要 15-20 分钟。

**Q: 某些查询返回 "暂不支持" 错误？**
A: 部分高级分析功能有使用限制。尝试简化查询或换用其他相关关键词。

**Q: macroData 返回的数据量较少？**
A: 系统有限制，大的数据范围会返回精简后的部分数据。查看 `result.message` 获取具体说明。

---

## 许可

MIT
