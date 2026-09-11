# 开源技术选型与封装架构

## 一、技术选型决策表

基于 2026-09 最新调研，以下是各能力域的推荐方案：

| 能力域 | 推荐方案 | 类型 | 成本 | 优先级 |
|--------|---------|------|------|--------|
| **数字人视频** | HeyGen API → LatentSync 自托管 | 封装 API → 自托管 | $0.5/分钟 → GPU 租金 | P0 |
| **多语种 TTS** | CosyVoice 3 + MiniMax/Fish Audio | 自托管 + API 补充 | ¥500/月 + 按需 | P0 |
| **LLM 网关** | LiteLLM + Langfuse | 开源内嵌 | 免费 | P1 |
| **商品数据** | AliExpress Affiliate API | 封装官方 API | 免费 | P0 |
| **评测 Harness** | Promptfoo | 开源 CLI | 免费 | P1 |
| **敏感词过滤** | konsheng 词库 + houbb 引擎 | 开源组件 | 免费 | P0 |

## 二、架构分层

```
┌─────────────────────────────────────┐
│  前端层（Next.js）                   │
│  用户看到："AI 数字人营销视频平台"   │
└──────────────┬──────────────────────┘
               │
┌──────────────▼──────────────────────┐
│  编排层（FastAPI，核心价值层）       │
│  - 商品数据归一化                    │
│  - 国家分析（DeepSeek + 自研 prompt）│
│  - 内容计划生成                      │
│  - 合规闸门（授权 + 敏感词 + 标识）  │
│  - 评测管道（5 维 rubric）          │
└──────────────┬──────────────────────┘
               │
       ┌───────┴─────┬──────┬─────────┐
       │             │      │         │
  ┌────▼───┐  ┌─────▼──┐  │    ┌────▼─────┐
  │ HeyGen │  │CosyVoice│  │    │AliExpress│
  │  API   │  │ 自托管  │  │    │   API    │
  └────────┘  └────────┘  │    └──────────┘
                      ┌────▼────┐
                      │ MiniMax │
                      │(pt/ar)  │
                      └─────────┘
```

## 三、License 合规检查表

⚠️ **关键风险**：很多「开源」项目的权重是非商用的

### ✅ 可安全商用

- **LatentSync**: Apache-2.0 代码（权重 OpenRAIL++ 有使用限制但允许商用）
- **EchoMimicV2**: Apache-2.0 全干净
- **MuseTalk**: MIT
- **CosyVoice 3**: Apache-2.0 全干净
- **LiteLLM**: MIT
- **Promptfoo**: MIT
- **konsheng/Sensitive-lexicon**: MIT

### ❌ 禁止商用

- ChatTTS / F5-TTS: CC-BY-NC（权重非商用）
- Fish Speech: CC-BY-NC-SA（自托管非商用）
- XTTS-v2: CPML 非商用，Coqui 已关闭
- SadTalker: 捆绑非商用组件
- Wav2Lip: 非商用

### ⚠️ 有条件商用

- Fay / ClipForge: GPL/AGPL（传染性，需隔离）
- 硅基智能 Duix: 自定义许可（>1000 MAU 需授权）
- IndexTTS-2: 营收门槛（>¥1B 需授权）

## 四、4 个关键决策的推荐答案

### 决策 1：数字人服务商选型

**推荐：双轨策略**

**阶段 1（立即上线）：HeyGen API**
- 成本：$5 起步，~$0.5/分钟
- 优势：175 语言、中文质量好、零运维
- 触发切换：月账单 > GPU 月租

**阶段 2（成本优化）：自托管 LatentSync**
- 适用：有固定真人发言人授权
- 成本：RTX 4070 租金 ¥3-5/时
- 方案：对已授权视频做多语言重配音

### 决策 2：商品数据来源

**推荐：AliExpress Affiliate API**

理由：
- ✅ 免费、合法、有 purchase_url
- ✅ 1-2 天审核，无销售历史要求
- ✅ 一次调用返回：图片 + 价格 + 追踪链接 + 本地化标题
- ✅ 最多 50 商品/次，20-30 个轻松搞定

**多语言字段生成：**
- `name_xx`: 循环调用 API 的 `target_language` 参数
- `description_xx`: 任何 API 都不提供，必须用你的内容策划 LLM 生成（这正是核心价值）

### 决策 3：数据存储选型

**推荐：SQLite 起步**

理由：
- 你已有 Repository 端口模式，迁移只换适配器
- 20-30 商品 + 评测数据，SQLite 完全够用
- 触发 Postgres 的信号：多实例并发写 or 多租户

### 决策 4：冗余目录处理

**需要你确认后才能删除**：
- `liuliangchuhaillch/`：疑似空仓库
- `liuliangchuhai copy`：需对比确认无独有改动

## 五、后续准备清单

### A. 账号与密钥（立即申请）

- [ ] **AliExpress Affiliate**
  - Portals 账号：https://portals.aliexpress.com
  - Open Platform 应用：https://open.aliexpress.com
  - 审核时间：1-2 工作日

- [ ] **HeyGen API**
  - 注册：https://app.heygen.com
  - API key：pay-as-you-go 无门槛

- [ ] **DeepSeek API**（如已有跳过）
  - 注册：https://platform.deepseek.com

- [ ] **MiniMax/Fish Audio**（补 pt/ar 语种）
  - MiniMax：https://platform.minimax.io
  - Fish Audio：https://fish.audio

- [ ] **Langfuse**（可选）
  - 自托管 or 云免费额度

### B. 算力（仅自托管数字人/TTS 需要）

- [ ] RTX 4070（16GB+）或云 GPU
  - AutoDL：https://www.autodl.com
  - 火山引擎：https://volcengine.com

**成本估算：**
- CosyVoice: ~8GB VRAM，RTX 3060 够用
- LatentSync: 8-18GB VRAM，RTX 4070 推荐

### C. 合规（上线前必须）

⚠️ **以下是 2026-09 调研结果，上线前务必法务复核**

- [ ] **授权闸门**
  - 真人肖像权授权书（单独同意）
  - 声音权授权书（单独同意）
  - 未成年人需监护人同意
  - 禁止永久授权/转授权/用于训练条款
  - 保留授权记录和销毁证明

- [ ] **内容标识**（GB 45438—2025）
  - 显式标识：视频开头「AI 生成/数字人」
  - 隐式标识：文件元数据（供应商名+内容 ID）
  - 禁止删除/篡改标识

- [ ] **算法备案**
  - 平台：beian.cac.gov.cn
  - 时限：上线后 10 工作日内
  - 材料：算法安全自评估报告/承诺书

- [ ] **敏感词库**
  - konsheng/Sensitive-lexicon（MIT）
  - 自建广告法禁用词/极限词清单
  - DFA 引擎接入

### D. 评测数据

- [ ] **Ground Truth**
  - 20-30 组 product×country 专家标注
  - 这是你独有的工作量

- [ ] **5 维 Rubric 定义**
  - 需求 / 竞争 / 文化 / 物流 / 价格
  - 每维度评分标准

### E. 工作量基准（对应你的「一人即一支团队」目标）

- [ ] 定义端到端耗时记录方式
- [ ] 定义单交付 token 成本统计
- [ ] 定义迭代次数统计口径

## 六、MVP 开发路线（4 周）

### Phase 1（第 1-2 周）：核心闭环

```
商品 URL → 视频输出（HeyGen API）
```

**任务清单：**
1. 封装 AliExpress API（1 天）
2. 接入 DeepSeek 内容策划（2 天）
3. 封装 HeyGen API（2 天）
4. 前端 demo：输入 URL → 输出视频（3 天）
5. 合规敏感词过滤（2 天）

### Phase 2（第 3 周）：评测与观测

```
评测 harness + 指标埋点
```

**任务清单：**
1. Promptfoo 配置（1 天）
2. LiteLLM 网关 + Langfuse（2 天）
3. 前端「有用/无用」按钮（1 天）

### Phase 3（第 4 周+）：降本与合规加固

```
自托管 CosyVoice + 完整合规闸门
```

**任务清单：**
1. 自托管 CosyVoice（3 天）
2. 数字人授权管理（3 天）
3. 内容标识（GB 45438，2 天）
4. 算法备案文档准备

## 七、成本对比分析

### 场景：月生成 1000 分钟视频 + 1500 分钟音频

| 方案 | 月成本 | 说明 |
|------|--------|------|
| **全 API** | $500 + $90 = **$590** | HeyGen + MiniMax |
| **混合 A** | $250 + ¥500 = **$320** | HeyGen(50%) + CosyVoice |
| **混合 B** | ¥500 + $500 = **$570** | LatentSync + HeyGen(备用) |
| **全自托管** | ¥1500 ≈ **$210** | LatentSync + CosyVoice（需专职运维） |

**推荐轨迹：**
1. 起步：全 API（快速验证）
2. 达到 500 视频/天：启用混合 A
3. 达到 2000 视频/天：评估全自托管

## 八、风险提示

### 技术风险

1. **数字人质量**：开源模型质量参差不齐，商业 API 是稳妥选择
2. **多语种 TTS**：CosyVoice 不覆盖 pt/ar，必须保留 API 兜底
3. **合规变化**：AI 监管政策快速迭代，需持续跟进

### 商业风险

1. **API 涨价**：HeyGen 等 SaaS 可能调价，需预案
2. **服务稳定性**：第三方 API 可能故障/限流
3. **License 纠纷**：开源组件 License 需定期审计

### 缓解措施

1. **多供应商**：数字人和 TTS 都保留 2+ 备选
2. **降级策略**：API 故障时自动切换到自托管
3. **成本告警**：设置月度预算告警阈值

---

## 附录：调研原始数据

完整调研结果（259k tokens，96 次检索）已存档：
- 数字人：20 个方案对比
- TTS：16 个方案对比
- LLM 网关：7 个方案对比
- 评测 harness：8 个方案对比
- 同类项目：6 个对比
- 合规工具：7 个对比
- 商品数据：9 个来源对比

**调研日期**：2026-09-11  
**有效期**：建议每季度更新一次
