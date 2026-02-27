# PerimeterX 按压验证逆向资源汇总

---

## 一、GitHub 开源项目

### 1. glizzykingdreko — PX WASM 复现（最核心）
- **PerimeterX-Captcha-WASM**（Node.js 复现 WASM 部分，PxCaptcha v1.8.7）
  - https://github.com/glizzykingdreko/PerimeterX-Captcha-WASM
  - 时间：2023年

- **PerimeterX-Deobfuscator**（PX 主文件自定义反混淆工具）
  - https://github.com/glizzykingdreko/PerimeterX-Deobfuscator
  - 时间：2023年

### 2. Pr0t0ns — 完整 Solver（纯 request 方案）
- **PerimeterX-Reverse**（逆向过程记录 + 分析文档）
  - https://github.com/Pr0t0ns/PerimeterX-Reverse
  - 时间：2023年

- **PerimeterX-Solver**（v6.7.9 完整 Solver）
  - https://github.com/Pr0t0ns/PerimeterX-Solver
  - 时间：2023年

- **perimeterx-solution**（v8.9.6 更新版 Solver）
  - https://github.com/Pr0t0ns/perimeterx-solution
  - 时间：2023-2024年

### 3. MoterHaker — Puppeteer 自动化示例
- **bypass-captcha-examples/perimeterx.js**
  - https://github.com/MoterHaker/bypass-captcha-examples/blob/main/perimeterx.js
  - 时间：2023年

### 4. GitHub Topics 汇总页
- **perimeterx 标签下所有项目**
  - https://github.com/topics/perimeterx?o=desc&s=updated

---

## 二、技术博客 & 深度分析文章

### 中文资源

### 5. CSDN — PX3 无感 + 按压分析（含 WASM 参数细节）
- **perimeterx px3 无感分析**
  - https://blog.csdn.net/qq_21050249/article/details/134437232
  - 时间：2023年11月

- **perimeterx px3 px2 按压验证码分析**（含 PX12590/PX12610 代码）
  - https://blog.csdn.net/qq_21050249/article/details/135006728
  - 时间：2023年12月

### 6. CSDN — PX 分析与破解（_px2 和 _px3）
- **perimeterx 分析与破解**（含 WASM 提取 + wbg 对象复现）
  - https://blog.csdn.net/hero706309/article/details/131736540
  - 时间：2023年7月

### 7. CSDN — PerimeterX 验证解决方案详解（含轨迹分析）
- **PerimeterX 验证解决方案详解**（含 px561 轨迹字段、Se/Oe 分析）
  - https://blog.csdn.net/qq_33253945/article/details/146137340
  - 时间：2025年3月

### 8. CSDN — PerimeterX 行为检测系统深度解析
- **行为检测系统深度解析与绕过技术实战指南**
  - https://blog.csdn.net/qq_33253945/article/details/152059697
  - 时间：2025年9月

### 9. yazong's blog — PX3 按压反混淆 && 逆向分析
- **PerimeterX盾-PX3按压反混淆&&逆向分析**（以 Walmart 为样例）
  - https://www.1997.pro/archives/1711604818499
  - 时间：2024年3月

### 10. ChrisYP / nocaptcha — PX 三种模式文档
- **中文版 PX 文档**（无感/首页按压/XHR按压三种模式详解）
  - https://github.com/ChrisYP/ChrisYP.github.io/blob/main/zh-CN/perimeterx.md
  - 时间：2024年
- **英文版**
  - https://chrisyp.github.io/en-US/perimeterx.html

---

### 英文资源

### 11. glizzykingdreko — Medium 文章（PX 动态函数分析）
- **Extracting PerimeterX's Dynamic Functions for Advanced Anti-Bot Evasion**
  - https://medium.com/@glizzykingdreko/extracting-perimeterxs-dynamic-functions-for-advanced-anti-bot-evasion-921f35c16247
  - 时间：2023年11月

### 12. Biplov Dahal — PX iOS SDK 逆向（移动端，含 challenge 算术逻辑）
- **Breaking Mobile Bot Protection: Reverse Engineering PerimeterX's iOS SDK**
  - https://medium.com/@biplovdahal/breaking-mobile-bot-protection-reverse-engineering-perimeterxs-ios-sdk-8c760fb0fdc7
  - 时间：2026年1月

### 13. antibot.blog（obfio）— PX SDK 系列（含 GoLang 移植）
- **PerimeterX SDK: Part 1, reverse engineering**
  - https://antibot.blog/posts/1741549175263
- **PerimeterX SDK: Part 2, generator time!**
  - https://antibot.blog/posts/1741549345619
  - 时间：2025年3月

### 14. glizzykingdreko — DataDome WASM 分析（可参考 WASM 逆向思路）
- **Breaking Down Datadome Captcha WAF**（含 WASM boring_challenge 详细分析）
  - https://medium.com/@glizzykingdreko/breaking-down-datadome-captcha-waf-d7b68cef3e21
  - 时间：2025年5月

---

## 三、综合绕过指南（含逆向方法论）

### 15. ZenRows — How to Bypass PerimeterX（最详细的英文指南）
- https://www.zenrows.com/blog/perimeterx-bypass
- 时间：持续更新至 2026年

### 16. ScrapeOps — How To Bypass PerimeterX
- https://scrapeops.io/web-scraping-playbook/how-to-bypass-perimeterx/
- 时间：2022年10月（持续更新）

### 17. Scrapfly — How to Bypass PerimeterX when Web Scraping
- https://scrapfly.io/blog/posts/how-to-bypass-perimeterx-human-anti-scraping
- 时间：2026年2月（最新）

### 18. ScrapingBee — How to bypass PerimeterX anti-bot system
- https://www.scrapingbee.com/blog/how-to-bypass-perimeterx-anti-bot-system/
- 时间：2026年1月

### 19. Oxylabs — How Do PerimeterX Bypasses Work?
- https://oxylabs.io/blog/bypass-perimeterx
- 时间：2024年

### 20. 集蜂云（中文）— 如何绕过 PerimeterX：6 种最佳方法
- https://www.beeize.com/tecShare/article/perimeterx-bypass/
- 时间：2024年6月

### 21. 代理服务器（中文）— 如何绕过 PerimeterX
- https://www.dailiservers.com/perimeterx-bypass/
- 时间：2024年12月

---

## 四、WASM 逆向通用资源

### 22. K哥爬虫 — WASM 逆向实战（酷某音乐案例，含补环境思路）
- https://www.cnblogs.com/ikdl/p/18380733
- 时间：2024年

### 23. CSDN — WASM 逆向综合教程（含 wabt 工具使用 + 动态调试）
- https://blog.csdn.net/weixin_52369224/article/details/121566319
- 时间：2021年（基础方法论仍适用）

---

## 五、其他相关

### 24. GBHackers — 威胁分析报告（PX 按压验证的地下交易）
- **Threat Actors Target PerimeterX CAPTCHA to Automate Microsoft Account Creation**
  - https://gbhackers.com/target-perimeterx-captcha/
  - 时间：2025年6月

### 25. V2EX — PerimeterX 按压验证讨论帖
- https://www.v2ex.com/t/907264
- 时间：2023年1月

### 26. The Web Scraping Club — Bypassing PerimeterX without browser automation
- https://substack.thewebscraping.club/p/bypassing-perimeterx-scrapy
- 时间：2024年2月

---

## 推荐阅读优先级

| 优先级 | 资源 | 原因 |
|--------|------|------|
| ⭐⭐⭐⭐⭐ | #1 glizzykingdreko WASM 项目 | 直接可复用的 WASM Node.js 方案 |
| ⭐⭐⭐⭐⭐ | #2 Pr0t0ns Solver v8.9.6 | 最完整的开源纯 request Solver |
| ⭐⭐⭐⭐⭐ | #5 CSDN 按压验证码分析 | 含 PX12590/12610 具体代码 |
| ⭐⭐⭐⭐ | #11 glizzykingdreko Medium | PX 动态函数深度分析 |
| ⭐⭐⭐⭐ | #12 Biplov iOS SDK 逆向 | challenge 算术逻辑最清晰的分析 |
| ⭐⭐⭐⭐ | #13 antibot.blog 系列 | GoLang 移植实战 |
| ⭐⭐⭐ | #7 CSDN 验证方案详解 | 轨迹字段 Se/Oe 的具体分析 |
| ⭐⭐⭐ | #15 ZenRows 指南 | 最全面的英文方法论 |
| ⭐⭐⭐ | #9 yazong 博客 | AST 反混淆实操 |

---

# Pr0t0ns PerimeterX v8.9.6 完整技术逆向文档

> 数据来源: https://github.com/Pr0t0ns/perimeterx-solution 及 https://github.com/Pr0t0ns/PerimeterX-Reverse
> 版本: v8.9.6 | 目标站: arcteryx.com (AppID: PX943r4Fb8, ft: 330)

---

## 一、整体架构与 Challenge 流程

### 1.1 完整流程（两步 Collector 请求）

```
浏览器加载页面
  |
  v
PX script 注入 (例: https://arcteryx.com/943r4Fb8/init.js)
  |
  v
Step 1: request_1() -- 发送初始指纹 (fingerprint_1)
  POST -> https://collector-px943r4fb8.px-cloud.net/api/v2/collector
  |
  v
Server 返回 base64 编码的 `ob` 字段 (含挑战参数, 用 ~ 分割)
  |
  v
Step 2: solve_request() -- 发送完整指纹 (fingerprint_2) + challenge 解答
  POST -> 同一 collector URL
  |
  v
Server 返回包含 _px2/_px3 cookie 的响应 (从 "330|" 后解析)
```

### 1.2 Collector 端点结构

- **URL 模式**: `https://collector-{appid_lowercase}.px-cloud.net/api/v2/collector`
- **示例**: `https://collector-px943r4fb8.px-cloud.net/api/v2/collector`
- **Method**: POST
- **Content-Type**: `application/x-www-form-urlencoded`
- **跨域**: `sec-fetch-site: cross-site`, origin 为目标站点

### 1.3 Init Script 路径

- **格式**: `https://{host}/{appid_suffix}/init.js`
- **示例**: `https://arcteryx.com/943r4Fb8/init.js`
- init.js 约 9000+ 行, 带 VM 保护和混淆, 每次刷新变量名会变

---

## 二、请求参数详解

### 2.1 Request 1 (初始指纹) 的 POST 参数

| 参数 | 说明 | 示例 |
|------|------|------|
| `payload` | 加密后的指纹 JSON (见加密流程) | Base64+XOR+Padding 后的字符串 |
| `appId` | 站点 AppID | `PX943r4Fb8` |
| `tag` | PX SDK 版本 | `v8.9.6` |
| `uuid` | 随机 UUID, 本次会话唯一 | `uuid4()` 生成 |
| `ft` | 站点特有的 3 位数字 | `330` (arcteryx) |
| `seq` | 序列号, = rsc - 1 | `0` (首次) |
| `en` | 事件名, 固定为 NTA | `NTA` |
| `pc` | HMAC-MD5 校验值 (key=uuid:version:ft) | 整数字符串 |
| `sid` | Session ID | 从站点获取 |
| `vid` | Visitor ID | 从站点获取 |
| `cts` | Client Timestamp Token | 从站点获取 |
| `rsc` | Request Sequence Counter | `1` (首次) |
| `pxhd` | 已有的 _pxhd cookie (可选) | hash:vid 格式 |

### 2.2 Request 2 (验证请求) 的额外参数

| 参数 | 说明 | 来源 |
|------|------|------|
| `cs` | Challenge Solution | 从 response_1 中提取: `resp.split("1ooo11|")[1].split("~")[0]` |
| `payload` | 加密后的 fingerprint_2 JSON | 包含完整浏览器指纹 + response_1 中的挑战值 |

---

## 三、Payload 加密流程

### 3.1 三层加密: XOR -> URL-encode -> Base64 -> Padding

```python
def encrypt_payload(payload: str) -> str:
    # Step 1: XOR 每个字符 ^ 50
    xored = fn(payload, 50)  # fn(t, n) = ''.join(chr(ord(c) ^ n) for c in t)

    # Step 2: URL encode -> 解码十六进制 -> Base64 编码
    encoded = encode_string(xored)

    # Step 3: 添加 20 字符的自定义 padding
    padded = add_padding(encoded, uuid)

    return padded
```

### 3.2 Padding 机制

- **固定 padding 字符列表**: `G^S}DNK8DNa>D`K}GK77` (20 个字符, 全局静态)
- **Offset 计算**: 基于 UUID 的 base64 编码与 XOR(10) 的结果, 计算 20 个插入位置
- **插入方式**: 将 20 个 padding 字符分别插入到 payload 的计算位置

```python
custom_padding = list('G^S}DNK8DNa>D`K}GK77')

def add_padding(payload, PX_UID):
    n = get_offset(custom_padding, len(payload), PX_UID)
    # n = 根据 UUID 计算的 20 个排序后的偏移位置
    i = 0; o = ""
    for u in range(20):
        o += payload[i:n[u] - u - 1] + custom_padding[u]
        i = n[u] - u - 1
    return o + payload[i:]
```

### 3.3 Offset 计算算法 (get_offset)

```python
def get_offset(t, e, n):
    # t = padding 字符列表 (20 字符)
    # e = payload 长度
    # n = UUID
    g = fn(base64.b64encode(str(n).encode()).decode(), 10)  # UUID -> base64 -> XOR(10)
    p = []
    w = -1  # 最大乘积

    # 第一轮: 找到最大乘积 w
    for A in range(len(t)):
        m = math.floor(A / len(g) + 1)
        y = A if A >= len(g) else A % len(g)
        G = ord(g[y]) * ord(g[m])
        if G > w:
            w = G

    # 第二轮: 生成 20 个唯一偏移位置
    for V in range(len(t)):
        b = math.floor(V / len(g)) + 1
        Q = V % len(g)
        T = ord(g[Q]) * ord(g[b])
        if T >= e:
            T = Sl(T, 0, w, 0, e - 1)  # 线性缩放到 payload 范围
        while T in p:
            T += 1
        p.append(T)

    return sorted(p)  # 排序后的偏移列表
```

---

## 四、PC 值生成 (HMAC-MD5)

### 4.1 核心: generate_pc() -- 即原始函数 W(t, n)

`pc` 是 HMAC-MD5 的变体, 用于验证 payload 完整性:

```python
def generate_pc(key, fingerprint, pc_generation=True):
    # key 在不同场景下:
    #   Request pc:  key = "{uuid}:v8.9.6:{ft}"   (例: "xxxx:v8.9.6:330")
    #   PX11804:     key = user_agent, fingerprint = uuid
    #   PX11746:     key = user_agent, fingerprint = vid
    #   PX11371:     key = user_agent, fingerprint = sid

    r = L(key)      # 字符串 -> 32-bit word array
    o = [0]*15 + [None]
    i = [0]*15 + [None]

    if len(r) > 16:
        r = U(r, 8 * len(key))  # MD5 hash if key > 64 bytes

    for e in range(16):
        o[e] = 909522486 ^ r[e]   # ipad = 0x36363636
        i[e] = 1549556828 ^ r[e]  # opad = 0x5C5C5C5C

    # HMAC: MD5(opad || MD5(ipad || message))
    for val in L(fingerprint):
        o.append(val)
    a = U(o, 512 + 8 * len(fingerprint))
    for int_val in a:
        i.append(int_val)

    _v = G(U(i, 640))
    calculated_hash = calculate_hash_from_xored_value(_v)

    if not pc_generation:
        return calculated_hash  # 返回完整 hex hash (用于 PX11804/11746/11371)

    # pc_generation=True: 提取数字并交替取
    r = hash_to_full_pc(calculated_hash)
    o = ""
    for i in range(0, len(r), 2):
        o += r[i]
    return o  # 最终 pc 值 (数字字符串)
```

### 4.2 hash_to_full_pc: Hash -> 数字提取

```python
def hash_to_full_pc(hash_str):
    n = ""  # 直接数字
    e = ""  # 字母转数字 (ord % 10)
    for r in range(len(hash_str)):
        o = ord(hash_str[r])
        if 48 <= o <= 57:  # '0'-'9'
            n += hash_str[r]
        else:
            e += str(o % 10)
    return n + e  # 数字在前, 字母转换值在后
```

### 4.3 PC Key 构造

```python
# 请求级别的 PC
pc_key = f"{uuid}:v8.9.6:{ft}"
# 例: "a1b2c3d4-xxxx-yyyy-zzzz:v8.9.6:330"

# fingerprint_2 中的三个内部 PC 值
PX11804 = generate_pc(user_agent, uuid, pc_generation=False)   # UA + UUID -> hex hash
PX11746 = generate_pc(user_agent, vid, pc_generation=False)    # UA + VID -> hex hash
PX11371 = generate_pc(user_agent, sid, pc_generation=False)    # UA + SID -> hex hash
```

---

## 五、指纹 Payload 结构

### 5.1 Fingerprint 1 (初始指纹, 类型 PX12095)

```json
[{
    "t": "PX12095",
    "d": {
        "PX11645": "https://www.target.com",    // host
        "PX12207": 0,                           // 未知标志
        "PX12458": "Win32",                     // navigator.platform
        "PX11902": 0,                           // 计数器
        "PX11560": 3000,                        // 随机 2809-3809
        "PX12248": 3600,                        // 固定值
        "PX11385": 1713737306091,               // 起始时间 (ms)
        "PX12280": 1713737306096,               // 起始时间 + random(1,30)
        "PX11496": "uuid-here",                 // 本次会话 UUID
        "PX12564": null,
        "PX12565": -1,
        "PX11379": false
    }
}]
```

### 5.2 Fingerprint 2 (完整指纹, 两段: PX11590 + PX11547)

**类型 PX11590 -- 浏览器环境基础指纹:**

| PX Key | 含义 | 示例值 |
|--------|------|--------|
| PX11431 | 从 response_1 (`o11o11o1\|...\|~`) 提取的挑战值 | 整数 |
| PX11804 | HMAC(UA, UUID) | hex hash |
| PX12118 | 从 response_1 (`11o1o1\|...\|~`) 提取 | 字符串 |
| PX11746 | HMAC(UA, VID) | hex hash |
| PX11371 | HMAC(UA, SID) | hex hash |
| PX11529 | usedJSHeapSize | 随机 52M-59M |
| PX11555 | jsHeapSizeLimit | 4294705152 |
| PX11833 | totalJSHeapSize | 随机 58M-60M |
| PX11840 | 时间字符串 (Pacific Time) | "Wed Aug 21 2024 ..." |
| PX11526/11684/11812 | 自动化检测标志 | false |
| PX12335 | 功能检测 | true |
| PX12080 | hardwareConcurrency 相关 | 10 |
| PX11678 | cookieEnabled | true |
| PX11349 | document.visibilityState | "visible" |
| PX12150 | screen.width | 1280 |
| PX11651 | innerHeight | 752 |
| PX11991 | colorDepth | 24 |
| PX11508/11452/12218/12481/11780 | Canvas/Audio 指纹 hash | 8位hex |
| PX11701 | 从 response_1 (`1o111o\|...\|~`) 提取 | 字符串 |
| PX12454 | 从 response_1 (`o11o11oo\|...\|~`) 提取 | 整数 |
| PX12330 | 性能时间 | "109\|66\|66\|70\|80" |
| PX11705 | 某性能指标 | 1690 |
| PX11881 | chrome 对象属性 | ["loadTimes","csi","app"] |
| PX11984 | 故意触发的错误堆栈 | TypeError 字符串 |
| PX12506/12507 | CPU 架构 | "x86" / "64" |
| PX12508 | UA brands 数组 | Chrome/Chromium brands |
| PX12553 | 时区 | "America/Los_Angeles" |
| PX12579 | 网络信息 | {effectiveType:"4g", rtt:50, ...} |
| PX12524 | WebGL 相关编码值 | Unicode 编码字符串 |
| PX12527 | WebGL hash | md5 hash |

**动态 key 计算 (反调试):**
```python
# response_1 返回的 PX11701 值参与动态 key 生成
fn(PX11701, int(PX11431) % 10 + 2): fn(PX11701, int(PX11431) % 10 + 1)
# fn(t, n) = ''.join(chr(ord(c) ^ n) for c in t)
# 即: XOR(PX11701, PX11431%10+2) 作为 key, XOR(PX11701, PX11431%10+1) 作为 value
```

**类型 PX11547 -- WebGL/Canvas/DOM 深度指纹:**

| PX Key | 含义 | 说明 |
|--------|------|------|
| PX12492/12570/11352 | Canvas 指纹 hash | MD5 of canvas data |
| PX12292 | WebGL vendor | "WebKit" |
| PX11567 | WebGL renderer (generic) | "WebKit WebGL" |
| PX12032 | WebGL version | "WebGL 1.0 (OpenGL ES 2.0 Chromium)" |
| PX11536 | WebGL 扩展列表 | 35 个扩展名数组 |
| PX12149 | WebGL 参数值数组 | 约 55 个数值 |
| PX12352 | GPU vendor | "Google Inc. (Intel)" |
| PX11455 | GPU renderer (ANGLE) | "ANGLE (Intel, Intel(R) Iris(R) Xe ...)" |
| PX11534 | GLSL version | "WebGL GLSL ES 1.0 ..." |
| PX12503/12502/11927/12572 | 各种 fingerprint hash | MD5 |
| PX11477 | AudioContext 指纹 | "126.86972438948578" |
| PX12109/12362/12354/12491/12622 | 各种 hash | MD5 |
| PX12130 | window 全局变量检测 | 包含 _satellite, _fbq 等 |
| PX12351 | DOM 属性检测 | React event handlers 等 |
| PX11386 | 自动化检测属性 | ["webdriver"] |
| PX12275 | 自定义 DOM 属性 | ["data-react-helmet"] |
| PX12427 | window 全局变量 (含 PX) | 含 _pxAppId, _943r4Fb8handler |
| PX11842 | body 子元素属性 | React event props |
| PX12439 | 插件详细信息 | MIME type 关联 |
| PX11993 | 页面时间戳 | 毫秒字符串 |
| PX12228 | 错误堆栈 (不同位置) | init.js 内部函数调用 |

---

## 六、Response 解析

### 6.1 Response 1 结构

Server 返回 JSON `{ "ob": "base64_string" }`, 解码后为 `~` 分隔的键值对:

```
...11o1o1|{value1}~1o111o|{value2}~o11o11o1|{value3}~o11o11oo|{value4}~1ooo11|{cs_value}~...
```

提取方式:
```python
resp = base64.b64decode(response.json()['ob']).decode()

PX12118 = resp.split("11o1o1|")[1].split("~")[0]    # 第一个挑战参数
PX11701 = resp.split("1o111o|")[1].split("~")[0]    # 第二个挑战参数
PX11431 = resp.split("o11o11o1|")[1].split("~")[0]  # 第三个挑战参数 (整数)
PX12454 = resp.split("o11o11oo|")[1].split("~")[0]  # 第四个挑战参数 (整数)
cs      = resp.split("1ooo11|")[1].split("~")[0]    # Challenge Solution token
```

### 6.2 Response 2 结构 (_px2/_px3 Cookie)

```python
resp_2 = base64.b64decode(response.json()['ob']).decode()
# Cookie 在 "330|" (ft值) 后面
cookie = resp_2.split("330|")[1].split("|")[0]
# 这个 cookie 就是 _px2 或 _px3 的值
```

---

## 七、Key Map (混淆映射表)

PX init.js 中的变量名 -> PX 内部 key 名的映射 (key_map.json):

```
PRlcBXs     -> PX645
PRlbAXlc    -> PX1070
PRlbAXla    -> PX1076
PRlbAHtYfg  -> PX11547   (WebGL/Canvas 指纹块类型)
PRlbA35VfA  -> PX12095   (初始指纹块类型)
PRlbAHtVeQ  -> PX11590   (浏览器环境指纹块类型)
PRlbAHhYfA  -> PX11645   (host)
PRlbA3xcfg  -> PX12207   (标志位)
PRlbA3pZcQ  -> PX12458   (platform)
PRlbAHdcew  -> PX11902   (计数器)
PRlbAHtaeQ  -> PX11560   (随机值)
PRlbA3xYcQ  -> PX12248   (固定值)
PRlbAH1UfA  -> PX11385   (开始时间)
PRlbA3xUeQ  -> PX12280   (结束时间)
PRlbAHpVfw  -> PX11496   (UUID)
PRlbA3tafQ  -> PX12564
PRlbA3tafA  -> PX12565
PRlbAH1bcA  -> PX11379
PRlbAHZYeg  -> PX11843   (screen.width 或 availWidth)
PRlbAHlUeA  -> PX11781   (screen.height 或 availHeight)
PRlbA39eeA  -> PX12121   (outerWidth)
PRlbA31Ufg  -> PX12387   (分辨率字符串 "1280X800")
PRlbAH1UeQ  -> PX11380   (colorDepth)
PRlbA39ecQ  -> PX12128   (innerHeight)
PRlbAHZYcA  -> PX11849   (canvas hash)
PRlbAHtUeg  -> PX11583   (language)
PRlbAHlZfQ  -> PX11754   (userAgent)
PRlbAHhUeA  -> PX11681   (languages array)
PRlbAHhbcQ  -> PX11678   (cookieEnabled)
PRlbAHZYeQ  -> PX11840   (时间字符串)
PRlbAHtYeQ  -> PX11540   (某布尔值)
PRlbAHtfcA  -> PX11539   (hash 值)
PRlbAHtZfA  -> PX11555   (jsHeapSizeLimit)
PRlbAHpZew  -> PX11452   (hash 值)
PRlbA3tefg  -> PX12527   (WebGL hash)
```

---

## 八、防护机制与反检测要点

### 8.1 PX init.js 的保护

- **VM 保护**: 每次刷新页面, 函数名/变量名都会改变
- **重度混淆**: 9000+ 行代码
- **console.debug 检测**: 通过 property manipulation 检测 DevTools
- **WebDriver 检测**: 检查 navigator.webdriver, iframe 属性等
- **DOM 变异观察**: MutationObserver 监控 DOM 变化
- **错误堆栈分析**: 故意触发错误获取 init.js 内部的调用堆栈 (PX11984, PX12228)

### 8.2 指纹要求

- **WebGL**: 需要真实 GPU 渲染器 (ANGLE string), WebGL 扩展, 参数值
  - 建议: "For higher pass rates rotate the WEBGL fingerprint properties accordingly"
- **Canvas/Audio**: 多个 MD5 hash (PX12492, PX12570, PX11352, PX11477 等)
- **TLS 指纹**: 使用 tls_client 库模拟 Chrome 127 的 TLS 握手
- **UA Client Hints**: PX12506-PX12513 包含 UA brands, architecture, platform version
- **Heap Sizes**: 随机生成合理范围内的 JS 堆内存值
- **窗口/插件检测**: 检测全局变量 (PX12130, PX12427), 包括 _pxAppId 自身

### 8.3 TLS 配置

```python
session = tls_client.Session(
    client_identifier="chrome_127",
    random_tls_extension_order=True
)
```

---

## 九、fn() 函数 -- XOR 工具

贯穿整个系统的核心工具函数:

```python
def fn(t, n):
    """XOR 每个字符"""
    e = ""
    for char in t:
        e += chr(ord(char) ^ n)
    return e
```

用途:
- `fn(payload, 50)` -- 加密 payload (XOR 50)
- `fn(base64_uuid, 10)` -- 生成 padding offset 的种子 (XOR 10)
- `fn(PX11701, PX11431%10+2)` -- 生成动态 key
- `fn(PX11701, PX11431%10+1)` -- 生成动态 value

---

## 十、RSC (Request Sequence Counter) 机制

```
Request 1: rsc=1, seq=0 (rsc-1)
Response 1: 获取挑战参数
Request 2: rsc=2 (内部 +1), seq=2 (直接用 rsc)
Response 2: 获取 cookie
```

注: request_1 之后 `self.rsc += 1`, solve_request 中 seq 直接用 self.rsc (值为 2).

---

## 十一、完整使用示例

```python
token = PX(
    app_id="PX943r4Fb8",           # 站点 AppID
    ft=330,                         # 站点 ft 值
    collector_uri="https://collector-px943r4fb8.px-cloud.net/api/v2/collector",
    host="https://arcteryx.com/",   # 目标站点
    sid="0396fb2e-...",             # Session ID (从站点获取)
    vid="0bc41189-...",             # Visitor ID (从站点获取)
    cts="0c3f5439-...",             # Client Timestamp (从站点获取)
    proxy="user:pass@ip:port",      # 可选代理
    pxhd="hash:vid"                 # 可选已有 _pxhd cookie
).solve()

# token 就是 _px2 或 _px3 cookie 的值
```

---

## 十二、WASM 交互说明

在 Pr0t0ns 的 v8.9.6 solver 中, **没有直接使用 WASM**. 该 solver 是纯 Python 实现, 将所有本应由 WASM 执行的逻辑 (MD5, HMAC, 指纹哈希等) 用 Python 重新实现了:

- `pc_functions.py`: 实现了完整的 MD5 算法 (函数 L, U, G 等)
- `mods.py`: 使用 MD5 实现 HMAC-MD5 (generate_pc), 加密 (encrypt_payload), padding (add_padding)

但在浏览器端, PX 的 init.js 会加载 WASM 模块来执行:
- 指纹计算/哈希
- PC 值生成
- 某些加密操作
- 反调试检测

Pr0t0ns 的方案本质上是将 WASM 中的计算逻辑逆向后用 Python 重写, 绕过了 WASM 执行.

---

## 十三、关键发现与注意事项

1. **Response 分隔符使用二进制风格编码**: `11o1o1|`, `1o111o|`, `o11o11o1|`, `o11o11oo|`, `1ooo11|` -- 这些看起来像二进制表示的数字 (o=0, 1=1)
2. **PX11984/PX12228 (错误堆栈)**: PX 故意在 init.js 中触发 TypeError, 然后捕获堆栈信息作为指纹. 如果堆栈不是来自正确的 init.js URL, 会被检测
3. **动态 key-value 对**: fingerprint_2 中有一个动态的 key-value 对, 其 key 和 value 都是通过 XOR response_1 中的值计算的, 增加了逆向难度
4. **PX12595 字段**: 检测全局对象上的特殊属性, 值为 "AudioData.SVGAnimatedAngle.SVGMetadataElement.appEventData.appEventDataProcess"
5. **Cookie 提取**: 从 response_2 中用 `ft值|` 分割 (如 "330|"), 取第一个 segment 作为 cookie

---

# PerimeterX Mobile SDK Reverse Engineering - Complete Technical Reference (antibot.blog)

> Source: antibot.blog by obfio (2025/3/10)
> - Part 1: https://antibot.blog/posts/1741549175263
> - Part 2: https://antibot.blog/posts/1741549345619

---

## PART 1: REVERSE ENGINEERING

### Target & SDK Version
- **Target App**: GrubHub Android (no other anti-bot alongside PX)
- **PX SDK Version**: 2.2.3 (outdated)
- **PX Type**: px2 only (not px3) -- rare nowadays
- **App Version**: 2023.25
- **App ID**: `PXO97ybH4J`

### Setup & Tools
- **Android Emulator**: NoxPlayer (port range 62001-62999 for ADB)
- **MITM Proxy**: Burp Suite (base64 decode, request editing, brute force)
- **APK Decompiler**: JADX (struggles with Kotlin decompilation)
- **Device Interaction**: ADB + Frida
- **Frida Install**: `pip install frida-tools`, run with `frida -U -l test.js -f com.grubhub.android`

### SSL Pinning Bypass

PX uses okhttp3 with CertificatePinner:
```java
this.f73783a = dVar.a("*.perimeterx.net", "sha256/V5L96iSCz0XLFgvKi7YVo6M4SIkOP9zSkDjZ0EoU6b8=");
```

**Step 1** - Hook okhttp3 CertificatePinner (only bypasses PX pinning):
```javascript
Java.perform(function() {
    let okhttp3Pin = Java.use("okhttp3.CertificatePinner$Builder")
    okhttp3Pin["add"].implementation = function(pattern, pins) {
        return this
    }
})
```

**Step 2** - Hook Android's default TrustManager (bypasses all SDK pinning):
```javascript
var TrustManagerImpl = Java.use('com.android.org.conscrypt.TrustManagerImpl');
TrustManagerImpl.verifyChain.implementation = function (untrustedChain, trustAnchorChain, host, clientAuth, ocspData, tlsSctData) {
    return untrustedChain;
};
```

---

### API Endpoints

1. **Config**: `POST https://px-conf.perimeterx.net/api/v1/mobile`
2. **Collector (Request 1 & 2)**: `POST https://collector-pxo97ybh4j.perimeterx.net/api/v1/collector/mobile`

---

### Request 1: PX Config

**Request Body (JSON)**:
```json
{
    "device_os_version": "9",
    "device_os_name": "Android",
    "device_model": "SM-G988N",
    "sdk_version": "v2.2.3",
    "app_version": "2023.25",
    "app_id": "PXO97ybH4J"
}
```

**Response Body**:
```json
{
    "enabled": true,
    "ipv6": false
}
```

**Field Origins**:
- `device_os_version` = `Build.VERSION.RELEASE` (e.g. "9")
- `device_os_name` = static "Android"
- `device_model` = `Build.MODEL`
- `sdk_version` = static from `PerimeterX.sdkVersion()` (e.g. "v2.2.3")
- `app_version` = `context.getPackageManager().getPackageInfo(context.getPackageName(), 0).versionName`
- `app_id` = static per app (e.g. "PXO97ybH4J")

---

### Request 2: First Collector Payload (Init/Session)

**Request Format**: `application/x-www-form-urlencoded`
```
payload=<BASE64_ENCODED_JSON>&uuid=<UUIDv4>&appId=PXO97ybH4J&tag=mobile&ftag=22
```

**Key**: `tag` = static "mobile", `ftag` = static "22"
**Key**: `uuid` = `UUID.randomUUID().toString()` (UUIDv4, stored in session for reuse)

**Payload Structure** (base64 decoded):
```json
[{
    "t": "PX315",
    "d": {
        "PX1214": "...",
        "PX91": 900,
        ...
    }
}]
```

- `t` = payload type identifier. `PX315` = init/session payload
- `d` = data object

#### Complete Sensor Data Field Map (First Payload):

| Key | Source | Description |
|-----|--------|-------------|
| PX1214 | `Settings.Secure.getString(context.getContentResolver(), "android_id")` | Android device ID |
| PX91 | `displayMetrics.widthPixels` | Screen width |
| PX92 | `displayMetrics.heightPixels` | Screen height |
| PX316 | `((TelephonyManager) systemService2).getSimState() != 1` | Has SIM card (bool) |
| PX318 | `Build.VERSION.SDK_INT.toString()` | OS SDK version (e.g. "28") |
| PX319 | `System.getProperty("os.version")` | Kernel version (e.g. "4.19.110") |
| PX320 | `Build.MODEL` | Phone model (e.g. "SM-G988N") |
| PX339 | `Build.MANUFACTURER` | Manufacturer (e.g. "samsung") |
| PX321 | `Build.DEVICE` | Device codename (e.g. "z3q") |
| PX323 | `System.currentTimeMillis() / 1000` | Current timestamp (seconds) |
| PX322 | static "Android" | OS name constant |
| PX337 | `hasSystemFeature("android.hardware.location.gps")` | Has GPS |
| PX336 | `hasSystemFeature("android.hardware.sensor.gyroscope")` | Has Gyroscope |
| PX335 | `hasSystemFeature("android.hardware.sensor.accelerometer")` | Has Accelerometer |
| PX334 | SDK >= 24 ? `hasSystemFeature("android.hardware.ethernet")` : false | Has Ethernet |
| PX333 | `hasSystemFeature("android.hardware.touchscreen")` | Has Touchscreen |
| PX331 | `hasSystemFeature("android.hardware.nfc")` | Has NFC |
| PX332 | `hasSystemFeature("android.hardware.wifi")` | Has WiFi |
| PX421 | Root check: checks if su files exist or `/system/xbin/which su` returns output | Is Rooted (string "false"/"true") |
| PX442 | `Build.TAGS.contains("test-keys")` | Secondary root check (string "false"/"true") |
| PX317 | Network type: "WiFi" / "Mobile" / "NA" based on `networkCapabilities.hasTransport()` | Connection type |
| PX344 | `((TelephonyManager) systemService).getNetworkOperatorName()` | Carrier name (e.g. "T-Mobile") |
| PX347 | `Locale.getDefault().toString()` | Locale (e.g. "[en_US]") |
| PX343 | Network connectivity: "Unknown" / "2G" / "3G" / "4G" / "5G" | Signal type |
| PX415 | `registerReceiver.getIntExtra("level", 0)` (BATTERY_CHANGED intent) | Battery level (0-100) |
| PX413 | Battery health switch (1-7): "unknown"/"good"/"overheat"/"dead"/"over voltage"/"unspecified failure"/"cold" | Battery health |
| PX416 | Charging plug status: "Wireless" / "USB" / "AC" / "" | Charging port type |
| PX414 | Battery status: "full" / "not charging" / "discharging" / "charging" / "" | Charging status |
| PX419 | `"bv0.a@" + hex(7chars)` -- class@hashcode format, random hex after @ | Battery technology identifier |
| PX418 | `registerReceiver.getIntExtra("temperature", 0)` | Battery temperature |
| PX420 | `registerReceiver.getIntExtra("voltage", 0)` | Battery voltage |
| PX340 | `'v' + sdkVersion` | PX SDK version (static per app) |
| PX342 | app version | App version (static per app) |
| PX341 | app name | App name (static per app) |
| PX348 | package name | Package name (e.g. "com.grubhub.android") |
| PX1159 | `InstantApps.getPackageManagerCompat(context).isInstantApp()` | Is Google Play Instant App |
| PX330 | State from SharedPreferences | Session state: "new_session" on first request |
| PX345 | Resume counter from SharedPreferences (increments each fetch) | Request counter (starts at 0) |
| PX351 | `new Date().getTime() - initTime` | Time since session init (ms) |
| PX326 | UUID created from `new UUID(currentTimeMillis, 1L).toString()` | Session UUID |
| PX327 | `uniqueString.split("-")[0].toUpperCase()` | First section of UUID (uppercase) |
| PX328 | `SHA1(deviceModel + uniqueString + PX327).toUpperCase()` -- hex encoded | SHA-1 hash of device+UUID |
| PX1208 | Array of previous URLs requested in session, serialized as string | URL history (usually "[]") |

#### Root Detection (PX421) Detail:
Checks these file paths:
```
/system/app/Superuser.apk, /sbin/su, /system/bin/su, /system/xbin/su,
/data/local/xbin/su, /data/local/bin/su, /system/sd/xbin/su,
/system/bin/failsafe/su, /data/local/su, /su/bin/su
```
Falls back to executing `/system/xbin/which su` and checking for non-null output.

#### UUID Generation (PX326) Detail:
```java
long currentTimeMillis = System.currentTimeMillis();
if (currentTimeMillis == iv0.f.f46782a) {
    currentTimeMillis++;
}
iv0.f.f46782a = currentTimeMillis;
String uuid = new UUID(currentTimeMillis, 1L).toString();
```
Caches timestamp to prevent duplicate UUIDs.

#### SHA-1 Hash Function (PX328):
```java
public final String a(String input) {
    MessageDigest messageDigest = MessageDigest.getInstance("SHA-1");
    byte[] bytes = input.getBytes(Charsets.UTF_8);
    byte[] bytes2 = messageDigest.digest(bytes);
    StringBuilder sb2 = new StringBuilder(bytes2.length * 2);
    for (byte b12 : bytes2) {
        sb2.append("0123456789abcdef".charAt((b12 >> 4) & 15));
        sb2.append("0123456789abcdef".charAt(b12 & 15));
    }
    return sb2.toString();
}
```
Input: `deviceModel + uniqueString(UUID) + PX327`
Output: uppercase hex-encoded SHA-1 hash

---

### Response from First Collector Request (Instructions):

```json
{
    "do": [
        "sid|b23a538a-1e24-11ee-8b28-4a495456456d",
        "vid|b23a467b-1e24-11ee-8b28-2cb452de27a1|31536000|false",
        "appc|1|1688967166574|82bdf735e01cc1fd89afe73c1a04aa2d9070aed0a2d92ff800ee1e33ed2230d1|2a92d760-1ee3-11ee-9486-7d6cfd79bd83",
        "appc|2|1688967166574|42443399873c...hash...|374|3542|3311|1478|3717|352"
    ]
}
```

**Instruction Parsing**:
- `sid|<value>` -> sets Session ID
- `vid|<value>|ttl|flag` -> sets Visitor ID
- `appc|1|...` -> sets timestamp and hash (not used for PX257)
- `appc|2|timestamp|hash|n1|n2|n3|n4|n5|n6` -> sets PX259, PX256, and triggers POW for PX257

---

### Request 3: Second Collector Payload (Cookie Request)

Same endpoint, same format. Adds to payload:
- `sid` and `vid` from first response
- Changes `t` to `PX329`

**Additional Fields (only in second payload)**:

| Key | Source |
|-----|--------|
| PX259 | Timestamp from `appc\|2` instruction (3rd field) |
| PX256 | Hash string from `appc\|2` instruction (4th field) |
| PX257 | Proof-of-Work result (see below) |

#### Proof of Work (PX257) - Math Function:
```java
public final int a(int i12, int i13, int i14, int i15) {
    int i16 = i15 % 10;
    int i17 = i16 != 0 ? i14 % i16 : i14 % 10;
    int i18 = i12 * i12;
    int i19 = i13 * i13;
    switch (i17) {
        case 0: return i13 + i18;
        case 1: break;
        case 2: return i13 * i18;
        case 3: return i13 ^ i12;
        case 4: return i12 - i19;
        case 5: int i22 = i12 + 783; i12 = i22 * i22; break;
        case 6: return i13 + (i12 ^ i13);
        case 7: return i18 - i19;
        case 8: return i13 * i12;
        case 9: return (i13 * i12) - i12;
        default: return -1;
    }
    return i12 + i19;
}
```

**Called as**: `pow(pow(n3, n4, n1, n6), n5, n2, n6)` where n1-n6 are the 6 numbers from `appc|2`

**Final PX257 calculation** (IMPORTANT - decompiler was WRONG):
```java
// Decompiler output (WRONG):
int i14 = (bArr.length >= 4 ? 0 : ByteBuffer.wrap(bArr).getInt()) ^ a13;

// Smali/correct version:
int i14 = (bArr.length >= 4 ? ByteBuffer.wrap(bArr).getInt() : 0) ^ a13;
```
Where `bArr = Build.MODEL.getBytes(UTF_8)` and `a13` = POW output.

Since most phone models are >= 4 chars, this becomes: `ByteBuffer.wrap(modelBytes).getInt() ^ powResult`

#### Response from Second Collector (Cookie):
```json
{
    "do": [
        "bake|_px2|500|eyJ1IjoiMzFlxxxx...base64cookie...|true|500"
    ]
}
```
The `bake` instruction contains the `_px2` cookie/header value at index 3.

---

## PART 2: GENERATOR IMPLEMENTATION (Golang)

### Code Porting - Critical Notes

**Integer types matter**: Java `int` = 32 bits. Go `int` = 64 bits. Must use `int32` in Go to match Java behavior for POW math.

### POW Function (Go port):
```go
func pow(i12, i13, i14, i15 int32) int32 {
    i16 := i15 % 10
    i17 := int32(0)
    if i16 != 0 {
        i17 = i14 % i16
    } else {
        i17 = i14 % 10
    }
    i18 := i12 * i12
    i19 := i13 * i13
    switch i17 {
    case 0: return i13 + i18
    case 1: break
    case 2: return i13 * i18
    case 3: return i13 ^ i12
    case 4: return i12 - i19
    case 5:
        i22 := i12 + 783
        i12 = i22 * i22
        break
    case 6: return i13 + (i12 ^ i13)
    case 7: return i18 - i19
    case 8: return i13 * i12
    case 9: return (i13 * i12) - i12
    default: return -1
    }
    return i12 + i19
}
```

### Frida Hooks for Validation:

**Hook POW function**:
```javascript
Java.perform(function () {
    let a = Java.use("ov0.a");
    a["a"].implementation = function (i12, i13, i14, i15) {
        console.log('a is called, i12: ' + i12 + ', i13: ' + i13 + ', i14: ' + i14 + ', i15: ' + i15);
        let ret = this.a(i12, i13, i14, i15);
        console.log('a ret value is ' + ret);
        return ret;
    };
})
```

**Hook Boxing.boxInt (final PX257 output)**:
```javascript
Java.perform(function () {
    let Boxing = Java.use("kotlin.coroutines.jvm.internal.Boxing");
    Boxing["boxInt"].implementation = function (i12) {
        console.log('boxInt is called, i12: ' + i12);
        let ret = this.boxInt(i12);
        console.log('boxInt ret value is ' + ret);
        return ret;
    };
})
```

### ByteBuffer.wrap().getInt() in Go:
```go
b := []byte("SM-G988N")
buf := bytes.NewBuffer(b)
res := int32(0)
binary.Read(buf, binary.BigEndian, &res)
```

### APPC Instruction Parser (Go):
```go
func (p *Payload) AppcInstruction(appc string) error {
    parts := strings.Split(appc, "|")
    if parts[1] != "2" || len(parts) != 10 {
        return nil
    }
    p.D.Px256 = &parts[3]
    date, err := strconv.ParseInt(parts[2], 10, 64)
    if err != nil { return nil }
    p.D.Px259 = &date
    parts = parts[4:]
    numbers := []int32{}
    for _, str := range parts {
        num, err := strconv.ParseInt(str, 10, 32)
        if err != nil { return nil }
        numbers = append(numbers, int32(num))
    }
    mathOut := pow(pow(numbers[2], numbers[3], numbers[0], numbers[5]), numbers[4], numbers[1], numbers[5])
    bArr := []byte(p.D.Px320)
    res := int32(0)
    if len(bArr) >= 4 {
        binary.Read(bytes.NewBuffer(bArr), binary.BigEndian, &res)
    }
    out := res ^ mathOut
    p.D.Px257 = &out
    return nil
}
```

### UUID Generation (Custom UUIDv1 for PX)

Java creates UUID with: `new UUID(currentTimeMillis, 1L)`

Standard UUIDv1 Go output: `93a92bf0-0189-1000-8000-04421aef6061`
Required PX output: `00000189-93a9-2bf0-0000-000000000001`

**Key modifications to standard UUID generator**:
1. Hard-coded `hardwareAddr` to `[]byte{0, 0, 0, 0, 0, 1}` (from Java's `1L` second param)
2. Changed Variant from `VariantRFC4122` to `VariantNCS` (changes `8000` to `0000`)
3. Removed `u.SetVersion(V1)` (would override a byte)
4. Rearranged byte packing to match Java's format:
```go
func (g *rfc4122Generator) NewV1(timeNow uint64) (UUID, error) {
    u := UUID{}
    clockSeq := uint16(0)
    binary.BigEndian.PutUint16(u[0:], uint16(0))
    binary.BigEndian.PutUint16(u[2:], uint16(timeNow>>32))
    binary.BigEndian.PutUint32(u[4:8], uint32(timeNow))
    binary.BigEndian.PutUint16(u[8:], clockSeq)
    hardwareAddr := []byte{0, 0, 0, 0, 0, 1}
    copy(u[10:], hardwareAddr)
    u.SetVariant(VariantNCS)
    return u, nil
}
```

Uses forked `github.com/satori/go.uuid` with go.mod replace:
```
replace github.com/satori/go.uuid => ./uuid
```

### UUID Section Generator (PX326, PX327, PX328):
```go
func (p *Payload) UUIDSection() error {
    if p.Cache.TimeStamp == p.Cache.PrevUUIDTime {
        p.Cache.TimeStamp++
        p.Cache.PrevUUIDTime++
    }
    p.D.Px326 = uuid.Must(uuid.NewV1(p.Cache.TimeStamp))
    p.D.Px327 = strings.ToUpper(p.D.Px326[0:8])
    p.D.Px328 = strings.ToUpper(px328(p.D.Px320 + p.D.Px326 + p.D.Px327))
    return nil
}

func px328(str string) string {
    h := sha1.New()
    h.Write([]byte(str))
    return hex.EncodeToString(h.Sum(nil))
}
```

### Device Data Collection

**Required fields to collect per device**:
- Model, Manufacturer, Device codename
- Screen width/height
- GPS, Gyro, Accelerometer, Ethernet, Touchscreen, NFC, WiFi (booleans)
- Android version

**Source**: PhoneMore (phonemore.com/phones/) - scraped for device data
**Scraper**: github.com/obfio/phonemore-scraper

**Android ID generation** (not collected, generated):
```java
String androidId = Long.toHexString(new SecureRandom().nextLong());
```
Go equivalent: `randomHex(8)` -- random 16-char hex string

**Android SDK Levels mapping** (levels.json):
```json
{"10": 29, "11": 30, "12": 31, "13": 33}
```

**Kernel versions by Android version**:
- Android 10 (SDK 29): `4.19.0` to `4.19.292`
- Android 11 (SDK 30): `5.4.0` to `5.4.254`
- Android 12 (SDK 31): `5.10.0` to `5.10.192`
- Android 13 (SDK 33): `5.15.0` to `5.15.128`

### Payload Population Logic (Go):

```go
func (p *Payload) Populate(d *Device, l int, sdkVer, appVer, appName, packName string, isInstantApp bool) {
    p.T = "PX315"
    p.D.Px1214 = randomHex(8)           // random android_id
    p.D.Px91 = d.Width
    p.D.Px92 = d.Height
    p.D.Px316 = true                     // has SIM
    p.D.Px318 = fmt.Sprint(l)            // SDK level
    p.D.Px319 = getkernelVersion(l)      // random kernel for SDK
    p.D.Px320 = strings.ToUpper(d.Model)
    p.D.Px339 = d.Manufacturer
    p.D.Px321 = d.Device
    p.Cache.TimeStamp = time.Now().UnixMilli()
    p.D.Px323 = p.Cache.TimeStamp / 1000
    p.D.Px322 = "Android"
    p.D.Px337 = d.GPS
    p.D.Px336 = d.Gyro
    p.D.Px335 = d.Accelerometer
    p.D.Px334 = l >= 28                  // ethernet conditional on SDK level
    p.D.Px333 = d.TouchScreen
    p.D.Px331 = d.NFC
    p.D.Px332 = d.WiFi
    p.D.Px421 = "false"                  // not rooted
    p.D.Px442 = "false"                  // no test-keys
    p.D.Px317 = random("WiFi", "Mobile")
    p.D.Px344 = randomCarrier()
    p.D.Px347 = "[en_US]"
    p.D.Px343 = random("Unknown","2G","3G","4G","5G")
    p.D.Px415 = 20 + rand(80)           // battery 20-100
    p.D.Px418 = randomTemp(-40 to 60)
    p.D.Px420 = randomVoltage(1.0 to 6.0)
    p.D.Px413 = batteryHealth()          // based on temp/voltage
    p.D.Px416 = chargingPort()           // USB or ""
    p.D.Px414 = chargingStatus()         // full/charging/not charging
    p.D.Px419 = "bv0.a@" + randomHex(4)[:7]  // 7 hex chars after @
    p.D.Px340 = sdkVer
    p.D.Px342 = appVer
    p.D.Px341 = appName
    p.D.Px348 = packName
    p.D.Px1159 = isInstantApp
    p.D.Px330 = "new_session"
    p.D.Px1208 = "[]"
}
```

### Payload Struct (Go):
```go
type Payload struct {
    T string `json:"t"`
    D struct {
        Px1214 string  `json:"PX1214"`
        Px91   int     `json:"PX91"`
        Px92   int     `json:"PX92"`
        // ... all PX fields
        Px259  *int64  `json:"PX259,omitempty"`
        Px256  *string `json:"PX256,omitempty"`
        Px257  *string `json:"PX257,omitempty"`
        Px1208 string  `json:"PX1208"`
    } `json:"d"`
}
```

### HTTP Request Flow

#### Headers:
- `User-Agent`: `PerimeterX Android SDK/2.2.3` (without 'v' prefix)
- `Accept-Charset: UTF-8`
- `Accept: */*`
- `Content-Type: application/json` (for config) or `application/x-www-form-urlencoded; charset=utf-8` (for collector)
- `Connection: close` (for config)

#### Request 1 - Config:
```
POST https://px-conf.perimeterx.net/api/v1/mobile
Content-Type: application/json
User-Agent: PerimeterX Android SDK/2.2.3
```

#### Request 2 - First Collector:
```
POST https://collector-pxo97ybh4j.perimeterx.net/api/v1/collector/mobile
Content-Type: application/x-www-form-urlencoded; charset=utf-8

payload=<base64([{t:"PX315",d:{...}}])>&uuid=<UUIDv4>&appId=PXO97ybH4J&tag=mobile&ftag=22
```

#### Request 3 - Second Collector (get cookie):
```
POST https://collector-pxo97ybh4j.perimeterx.net/api/v1/collector/mobile
Content-Type: application/x-www-form-urlencoded; charset=utf-8

payload=<base64([{t:"PX329",d:{...+PX257,PX256,PX259}}])>&uuid=<same_UUIDv4>&appId=PXO97ybH4J&tag=mobile&ftag=22&sid=<sid>&vid=<vid>
```

### TLS Fingerprinting

- PX uses okhttp3 which has a specific TLS fingerprint
- Must match TLS cipher suites, extensions, curves to okhttp3
- TLS client library: `github.com/bogdanfinn/tls-client`
- Match Android version to TLS profile:
  - Android 10 -> `tlsclient.Okhttp4Android10`
  - Android 11 -> `tlsclient.Okhttp4Android11`
  - Android 12 -> `tlsclient.Okhttp4Android12`
  - Android 13 -> `tlsclient.Okhttp4Android13`

### Client Setup (Go):
```go
type Client struct {
    PXID         string
    PXPayload    *Payload
    Proxy        string
    DeviceData   *Device
    HTTPClient   tlsclient.HttpClient
    SDKVersion   string
    AppVersion   string
    AppName      string
    PackageName  string
    IsInstantApp bool
    SID          string
    VID          string
    UUIDv4       string
    Config       *Config
    Payloads     []string  // debug
}
```

---

# ifood PerimeterX 按压验证 (Captcha/Bundle) 逆向分析

> 目标站: ifood.com.br
> AppID: PXd6f03jmq8h6c7382req0
> 分析时间: 2026年2月
> 状态: Collector API 已破解, Bundle 接口逆向进行中

---

## 一、整体架构：Collector vs Bundle

### 1.1 两种模式

| 模式 | 触发条件 | 生成 Cookie | 脚本 |
|------|----------|-------------|------|
| **Collector** (无感验证) | 正常访问 | `_px3` | main.js (init.js) |
| **Bundle** (按压验证/captcha) | 被判定为 bot | 新的 `_px3` | main.js + captcha.js |

### 1.2 Bundle 请求流程

```
触发 captcha 页面
  │
  ├── 加载 main.js (≈10653 行, 混淆)
  ├── 加载 captcha.js (≈10492 行, 混淆, 文件名每次变化)
  │
  ▼
Bundle #1 请求 (POST)
  │ 发送初始指纹 + 挑战请求
  ▼
Bundle #1 响应 → ob 解码 → 13 个指令段
  │ 包含: PoW 挑战参数、cookie 配置、视觉挑战参数
  │
  ├── 自动求解 PoW (SHA-256 暴力搜索)
  ├── 设置全局状态 (jf, to, ao, qa, $a 等)
  │
  ▼
Bundle #2 请求 (POST, 带 PoW 答案)
  │
  ▼
Bundle #2 响应 → ob 解码 → 2 个指令段
  │ 包含: 新的 _px3 cookie + 控制标志
  │
  ▼
[用户按压] → Bundle #3 请求 (待分析)
```

---

## 二、ob 响应解码链

### 2.1 完整解码流程

```
JSON 响应 → 提取 .ob 或 .do 字段
  │
  ▼ Step 1: Base64 decode
atob(obValue)
  │
  ▼ Step 2: XOR 解码
ee(decoded, key=120)   // key = parseInt(ml("DhY8E0h7J2cKHw=="), 10) % 128
  │
  ▼ Step 3: 分割指令段
xored.split("~~~~")   // 4个波浪号!!
  │
  ▼ Step 4: 解析每个段
段.split("|")  →  fields[0] = handler key, fields[1..] = 参数
```

### 2.2 关键函数

**Et()**: 返回硬编码值 `"DhY8E0h7J2cKHw=="`

**ml(t)**: 哈希函数，返回 3 位数字字符串
```javascript
function ml(t) {
    for (var e = 0, n = 0; n < t.length; n++) {
        e = (31 * e + t.charCodeAt(n)) % 2147483647;
    }
    return (e % 900 + 100).toString();
}
// ml("DhY8E0h7J2cKHw==") = "888"
```

**ee(t, key)**: XOR 解码
```javascript
function ee(t, e) {
    for (var n = '', i = 0; i < t.length; i++) {
        n += String.fromCharCode(t.charCodeAt(i) ^ e);
    }
    return n;
}
```

**XOR key 计算**: `parseInt("888", 10) % 128 = 120`

### 2.3 重要细节

- **分隔符是 4 个波浪号** `~~~~`，不是 3 个！（二进制 `0x06 0x06 0x06 0x06` XOR `0x78` = `0x7E 0x7E 0x7E 0x7E`）
- **handler key 是第一个字段**（用 `shift()` 取出，不是 `pop()`）
- **"cc" 延迟执行**：如果段的第一个参数是 `"cc"`，该段被延迟到最后执行（`unshift` 到队列头部）
- **JSON 的 `.do` 字段优先于 `.ob`**：`parsed.do || parsed.ob`

---

## 三、ih 段处理器

### 3.1 位置: main.js:4310-4339

```javascript
function ih(segments, isDo) {
    // isDo=false → 使用 Ql 注册表 (ob 响应)
    // isDo=true  → 使用 jl 注册表 (do 响应)

    for each segment:
        fields = segment.split("|")
        handlerKey = fields.shift()   // 取第一个字段作为 handler key

        if (fields[0] === "cc"):     // 延迟标记
            deferred = {key, args: fields}
            continue

        queue.push({key, args: fields})

    if (deferred) queue.unshift(deferred)  // cc 段放到最前面执行

    // 按队列顺序执行所有 handler
    for each item in queue:
        Ql[item.key].apply(context, item.args)
}
```

### 3.2 "cc" 标记来源

`Rr[Te] = J("Y2M=")` → `atob("Y2M=")` → `"cc"`

这是 PX 的延迟执行机制，用于确保某些 handler（如 cookie 配置）在其他 handler 之后再执行。

---

## 四、Ql Handler 注册表（27 个）

### 4.1 位置: main.js:3933-4239

### 4.2 完整 Handler 列表

| Handler Key | 功能 | 参数 |
|-------------|------|------|
| **I0I000** | 设置 jf (控制标志) | (flag) |
| **0IIII0** | fh → 设置 to/eo (session ID) | (sessionId, extra) |
| **0III0I0I** | ch → 设置 no/ro (时间戳) | (timestamp) |
| **II00II** | 设置 $a (App ID) | (appId) |
| **0III0I00** | ah → 设置 ao (状态码) | (statusCode) |
| **III000** | 设置 qa (challenge hash) | (hash) |
| **0II0III0** | 视觉挑战参数 (PX12634) | (startW, startH, wJump, hJump, hash) |
| **I0I0I0** | **PoW 启动 (PX1135=Bs)** | (enabled, suffix, targetHash, difficulty, isTrusted) |
| **0II0I0** | **PoW 执行入口 (qu)** | (enabled, uuid, port, challengeData, extra, tag) |
| **IIIIII** | cookie 配置 (Xr) | (featureName, ttl, args) |
| **II0III** | 解析逗号分隔配置 | (configStr) |
| **III0II** | **设置 _px3 cookie (oh)** | (name, ttl, value, secure, maxAge) |
| **I0III0** | localStorage 存值 (rh) | (value) |
| **IIII00** | 创建隐藏 DOM 蜜罐 | (id, tagName, name, className) |
| **00I0I0** | 重定向/导航 | (url, ttl, param) |
| **I0I00I** | Ao 回调触发 | (event, ...args) |
| **00II00** | 上报/日志 | (type, data, code) |
| **000II0** | URL 操作 + reload | (flag) |
| **0III0II0** | 存储 TTL | (key, ttl, value, param, extra) |
| **0I0II0** | noop | - |
| **0II00I** | noop | - |
| **I000I0** | Gf() 重置 | - |
| **0III00I0** | $u 调用 (PX764) | (data) |
| **I000II** | sr(go) 清除 cookie | - |
| **0III0000** | ei(t,e) | (t, e) |
| **0II0IIII** | 加载外部脚本 | (scriptUrl) |
| **IIIII0** | PX 控制 (th=true) | - |
| **0II0II0I** | localStorage 存值 #2 | (value) |

### 4.3 Handler Key 命名规则

Handler key 使用 `I` 和 `0` 的二进制风格编码，长度 6 或 8 个字符。

---

## 五、Bundle #1 响应完整解析

### 5.1 示例数据（13 个段）

```
段 0:  I0I000   → jf = "cu" (控制标志, "cc" 延迟执行)
段 1:  0IIII0   → to = "41916095560041989364" (session ID)
段 2:  0III0I0I → no = "1771962830422" (时间戳 ms)
段 3:  II00II   → $a = "d6f03jmq8h6c7382req0" (App ID)
段 4:  0III0I00 → ao = "401" (HTTP 状态码)
段 5:  III000   → qa = "4481f3...03bc" (challenge hash, SHA-256)
段 6:  0II0III0 → 视觉挑战: {startW:27, startH:57, wJump:1, hJump:4, hash:"440be2...2490"}
段 7:  I0I0I0   → PoW 启动: {suffix:"ab317b...ee9c", target:"7bb57f...1169", difficulty:16}
段 8:  0II0I0   → PoW 执行: {uuid:"8a213f60-...", port:8588, challengeData:"hash_suffix"}
段 9:  IIIIII   → cookie: {ff:"cc", ttl:60, args:"U2FtZVNpdGU9TGF4Ow=="}  (cc=延迟)
段 10: IIIIII   → cookie: {ff:"rf", ttl:60, args:"1"}
段 11: IIIIII   → cookie: {ff:"fp", ttl:60, args:"1"}
段 12: II0III   → 配置: "ccc:0,ic:0,nf:0,ai:0,ai:0"
```

### 5.2 重要状态变量（Handler 执行后）

```javascript
jf  = "cu"                              // 控制标志
to  = "41916095560041989364"             // session/tracking ID
no  = "1771962830422"                    // 时间戳 (ms)
ro  = 1771962830                         // 时间戳 (秒)
ao  = "401"                              // HTTP 状态码
qa  = "4481f3f71e53718b3e58..."          // challenge hash (SHA-256)
$a  = "d6f03jmq8h6c7382req0"            // App ID
Lu  = "8a213f60-11ba-11f1-a1d1-..."     // PoW UUID
Mr  = {cc:"U2FtZ...", rf:"1", fp:"1",   // cookie 配置
       ccc:"0", ic:"0", nf:"0", ai:"0"}
```

---

## 六、PoW (Proof of Work) 完整还原

### 6.1 触发链

```
Bundle #1 段 7 (I0I0I0 handler)
  │
  ├── 检查 enabled === "1"
  ├── 参数重排: handler(t,e,n,r,a) → Bs(n, e, r, a==="true")
  │   即: Bs(targetHash, suffix, difficulty, isTrusted)
  │
  ▼
PX1135 = PX762 = Bs (captcha.js:7411)
  │ 同一个函数，注册了两个别名
  │
  ▼
Bs(targetHash, suffix, difficulty)
  │
  ├── Web Worker 并行路径 (浏览器环境)
  └── setTimeout 单线程路径 (降级)
      │
      ▼
  poi(counter, mask, padding, hexDigits, lastHexDigit, prefix, 0, targetHash)
```

### 6.2 核心算法

```javascript
// captcha.js:7165 — poi() 单次尝试
function poi(r, n, u, t, v, e, f, s) {
    var m = (u + (r & n).toString(16)).slice(-t);
    var o = e + (v + (r >> (t << 2))).toString(16) + m;
    if (sha256(o) === s) return o;
}
```

### 6.3 参数推导（difficulty=16 为例）

```
输入:
  targetHash = "7bb57f904e7b938c..."  (SHA-256, 64字符)
  suffix     = "ab317b680dfb5a3d...ee9c"  (60字符)
  difficulty = 16

Bs 内部计算:
  m = Math.ceil(16 / 4) = 4            // hex 位数
  padding = "0000"                      // 补零字符串
  mask = (1 << 16) - 1 = 65535         // 位掩码
  lastHexDigit = parseInt("0xc", 16) = 12  // suffix 最后一个 hex 字符
  prefix = suffix.slice(0, -1)          // suffix 去掉最后一个字符
  maxCounter = 1 << 16 = 65536         // 搜索空间

对于 difficulty=16 (counter < 65536):
  candidate = suffix + counter.toString(16).padStart(4, '0')

  等价于: sha256(suffix + "0000") === target?
          sha256(suffix + "0001") === target?
          ...
          sha256(suffix + "ffff") === target?
```

### 6.4 Node.js 求解器

```javascript
const crypto = require('crypto');

function sha256(data) {
    return crypto.createHash('sha256').update(data, 'utf8').digest('hex');
}

function solvePow(targetHash, suffix, difficulty) {
    difficulty = +difficulty || 16;
    const m = Math.ceil(difficulty / 4);
    const padding = '0'.repeat(m);
    const mask = (1 << (4 * m)) - 1;
    const lastHexDigit = parseInt('0x' + suffix.charAt(suffix.length - 1), 16);
    const prefix = suffix.slice(0, -1);
    const maxCounter = 1 << difficulty;

    for (let r = 0; r < maxCounter; r++) {
        const lowPart = (padding + (r & mask).toString(16)).slice(-m);
        const candidate = prefix + (lastHexDigit + (r >> (m << 2))).toString(16) + lowPart;
        if (sha256(candidate) === targetHash) {
            return { answer: candidate, counter: r };
        }
    }
    return null;
}
```

### 6.5 验证结果

```
输入:
  suffix     = "ab317b680dfb5a3dc7c52a4fefedce5adb20cedd066ce5408ce6887aee9c"
  targetHash = "7bb57f904e7b938c8442e522a97d754d23a35964a1030857244c7d2c803a1169"
  difficulty = 16

输出:
  answer  = "ab317b680dfb5a3dc7c52a4fefedce5adb20cedd066ce5408ce6887aee9c24da"
  counter = 9434
  耗时    = 9ms

验证:
  sha256(answer) === targetHash  ✓
```

### 6.6 0II0I0 handler 的补充处理

段 8 (0II0I0) 同时执行：
1. 存储 UUID: `Lu = uuid`
2. **XOR 解码 challengeData 的后缀部分**:
   ```javascript
   challengeData = "hash_encodedSuffix"
   parts = challengeData.split("_")
   // parts[0] = hash 部分
   // parts[1] = 编码后缀 (XOR key = $l = 10)
   decodedSuffix = ee(parts[1], 10)  // 如 "?::<" → "5002"
   ```
3. 调用 `qu(uuid, decodedPort, hash, difficulty, tag)` → `os()` → `Bs()`

**注意**: I0I0I0 (段7) 和 0II0I0 (段8) 都会触发 Bs，但参数来源不同。I0I0I0 通过 PX1135 直接调用 Bs 是主路径。

---

## 七、Bundle #2 响应解析

### 7.1 示例数据（2 个段）

```
段 0: III0II → 设置 _px3 cookie
  [0] _px3                     ← cookie 名
  [1] 330                      ← TTL (秒)
  [2] 2d8e5eafe6b58c6f26...    ← cookie 值 (含加密数据)
  [3] true                     ← secure 标志
  [4] 300                      ← max-age

段 1: I0I000 → jf = "cu" (控制标志)
```

### 7.2 Cookie 结构

`_px3` cookie 值格式: `hash:base64data:ttl:base64sig`

---

## 八、captcha.js 关键函数注册表

### 8.1 captcha handler 对象

```javascript
// 通过控制台确认:
window._O1GDTa7Qhandler = {
    PX762:   Bs,    // PoW 求解器 (captcha.js:7411)
    PX12634: ...,   // 视觉挑战处理
    PX1135:  Bs     // PoW 入口 (与 PX762 是同一函数!)
}
```

**重要发现**: `PX1135 === PX762 === Bs`，是完全相同的函数。

### 8.2 main.js 设置的回调

os() 执行时在 captcha handler 上设置:
```javascript
handler.PX763  = ds   // PoW 完成回调 → 发送结果给服务器
handler.PX1078 = rs   // 接收配置 (Wu, Zu, Ou)
handler.PX1200 = ts   // 事件触发 (Nu)
handler.PX1145 = zu   // 通知函数
```

### 8.3 captcha.js 内部关键函数

| 函数 | 行号 | 功能 |
|------|------|------|
| **sha256()** | ~7000-7164 | 纯 JS SHA-256 实现 |
| **poi()** | 7165-7170 | PoW 单次尝试 (SHA-256 比对) |
| **ws()** | 7171-7175 | Web Worker 循环调用 poi() |
| **Ks()** | 7176-7219 | 创建 Web Worker (Blob URL) |
| **Ts()** | 7406-7410 | 存储 PoW 结果 (Es=answer, Js=elapsed) |
| **Bs()** | 7411-7524 | 完整 PoW 求解器 (Worker/setTimeout 双路径) |

---

## 九、main.js 关键函数位置

| 函数 | 行号 | 功能 |
|------|------|------|
| **Ql** | 3933-4239 | Handler 注册表 (27 个 handler) |
| **ih()** | 4310-4339 | ob 段处理器 |
| **oh()** | 4276-4309 | 设置 _px3 cookie |
| **hr()** | 1012-1034 | Cookie 写入 |
| **sr()** | 1002-1005 | Cookie 删除 |
| **Xr()** | 1171-1187 | Cookie 配置存储 |
| **qu()** | 2537-2542 | PoW 挑战入口 |
| **os()** | 2589-2597 | PoW worker 启动, 设置回调 |
| **ss()** | 2610-2612 | PoW 结果回调 (发送 Nu) |
| **ds()** | 2659-2664 | PX763 回调 |
| **zu()** | 2516-2521 | PX1145 通知 |
| **ls()** | 2617-2620 | 获取 captcha 模块引用 |
| **Rr** | 1138-1165 | 常量表 (含 "cc" 标记) |
| **fh()** | 4361 | 设置 to/eo |
| **ch()** | 4344 | 设置 no/ro |
| **ah()** | 4273 | 设置 ao |

---

## 十、项目文件结构

```
ifood_PerimeterX-WAF_jsReverse/
├── main.js                     # PX bundle 主脚本 (10653 行, 混淆)
├── captcha.js                  # PX captcha 模块 (10492 行, 混淆, 文件名会变)
├── px_captcha.wasm             # 提取的 WASM 二进制 (60862 bytes)
├── documents.md                # 本文档
│
├── js_reverse/
│   └── ob_handlers.js          # ★ 完整还原: 解码器 + 27个Handler + PoW solver
│
├── utils/
│   ├── decode_ob.js            # ob 响应解码器模块
│   ├── decode_ob_bundle1.js    # Bundle #1 解码测试
│   ├── decode_ob_bundle2.js    # Bundle #2 解码测试
│   ├── test_handlers.js        # Handler 集成测试
│   ├── extract_wasm.js         # 从 captcha.js 提取 WASM
│   ├── run_wasm.js             # WASM 运行器
│   ├── run_wasm_debug.js       # WASM 调试版
│   └── trigger_captcha.js      # 触发 captcha 的辅助脚本
│
└── test/                       # 测试目录
```

---

## 十一、踩坑记录与经验

### 11.1 不要搜索反混淆后的函数名

captcha.js / main.js 是高度混淆的代码。用户给出的 `Ub`, `eh`, `ih`, `ml`, `Et` 等都是反混淆后的名字，在原始文件中搜索不到。**应该直接使用用户提供的反混淆代码，而不是去原始文件里找。**

### 11.2 分隔符是 4 个波浪号

初始用 3 个波浪号 `~~~` 分割，导致每个段前面多了一个 `~`。正确的分隔符是 `~~~~`（4个）。

### 11.3 shift() 而不是 pop()

handler key 是第一个字段，用 `shift()` 取出。不是最后一个字段。通过交叉验证段数据和 Ql 注册表确认。

### 11.4 PX1135 = Bs (同一函数)

最初以为 PX1135 和 PX762 是不同函数。通过浏览器控制台 `h.PX1135.toString()` 确认输出就是 `function Bs(...)`，是完全相同的函数。

### 11.5 I0I0I0 handler 参数重排

handler 接收 `(t, e, n, r, a)`，但调用 Bs 时重排为 `(n, e, r, a==="true")`：
```
handler 参数:  [enabled, suffix, targetHash, difficulty, isTrusted]
Bs 接收参数:  [targetHash, suffix, difficulty, isTrusted]
```

### 11.6 captcha.js 文件名会变

每次加载 captcha 脚本的 URL 和内容都会变化，无法直接打断点。需要通过 main.js（固定）或控制台注入来调试。

### 11.7 Bash 中 $a 变量名冲突

在 Bash 中用 node -e 执行含 `$a` 的代码会被 shell 解释。解决方案：将代码写入文件再执行。

---

## 十二、待完成项

- [ ] Bundle #2 请求体构建（POST body 格式、Header）
- [ ] Bundle #3 请求（用户按压后发送）
- [ ] Bundle 请求 URL 和 Headers 完整分析
- [ ] ss() 回调函数：PoW 结果如何编码进请求体
- [ ] 视觉挑战 (PX12634) 的完整逻辑
- [ ] WASM 在 Bundle 流程中的角色（如有）

### Cookie Usage

The `_px2` cookie is used as a header:
- **Header Name**: `X-Px-Authorization`
- **Header Value**: `2:<cookie_value>` (the "2:" prefix because it's px2)

### Testing Cookies (GrubHub-specific)

**Step 1**: Get auth token from `POST https://api-gtm.grubhub.com/auth/anon`
```json
{"brand":"GRUBHUB","client_id":"ghandroid_Ujtwar5s9e3RYiSNV31X41y2hsK6Kh1Uv7JDrkpS","scope":"anonymous"}
```

**Step 2**: Login with `POST https://api-gtm.grubhub.com/auth/login`
```json
{
    "brand": "GRUBHUB",
    "client_id": "ghandroid_Ujtwar5s9e3RYiSNV31X41y2hsK6Kh1Uv7JDrkpS",
    "email": "...",
    "password": "...",
    "exclusive_session": false,
    "scope": "diner",
    "device_id": "<UUIDv4>",
    "device_public_key": null,
    "metadata_map": null
}
```

Headers include:
- `X-Px-Authorization: 2:<cookie>`
- `Authorization: Bearer <auth_token>`
- `User-Agent: Grubhub/2023.25 (MODEL; Android VERSION)`
- `X-Gh-Features: 0=phone;1=grubhub 2023.25.0;2=Android VERSION;`

**Expected Results**:
- 401 = cookie passed (invalid login creds, which is expected)
- 403 = cookie failed / blocked by PX
- 403 body contains: `{"action":"captcha","uuid":"...","vid":"...","appId":"PXO97ybH4J","page":"...","collectorUrl":"..."}`

---

### Troubleshooting & Critical Discoveries

1. **Form encoding issues**: Go's `url.Values` doesn't preserve key order. Fix: use `github.com/justhyped/OrderedForm`
2. **URL encoding**: PX uses text encoding, not URL encoding. `=` should NOT become `%3D`, `&` should NOT become `\u0026`
3. **Host header case**: The Host header must use lowercase PXID (e.g. `collector-pxo97ybh4j` not `collector-PXO97ybH4J`)
4. **PX419 hex chars**: Must have >= 3 letter characters in the 7-char hex string (not all numbers)
5. **Empty instructions**: Sometimes PX returns `{"do":[]}`. Must retry up to 3 times, regenerating payload each time with updated PX345 (counter++) and PX351 (elapsed time)
6. **Retry logic for payload regeneration**:
```go
populated := p.Cache.StartTime != 0
if !populated {
    // first-time setup (kernel version, etc.)
} else {
    p.D.Px345++
    p.D.Px351 += time.Now().UnixMilli() - p.Cache.StartTime
}
```
7. **Decompiler bugs**: JADX can flip ternary conditions. Always verify against Smali bytecode when something doesn't work.
8. **PX345/PX351 bug**: Both first and second payloads can have the same value (0) because PX's own code doesn't refresh these values between payload generations. PX345 counter stays at 1 after 2 requests internally.

### Anti-Bot Behavioral Notes

- PX SDK (mobile) is known to be much easier than PX web
- PX gives "valid-looking" responses that are actually bad cookies -- must test externally
- PX heavily relies on captcha during traffic spikes (influx of users/bots)
- Low-scale requests (e.g. every 300ms) can pass with NO PX header at all
- IP trust score matters: very low-quality IPs get blocked even on single requests
- Detection rate ~50-60% on high threads is likely PX's normal captcha behavior, not payload issues
- Most PX payload fields can be left blank/wrong and still pass -- PX's ML model is poorly trained for mobile
- PX stores session data in SharedPreferences
- Multiple anti-bots can stack (e.g. Walmart uses PX + Akamai + ThreatMetrix)
- Biometrics fingerprinting (cursor tracking, HTML element positions) exists on PX web but NOT in mobile SDK
- Most anti-bots use ML models to process data; poorly trained models can block legitimate users
- PX is known to ban entire timezones, browsers, and lock sites behind captcha during traffic spikes

### API Structure (Go/Gin)

**Endpoint**: `POST 127.0.0.1:7356/px/bake`

**Input**:
```json
{
    "pxid": "PXO97ybH4J",
    "proxy": "http://...",
    "sdkVersion": "v2.2.3",
    "appVersion": "2023.25",
    "appName": "\"Grubhub\"",
    "packageName": "com.grubhub.android",
    "isInstantApp": false
}
```

**Output**:
```json
{
    "cookie": "eyJ1IjoiMzFlxxxx...",
    "error": ""
}
```

### Complete Flow Summary

1. `GetConfig()` -> POST to px-conf -> get enabled/ipv6
2. `Populate()` -> fill device fingerprint data into payload
3. `UUIDSection()` -> generate PX326/327/328
4. `GetInstructions()` -> POST first payload (t=PX315) to collector -> get sid/vid/appc instructions
5. Parse instructions: extract sid, vid, run AppcInstruction for appc|2
6. Set payload type to PX329, add PX257/256/259
7. `GetCookie()` -> POST second payload (t=PX329) with sid/vid to collector -> get bake instruction
8. Extract cookie from bake instruction index 3
9. Use cookie as `X-Px-Authorization: 2:<cookie>` header

### References & GitHub
- Project repo: github.com/obfio/px-grubhub-mobile
- PhoneMore Scraper: github.com/obfio/phonemore-scraper
- TLS Client: github.com/bogdanfinn/tls-client
- Ordered Forms: github.com/justhyped/OrderedForm
- UUID Fork: github.com/satori/go.uuid (forked/modified)
- Gin HTTP Framework: github.com/gin-gonic/gin
- Frida: github.com/frida/frida
- JADX: github.com/skylot/jadx
- Burp Suite: portswigger.net/burp/communitydownload
- NoxPlayer: bignox.com
- TLS Fingerprint Testing: tls.peet.ws