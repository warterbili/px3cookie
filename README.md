# iFood 爬虫技术文档

**版本：** v1.8  
**更新：** 2026-02-26  
**状态：** ✅ 全部完成（raw_v2 5000 条含 choices，4个 JSONL mapping 输出完毕）

---

## 📁 项目地图

```
ifood-web/
├── README.md                        ← 本文档
├── template.xlsx                    ← 输出字段模板（4个 sheet）
│
├── px_cookie_generator.py           ← PX cookie 生成器（爬虫核心依赖）
├── px_node_bridge.js                ← Node.js 浏览器环境模拟（PX 依赖）
│
├── data/
│   ├── merchants_raw_v2.jsonl       ← 主数据：5000条完整原始响应（329MB，含 choices）
│   ├── progress.json                ← 爬虫进度：含 discovered_ids（111,949个商家 ID）
│   ├── raw_v2_new.log               ← 最新一次抓取日志
│   └── output/                      ← mapping 输出（基于 template.xlsx）
│       ├── outlet_information.jsonl ← 商家基本信息（5,000 条，8MB）
│       ├── outlet_meal.jsonl        ← 商品列表（159,384 条，82MB）
│       ├── meal_option.jsonl        ← 商品选项（803,542 条，306MB）
│       └── option_relation.jsonl   ← 选项关联关系（803,542 条，212MB）
│
└── scripts/
    └── analysis/
        ├── fetch_raw_details.py     ← rawdata 抓取脚本（20 workers，含 choices 补抓）
        └── map_to_template.py       ← mapping 脚本（rawdata → 4个 JSONL）
```

### 如何复现

**重新抓取 rawdata（5000条）：**
```bash
cd ~/reversation/ifood-web
source venv/bin/activate
python3 scripts/analysis/fetch_raw_details.py
# 输出到 data/merchants_raw_v2.jsonl
```

**重新生成 mapping 输出：**
```bash
cd ~/reversation/ifood-web
source venv/bin/activate
python3 scripts/analysis/map_to_template.py
# 输出到 data/output/*.jsonl
```

**补充 ID 列表（如需替换失败商家）：**
```bash
# 在 data/ 下放置 补充_ids.json（JSON 数组），脚本会优先读取
# 完成后删除该文件
```

---

## ⚠️ 已知数据限制与经验总结（2026-02-26）

### 1. Option/Modifier 数据缺失（已解决）
- **问题**：Catalog API 返回的 item 结构中，`needChoices: true` 的商品只有标记，**没有返回选项详情**
- **原因**：选项数据（garnishes/modifier）需要单独调用另一个接口
- **解决**：逆向找到接口 `GET /v1/merchants/restaurant/{mid}/items/{item_id}`，`fetch_raw_details.py` 已自动补抓注入 `choices` 字段
- **现状**：✅ raw_v2 的 5000 条数据中，54,286 个商品含完整 choices/garnishItens 数据

### 2. 数据去重问题
- **问题**：续爬时 append 模式导致重复写入，原始文件 112,056 行含 110 条重复
- **解决**：去重后保留每个 ID 最后出现的记录（续爬数据更新），最终 111,946 条
- **经验**：爬虫写入前应先检查 ID 是否已存在，或在停止时统一去重

### 3. 失败商家（available: None）
- **问题**：约 366 个商家 ID 无法抓取详情，API 返回 403
- **原因**：这些商家在发现时已下线/关闭，`available: None`，非 IP 被封问题
- **经验**：换 IP 无效，这类商家直接跳过即可，不影响整体数据质量

### 4. 停止条件 Bug（已修复）
- **问题**：原爬虫以 `completed >= target` 为停止条件，导致提前停止，剩余 11,706 个商家未抓取
- **修复**：改为 `completed + failed >= discovered` 才停止，新增 `failed_ids` 字段追踪失败记录
- **经验**：target 参数应作为上限而非精确目标，停止条件必须覆盖所有已发现商家

### 5. 备份注意事项
- **排除目录**：`node_modules/`、`venv/`、`.checkpoint/`、`px-node-env/.chrome-data/`（Chrome 缓存，约 1.2GB 垃圾）
- **排除文件**：`data/merchants_raw.jsonl`（原始含重复备份，可删）
- **推荐命令**：
  ```bash
  rsync -a --exclude='node_modules/' --exclude='venv/' --exclude='.checkpoint/' \
    --exclude='px-node-env/.chrome-data/' \
    ~/reversation/ifood-web/ ~/Nextcloud/ifood-web/
  ```

### 6. 已下线商家的补充策略
- **问题**：前 5000 个 discovered_ids 中约 4% 已下线（`available: None`），discovered_ids 靠后的商家也大量下线
- **错误做法**：从 discovered_ids 顺序往后取候补 → 大量失败浪费时间
- **正确做法**：从 `merchants.jsonl` 主数据中筛 `available: True` 的商家作为候补 → 命中率高
- **经验**：补充候补时优先从已知可用的商家池取，而不是盲目顺序遍历未知列表

### 7. Raw Data（v2）
- **文件**：`data/merchants_raw_v2.jsonl`（**5000 条**，✅ 已完成，2026-02-26）
- **大小**：329 MB
- **结构**：`{id, graphql_raw, catalog_raw, fetched_at}`
- **catalog_raw 含 choices**：每个 `needChoices: true` 的商品已补调 `/v1/merchants/restaurant/{mid}/items/{item_id}`，`choices[]` 字段含完整选项组和 `garnishItens[]`
- **规模**：5000 个商家，54,286 个商品含完整 choices 数据
- **脚本**：`scripts/analysis/fetch_raw_details.py`（20 workers，自动 IP 轮换，断点续抓）
- **注意**：少量商家（~4%）因已下线（`available: None`）无法抓取，用 `merchants.jsonl` 中 `available:true` 的商家替补补齐至 5000 条

### 8. 数据文件说明（最终状态）
| 文件 | 大小 | 说明 |
|------|------|------|
| `data/merchants_raw_v2.jsonl` | 329 MB | **主数据**，5000 条完整 rawdata（含 choices） |
| `data/progress.json` | 8.5 MB | 爬虫进度记录，含 discovered_ids（111,949 个） |
| `data/raw_v2_new.log` | 1.2 MB | 最新抓取日志 |
| `data/output/outlet_information.jsonl` | 8 MB | 5,000 条商家基本信息 |
| `data/output/outlet_meal.jsonl` | 82 MB | 159,384 条商品数据 |
| `data/output/meal_option.jsonl` | 306 MB | 803,542 条选项数据（含 garnishItens） |
| `data/output/option_relation.jsonl` | 212 MB | 803,542 条选项关联关系 |

> ✅ 4个文件已基于含 choices 的 raw_v2 重新生成（2026-02-26）。

### 9. 商品选项接口逆向（2026-02-26）
- **问题**：Catalog API 的 `needChoices: true` 商品无选项详情，需要找专门的 choices 接口
- **逆向过程**：
  1. CDP 控制 Chrome 访问商家页面，监听网络请求
  2. 等到营业中商家（巴西凌晨大部分关门，需用 API 找 `available: true` 的商家）
  3. 点击商品触发弹窗，捕获到接口：`GET /v1/merchants/restaurant/{mid}/items/{item_id}`
- **接口**：`https://cw-marketplace.ifood.com.br/v1/merchants/restaurant/{mid}/items/{item_id}?latitude=LAT&longitude=LNG`
- **响应结构**：返回 item 完整信息，`choices[]` 数组含多个选项组，每组有 `garnishItens[]` 选项列表
- **经验**：
  - `Fechado`（关店）状态下点击商品不会触发 API，需要找营业中的商家
  - JS `.click()` 对 React 合成事件无效，需用 CDP `Input.dispatchMouseEvent` 原生鼠标事件
  - 巴西时间凌晨（中国时间上午）大部分餐厅关门，可用 Feed API（`/v2/bm/home`）找当前营业商家

---

## ⚡ 快速说明：运行模式总览

| 模式 | 方式 | PX Cookie | Node.js | 速度 | 成本 | 可用 |
|------|------|-----------|---------|------|------|------|
| **住宅 IP + PX**（当前） | Bright Data 住宅代理 + Node.js | ✅ 自动生成 | ✅ 需要 | 中 | 按流量 | ✅ |
| **Web Unlocker** | Bright Data Web Unlocker | ❌ 不需要 | ❌ 不需要 | 快 | 按请求次数（贵） | ✅ |
| **Native PX**（备用） | 本机直连，无代理 | ✅ 自动生成 | ✅ 需要 | 较慢 | 免费 | ✅ |
| ~~DC/CDN IP + PX~~ | ~~数据中心代理 + Node.js~~ | ~~自动生成~~ | ~~需要~~ | - | - | ❌ 不可用 |

> **当前使用：住宅 IP + Node.js PX 模式**，10 workers，稳定无 403。

---

## 目录

1. [网站分析](#1-网站分析)
2. [接口文档](#2-接口文档)
3. [反爬机制破解流程](#3-反爬机制破解流程)
4. [工程环境配置](#4-工程环境配置)
5. [Node.js 源码说明](#5-nodejs-源码说明)（仅 Native PX 模式需要）
6. [Python 源码说明](#6-python-源码说明)
7. [运行配置与操作手册](#7-运行配置与操作手册)

---

## 1. 网站分析

### 1.1 基本信息

| 项目 | 内容 |
|------|------|
| 网站 | https://www.ifood.com.br |
| 类型 | 巴西最大外卖平台 |
| 前端框架 | Next.js（SSR + CSR 混合） |
| 主要语言 | 葡萄牙语（pt-BR） |
| 数据格式 | REST JSON API |

### 1.2 技术架构

```
用户浏览器
    │
    ├─ www.ifood.com.br          → Next.js SSR 页面
    ├─ cw-marketplace.ifood.com.br → 商户/搜索/首页Feed API（主要目标）
    ├─ logistics-api.ifood.com.br  → 地址/坐标 API
    ├─ consumer-api.ifood.com.br   → 用户/IP API
    │
    └─ collector-PXO1GDTa7Q.px-cloud.net → PerimeterX 反爬收集器
```

### 1.3 认证机制

- **无 OAuth / Bearer Token**：公开浏览接口只需 Cookie
- **核心 Cookie：** `_px3`（PerimeterX 生成，有效期约 10-30 分钟）
- **辅助 Cookie：** `_pxvid`（设备标识），`pxcts`（时间戳）
- **固定请求头：**
  - `x-client-application-key: 41a266ee-51b7-4c37-9e9d-5cd331f280d5`
  - `platform: Desktop`
  - `app_version: 9.139.0`
  - `Country: BR`

### 1.4 页面数据结构

商户页面 URL 格式：
```
/delivery/{city-slug}-{state}/{restaurant-slug}/{merchant-uuid}
```
示例：`/delivery/sao-paulo-sp/burguer-house-bela-vista/1644fa5b-9a22-4397-b8fb-04ee8f8a4a24`

---

## 2. 接口文档

### 2.1 Base URLs

| 域名 | 用途 |
|------|------|
| `https://cw-marketplace.ifood.com.br` | 商户列表、搜索、首页 Feed（主要） |
| `https://logistics-api.ifood.com.br` | 地址/坐标服务 |
| `https://consumer-api.ifood.com.br` | 用户/IP 检测 |

### 2.2 首页 Feed（商户发现）

```
POST https://cw-marketplace.ifood.com.br/v2/cardstack/search/home
```

**Query 参数：**

| 参数 | 类型 | 示例 | 说明 |
|------|------|------|------|
| `latitude` | float | `-23.5505` | 纬度（WGS84） |
| `longitude` | float | `-46.6333` | 经度（WGS84） |
| `channel` | string | `IFOOD` | 固定值 |
| `alias` | string | `HOME_MULTICATEGORY_V10` | 页面别名 |
| `size` | int | `20` | 每页数量 |

**Request Body：**
```json
{
  "supported-headers": ["OPERATION_HEADER"],
  "supported-cards": ["MERCHANT_LIST", "MERCHANT_LIST_V2", "NEXT_CONTENT"],
  "supported-actions": ["merchant", "page", "card-content"],
  "feed-feature-name": "",
  "faster-overrides": ""
}
```

**Response 结构（简化）：**
```json
{
  "sections": [
    {
      "id": "...",
      "cards": [
        {
          "data": {
            "id": "uuid",
            "name": "餐厅名称",
            "slug": "restaurant-slug",
            "mainCategory": {"name": "Lanches"},
            "userRating": 4.5,
            "deliveryFee": {"value": 0},
            "deliveryTime": {"min": 30, "max": 45}
          }
        }
      ]
    }
  ]
}
```

### 2.3 商户详情（GraphQL）

```
POST https://cw-marketplace.ifood.com.br/v1/merchant-info/graphql
```

**Request Body：**
```json
{
  "query": "query ($merchantId: String!) { merchant(merchantId: $merchantId, required: true) { available name deliveryFee { value } ... } merchantExtra(merchantId: $merchantId) { address { city state streetName } description documents { CNPJ { value } } shifts { dayOfWeek start duration } } }",
  "variables": { "merchantId": "uuid-here" }
}
```

**Response 包含字段：**

| 字段 | 说明 |
|------|------|
| `merchant.name` | 商户名 |
| `merchant.available` | 是否营业 |
| `merchant.deliveryFee.value` | 配送费 |
| `merchant.deliveryTime` | 配送时间范围 |
| `merchant.userRating` | 评分 |
| `merchant.minimumOrderValue` | 最低起送价 |
| `merchantExtra.address` | 详细地址（城市/街道/邮编/经纬度） |
| `merchantExtra.description` | 商户描述 |
| `merchantExtra.documents.CNPJ.value` | 巴西营业执照号 |
| `merchantExtra.shifts` | 营业时间（按星期） |

### 2.4 商户菜单（Catalog）

```
GET https://cw-marketplace.ifood.com.br/v1/merchants/restaurant/{merchant_id}/catalog
```

**Query 参数：**

| 参数 | 类型 | 说明 |
|------|------|------|
| `latitude` | float | 用户纬度 |
| `longitude` | float | 用户经度 |
| `channel` | string | `IFOOD` |

**Response 结构：**
```json
{
  "data": [
    {
      "code": "分类ID",
      "friendlyName": "分类名称",
      "itens": [
        {
          "id": "item-uuid",
          "description": "商品名",
          "details": "描述",
          "unitPrice": 1990,
          "originalUnitPrice": 2500,
          "logoUrl": "https://...",
          "availability": "AVAILABLE"
        }
      ]
    }
  ]
}
```

> 价格单位为**巴西分**（centavos），除以 100 得到 BRL。

### 2.5 地址/坐标

```
GET https://logistics-api.ifood.com.br/location/v1/addresses:geocode?query={address}
GET https://logistics-api.ifood.com.br/location/v1/states?country=BR
GET https://consumer-api.ifood.com.br/ip
```

### 2.6 通用请求头

所有 API 请求需携带：
```http
Accept: application/json, text/plain, */*
Content-Type: application/json
accept-language: pt-BR,pt;q=0.9
x-client-application-key: 41a266ee-51b7-4c37-9e9d-5cd331f280d5
referer: https://www.ifood.com.br/
origin: https://www.ifood.com.br
platform: Desktop
app_version: 9.139.0
Country: BR
browser: Mac OS
Cookie: _px3=<generated>; _pxvid=<generated>
```

---

## 3. 反爬机制破解流程

### 3.1 PerimeterX 机制概述

iFood 使用 **PerimeterX (PX)** 作为反爬系统，App ID：`PXO1GDTa7Q`。

PX 工作流程：
```
1. 页面加载时注入 PX SDK (main_pretty.js，~8900 行混淆 JS)
2. SDK 收集浏览器指纹（Canvas、WebGL、Audio、Navigator、事件）
3. 向 PX Collector 发送 2 次 HTTP 请求（加密 payload）
4. PX 服务端验证后，通过响应的 "do" 指令，在 Cookie 里写入 _px3
5. 后续 API 请求携带 _px3，PX 服务端在边缘节点验证
```

### 3.2 _px3 Cookie 结构

```
格式：<HASH1>:<HASH2>:1000:<PAYLOAD>

HASH1:   64 HEX  = SHA-256（来源：payload + 时间戳 + SDK 内部密钥）
HASH2:  128 HEX  = SHA-512（HMAC，密钥为 session_secret）
PART3:  "1000"   = 版本号常量
PAYLOAD: Base64  = 浏览器指纹数据（包含 request_count、事件序列等）
```

> ⚠️ 无法直接伪造 _px3，因为 HASH1/HASH2 依赖 SDK 内部密钥，必须让 PX SDK 本身来生成。

### 3.3 绕过方案：Node.js 补环境

**核心思路：** 在 Node.js 中模拟浏览器环境（jsdom），加载真实 PX SDK 并让其运行，拦截其发出的 collector 请求，用 `curl_cffi`（Chrome TLS 指纹）代理发送，最终从 Cookie 中提取 _px3。

```
Node.js (jsdom 模拟浏览器)
  │  加载 PX SDK → 收集指纹 → 生成 collector payload
  │
  ↓ stdout JSON 输出 collector 请求
Python (curl_cffi chrome131 TLS)
  │  代理发送 collector 请求到 PX 服务器
  │
  ↓ stdin 响应回传
Node.js
  │  PX SDK 处理响应 → bake Cookie 指令 → 生成 _px3
  │
  ↓ stdout JSON 输出 _px3
Python
     提取 _px3，用于后续 API 请求
```

**关键点：TLS 指纹一致性**  
Python 用 `curl_cffi` 的 `chrome131` 模式同时发送：
- PX Collector 请求（代理 Node.js 的请求）
- iFood API 请求（实际数据抓取）

TLS 指纹一致，避免 PX 检测到 TLS 与请求头不匹配。

### 3.4 浏览器指纹模拟清单

| 指纹类型 | 实现状态 | 文件 |
|---------|---------|------|
| Navigator（UA/plugins/language） | ✅ | `env/navigator.js` |
| Canvas 2D | ✅ | `env/canvas.js` |
| WebGL（29 个扩展） | ✅ | `env/browser_apis.js` |
| AudioContext（hash: 124.04） | ✅ | `env/audio.js` |
| 字体枚举（12 个常见字体） | ✅ | `env/fonts.js` |
| 反自动化检测（移除 20+ webdriver 标记） | ✅ | `env/stealth.js` |
| TLS 指纹（curl_cffi chrome131） | ✅ | `px_cookie_generator.py` |
| 鼠标/滚动事件序列 | ❌ 待实现 | `env/events.js` |

### 3.5 当前状态

- ✅ PX SDK 正常运行，成功生成 `_px3` cookie
- ✅ `_px3` 可通过 iFood API 验证（实际爬虫正常运行中）
- ⚠️ 不定期触发 429（PX 限流），自动退避 + 刷新 cookie 可恢复
- ❌ 缺少事件序列，payload 与真实浏览器相似度 < 95%（待优化）

### 3.6 代理方案实测经验（2026-02-25）

#### 方案一：DC/CDN 代理 + Node.js PX Cookie ❌ 不可行

```
本机 Node.js 生成 _px3 → 用 DC IP（DigitalOcean/CDN）发 API 请求 → 403
```

**失败原因：**
- PX 会识别 ASN 类型，DC/CDN 的 ASN 直接被标记为高风险机器流量
- 无论 `_px3` 生成得多完美，请求来自 DC IP 一律拒绝
- 即使 cookie 和请求用同一个 DC IP session，依然 403

#### 方案二：住宅 IP + Node.js PX Cookie ✅ 可行（当前方案）

```
用住宅 IP session 生成 _px3（collector 请求走住宅 IP）
→ 同一个住宅 IP session 发 API 请求
→ 200 成功
```

**关键点：cookie 生成和 API 请求必须用同一个住宅 IP session。**

PX 会校验：
1. Cookie 生成时的 IP 环境
2. 当前 API 请求的 IP 环境
3. 两者必须一致，否则 403

代码实现：每个 worker 独立持有一个 `session_id`，`PXCookieGenerator` 初始化时传入带 `session_id` 的代理 URL，cookie 生成和后续 API 请求复用同一个 `curl_cffi.Session`（同一个住宅 IP）。

```python
# 每个 worker 独立的住宅 IP session
proxy = f"http://user-session-{random_id}:pass@brd.superproxy.io:33335"
gen = PXCookieGenerator(proxy=proxy)
px3 = gen.generate()          # collector 请求走这个住宅 IP
session = gen.session          # 复用同一个 session（同一个 IP）
session.get(ifood_api, cookies={"_px3": px3})  # API 请求同 IP → 200 ✅
```

**并发上限：** 10 workers（每个 worker 独立 session），超过后 Node.js 子进程并发过多互相干扰。

#### 方案三：Web Unlocker ✅ 可行（最简单，较贵）

```
直接发请求 → Bright Data Web Unlocker（内部处理 PX）→ 200
```

完全不需要 Node.js 和 PX cookie，一行代理配置搞定。
费用按请求次数计费，111,510 条商户 × 2 请求 ≈ 22 万次，费用较高。

#### 方案选择建议

| 场景 | 推荐方案 |
|------|---------|
| 有 Bright Data 住宅代理，想省钱 | 住宅 IP + PX（当前方案） |
| 有预算，追求稳定简单 | Web Unlocker |
| 没有代理账号 | Native PX（本机直连，免费但偶发限流） |
| 只有 DC/CDN 代理 | ❌ 无法使用，换其他方案 |

---

## 4. 工程环境配置

### 4.1 系统要求

| 依赖 | 版本 | 用途 |
|------|------|------|
| macOS / Linux | - | 宿主系统 |
| Python | ≥ 3.10 | 主爬虫 |
| Node.js | ≥ 18.x | PX 补环境 |
| npm | ≥ 9.x | Node 依赖管理 |

### 4.2 Python 环境

```bash
cd ~/reversation/ifood-web

# 创建虚拟环境
python3 -m venv venv
source venv/bin/activate

# 安装依赖
pip install curl_cffi
```

**核心依赖：**

| 包名 | 版本 | 用途 |
|------|------|------|
| `curl_cffi` | latest | Chrome TLS 指纹 HTTP 客户端 |
| `json` | stdlib | 数据处理 |
| `subprocess` | stdlib | 调用 Node.js |
| `threading` | stdlib | 多线程 worker |
| `queue` | stdlib | 任务队列 |

### 4.3 Node.js 环境

#### 安装依赖

```bash
cd ~/reversation/ifood-web/px-node-env
npm install
```

> ⚠️ `@napi-rs/canvas` 是原生 binding，安装时会编译，需要 Xcode CLI Tools（macOS）或 build-essential（Linux）。

**package.json 依赖：**

| 包名 | 用途 |
|------|------|
| `jsdom` | 模拟浏览器 DOM 环境（核心） |
| `@napi-rs/canvas` | Canvas 2D 原生实现（指纹更真实） |
| `undici` | HTTP 客户端（jsdom 内部依赖） |
| `playwright` / `puppeteer` | 早期方案遗留，当前未使用 |

#### 独立测试 Node 环境

```bash
cd ~/reversation/ifood-web

# 方式 1：测试 PX SDK 是否能正常加载并生成 cookie（generate_px.js，独立运行）
node px-node-env/generate_px.js

# 预期输出：
# [STEP 1] Building environment...
# [STEP 2] Installing network layer...
# [STEP 3] Loading PX SDK...
# [SDK] Loaded PX SDK (XXXXXX bytes)
# [STEP 4] Executing PX SDK...
# [STEP 5] Waiting for PX SDK to initialize...
# [RESULT] Intercepted 2 requests
# [SUCCESS] Found _px3 cookie: 33c23974...
# [CHECKPOINT] Report saved to: .checkpoint/phase1-mvp.md
```

```bash
# 方式 2：测试桥接脚本（px_node_bridge.js，需要 Python 配合，单独跑会等待 stdin 输入）
# 通常不直接运行，由 px_cookie_generator.py 调用
# 如需调试，可以：
node px_node_bridge.js
# 此时它会等待 stdin 输入响应，Ctrl+C 退出
```

#### 环境模块说明

```
px-node-env/env/
├── builder.js        # 主入口，按顺序安装所有模块
├── navigator.js      # window.navigator / screen / platform
├── canvas.js         # HTMLCanvasElement Canvas 2D
├── audio.js          # AudioContext / OfflineAudioContext
├── browser_apis.js   # WebGL、MediaDevices、Notification 等
├── fonts.js          # 字体枚举检测（FontFace API）
├── stealth.js        # 移除 webdriver 标记，修复 toString
├── events.js         # 鼠标/滚动事件模拟（待完善）
├── network.js        # XMLHttpRequest / fetch 拦截
├── px_intercept.js   # PX SDK 专属补丁（window 缺失属性）
└── tls_fingerprint.js # TLS 配置（供参考，实际由 curl_cffi 实现）
```

#### 调试单个模块

```bash
cd ~/reversation/ifood-web/px-node-env

# 快速测试 builder 环境是否搭建成功
node -e "
const { buildEnvironment } = require('./env/builder');
const { window } = buildEnvironment();
console.log('UA:', window.navigator.userAgent);
console.log('Canvas:', typeof window.HTMLCanvasElement);
console.log('WebGL:', typeof window.WebGLRenderingContext);
console.log('Audio:', typeof window.AudioContext);
"

# 预期输出：
# UA: Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) ...
# Canvas: function
# WebGL: function
# Audio: function
```

### 4.4 目录结构

```
~/reversation/ifood-web/
│
├── ifood_full_scraper.py       # 主爬虫入口 ★
├── px_cookie_generator.py      # PX Cookie 生成器
├── px_node_bridge.js           # Node.js ↔ Python 桥接脚本
├── benchmark_workers.py        # 并发性能测试工具
├── README.md                   # 本文档
│
├── data/                       # 采集结果
│   ├── merchants.jsonl         # 已抓取商户数据（112056 条，JSONL）
│   ├── progress.json           # 爬虫进度存档
│   └── scrape.log              # 运行日志
│
├── px-node-env/                # Node.js 补环境
│   ├── package.json
│   ├── generate_px.js          # 独立测试入口
│   └── env/
│       ├── builder.js          # 环境构建主入口
│       ├── navigator.js        # Navigator/UA 模拟
│       ├── network.js          # 网络拦截
│       ├── canvas.js           # Canvas 指纹
│       ├── audio.js            # AudioContext 指纹
│       ├── browser_apis.js     # WebGL/其他 API
│       ├── stealth.js          # 反检测
│       ├── fonts.js            # 字体枚举
│       ├── events.js           # 事件系统（待完善）
│       └── tls_fingerprint.js  # TLS 配置
│
├── perimeterx/
│   ├── main_pretty.js          # PX SDK 原始文件（8900 行）
│   ├── opus_analysis.md        # PX 深度逆向分析报告
│   ├── payload_samples.jsonl   # 15 条真实 payload 样本
│   └── TECHNICAL_REFERENCE.md # 技术参考
│
├── scripts/
│   ├── analysis/               # 分析脚本（逆向/解码/流量分析）
│   └── capture/                # 抓包脚本（CDP/Playwright）
│
├── docs/                       # 技术文档、分析报告
├── archive/                    # 历史版本、弃用脚本
├── crawler/                    # 早期 Playwright 爬虫（已弃用）
├── node_modules/               # Node.js 依赖（勿移动）
└── venv/                       # Python 虚拟环境（勿移动）
```

---

## 5. Node.js 源码说明

### 5.1 `px_node_bridge.js`（桥接脚本）

**入口，由 Python subprocess 调用。**

**流程：**
1. 调用 `buildEnvironment()` 构建 jsdom 浏览器环境
2. 安装 `ProxyXHR` / `fetch` 替代原生网络（不实际发请求，输出到 stdout）
3. 加载 `perimeterx/main_pretty.js` 执行 PX SDK
4. 等待 15 秒（PX SDK 收集指纹并触发请求）
5. 从 stdin 读取 Python 回传的响应，注入回 PX SDK
6. 提取 Cookie，以 JSON 格式输出 `_px3` 到 stdout

**I/O 协议：**
```
stdout → {"type": "request", "id": 1, "method": "POST", "url": "...", "headers": {}, "body": "..."}
stdin  ← {"id": 1, "status": 200, "body": "...", "cookies": [...]}
stdout → {"type": "result", "px3": "abc...", "pxvid": "..."}
```

### 5.2 `env/builder.js`

构建完整的 jsdom 浏览器环境。

**关键配置：**
```javascript
const dom = new JSDOM('<!DOCTYPE html><html></html>', {
  url: 'https://www.ifood.com.br',
  pretendToBeVisual: true,
  runScripts: 'dangerously',
  resources: 'usable',
});
```

安装顺序：navigator → canvas → audio → webgl → fonts → stealth

### 5.3 `env/navigator.js`

模拟 `window.navigator`，关键属性：
```javascript
userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) ...'
language: 'pt-BR'
platform: 'MacIntel'
hardwareConcurrency: 8
deviceMemory: 8
plugins: [Chrome PDF Plugin, Chrome PDF Viewer, ...]
```

### 5.4 `env/stealth.js`

移除 jsdom 自动化痕迹：
- 删除 `window.webdriver`
- 修复所有 `[native code]` toString
- 模拟 `chrome.runtime`
- 伪造 `permissions.query`

---

## 6. Python 源码说明

### 6.1 `px_cookie_generator.py`

**类：`PXCookieGenerator`**

```python
gen = PXCookieGenerator(verbose=True)
px3 = gen.generate()   # 返回 _px3 字符串，约需 15-20 秒
```

**`generate()` 流程：**
1. 用 `curl_cffi chrome131` 先访问 ifood 首页（建立 session）
2. `subprocess.Popen` 启动 `px_node_bridge.js`
3. 循环读 stdout：
   - 收到 `type=request` → 调用 `_proxy_request()` 用 curl_cffi 发送
   - 收到 `type=result` → 提取 `_px3`，结束
4. 返回 `_px3` 字符串

**Cookie 刷新策略（在主爬虫中）：**
```python
# 每 20 分钟或遇到 403/429 时重新生成
if time.time() - self.cookie_ts > 1200 or resp.status_code in (403, 429):
    self.refresh_px_cookie()
```

### 6.2 `ifood_full_scraper.py`

**主类：`IFoodFullScraper`**

```python
scraper = IFoodFullScraper(
    target_count=99999,
    request_delay=0.2,
    num_workers=10
)
scraper.run()
```

**`run()` 流程：**

```
主线程
├── discovery_thread（1个）
│     for 每个网格点:
│       POST /v2/cardstack/search/home
│       → 发现新商户 ID → 放入 detail_queue
│
└── detail_thread × N（10个）
      while queue 非空:
        fetch_detail()   → POST /v1/merchant-info/graphql
        fetch_catalog()  → GET /v1/merchants/.../catalog
        → 合并数据 → 追加写入 merchants.jsonl
        → 每 20 条保存一次 progress.json
```

**`fetch_merchants_at(lat, lng, max_pages=5)`：**
- 循环请求首页 Feed，每页最多 5 页
- 解析 `sections[].cards[].data.id` 提取商户 ID

**`fetch_detail(merchant_id, lat, lng)`：**
- GraphQL 查询，返回 `(merchant_dict, extra_dict)`

**`fetch_catalog(merchant_id, lat, lng)`：**
- REST GET，返回菜品分类列表

**`build_record(listing, detail, extra, catalog)`：**
- 合并所有字段，生成最终 JSON 记录

**429 处理：**
```python
if resp.status_code == 429:
    time.sleep(backoff)   # 退避 5-10 秒
    self.refresh_cookie() # 重新生成 _px3
    backoff = min(backoff * 2, 60)
```

### 6.3 `benchmark_workers.py`

性能测试工具，测量不同 worker 数 + delay 组合的吞吐量和 429 率。

```bash
python3 benchmark_workers.py
# 每种配置运行 45 秒，输出对比表格
```

**测试结论（2026-02-25）：**

| Workers | Delay | 吞吐(req/s) | 429% |
|---------|-------|------------|------|
| 10 | 0.2s | 4.44 | 0% | ⭐ 最优 |
| 12+ | ≤0.15s | 4.44 | 0% | 无提升（瓶颈在 PX cookie 串行） |

---

## 7. 运行配置与操作手册

### 7.1 启动爬虫

#### 模式一：Web Unlocker（推荐，无需 PX Cookie）

```bash
cd ~/reversation/ifood-web

nohup python3 ifood_full_scraper.py \
  --target 99999 \
  --workers 10 \
  --delay 0.1 \
  --proxy "http://brd-customer-hl_26f509b3-zone-web_unlocker1:mlmpp56sfr8f@brd.superproxy.io:33335" \
  >> data/scrape.log 2>&1 &

echo "PID: $!"
```

> ⚠️ Web Unlocker 按流量计费，111,510 条商户 × 2 次请求（detail + catalog）= 约 22 万次请求，注意控制账户余额。

#### 模式二：住宅 IP + Node.js PX（当前使用，性价比高）

```bash
cd ~/reversation/ifood-web

nohup python3 ifood_full_scraper.py \
  --target 99999 \
  --workers 10 \
  --delay 0.2 \
  --proxy "http://brd-customer-hl_26f509b3-zone-residential-country-us-session-{SESSION}:b179936rlgcl@brd.superproxy.io:33335" \
  >> data/scrape.log 2>&1 &

echo "PID: $!"
```

> `{SESSION}` 是占位符，代码会自动替换为随机字符串，确保每个 worker 持有独立住宅 IP session。

#### 模式三：Native PX（无代理备用，免费）

```bash
cd ~/reversation/ifood-web

nohup python3 ifood_full_scraper.py \
  --target 99999 \
  --workers 10 \
  --delay 0.2 \
  >> data/scrape.log 2>&1 &

echo "PID: $!"
```

> 需要 Node.js 环境 + `px-node-env/node_modules/`，速度约 2.2 条/秒，偶发 429 自动恢复。本机 IP 长时间请求可能被 PX 标记，建议优先使用住宅 IP 方案。

**参数说明：**

| 参数 | 默认 | 说明 |
|------|------|------|
| `--target` | 5000 | 目标抓取数量 |
| `--workers` | 8 | 详情抓取并发线程数 |
| `--delay` | 0.3 | 请求间隔（秒） |
| `--proxy` | 无 | 代理地址，含 `web_unlocker` 关键字时自动启用 Web Unlocker 模式 |
| `--test` | false | 测试模式，只抓 20 条 |

**模式自动判断逻辑：**
```python
# proxy 参数包含 "web_unlocker" → Web Unlocker 模式（跳过所有 PX 逻辑）
# proxy 为空 → Native PX 模式（Node.js 生成 _px3 cookie）
```

### 7.2 查看进度

```bash
# 当前进度
cd ~/reversation/ifood-web/data
python3 -c "
import json
d = json.load(open('progress.json'))
print(f'completed: {len(d[\"completed_ids\"])} / {len(d[\"discovered_ids\"])}')
print(f'progress: {len(d[\"completed_ids\"]) / len(d[\"discovered_ids\"]) * 100:.1f}%')
"

# 文件行数
wc -l merchants.jsonl

# 实时日志
tail -f scrape.log

# 确认进程存活
ps aux | grep ifood_full_scraper | grep -v grep
```

### 7.3 停止/重启

```bash
# 停止（进度自动保存，可断点续爬）
kill $(ps aux | grep ifood_full_scraper | grep -v grep | awk '{print $2}')

# 重启（自动从上次进度继续）
nohup python3 ifood_full_scraper.py --target 99999 --workers 10 --delay 0.2 >> data/scrape.log 2>&1 &
```

### 7.4 数据查看

```bash
# 查看前 3 条记录
head -3 merchants.jsonl | python3 -m json.tool

# 按城市统计
python3 -c "
import json
from collections import Counter
cities = []
with open('merchants.jsonl') as f:
    for line in f:
        r = json.loads(line)
        city = r.get('address', {}).get('city', 'unknown')
        cities.append(city)
for city, count in Counter(cities).most_common(10):
    print(f'{city}: {count}')
"

# DuckDB 直接 SQL 查询（推荐大文件）
python3 -c "
import duckdb
duckdb.sql(\"SELECT address->>'city' as city, COUNT(*) as n FROM read_ndjson('merchants.jsonl') GROUP BY 1 ORDER BY 2 DESC LIMIT 10\").show()
"
```

### 7.5 数据字段说明

每条 JSONL 记录包含：

```json
{
  "id": "uuid",
  "name": "餐厅名",
  "slug": "url-slug",
  "category": "分类名",
  "rating": 4.5,
  "ratingCount": 1200,
  "priceRange": 2,
  "available": true,
  "deliveryFee": 0,
  "deliveryTimeMin": 25,
  "deliveryTimeMax": 40,
  "distance": 1.2,
  "minimumOrderValue": 15.0,
  "address": {
    "street": "Rua ...",
    "number": "123",
    "district": "Bairro",
    "city": "São Paulo",
    "state": "SP",
    "zipCode": "01310-100",
    "country": "BR",
    "lat": -23.5505,
    "lng": -46.6333
  },
  "cnpj": "12.345.678/0001-90",
  "shifts": [...],
  "menu": [
    {
      "category": "分类名",
      "items": [
        {
          "id": "item-uuid",
          "name": "商品名",
          "price": 19.9,
          "originalPrice": 25.0,
          "available": true
        }
      ]
    }
  ]
}
```

### 7.6 每小时自动报告

Cron job 已配置，每小时整点自动发送进度报告到 Telegram 群。

手动触发报告：
```bash
# 查看 cron job 状态（在 OpenClaw 中执行）
# cron action=list
# cron action=run jobId=4c7b546e-3ca0-4d66-97a9-f98487378e81
```

### 7.7 常见问题

**Q: Web Unlocker 模式下还需要 Node.js 和 PX 环境吗？**  
A: 完全不需要。Web Unlocker 模式下 Node.js 补环境、px_cookie_generator.py、px_node_bridge.js 全部不会执行，只需要 Python + `requests` 库即可。

**Q: Web Unlocker 和 Native PX 怎么切换？**  
A: 加 `--proxy` 参数且 proxy URL 包含 `web_unlocker` → Web Unlocker 模式；不加 `--proxy` → Native PX 模式。两套代码并存，随时切换。

**Q: Web Unlocker 并发设多少合适？**  
A: 10 workers 稳定，超过 20 会出现代理连接断开（`ProxyError: Remote end closed connection`）。

**Q: 大量 429 怎么办？（Native PX 模式）**  
A: 爬虫会自动退避 + 刷新 cookie。如果持续超过 5 分钟，手动重启。建议切换 Web Unlocker 模式彻底解决。

**Q: 进程意外退出怎么办？**  
A: 直接重启，`progress.json` 每 20 条保存一次，断点续爬自动恢复。

**Q: Native PX 模式并发上限是多少？**  
A: 10 workers，超过无提升。瓶颈是 PX cookie 串行刷新，不是网络带宽。

**Q: _px3 cookie 失效了怎么判断？（Native PX 模式）**  
A: 连续 403 + 日志出现 `Access denied`，爬虫会自动重新生成。

---

*文档由 Claude 自动生成并维护，最后同步时间：2026-02-25*
