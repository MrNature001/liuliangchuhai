# 封装层架构交付总结

**交付日期**: 2026-09-11  
**工作范围**: 后端封装层架构搭建 + 开源技术选型 + 项目接力体系

---

## ✅ 完整交付清单

### 1. 核心文档（3份）
| 文档 | 路径 | 说明 |
|------|------|------|
| 开源技术选型文档 | `docs/OPENSOURCE_SELECTION.md` | 259k tokens调研，7个能力域完整方案推荐 |
| 项目接力日志 | `PROJECT_WORKLOG.md` | 自动更新的进度追踪，接手人必读 |
| AI开发规则 | `AI_RULES.md` | 永久约束规范，所有AI必须遵守 |
| 快速启动指南 | `QUICK_START.md` | 环境配置、启动步骤、故障排查 |

### 2. 封装适配器（5个）
| 适配器 | 路径 | 功能 |
|--------|------|------|
| HeyGen数字人 | `liuliangchuhai/apps/api/src/liuliangchuhai/infrastructure/digital_human/heygen_adapter.py` | 音频→视频生成→轮询完成 |
| AliExpress商品 | `liuliangchuhai/apps/api/src/liuliangchuhai/infrastructure/product/aliexpress_adapter.py` | HMAC签名、多语言、缓存 |
| 统一TTS | `liuliangchuhai/apps/api/src/liuliangchuhai/infrastructure/tts/unified_tts_adapter.py` | CosyVoice(8语言) + MiniMax(pt/ar) |
| 敏感词过滤 | `liuliangchuhai/apps/api/src/liuliangchuhai/infrastructure/compliance/sensitive_word_filter.py` | DFA算法 |
| 合规闸门 | `liuliangchuhai/apps/api/src/liuliangchuhai/infrastructure/compliance/compliance_gate.py` | 内容审核统一入口 |

### 3. 领域模型（1个）
| 模型 | 路径 | 说明 |
|------|------|------|
| TTS模型 | `liuliangchuhai/apps/api/src/liuliangchuhai/domain/tts.py` | TTSRequest + TTSResult |

### 4. 配置文件（4个）
| 文件 | 路径 | 说明 |
|------|------|------|
| 环境变量模板 | `.env.example` | 新增所有API密钥配置 |
| Docker配置 | `docker-compose.yml` | CosyVoice + Langfuse + Postgres + Redis |
| 基础敏感词库 | `liuliangchuhai/apps/api/data/sensitive_words/base.txt` | 示例词库 |
| 广告法词库 | `liuliangchuhai/apps/api/data/sensitive_words/ad_law.txt` | 禁用词/极限词 |

---

## 🏗️ 架构设计

### 三层封装策略
```
┌─────────────────────────────────────┐
│  前端层 (Next.js)                    │
│  用户看到："AI数字人营销视频平台"    │
└──────────────┬──────────────────────┘
               │
┌──────────────▼──────────────────────┐
│  编排层 (FastAPI - 核心价值)        │
│  ├─ 商品数据归一化                   │
│  ├─ 国家分析 (DeepSeek LLM)         │
│  ├─ 内容计划生成                     │
│  ├─ 合规闸门 (授权+敏感词+标识)      │
│  └─ 评测管道 (5维rubric)            │
└──────────────┬──────────────────────┘
               │
       ┌───────┴─────┬──────┬─────────┐
  ┌────▼───┐  ┌─────▼──┐  │    ┌────▼─────┐
  │ HeyGen │  │CosyVoice│  │    │AliExpress│
  │  API   │  │ 自托管  │  │    │   API    │
  └────────┘  └────────┘  │    └──────────┘
                      ┌────▼────┐
                      │ MiniMax │
                      │(pt/ar)  │
                      └─────────┘
```

### 成本优化双轨策略
| 阶段 | 数字人方案 | 触发条件 | 月成本 |
|------|-----------|---------|--------|
| 阶段1 | HeyGen API | 立即上线 | $500 (1000视频/月) |
| 阶段2 | 自托管 LatentSync | 月账单 > GPU租金 | ¥500 (~$70) |

### License 合规保障
✅ **安全商用组件**:
- LatentSync (Apache-2.0)
- EchoMimicV2 (Apache-2.0)
- CosyVoice 3 (Apache-2.0)
- LiteLLM (MIT)
- Promptfoo (MIT)
- konsheng/Sensitive-lexicon (MIT)

❌ **已规避非商用组件**:
- ChatTTS / F5-TTS (CC-BY-NC)
- Fish Speech (CC-BY-NC-SA)
- XTTS-v2 (CPML非商用)
- SadTalker (捆绑非商用组件)

---

## 📊 技术选型总结

基于 **259,332 tokens** 的深度调研（7个能力域，96次检索），以下是最终推荐：

| 能力域 | 推荐方案 | 类型 | 月成本 (1000视频) |
|--------|---------|------|------------------|
| 数字人 | HeyGen API | 商业API | $500 |
| TTS | CosyVoice 3 | 自托管 | ¥500 ($70) |
| TTS pt/ar | MiniMax API | 商业API | $10 |
| 商品数据 | AliExpress Affiliate | 官方API | 免费 |
| LLM网关 | LiteLLM | 开源内嵌 | 免费 |
| 评测harness | Promptfoo | 开源CLI | 免费 |
| 敏感词 | konsheng词库 + DFA | 开源 | 免费 |
| **总计** | | | **$580/月** |

---

## 🎯 下一步行动（优先级排序）

### P0 - 必须完成（1-2天）
1. **申请API密钥**
   - [ ] HeyGen API key
   - [ ] AliExpress Portals + Open Platform
   - [ ] DeepSeek API key
   - [ ] MiniMax API key（可选）

2. **配置环境变量**
   - [ ] 复制 `.env.example` → `.env.local`
   - [ ] 填入所有 API 密钥

### P1 - 功能补全（3-5天）
3. **前端交互补全**
   - [ ] 遍历所有页面
   - [ ] 补全按钮点击逻辑
   - [ ] 连接前后端 API

4. **端到端测试**
   - [ ] 启动前端: `npm run dev`
   - [ ] 启动后端: `uvicorn liuliangchuhai.bootstrap.main:app --reload`
   - [ ] 测试完整流程: 商品URL → 视频输出

### P2 - 生产准备（按需）
5. **下载完整敏感词库**
   ```bash
   wget https://raw.githubusercontent.com/konsheng/Sensitive-lexicon/main/words.txt \
     -O liuliangchuhai/apps/api/data/sensitive_words/base.txt
   ```

6. **部署自托管服务**（需GPU）
   ```bash
   docker-compose up -d
   ```

7. **合规材料准备**
   - [ ] 数字人肖像权授权书
   - [ ] 声音权授权书
   - [ ] 算法备案材料（beian.cac.gov.cn）
   - [ ] 内容标识实现（GB 45438-2025）

---

## 🔑 关键决策记录

### 决策1: 数字人服务商
**推荐**: HeyGen API（初期）+ LatentSync（降本）
**理由**: 
- HeyGen 175语言、中文质量好、零运维
- 自托管需 GPU + 模型调优，成本高于 API
- 触发切换点: 月账单 > GPU租金

### 决策2: 商品数据来源
**推荐**: AliExpress Affiliate API
**理由**:
- 免费、1-2天审核、无销售历史要求
- 提供图片+价格+purchase_url+本地化标题
- 亚马逊PA-API需销售历史门槛

### 决策3: 数据存储
**推荐**: SQLite 起步
**理由**:
- 已有 Repository 端口模式，迁移只换适配器
- 20-30商品+评测数据，SQLite足够
- 触发Postgres: 多实例并发写 or 多租户

### 决策4: 冗余目录
**待确认**: `liuliangchuhaillch/` 和 `liuliangchuhai copy`
**建议**: 需要你对比确认无独有改动后删除

---

## 📖 使用指南

### 接手开发者必读
1. 阅读 `PROJECT_WORKLOG.md` - 了解完整进度
2. 阅读 `AI_RULES.md` - 了解开发规范
3. 阅读 `QUICK_START.md` - 快速启动项目
4. 阅读 `docs/OPENSOURCE_SELECTION.md` - 技术选型详情

### 核心原则
- ❌ 禁止只写静态UI空壳
- ✅ UI和功能一次性实现
- ✅ 优先选择低成本方案
- ✅ 允许中转封装第三方API

---

## 🐞 已知问题 & 风险

### 技术风险
1. **API稳定性**: 第三方API可能故障/限流
   - 缓解: 保留多供应商备选
2. **License合规**: 需定期审计开源组件
   - 缓解: 所有组件已通过初审

### 商业风险
1. **API涨价**: HeyGen等SaaS可能调价
   - 缓解: 预留自托管降级路径
2. **合规变化**: AI监管政策快速迭代
   - 缓解: 持续跟进法规更新

---

## 📞 技术支持

- 完整技术调研: [`docs/OPENSOURCE_SELECTION.md`](docs/OPENSOURCE_SELECTION.md)
- 项目进度日志: [`PROJECT_WORKLOG.md`](PROJECT_WORKLOG.md)
- 快速启动: [`QUICK_START.md`](QUICK_START.md)
- AI开发规范: [`AI_RULES.md`](AI_RULES.md)

---

**交付完成标志**: ✅ 所有封装层架构就绪，可开始前端集成和API密钥申请
