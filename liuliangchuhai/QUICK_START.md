# 快速启动指南

## 前置要求

### 必需
- Node.js 18+
- Python 3.12+
- Docker & Docker Compose（可选，用于自托管服务）

### API 密钥（必须申请）
1. **DeepSeek** - 内容策划 LLM
   - 注册：https://platform.deepseek.com
   - 成本：~$1/M tokens

2. **HeyGen** - 数字人视频生成
   - 注册：https://app.heygen.com
   - 成本：$0.5/分钟视频

3. **AliExpress Affiliate** - 商品数据
   - 注册 Portals：https://portals.aliexpress.com
   - 创建 Open Platform 应用：https://open.aliexpress.com
   - 审核时间：1-2 工作日
   - 成本：免费

4. **MiniMax**（可选）- TTS pt/ar 补充
   - 注册：https://platform.minimax.io
   - 成本：$60/M 字符

## 快速启动步骤

### 1. 克隆并配置环境变量

```bash
# 复制环境变量模板
cp .env.example .env.local

# 编辑 .env.local，填入你的 API 密钥
# DEEPSEEK_API_KEY=sk-...
# HEYGEN_API_KEY=...
# ALIEXPRESS_APP_KEY=...
# ALIEXPRESS_APP_SECRET=...
```

### 2. 启动前端（Next.js）

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 访问 http://localhost:3000
```

### 3. 启动后端 API（Python FastAPI）

```bash
cd liuliangchuhai/apps/api

# 创建虚拟环境
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# 安装依赖
pip install -e .

# 启动 API 服务器
uvicorn liuliangchuhai.bootstrap.main:app --reload

# API 文档: http://localhost:8000/docs
```

### 4. 启动自托管服务（可选）

如果你有 GPU 并希望自托管 CosyVoice TTS：

```bash
# 启动 Docker 服务
docker-compose up -d

# 检查服务状态
docker-compose ps

# CosyVoice API: http://localhost:8000
# Langfuse 观测平台: http://localhost:3001
# Postgres: localhost:5432
# Redis: localhost:6379
```

## 架构说明

```
前端 (Next.js :3000)
  ↓
后端 API (FastAPI :8000)
  ├─ HeyGen API (数字人)
  ├─ CosyVoice (TTS 自托管 :8000)
  ├─ MiniMax API (TTS pt/ar)
  ├─ AliExpress API (商品数据)
  └─ DeepSeek API (内容策划)

可选服务:
  - Langfuse (:3001) - LLM 观测
  - Postgres (:5432) - 数据库
  - Redis (:6379) - 缓存
```

## 成本估算（月运营 1000 视频）

| 服务 | 方案 | 月成本 |
|------|------|--------|
| 数字人 | HeyGen API | $500 |
| TTS | CosyVoice 自托管 | ¥500 (~$70) |
| TTS pt/ar | MiniMax API | $10 |
| 内容策划 | DeepSeek API | $50 |
| 商品数据 | AliExpress API | 免费 |
| **总计** | | **$630/月** |

### 降本策略
- 达到 500 视频/天 → 自托管 LatentSync 替代 HeyGen（节省 50%）
- 纯 pt/ar 需求少 → 跳过 MiniMax，只用 CosyVoice

## 敏感词库更新

生产环境需下载完整敏感词库：

```bash
# 下载 konsheng/Sensitive-lexicon (MIT License)
cd liuliangchuhai/apps/api/data/sensitive_words
wget https://raw.githubusercontent.com/konsheng/Sensitive-lexicon/main/words.txt -O base.txt
```

## 故障排查

### 问题：CosyVoice 容器无法启动
**解决**：确保已安装 NVIDIA Container Toolkit
```bash
# Ubuntu/Debian
sudo apt-get install -y nvidia-container-toolkit
sudo systemctl restart docker
```

### 问题：HeyGen API 返回 401
**解决**：检查 `.env.local` 中 `HEYGEN_API_KEY` 是否正确

### 问题：AliExpress API 签名错误
**解决**：确认 `APP_KEY` 和 `APP_SECRET` 匹配，检查时间戳生成逻辑

## 下一步

- 阅读 [`docs/OPENSOURCE_SELECTION.md`](docs/OPENSOURCE_SELECTION.md) 了解技术选型
- 查看 [`PROJECT_WORKLOG.md`](PROJECT_WORKLOG.md) 了解项目进度
- 查看 [`AI_RULES.md`](AI_RULES.md) 了解开发规范

## 技术支持

- 开源选型文档：[docs/OPENSOURCE_SELECTION.md](docs/OPENSOURCE_SELECTION.md)
- 项目接力日志：[PROJECT_WORKLOG.md](PROJECT_WORKLOG.md)
- GitHub Issues：（项目仓库地址）
