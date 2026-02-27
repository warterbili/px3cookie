# Node Bridge — iFood PX Cookie 生成器

通过 Node.js (JSDOM) 模拟浏览器环境运行 PerimeterX SDK，配合 Python (curl_cffi) 代理网络请求，生成有效的 `_px3` cookie 用于 iFood API 调用。

---

## 目录结构

```
node_bridge/
├── main3.js               ← PX SDK（10,684 行，430KB，勿修改）
├── package.json            ← Node 依赖（jsdom）
├── px_node_bridge.js       ← Node.js 桥接脚本（stdin/stdout IPC）
├── px_cookie_generator.py  ← Python 协调器（curl_cffi chrome131 TLS）
├── env/
│   └── builder.js          ← JSDOM 浏览器环境构建（Navigator/Canvas/WebGL/Audio 等 mock）
├── node_modules/           ← npm install 生成
└── README.md               ← 本文档
```

---

## 环境要求

| 依赖 | 最低版本 | 用途 |
|------|---------|------|
| Node.js | ≥ 18 | 运行 JSDOM + PX SDK |
| Python | ≥ 3.10 | 协调器 + TLS 代理 |
| curl_cffi | ≥ 0.7 | Chrome TLS 指纹 HTTP 客户端 |

操作系统：Windows / macOS / Linux 均可。

---

## 安装

### 1. Node 依赖

```bash
cd node_bridge
npm install
```

只装一个包：`jsdom`。

### 2. Python 依赖

```bash
pip install curl_cffi
```

---

## 运行

### 一键生成 cookie

```bash
cd node_bridge
python px_cookie_generator.py
```

预期输出：
```
[PX] Starting PX cookie generation via Node bridge...
[PX] Visiting ifood homepage...
  [NODE] [BRIDGE] Starting PX Node Bridge...
  [NODE] [ENV] Environment built successfully
  [NODE] [BRIDGE] PX SDK loaded, waiting for requests...
[PX] Proxying request 1: GET https://tzm.px-cloud.net/ns?c=...
[PX] Response 1: 200 (176 bytes)
[PX] Proxying request 2: POST https://collector-PXO1GDTa7Q.px-cloud.net/api/v2/collector
[PX] Response 2: 200 (1464 bytes)
[PX] Proxying request 3: POST https://collector-PXO1GDTa7Q.px-cloud.net/api/v2/collector
[PX] Response 3: 200 (32 bytes)
[PX] Got result: px3=yes
[PX] Success! _px3 length: 651
[PX] Verifying _px3 against ifood API...
[PX] Cardstack home: 200
[PX] Search autocomplete: 200
[PX] Success! Got 2 sections

============================================================
Generated _px3: bb6a5fa1d2d34890...
_pxvid: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
============================================================

Cookie verified - API returned 200!
```

整个过程约 20 秒（含 PX SDK 15s 等待时间）。

### 使用代理

```bash
# 住宅 IP 代理（推荐，成功率最高）
python -c "
from px_cookie_generator import PXCookieGenerator
gen = PXCookieGenerator(proxy='http://user:pass@host:port')
px3 = gen.generate()
print(px3)
"
```

> DC/CDN 代理不可用，PX 会检测 ASN 类型直接拒绝。必须用住宅 IP。

---

## 在代码中调用

```python
from px_cookie_generator import PXCookieGenerator

# 初始化（proxy 可选）
gen = PXCookieGenerator(verbose=True, proxy=None)

# 生成 cookie
px3 = gen.generate()

if px3:
    # 获取所有 cookie
    cookies = gen.get_cookies_dict()
    # → {'_px3': '...', '_pxvid': '...'}

    # 验证 cookie 是否有效
    ok = gen.verify()
    # → True (cardstack API 返回 200)

    # 复用 session 发请求（TLS 指纹一致）
    resp = gen.session.get(
        "https://cw-marketplace.ifood.com.br/v1/merchants/restaurant/{mid}/catalog",
        cookies=cookies,
        headers={"accept": "application/json"},
    )
```

---

## 工作原理

```
Python (px_cookie_generator.py)
  │
  ├─ 1. curl_cffi chrome131 访问 ifood 首页（建立 session）
  │
  ├─ 2. subprocess 启动 Node 子进程
  │     │
  │     └─ Node (px_node_bridge.js)
  │          ├─ JSDOM 构建浏览器环境 (env/builder.js)
  │          ├─ 安装 ProxyXHR / fetch 拦截器
  │          ├─ 加载 main3.js (PX SDK)
  │          └─ PX SDK 运行 → 收集指纹 → 发出 collector 请求
  │
  ├─ 3. Node stdout → JSON 请求 → Python 用 curl_cffi 代理发送到 PX 服务器
  │
  ├─ 4. PX 响应 → Python stdin → Node → PX SDK 处理 → bake cookie
  │
  └─ 5. Node 输出 _px3 cookie → Python 提取，完成
```

**关键：TLS 指纹一致性**

Python 的 `curl_cffi chrome131` 同时负责：
- 代理 PX collector 请求（替 Node 发）
- 后续 iFood API 请求（实际用数据的）

两者 TLS 指纹一致，PX 不会检测到不匹配。

---

## 调试

### 单独测试环境构建

```bash
node -e "
const { buildEnvironment } = require('./env/builder');
const { window } = buildEnvironment();
console.log('navigator.hardwareConcurrency:', window.navigator.hardwareConcurrency);
console.log('navigator.webdriver:', window.navigator.webdriver);
console.log('OfflineAudioContext:', typeof window.OfflineAudioContext);
console.log('WebGL support:', typeof window.document.createElement('canvas').getContext('webgl'));
"
```

### 单独测试 PX SDK 加载

```bash
# 会等待 stdin 输入，Ctrl+C 退出
node px_node_bridge.js
```

看到 `[BRIDGE] Request 1: GET https://tzm.px-cloud.net/ns?c=...` 说明 SDK 加载成功。

### 查看详细日志

所有 `[NODE]` 前缀的日志来自 Node 子进程的 stderr，`[PX]` 前缀来自 Python。
`px_cookie_generator.py` 默认 `verbose=True`，设为 `False` 可关闭日志。

---

## 浏览器环境 Mock 清单

`env/builder.js` 模拟的 API：

| 类别 | Mock 内容 | PX SDK 用途 |
|------|----------|-------------|
| Navigator | UA, platform, plugins×3, mimeTypes, webdriver=false, hardwareConcurrency=8, deviceMemory=8, connection, permissions | 浏览器指纹基础信息 |
| UserAgentData | brands (Chrome 131), getHighEntropyValues | 高熵 UA 数据采集 (line 1441) |
| Screen | 1920×1080, colorDepth=24, devicePixelRatio=2 | 屏幕指纹 |
| Performance | timing 全部时间点, navigation, now(), memory | 页面加载性能指纹 |
| Canvas 2D | fillRect/fillText/toDataURL（固定 base64） | Canvas 指纹 |
| WebGL | getParameter(RENDERER/VENDOR), 29 extensions, debug_renderer_info | WebGL 指纹 (line 4739) |
| AudioContext | oscillator, compressor, analyser | 音频指纹 |
| OfflineAudioContext | startRendering → 确定性 Float32Array | 离线音频指纹 (line 7510) |
| Storage | localStorage, sessionStorage | 存储可用性检测 |
| Crypto | getRandomValues (Node crypto), subtle.digest | 随机数/哈希 |
| Chrome 对象 | chrome.app, chrome.runtime, chrome.loadTimes | 反自动化检测 |
| 其他 | matchMedia, IntersectionObserver, ResizeObserver, requestAnimationFrame, requestIdleCallback, Notification, Worker, visualViewport, document.hidden/visibilityState/hasFocus | 各类浏览器 API 可用性检测 |

---

## Cookie 有效期与刷新

- `_px3` 有效期取决于 PX 服务端策略，实测约 10-30 分钟不等
- 生产环境建议每 **4 分钟**刷新一次（参考 `fetch_raw_details.py` 的 240s 策略）
- 遇到 403/429 立即刷新

```python
import time

cookie_ts = time.time()

# 每次请求前检查
if time.time() - cookie_ts > 240 or resp.status_code in (403, 429):
    px3 = gen.generate()
    cookie_ts = time.time()
```

---

## 常见问题

**Q: Homepage visit failed: Resolving timed out**
A: 首页访问超时不影响 cookie 生成。PX collector 能连通就行。如需加速，可加代理。

**Q: 生成的 cookie 403 了**
A: 检查是否用了 DC/CDN 代理（不支持）。cookie 生成和 API 请求必须用同一个 IP session。

**Q: Node 报 `Cannot find module 'jsdom'`**
A: 在 `node_bridge/` 目录下运行 `npm install`。

**Q: Python 报 `No module named 'curl_cffi'`**
A: 运行 `pip install curl_cffi`。

**Q: 想用 Windows 跑**
A: 完全支持。确保 `node` 和 `python` 在 PATH 中，在 `node_bridge/` 目录下操作即可。
