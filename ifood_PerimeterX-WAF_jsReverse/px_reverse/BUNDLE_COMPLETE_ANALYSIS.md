# ifood PerimeterX Bundle (人机验证) 完整逆向分析

> 目标站: ifood.com.br | AppID: PXd6f03jmq8h6c7382req0
> 分析时间: 2026年2月 | 状态: PoW 已破解, Bundle 请求构建中
> 本文档串联所有发现，形成完整知识网

---

## 目录

1. [全局流程图](#一全局流程图从页面加载到通过验证)
2. [两种验证模式](#二两种验证模式collector-vs-bundle)
3. [Collector 无感验证流程](#三collector-无感验证完整流程)
4. [Bundle 按压验证流程](#四bundle-按压验证完整流程)
5. [ob 响应解码链](#五ob-响应解码链)
6. [ih 段处理器](#六ih-段处理器)
7. [Ql Handler 注册表 (27个)](#七ql-handler-注册表-27个)
8. [Bundle #1 响应解析](#八bundle-1-响应完整解析)
9. [PoW 算法完整还原](#九pow-proof-of-work-算法完整还原)
10. [Bundle #2 响应解析](#十bundle-2-响应解析)
11. [WASM 集成](#十一wasm-集成)
12. [全局状态变量](#十二全局状态变量)
13. [Cookie / Storage 机制](#十三cookie--storage-机制)
14. [事件回调系统 Ao](#十四事件回调系统-ao)
15. [captcha.js 关键函数](#十五captchajs-关键函数)
16. [main.js 关键函数](#十六mainjs-关键函数)
17. [Payload 加密与 PC 校验](#十七payload-加密与-pc-校验)
18. [Mobile SDK 对比](#十八mobile-sdk-对比)
19. [完整项目文件索引](#十九完整项目文件索引)
20. [踩坑记录](#二十踩坑记录)
21. [待完成项](#二十一待完成项)

---

## 一、全局流程图：从页面加载到通过验证

```
用户访问 ifood.com.br
  │
  ▼
PX 脚本注入 (main.min.js)
  │ URL: https://client.px-cloud.net/PXO1GDTa7Q/main.min.js
  │
  ▼
══════════════════════════════════════════
  无感验证 (Collector)  ← 正常状态
══════════════════════════════════════════
  │
  ├── Collector Request #1 (初始指纹 PX12095)
  │     POST → collector-pxo1gdta7q.px-cloud.net/api/v2/collector
  │     payload=base64(xor(fingerprint, 50)) + 各种参数
  │
  ├── Collector Response #1
  │     ob → base64 → 用 ~ 分割 → 提取 PX12118, PX11701, PX11431, PX12454, cs
  │
  ├── Collector Request #2 (完整指纹 PX11590+PX11547 + challenge 解答)
  │     payload=base64(xor(fingerprint2, 50)) + cs + rsc=2
  │
  ├── Collector Response #2
  │     ob → base64 → 从 "330|" 后提取 → _px3 cookie 值
  │
  ▼
正常访问 (带 _px3 cookie)
  │
  │  ≈200次请求后，被判定为 bot
  │
  ▼
══════════════════════════════════════════
  按压验证 (Bundle/Captcha)  ← 触发后
══════════════════════════════════════════
  │
  ├── 加载 captcha.js (≈10492行, 文件名每次变化)
  │     注册 PX762/PX1135/PX12634 到 window._O1GDTa7Qhandler
  │
  ├── 加载 px_captcha.wasm (≈60KB)
  │     导出 a() → PX12590, b(input) → PX12610
  │
  ├─── Bundle #1 Request ──────────────────────
  │     POST → collector (带指纹 payload)
  │
  ├─── Bundle #1 Response (13段指令) ──────────
  │     ob → base64 → XOR(120) → split("~~~~")
  │     │
  │     ├── 段0-5: 设置全局状态 (jf, to, no, $a, ao, qa)
  │     ├── 段6: 视觉挑战参数 (PX12634)
  │     ├── 段7: PoW 参数 → 调用 Bs/PX1135 求解
  │     ├── 段8: PoW 执行入口 (qu → os)
  │     ├── 段9-11: Cookie 配置 (cc/rf/fp)
  │     └── 段12: 功能开关配置
  │
  ├── [自动] PoW 求解 (~9ms)
  │     sha256(suffix + hex(counter)) === targetHash
  │
  ├─── Bundle #2 Request ──────────────────────
  │     POST → collector (带 PoW 答案)
  │
  ├─── Bundle #2 Response (2段指令) ───────────
  │     ├── 段0: III0II → 新 _px3 cookie
  │     └── 段1: I0I000 → jf="cu"
  │
  ├── [用户按压验证按钮] ← 人工动作
  │
  ├─── Bundle #3 Request (待分析) ─────────────
  │     POST → collector (带按压事件数据)
  │
  └── 验证通过，获得有效 _px3 → 正常访问
```

---

## 二、两种验证模式：Collector vs Bundle

| 维度 | Collector (无感) | Bundle (按压/captcha) |
|------|-----------------|---------------------|
| **触发条件** | 正常访问 | 被 PX 判定为 bot (~200请求后) |
| **脚本** | main.js 独立完成 | main.js + captcha.js + WASM |
| **请求次数** | 2次 (指纹→cookie) | ≥3次 (初始→PoW→按压) |
| **生成 Cookie** | `_px3` | 新的 `_px3` |
| **加密方式** | XOR(50) + base64 + 交织(20chars) | XOR(120) + base64 + "~~~~" |
| **服务端响应** | `~` 分割 | `~~~~` 分割, ob handler 指令 |
| **用户感知** | 无感知 | 需要按压/滑动 |
| **PoW** | 无 | SHA-256 暴力搜索 (difficulty=16) |
| **WASM** | 不需要 | PX12590/PX12610 |

### 关键标识

| 项目 | 值 |
|------|-----|
| AppID (init) | `PXO1GDTa7Q` |
| AppID (bundle) | `PXd6f03jmq8h6c7382req0` |
| Collector URL | `collector-pxo1gdta7q.px-cloud.net/api/v2/collector` |
| PX 主脚本 | `client.px-cloud.net/PXO1GDTa7Q/main.min.js` |
| 核心 Cookie | `_px3` |
| PX 函数挂载点 | `window.screen.*` (s/u/q/r/p/m/n/o) |
| captcha handler | `window._O1GDTa7Qhandler` |

---

## 三、Collector 无感验证完整流程

> 来源: Pr0t0ns v8.9.6 solver (arcteryx.com / PX943r4Fb8 / ft=330)

### 3.1 Request #1: 初始指纹

```
POST https://collector-{appid}.px-cloud.net/api/v2/collector
Content-Type: application/x-www-form-urlencoded

参数:
  payload  = encrypt(fingerprint_1)     ← XOR(50) + URL编码 + base64 + 交织(20字符, UUID算位置)
  appId    = PXO1GDTa7Q
  tag      = v8.9.6                     ← SDK 版本
  uuid     = UUID v4
  ft       = 330                        ← 站点特征值
  seq      = 0                          ← rsc - 1
  en       = NTA                        ← 事件名 (固定)
  pc       = HMAC-MD5 校验值            ← key = "{uuid}:v8.9.6:{ft}"
  sid      = session ID (从站点获取)
  vid      = visitor ID (从站点获取)
  cts      = client timestamp token
  rsc      = 1                          ← request sequence counter
```

**Fingerprint #1 结构 (PX12095):**
```json
[{
    "t": "PX12095",
    "d": {
        "PX11645": "https://www.ifood.com.br",
        "PX12458": "Win32",
        "PX11902": 0,
        "PX11560": 3000,       // random(2809, 3809)
        "PX12248": 3600,
        "PX11385": 1713737306091,
        "PX12280": 1713737306096,
        "PX11496": "uuid"
    }
}]
```

### 3.2 Payload 加密流程

```
原始 JSON → XOR(50) → URL encode → base64 → 插入 20 字符交织

交织机制 (Collector 版):
  交织字符: 基于 no (初始值, 非服务器时间戳) 生成, 20 个
  插入位置: 基于 UUID 的 base64 XOR(10) 计算 20 个偏移量
  线性缩放: offset = Qf(product, 0, maxProduct, 0, payloadLen-1)
  去交织位置: offsets[i] - 1 (同 Bundle)
```

### 3.3 Response #1 解析

```
{ "ob": "base64_string" }
↓ base64 decode
↓ 用 ~ 分割的键值对

提取:
  PX12118 = resp.split("11o1o1|")[1].split("~")[0]
  PX11701 = resp.split("1o111o|")[1].split("~")[0]
  PX11431 = resp.split("o11o11o1|")[1].split("~")[0]  ← 整数
  PX12454 = resp.split("o11o11oo|")[1].split("~")[0]  ← 整数
  cs      = resp.split("1ooo11|")[1].split("~")[0]    ← challenge solution token
```

**注意**: 这里的 handler key 格式 (`11o1o1`, `1o111o`) 和 Bundle 的 handler key (`I0I000`, `0IIII0`) 不同——Collector 用 `1/o` 编码，Bundle 用 `I/0` 编码。

### 3.4 Request #2: 完整指纹 + 解答

额外参数:
- `cs` = challenge solution (来自 Response #1)
- `rsc` = 2
- payload 包含完整浏览器指纹 (PX11590 + PX11547)

**Fingerprint #2 核心字段 (PX11590):**

| PX Key | 含义 | 来源 |
|--------|------|------|
| PX11431 | 挑战值 | Response #1 |
| PX11804 | HMAC(UA, UUID) | HMAC-MD5 |
| PX12118 | 挑战值 | Response #1 |
| PX11746 | HMAC(UA, VID) | HMAC-MD5 |
| PX11371 | HMAC(UA, SID) | HMAC-MD5 |
| PX11529 | usedJSHeapSize | ~52-59M |
| PX12150 | screen.width | 1280 |
| PX11651 | innerHeight | 752 |
| PX11508 | Canvas hash | MD5 |
| PX11477 | AudioContext | "126.869..." |
| PX12506/07 | CPU arch | "x86"/"64" |

**动态 key-value 对 (反逆向):**
```javascript
// Response #1 返回的 PX11701 参与动态 key 计算
key   = XOR(PX11701, PX11431 % 10 + 2)
value = XOR(PX11701, PX11431 % 10 + 1)
```

### 3.5 Response #2: 获取 Cookie

```
resp_2 = base64.b64decode(response.json()['ob']).decode()
_px3_cookie = resp_2.split("330|")[1].split("|")[0]
```

### 3.6 PC 值生成 (HMAC-MD5 变体)

```python
def generate_pc(key, fingerprint):
    """
    key = "{uuid}:v8.9.6:{ft}"
    输出: 数字字符串 (HMAC-MD5 → 提取数字 → 间隔取)
    """
    # 标准 HMAC-MD5
    ipad = [0x36363636 ^ k for k in word_array(key)]
    opad = [0x5C5C5C5C ^ k for k in word_array(key)]
    inner = MD5(ipad + word_array(fingerprint))
    hmac  = MD5(opad + inner)

    # 提取: 数字字符 + 字母 ord%10, 然后间隔取
    digits = extract_digits(hex(hmac))
    return digits[::2]  # 每隔一个取
```

---

## 四、Bundle 按压验证完整流程

### 4.1 触发条件

ifood 在约 200 次 API 请求后返回 403 + captcha JSON:
```json
{
    "blockScript": "https://client.px-cloud.net/.../captcha.js",
    "appId": "PXO1GDTa7Q"
}
```

可用 `trigger_captcha.js` 复现 (无限循环 POST ifood API，100ms 间隔)。

### 4.2 脚本加载

```
1. main.min.js (≈10653行, 固定 URL)
   → 注册 Ql handler 注册表 (27个)
   → 定义 ih 段处理器
   → 定义 ob 解码链

2. captcha.js (≈10492行, 文件名每次变化!)
   → 注册 captcha handler 到 window._O1GDTa7Qhandler
   → 包含 PoW solver (Bs), SHA-256, Web Worker
   → 包含 WASM loader (Us[10])
   → 包含视觉挑战 (PX12634)

3. px_captcha.wasm (≈60KB, 嵌入在 captcha.js 的 Us() 数组)
   → 导出 a() → PX12590 (指纹生成)
   → 导出 b(input) → PX12610 (挑战处理)
```

### 4.3 CDP 拦截替换

`test/ifood_intercept.js` 用 Chrome DevTools Protocol 拦截 main.min.js，替换为本地修改版:
```javascript
// 核心逻辑
Network.requestIntercepted(async ({interceptionId, request}) => {
    if (url.includes('px-cloud.net/PXO1GDTa7Q/main.min.js')) {
        // 返回本地文件内容
        await Network.continueInterceptedRequest({interceptionId, rawResponse});
    }
});
```

### 4.4 Bundle #1 Request: 完整请求结构 (已逆向!)

#### 4.4.1 URL (与 Collector 不同!)

```
POST https://collector-pxo1gdta7q.px-cloud.net/assets/js/bundle
                                                ^^^^^^^^^^^^^^^^
Collector 用: /api/v2/collector
Bundle   用: /assets/js/bundle    ← 不同端点!
```

#### 4.4.2 Request Headers

```
content-type: application/x-www-form-urlencoded
origin: https://www.ifood.com.br
referer: https://www.ifood.com.br/
sec-ch-ua: "Not:A-Brand";v="99", "Microsoft Edge";v="145", "Chromium";v="145"
sec-ch-ua-mobile: ?0
sec-ch-ua-platform: "Windows"
sec-fetch-dest: empty
sec-fetch-mode: cors
sec-fetch-site: cross-site
user-agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) ...
```

#### 4.4.3 POST 参数

| 参数 | 值 | 说明 | vs Collector |
|------|-----|------|-------------|
| `payload` | Jf(events, config) | 指纹数据 | **有 Jf() 交织!** |
| `appId` | PXO1GDTa7Q | App ID | 相同 |
| `tag` | `O2MKZn0OEhI/ag==` (base64) | SDK 版本 | Collector 用明文 `v8.9.6` |
| `uuid` | `eb30dfdf-11c5-11f1-...` | 会话 UUID | 相同 |
| `ft` | **388** | 站点特征值 | **Collector 用 330** |
| `seq` | 0 | 序列号 | 相同 |
| `en` | NTA | 事件名 | 相同 |
| `bi` | `GwNqS048KWpd...` (base64, 95bytes) | **浏览器信息** | **Collector 没有** |
| `pc` | 9751268234020178 | HMAC-MD5 校验 | 相同算法 |
| `sid` | `51338389-11b8-...` + 隐写 | Session ID + Unicode 隐写 | **Bundle 附加隐写** |
| `vid` | `51337cf3-11b8-...` | Visitor ID | 相同 |
| `cts` | `513385fa-11b8-...` | Client Timestamp | 相同 |
| `rsc` | 1 | Request Sequence | 相同 |

> **重要**: `bi` 和 `tag` 均为脚本硬编码值:
> - `bi` = `It` = `"GwNqS048KWpdXw5u..."` (固定 base64)
> - `tag` = `"O2MKZn0OEhI/ag=="` (固定 base64, 类似版本号)

#### 4.4.4 Payload 加密方式 (Jf() 交织)

```
Collector: JSON → XOR(50) → URL encode → base64 → 插入 20字符 padding (UUID 算位置)
Bundle:    JSON → XOR(50) → base64 → Jf() 字符交织 (UUID 算位置, 服务器时间戳生成密钥串)
```

**解密方式**: `去交织(payload, offsets) → base64_decode → XOR(50) → JSON`
- 交织 key `o` = XOR(base64(服务器时间戳), 10), 20 字符
- 偏移量基于 UUID 计算 (jf="cu", cu:Xa()=uuid)
- 去交织位置: `offsets[i] - 1` (NOT `offsets[i]`!)

#### 4.4.5 Payload JSON 完整结构

```json
[{
  "t": "GU1oT1wgZ3g=",
  "d": {
    "WQ0oDx9mKjg=": "https://www.ifood.com.br/restaurantes",
    "Fm4nbFMBIVk=": 1,
    "EFQhFlU9Iiw=": "Win32",
    "KDxZPm5YXw4=": 0,
    "MVUAV3c9AGU=": 3182,
    "Y1tSWSY0UGM=": 3600,
    "InpTeGQUXU8=": 1771967721486,
    "eW1ILzwCRh0=": 1771967721493,
    "FUlkS1Mga38=": "eb30dfdf-11c5-11f1-9781-bac43f3b40b0",
    "R382PQIXNgs=": null,
    "MkpDCHciQz8=": 0,
    "OS0Ib39DCVQ=": false,
    "fEANAjkuCzc=": "PX11745",
    "TTE8cwtaPEk=": "pxhc",
    "EFQhFlU6Iyw=": false,
    "LVEcU2g7GmI=": "a088cf8a...cookie_value...:1000:signature"
  }
}]
```

#### 4.4.6 字段映射 (Bundle vs Collector PX12095)

| # | Bundle Key (base64) | 值示例 | 对应 Collector PX Key | 含义 |
|---|---------------------|--------|---------------------|------|
| 0 | `WQ0oDx9mKjg=` | `"https://www.ifood.com.br/..."` | PX11645 | 当前页面 URL |
| 1 | `Fm4nbFMBIVk=` | `1` | PX12207 | 标志位 |
| 2 | `EFQhFlU9Iiw=` | `"Win32"` | PX12458 | navigator.platform |
| 3 | `KDxZPm5YXw4=` | `0` | PX11902 | 请求计数器 |
| 4 | `MVUAV3c9AGU=` | `3182` | PX11560 | 随机值 (2809-3809) |
| 5 | `Y1tSWSY0UGM=` | `3600` | PX12248 | 固定值 |
| 6 | `InpTeGQUXU8=` | `1771967721486` | PX11385 | 起始时间戳 (ms) |
| 7 | `eW1ILzwCRh0=` | `1771967721493` | PX12280 | 结束时间戳 (ms, +7) |
| 8 | `FUlkS1Mga38=` | `"eb30dfdf-..."` | PX11496 | 会话 UUID |
| 9 | `R382PQIXNgs=` | `null` | PX12564 | 空值 |
| 10 | `MkpDCHciQz8=` | `0` | PX12565 | 计数器 (Collector 是 -1) |
| 11 | `OS0Ib39DCVQ=` | `false` | PX11379 | 布尔标志 |
| **12** | `fEANAjkuCzc=` | `"PX11745"` | **无** | **★ PX key 引用** |
| **13** | `TTE8cwtaPEk=` | `"pxhc"` | **无** | **★ _pxhd cookie 类型** |
| **14** | `EFQhFlU6Iyw=` | `false` | **无** | **★ 布尔标志** |
| **15** | `LVEcU2g7GmI=` | `"a088cf8a...:...:1000:..."` | **无** | **★ _pxhd cookie 值 (665bytes)** |

**关键发现**:
- 前 12 个字段与 Collector PX12095 **完全一致**
- Bundle 额外添加 4 个字段: PX key 引用、pxhd 类型、标志、_pxhd cookie 值
- JSON key 使用 base64 编码 (每次 PX 脚本加载会变化)
- `"t"` 字段是 payload 类型标识 (base64 编码, 类似 Collector 的 `"PX12095"`)

#### 4.4.7 Bundle vs Collector 参数差异总结

```
                  Collector               Bundle
────────────     ────────               ──────
URL              /api/v2/collector       /assets/js/bundle
ft               330                     388
tag              明文 "v8.9.6"           base64 编码
bi               无                      base64 编码 (95 bytes)
payload 加密     XOR(50)+base64+交织     XOR(50)+base64+Jf()交织
JSON keys        明文 PX key             base64 编码 (每次变化)
字段数           12                      16 (多 4 个 pxhd 相关)
```

### 4.4.8 完整参数生成链路 (main.js 逆向)

#### mh(t, e) — 主构造函数 (line 4384)

```javascript
function mh(events, config) {
    // 1. 为每个事件注入运行时数据
    for (event of events) {
        event.d["MDRCNnZaQA0="] = kt          // blockScript 标志
        event.d["NSkHa3BHAl4="] = es()        // risk level (如果有)
        event.d["U0shSRYgJX4="] = Xl()        // isAsync
        event.d["FCgmKlFDIRg="] = Bl()        // getRiskRules
        event.d["HwdtBVlsbj8="] = Ca()        // module type
        event.d["bRFfEyh/Xik="] = jo()        // isFirstParty
        event.d["HmYsZFsMKVU="] = cr("_px3")  // _px3 cookie
    }

    // 2. 计算 cs 和 pc
    l = Ho()                                    // cs = qa (服务器下发!)
    h = jt(it(events), [uuid, tag, ft].join(":"))  // pc = HMAC-MD5

    // 3. 构造加密 payload
    v = Jf(events, {vid, tag, appID, cu:uuid, cs:l, pc:h})

    // 4. 组装 POST 参数数组
    p = [payload=v, appId, tag, uuid, ft, seq++, en="NTA", bi]
    if cs → p.push(cs)
    if pc → p.push(pc)
    p.push(sid=uuid+hh(ni()))   // sid + 隐写
    p.push(vid, ci, pxhd, cts, hid, pxac, rsc)
    return p
}
```

#### cs 来源: 服务器下发 (NOT 客户端计算!)

```
ob 响应 → atob → XOR(120) → split("~~~~")
   → segment[5] = III000 handler
      → qa = t  (存储 challenge hash)

mh() → l = Ho() → return qa
     → p.push("cs=" + l)
```

**cs 是 ob 响应中 III000 segment 给的 challenge hash** (64 hex chars, SHA-256)。
这就是为什么 `sha256(payload)` 等测试都不匹配 — 它根本不是客户端算的。

#### pc 计算: HMAC-MD5 变体 (line 596)

```javascript
// jt(data, salt) — line 596
function jt(t, e) {
    n = R(t, e)       // = hex(HMAC-MD5(salt=e, data=t)), 32 hex chars
    // 处理每个字符:
    //   digit (0-9, ascii 48-57) → 原样保留到 e
    //   letter (a-f) → charCode % 10 到 n  (a→7, b→8, c→9, d→0, e→1, f→2)
    // 拼接: digits + converted
    // 间隔取: result[0], result[2], result[4], ...
    return processed  // ~16 chars
}

// 调用: jt(it(events), "uuid:tag:ft")
// salt = "eb30dfdf-11c5-11f1-...:O2MKZn0OEhI/ag==:388"
```

#### Jf() Payload 加密 + 字符交织 (line 3128)

```javascript
Jf(events, config):
  // 1. 获取交织密钥串 (20 chars)
  o = ee(Q(ni()), 10)              // base64(服务器时间戳) XOR(10) → 密钥串

  // 2. 序列化 + 加密
  a = Q(ee(it(events), 50))        // JSON → XOR(50) → base64

  // 3. 用 UUID 生成插入位置数组 (jf="cu", config.cu=uuid)
  c = getOffsets(o.length, a.length, config[jf])

  // 4. 交织: 把密钥串字符按位置插入到 base64 payload 中
  a = interleave(o, a, c)          // o[i] 插入到位置 c[i]-1

  return a   // 最终 payload 参数值
```

> **关键**: payload 参数不是纯 `base64(XOR(JSON, 50))`!
> 还有一层字符交织 — 密钥串的字符按 UUID 计算的位置插入到 base64 编码中。
> 解密时需先去除交织字符: 从后往前 splice(offsets[i]-1, 1)。

#### sid 隐写编码 (line 4366)

```javascript
// hh(t) — line 4366: 将字符串编码为 Unicode Tag Characters
function hh(t) {
    return t.split("").reduce((acc, ch) => {
        hex = ch.codePointAt(0).toString(16).padStart(2, "0")
        return acc + unescape("%uDB40%uDC" + hex)  // U+E0000 系列
    }, "")
}

// ni() 返回 XOR key (no 变量, 50 for bundle)
// hh("50") → U+E0035 U+E0030 → 两个不可见 Unicode 字符

// sid = uuid + hh(ni())
// 实际观察: sid UUID 后附加了 cts 时间戳的隐写编码
// U+E0131='1', U+E0132='2', ..., U+E0139='9'
```

#### /ns 接口 (非 cs 来源!)

```
GET https://tzm.px-cloud.net/ns?c=PXO1GDTa7Q
  → 返回: "2qWXVXCIYzzIizvyGFRN..." (token 字符串)
  → 存储: Sm = responseText

用途: 放入 payload 事件字段 (k.d[M(d)] = Sm), NOT cs 参数
```

### 4.5 Bundle #1 Response: 获取挑战参数

```
POST → /assets/js/bundle
  │
  ▼
Response JSON {"ob": "MTExSDEx..."}
  │
  ▼ decodeOb()
  │
  ├── base64 decode
  ├── XOR(120)
  ├── split("~~~~")
  │
  ▼
13 个指令段 → ih() 处理
  │
  ├── [cc段先执行] 段0 I0I000: jf="cu"
  ├── 段1 0IIII0: to=sessionId
  ├── 段2 0III0I0I: no=timestamp
  ├── 段3 II00II: $a=appId
  ├── 段4 0III0I00: ao="401"
  ├── 段5 III000: qa=challengeHash
  ├── 段6 0II0III0: 视觉挑战参数
  ├── 段7 I0I0I0: PoW 直接求解 → Bs()
  ├── 段8 0II0I0: PoW via qu() → os()
  ├── 段9 IIIIII: cookie cc (deferred)
  ├── 段10 IIIIII: cookie rf
  ├── 段11 IIIIII: cookie fp
  └── 段12 II0III: config
```

### 4.6 Bundle #2 Request: 提交 PoW + 浏览器指纹 (已逆向!)

#### 4.6.1 POST 参数 (vs Bundle #1 差异)

| 参数 | Bundle #1 | Bundle #2 | 说明 |
|------|-----------|-----------|------|
| `payload` | 16字段, ~1KB | **80+字段, ~7.5KB** | **大量浏览器指纹** |
| `seq` | 0 | **3** | 递增 |
| `rsc` | 1 | **2** | 递增 |
| `cts` | UUID 格式 | **时间戳 ms** | 变为 `1771967728434` |
| `cs` | 无 | **64 hex chars** | **新增! 服务器下发的 challenge hash** |
| `ci` | 无 | **UUID** | **新增! challenge ID** |
| `sid` | 纯 UUID | **UUID + 隐写数字** | **附加 Unicode Tag Characters 编码 cts** |

#### 4.6.2 sid 隐写机制 (已确认!)

```
sid = "51338389-11b8-11f1-bb6d-13e608bfecce" + 隐写字符

隐写字符 (Unicode Tag Characters, U+E0100 系列):
  U+E0131 → '1'    ┐
  U+E0137 → '7'    │
  U+E0137 → '7'    │
  U+E0131 → '1'    │
  U+E0139 → '9'    │  → "1771967728434"
  U+E0136 → '6'    │     = cts 时间戳!
  U+E0137 → '7'    │
  U+E0137 → '7'    │
  U+E0132 → '2'    │
  U+E0138 → '8'    │
  U+E0134 → '4'    │
  U+E0133 → '3'    │
  U+E0134 → '4'    ┘

matches_cts: true ← 隐写数字 === cts 参数
```

#### 4.6.3 Bundle #2 Payload: 浏览器指纹 (80+ 字段)

解密后 JSON 为单事件, `t="Z19WXSE3WW8="`, `d` 包含:

| 字段值 | 来源 API | 类型 |
|--------|----------|------|
| `1771967728434` | `Date.now()` | 时间戳 |
| `["PDF Viewer",...]` | `navigator.plugins` | 插件列表 |
| `5` | `navigator.plugins.length` | 插件数 |
| `"zh-CN"` | `navigator.language` | 语言 |
| `"Win32"` | `navigator.platform` | 平台 |
| `["zh-CN","en","en-GB","en-US"]` | `navigator.languages` | 语言列表 |
| `"Mozilla/5.0 ... Edg/145.0.0.0"` | `navigator.userAgent` | UA |
| `-480` | `new Date().getTimezoneOffset()` | 时区偏移 |
| `"Gecko"` | `navigator.product` | 产品名 |
| `"20030107"` | `navigator.productSub` | 产品版本 |
| `"Netscape"` | `navigator.appName` | 应用名 |
| `"Mozilla"` | `navigator.appCodeName` | 代码名 |
| `"4g"` | `navigator.connection.effectiveType` | 网络类型 |
| `"x86"` / `"64"` | `navigator.userAgentData` | CPU 架构 |
| `[{brand:"Not:A-Brand",...}]` | `navigator.userAgentData.brands` | UA brands |
| `"Windows"` / `"19.0.0"` | `navigator.userAgentData.platform/Version` | 平台详情 |
| `1920` / `1080` | `screen.width/height` | 屏幕分辨率 |
| `1032` | `screen.availHeight` | 可用高度 |
| `32` | `screen.colorDepth` | 色深 |
| `"1920X1080"` | 拼接字符串 | 分辨率字符串 |
| `420` / `948` | `window.innerWidth/Height` | 窗口尺寸 |
| `"49e5084e"` | Canvas fingerprint hash | 指纹 |
| `"7c5f9724"` | WebGL fingerprint hash | 指纹 |
| `"65d826e0"` / `"a9269e00"` 等 | 多种指纹 hash | 指纹 |
| `"14249163045908910745"` | Canvas MurmurHash | 画布指纹 |
| `"C0{U3vpN.4srm"` | 未知编码 | 可能是压缩指纹 |
| `"Asia/Shanghai"` | `Intl.DateTimeFormat().resolvedOptions().timeZone` | 时区 |
| `"w3c"` | DOM 规范检测 | 标准 |
| `"screen"` | Visibility API | 可见性 |
| `{plugext:{...},plugins_len:5}` | 详细插件信息 | 嵌套对象 |
| `{smd:{ok:true,ex:false}}` | Shadow DOM 检测 | 嵌套对象 |
| `"f49f18dbec5558a76..."` | 完整性 hash | 32 hex |
| `"TypeError: Cannot read..."` | 错误堆栈 (故意触发) | 反调试 |
| `"PX11745"` / `"pxhc"` | PX key 引用 / cookie 类型 | 标识 |
| `779.1` | Performance timing | 毫秒 |
| `"4a456c59afc2be50..."` | **_pxhd cookie hash + 加密数据** | 大块二进制 |
| `"2qWXVXCIYzzI..."` (via /ns) | **/ns 接口返回的 token** | 网络指纹 |

> **注意**: payload 中 index 4049 之后出现约 3500 字节的"二进制数据",
> 实际是 Jf() 交织插入的 XOR 密钥字符串字符 + _pxhd cookie 中的非 ASCII 数据。

#### 4.6.4 Bundle #2 Response

```
POST → /assets/js/bundle (带 PoW answer + 浏览器指纹)
  │
  ▼
Response JSON {"ob": "MTExSDEx..."}
  │
  ▼ decodeOb()
  │
  ├── 段0 III0II: _px3 cookie (name, ttl=330, value, secure, maxAge=300)
  └── 段1 I0I000: jf="cu"
```

### 4.7 Bundle #3: 用户按压 → 最终验证

**(待分析)** — 用户按压验证按钮后发送，包含:
- 按压坐标/轨迹数据
- WASM 计算结果 (PX12590, PX12610)
- 可能包含视觉挑战答案

---

## 五、ob 响应解码链

### 5.1 完整流程

```
JSON 响应
  │
  ├── 检查 .do 字段 (优先)
  ├── 检查 .ob 字段
  │
  ▼ Step 1: Base64 decode
atob(obValue)
  │
  ▼ Step 2: XOR 解码
ee(decoded, key=120)
  │
  ▼ Step 3: 分割
xored.split("~~~~")       // 4个波浪号!
  │
  ▼ Step 4: 解析每段
segment.split("|")
  → fields[0] = handler key (shift 取出)
  → fields[1..] = 参数列表
```

### 5.2 XOR Key 计算

```
Et() = "DhY8E0h7J2cKHw=="                          ← 硬编码常量

ml("DhY8E0h7J2cKHw=="):
  for each char:
    hash = (31 * hash + charCode) % 2147483647
  return (hash % 900 + 100).toString()
  → "888"

XOR key = parseInt("888", 10) % 128 = 120
```

### 5.3 关键函数源码

```javascript
// ml(): 哈希函数 → 3位数字字符串
function ml(t) {
    for (var e = 0, n = 0; n < t.length; n++) {
        e = (31 * e + t.charCodeAt(n)) % 2147483647;
    }
    return (e % 900 + 100).toString();
}

// ee(): XOR 解码
function ee(t, e) {
    for (var n = '', i = 0; i < t.length; i++) {
        n += String.fromCharCode(t.charCodeAt(i) ^ e);
    }
    return n;
}
```

### 5.4 分隔符推导

```
"~~~~" = 0x7E 0x7E 0x7E 0x7E
XOR(120) 后: 0x06 0x06 0x06 0x06
所以在原始 base64 解码后的数据中看到的是 0x06 连续4字节
```

---

## 六、ih 段处理器

### 6.1 位置: main.js:4310-4339

```javascript
function ih(segments, isDo) {
    // isDo=false → Ql 注册表 (ob 响应)
    // isDo=true  → jl 注册表 (do 响应)
    var registry = isDo ? jl : Ql;
    var deferred = null;
    var queue = [];

    for (var i = 0; i < segments.length; i++) {
        var fields = segments[i].split("|");
        var handlerKey = fields.shift();     // ← 第一个字段
        var handler = registry[handlerKey];

        if (fields[0] === "cc") {            // 延迟标记
            deferred = {key: handlerKey, args: fields};
            continue;
        }

        if (typeof handler === "function") {
            queue.push({key: handlerKey, args: fields});
        }
    }

    if (deferred) queue.unshift(deferred);   // cc 段放到最前面

    // 按队列顺序执行
    for (var j = 0; j < queue.length; j++) {
        registry[queue[j].key].apply(ctx, queue[j].args);
    }
}
```

### 6.2 "cc" 机制详解

```
来源: Rr[Te] = J("Y2M=") → atob("Y2M=") → "cc"

作用: 当段的第一个参数是 "cc" 时:
  1. 该段从正常队列中移除
  2. 存为 deferred
  3. 执行前 unshift 到队列头部 → 最先执行

实际效果: I0I000 段 (jf="cu") 标记了 "cc"，所以它在所有其他段之前执行
```

### 6.3 执行顺序示例 (Bundle #1)

```
原始顺序: [段0(cc), 段1, 段2, ..., 段9(cc), 段10, 段11, 段12]

处理后队列:
  [段0(cc→unshift), 段1, 段2, 段3, 段4, 段5, 段6, 段7, 段8, 段9(如果是最后一个cc则覆盖), 段10, 段11, 段12]

注意: 只有最后一个 "cc" 段会被 deferred (前面的被覆盖)
      但段0的 cc 是唯一的 I0I000 cc，段9的 cc 也是 IIIIII cc
      由于只有一个 deferred 变量，最后的 cc 段会覆盖前面的
```

---

## 七、Ql Handler 注册表 (27个)

### 7.1 位置: main.js:3933-4239

### 7.2 完整映射表

#### 状态设置类

| Key | 函数 | 参数 | 效果 |
|-----|------|------|------|
| `I0I000` | jf = t | (flag) | `jf = "cu"` |
| `0IIII0` | fh(t,e) | (sessionId, extra) | `to = t, eo = e` |
| `0III0I0I` | ch(t) | (timestamp_ms) | `no = t, ro = floor(t/1000)` |
| `II00II` | — | (appId) | `$a = t` |
| `0III0I00` | ah(t) | (statusCode) | `ao = t` |
| `III000` | — | (hash) | `qa = t` |

#### PoW / 挑战类

| Key | 函数 | 参数 | 效果 |
|-----|------|------|------|
| `I0I0I0` | PX1135=Bs | (enabled, suffix, targetHash, difficulty, isTrusted) | **直接调用 Bs 求解 PoW** |
| `0II0I0` | qu→os→Bs | (enabled, uuid, port, challengeData, extra, tag) | **via qu() 调用 PoW** |
| `0II0III0` | — | (startW, startH, wJump, hJump, hash) | **视觉挑战参数 PX12634** |

#### Cookie / Storage 类

| Key | 函数 | 参数 | 效果 |
|-----|------|------|------|
| `IIIIII` | Xr(true, {...}) | (featureName, ttl, args) | 存储 cookie 配置到 Mr |
| `III0II` | **oh()** | (name, ttl, value, secure, maxAge) | **写入 _px3 cookie** |
| `II0III` | — | (configStr) | 解析 "key:val,key:val" 配置 |
| `I0III0` | rh() | (value) | localStorage 写入 |
| `0III0II0` | hr+Ao | (key, ttl, value, param, extra) | 存储 TTL + 触发 "si" 事件 |
| `0II0II0I` | — | (value) | localStorage 写入 #2 |
| `I000II` | sr(go) | - | 删除指定 cookie |

#### DOM / 导航类

| Key | 函数 | 参数 | 效果 |
|-----|------|------|------|
| `IIII00` | — | (id, tagName, name, className) | 创建隐藏 DOM 蜜罐 |
| `00I0I0` | — | (url, ttl, param) | 重定向/导航 |
| `000II0` | — | (flag) | URL 加时间戳或 reload |
| `0II0IIII` | — | (scriptUrl) | 动态加载 `<script>` |

#### 事件 / 控制类

| Key | 函数 | 参数 | 效果 |
|-----|------|------|------|
| `I0I00I` | Ao.trigger | (event, ...args) | 触发事件回调 |
| `00II00` | Rf("report") | (type, data, code) | 上报日志 |
| `0III00I0` | PX764 | (data) | $u 调用 |
| `IIIII0` | — | - | PX 控制 (th=true) |
| `I000I0` | Gf() | - | 重置 |

#### 无操作

| Key | 函数 | 参数 | 效果 |
|-----|------|------|------|
| `0I0II0` | noop | - | 无 |
| `0II00I` | noop | - | 无 |

### 7.3 Handler Key 命名规则

- 使用 `I` 和 `0` 的二进制风格
- 长度: 6 字符或 8 字符
- 6字符: `I0I000`, `0IIII0`, `III0II`, `IIIIII`, `II00II`, `II0III`, `III000`, `I0III0`, `IIII00`, `00I0I0`, `I0I00I`, `00II00`, `000II0`, `0I0II0`, `0II00I`, `I000I0`, `I000II`, `IIIII0`, `I0I0I0`, `0II0I0`
- 8字符: `0III0I0I`, `0III0I00`, `0II0III0`, `0III0II0`, `0III00I0`, `0III0000`, `0II0IIII`, `0II0II0I`

---

## 八、Bundle #1 响应完整解析

### 8.1 原始数据

```json
{"do":null,"ob":"MUgxSEhIBBsNBgYGBkgxMTExSARMSUFJTkhBTU1O..."}
```

### 8.2 解码后 13 段详情

```
段 0: I0I000|cc|cu
  → handler: 设置 jf
  → "cc" 标记 → 延迟执行 (但 unshift 后最先执行)
  → jf = "cu"

段 1: 0IIII0|41916095560041989364
  → handler: fh (session ID)
  → to = "41916095560041989364"

段 2: 0III0I0I|1771962830422
  → handler: ch (时间戳)
  → no = "1771962830422" (毫秒)
  → ro = 1771962830 (秒)

段 3: II00II|d6f03jmq8h6c7382req0
  → handler: App ID
  → $a = "d6f03jmq8h6c7382req0"

段 4: 0III0I00|401
  → handler: ah (状态码)
  → ao = "401"

段 5: III000|4481f3f71e53718b3e58d5ac1bc5cedf49ea4e0e4a8db4a2dfa2c81ea0d203bc
  → handler: challenge hash
  → qa = 64字符 SHA-256

段 6: 0II0III0|27|57|1|4|440be290d8e710ca5c9024316a6f6c25bb6fef14a42ec2eca1efdd04c53c2490
  → handler: 视觉挑战参数
  → startWidth=27, startHeight=57, wJump=1, hJump=4
  → hash = SHA-256

段 7: I0I0I0|1|ab317b680dfb5a3dc7c52a4fefedce5adb20cedd066ce5408ce6887aee9c|7bb57f904e7b938c8442e522a97d754d23a35964a1030857244c7d2c803a1169|16|false
  → handler: PoW 启动
  → enabled="1", suffix(60chars), targetHash(64chars), difficulty="16", isTrusted="false"
  → 参数重排后调用: Bs(targetHash, suffix, "16", false)

段 8: 0II0I0|1|8a213f60-11ba-11f1-a1d1-b7af17455ae4|8588|7bb57f904e7b938c8442e522a97d754d23a35964a1030857244c7d2c803a1169_?::<|1|
  → handler: qu PoW 执行
  → uuid="8a213f60-...", port="8588"
  → challengeData: "hash_encodedSuffix"
  → encodedSuffix "?::<" XOR(10) = "5002"
  → Lu = uuid

段 9: IIIIII|cc|60|U2FtZVNpdGU9TGF4Ow==
  → handler: cookie 配置
  → ff="cc", ttl=60, args=base64("SameSite=Lax;")
  → "cc" 标记 → 延迟执行

段 10: IIIIII|rf|60|1
  → handler: cookie 配置
  → ff="rf", ttl=60, args="1"

段 11: IIIIII|fp|60|1
  → handler: cookie 配置
  → ff="fp", ttl=60, args="1"

段 12: II0III|ccc:0,ic:0,nf:0,ai:0,ai:0
  → handler: 逗号分隔配置
  → ccc=0, ic=0, nf=0, ai=0
```

### 8.3 执行后全局状态

```javascript
jf  = "cu"
to  = "41916095560041989364"
no  = "1771962830422"
ro  = 1771962830
ao  = "401"
qa  = "4481f3f71e53718b3e58d5ac1bc5cedf49ea4e0e4a8db4a2dfa2c81ea0d203bc"
$a  = "d6f03jmq8h6c7382req0"
Lu  = "8a213f60-11ba-11f1-a1d1-b7af17455ae4"
Mr  = {cc: "U2FtZVNpdGU9TGF4Ow==", rf: "1", fp: "1", ccc: "0", ic: "0", nf: "0", ai: "0"}
```

---

## 九、PoW (Proof of Work) 算法完整还原

### 9.1 触发链

```
Bundle #1 段7 (I0I0I0 handler)
  │
  ├── 检查: enabled === "1" ✓
  │
  ├── 参数重排:
  │     handler 接收: (t, e, n, r, a)
  │     即:         (enabled="1", suffix, targetHash, difficulty="16", isTrusted="false")
  │     调用 Bs:    (n=targetHash, e=suffix, r="16", a==="true"→false)
  │
  ▼
PX1135(targetHash, suffix, "16", false)
  = PX762(targetHash, suffix, "16", false)
  = Bs(targetHash, suffix, "16", false)
  │
  ▼
Bs 内部:
  m = ceil(+"16" / 4) = 4          // hex 位数
  padding = "0000"
  mask = (1 << 4*4) - 1 = 65535    // 16位掩码
  lastHexDigit = parseInt(suffix最后一字符, 16)
  prefix = suffix.slice(0, -1)
  maxCounter = 1 << 16 = 65536
  │
  ├── 浏览器环境: 创建 Web Worker (Ks)
  │     Blob URL → Worker → ws() 循环
  │
  └── Node.js/降级: setTimeout 循环
        │
        ▼
      poi(counter, mask, padding, m, lastHexDigit, prefix, 0, targetHash)
```

### 9.2 Bs 函数完整源码 (反混淆)

```javascript
function Bs(r, n, t) {
    // r = targetHash (64字符 SHA-256)
    // n = suffix (60字符 hex)
    // t = difficulty (字符串, +"16" → 16)
    // arguments[3] = isTrusted (boolean, 可选)

    var m = Math.ceil(+t / 4);              // hex 位数 = 4
    var o = "0".repeat(m);                  // "0000"
    var D = (1 << 4 * m) - 1;              // mask = 65535
    var i = parseInt("0x" + n.charAt(n.length - 1), 16);  // suffix 最后 hex 字符
    var c = n.slice(0, -1);                 // suffix 去掉最后一字符
    var z = 1 << +t;                        // maxCounter = 65536

    // Web Worker 路径 (浏览器)
    if (typeof Worker !== 'undefined' && !arguments[3]) {
        var worker = Ks();  // 创建 Blob URL Worker
        // Worker 内运行 ws(0, z, D, o, m, i, c, r, startTime)
        // 找到后调用 Ts(answer, elapsed) 存储结果
        // 然后调用 PX763(ds) 回调
    }
    // setTimeout 路径 (降级)
    else {
        for (var counter = 0; counter < z; counter++) {
            var result = poi(counter, D, o, m, i, c, 0, r);
            if (result) {
                Ts(result, Date.now() - startTime);
                // PX763 回调
                return;
            }
        }
    }
}
```

### 9.3 poi 函数源码 (captcha.js:7165-7170)

```javascript
function poi(r, n, u, t, v, e, f, s) {
    // r = counter          n = mask (65535)
    // u = padding ("0000") t = hex digits (4)
    // v = lastHexDigit     e = prefix
    // f = 未使用 (0)       s = targetHash

    var m = (u + (r & n).toString(16)).slice(-t);
    //     = ("0000" + (counter & 65535).toString(16)).slice(-4)
    //     = 4位 hex 的 counter 低位

    var o = e + (v + (r >> (t << 2))).toString(16) + m;
    //     = prefix + (lastHex + (counter >> 16)).toString(16) + lowPart
    //     对于 difficulty=16: counter >> 16 = 0, 所以 = prefix + lastHex + lowPart
    //     即: suffix + counter的4位hex

    if (sha256(o) === s) return o;
    //     sha256(candidate) === targetHash → 返回答案
}
```

### 9.4 简化理解 (difficulty=16)

```
对于 difficulty=16, counter < 65536:
  counter >> 16 = 0 (始终为0)
  candidate = prefix + lastHexDigit.toString(16) + hex(counter, 4位)
            = suffix + hex(counter).padStart(4, '0')

本质上就是:
  for counter in 0..65535:
    if sha256(suffix + counter_hex_4位) === targetHash:
      return suffix + counter_hex_4位
```

### 9.5 Node.js 求解器

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
    const start = Date.now();

    for (let r = 0; r < maxCounter; r++) {
        const lowPart = (padding + (r & mask).toString(16)).slice(-m);
        const candidate = prefix + (lastHexDigit + (r >> (m << 2))).toString(16) + lowPart;
        if (sha256(candidate) === targetHash) {
            return { answer: candidate, counter: r, elapsed: Date.now() - start };
        }
    }
    return null;
}
```

### 9.6 验证实例

```
输入:
  suffix     = "ab317b680dfb5a3dc7c52a4fefedce5adb20cedd066ce5408ce6887aee9c"
  targetHash = "7bb57f904e7b938c8442e522a97d754d23a35964a1030857244c7d2c803a1169"
  difficulty = 16

输出:
  answer  = "ab317b680dfb5a3dc7c52a4fefedce5adb20cedd066ce5408ce6887aee9c24da"
  counter = 9434   (0x24da)
  elapsed = 9ms

验证: sha256(answer) === targetHash ✓
```

### 9.7 Web Worker 路径 (浏览器)

```javascript
// Ks(): 创建 Blob URL Web Worker
function Ks() {
    var code = [sha256源码, poi源码, ws源码].join('\n');
    var blob = new Blob([code], {type: 'application/javascript'});
    return new Worker(URL.createObjectURL(blob));
}

// ws(): Worker 内循环
function ws(start, end, mask, padding, m, lastHex, prefix, targetHash, startTime) {
    for (var i = start; i < end; i++) {
        var result = poi(i, mask, padding, m, lastHex, prefix, 0, targetHash);
        if (result) {
            postMessage({answer: result, elapsed: Date.now() - startTime});
            return;
        }
    }
}
```

### 9.8 两条 PoW 路径对比

| | I0I0I0 (段7) | 0II0I0 (段8) |
|---|---|---|
| **Handler key** | I0I0I0 | 0II0I0 |
| **调用方式** | 直接调用 PX1135(Bs) | qu() → os() → PX762(Bs) |
| **参数来源** | 段字段直接传入 | challengeData XOR(10) 解码 |
| **回调设置** | 无 | PX763=ds, PX1078=rs, PX1200=ts, PX1145=zu |
| **是否主路径** | ✓ 主路径 | 备用/补充路径 |

---

## 十、Bundle #2 响应解析

### 10.1 原始数据

```json
{"do":null,"ob":"MTExSDExBCcIAEsES0tIBBxBS0Aa..."}
```

### 10.2 解码后 2 段

```
段 0: III0II|_px3|330|2d8e5eafe6b58c6f26...(长cookie值)|true|300
  → handler: oh() — 设置 _px3 cookie
  → name = "_px3"
  → ttl = 330 秒
  → value = 加密的 cookie 值 (很长)
  → secure = "true"
  → maxAge = 300

段 1: I0I000|cu
  → handler: 设置 jf
  → jf = "cu"
```

### 10.3 oh() 函数 (main.js:4276-4309)

```javascript
"III0II": function(cookieName, ttl, cookieValue, secure, maxAge) {
    // 1. 触发 "sc" 事件
    Ao.trigger("sc", cookieValue, cookieName, ttl, maxAge);

    // 2. 写入 cookie
    hr(cookieName, ttl, cookieValue, secure);

    // 3. 写入 localStorage
    //    localStorage["x-px-cookies"] = JSON.stringify({_px3: cookieValue})
}
```

### 10.4 _px3 Cookie 结构

```
格式: hash:base64data:ttl:signature
示例: "2d8e5e:aGVsbG8=:330:c2lnbg=="
```

---

## 十一、WASM 集成

### 11.1 WASM 在 Bundle 中的角色

```
captcha.js 加载时:
  1. Us() 数组第 [10] 个元素 = WASM 二进制 (编码后)
  2. 解码链: ksXWzSIG(customB64 + URI decode) → 或其他路径
  3. WebAssembly.instantiate(wasmBytes, imports) → 得到 ys (WASM 实例)
  4. 注册导出函数:
     - ys.a() → PX12590 (指纹生成)
     - ys.b(input) → PX12610 (挑战处理)
```

### 11.2 WASM 导出函数

**a() → PX12590**: 无参数，返回字符串
```javascript
function wasmA() {
    const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
    wasm.a(retptr);
    return getStringFromWasm0(retptr);
    // 返回: SHA-256 格式的 hash 字符串
}
```

**b(input) → PX12610**: 接收字符串，返回字符串
```javascript
function wasmB(input) {
    const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
    const ptr = passStringToWasm0(input);
    wasm.b(retptr, ptr, len);
    return getStringFromWasm0(retptr);
    // input 通常是 Es (PoW answer 或 challenge hash)
}
```

### 11.3 WASM 二进制提取

```
位置: captcha.js 内 Us() 函数的数组第 [10] 个元素
大小: 约 60862 bytes
编码: 自定义 base64 (小写字母在前的字母表) + URI decode

自定义 base64 字母表:
  标准: ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=
  PX:   abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789+/=
```

### 11.4 wbg 导入 (WASM 需要的浏览器环境)

```javascript
const imports = { wbg: {
    // 字符串操作
    __wbindgen_string_new(ptr, len),        // UTF-8 → JS string
    __wbindgen_string_get(retptr, idx),     // JS string → WASM memory

    // 对象操作
    __wbg_get_e6ae480a4b8df368(objIdx, keyPtr, keyLen),  // obj[key]
    __wbindgen_object_drop_ref(idx),        // 释放引用

    // 环境检测
    __wbg_instanceof_Window_e266f02eee43b570(idx),  // 必须返回 1
    __wbg_crypto_c48a774b022d20ac(idx),    // crypto 对象
    __wbg_require_8f08ceecec0f4fee(),       // Node.js require

    // 随机数
    __wbg_getRandomValues_37fa2ca9e4e07fab(cryptoIdx, arrIdx),
    __wbg_randomFillSync_dc1e9a60c158336d(cryptoIdx, arrIdx),

    // 函数调用
    __wbg_newnoargs_2b8b6bd7753c76ba(ptr, len),     // new Function(code)
    __wbg_call_95d1ea488d03e4e8(fnIdx, thisIdx),     // fn.call(this)
    __wbg_call_9495de66fdbe016b(fnIdx, thisIdx, arg), // fn.call(this, arg)

    // 全局对象
    __wbg_self_e7c1f827057f6584(),
    __wbg_window_a09ec664e14b1b81(),
    __wbg_globalThis_87cbb8506fecf3a9(),

    // TypedArray
    __wbg_buffer_cf65c07de34b9a08(idx),
    __wbg_newwithbyteoffsetandlength_9fb2f11355ecadf5(bufIdx, offset, len),
    __wbg_new_537b7341ce90bb31(bufIdx),
    __wbg_set_17499e8aa4003ebd(arrIdx, srcIdx, offset),

    // 内存
    __wbindgen_memory(),
}};
```

### 11.5 关键发现: _pxUuid

```javascript
// WASM 的 b() 函数依赖 window._pxUuid
// 不设置则返回空字符串
globalThis._pxUuid = 'session-uuid-here';
```

### 11.6 WASM 提取路径 (extract_wasm.js)

尝试了 10 种解码路径:
1. ksXWzSIG (custom b64 + URI decode)
2. ksXWzSIG → standard atob
3. ksXWzSIG → u() (atob + XOR "zSLyhtf")
4. Standard atob
5. u() (atob + XOR)
6. u() → atob
7. ksXWzSIG → u() → atob
8. Standard b64 alphabet + URI decode
9. Custom b64 (no URI step)
10. Standard atob (no URI step)

WASM magic bytes: `\0asm` = `0x00 0x61 0x73 0x6D`

---

## 十二、全局状态变量

### 12.1 由 Handler 设置的变量

| 变量 | 设置者 | 类型 | 示例值 | 用途 |
|------|--------|------|--------|------|
| `jf` | I0I000 | string | "cu" | 控制标志 |
| `to` | 0IIII0 | string | "41916095560041989364" | Session/Tracking ID |
| `eo` | 0IIII0 | string | - | fh 第二参数 |
| `no` | 0III0I0I | string | "1771962830422" | 时间戳 (ms) |
| `ro` | 0III0I0I | number | 1771962830 | 时间戳 (秒) |
| `ao` | 0III0I00 | string | "401" | HTTP 状态码 |
| `qa` | III000 | string | "4481f3...03bc" | Challenge hash (SHA-256) |
| `$a` | II00II | string | "d6f03jmq8h6c7382req0" | App ID |
| `Lu` | 0II0I0 | string | "8a213f60-..." | PoW UUID |
| `Mr` | IIIIII/II0III | object | {cc:"...", rf:"1"} | Cookie 配置存储 |

### 12.2 由 Collector 设置的变量

| 变量 | 来源 | 类型 | 用途 |
|------|------|------|------|
| `bt` | VID cookie | string | Visitor ID |
| `mt` | 时间戳 | string | 时间戳字符串 |

### 12.3 PoW 内部变量

| 变量 | 位置 | 类型 | 用途 |
|------|------|------|------|
| `Es` | captcha.js | string | PoW 答案 (candidate) |
| `Js` | captcha.js | number | PoW 耗时 (ms) |

---

## 十三、Cookie / Storage 机制

### 13.1 hr(): Cookie 写入 (main.js:1012-1034)

```javascript
function hr(cookieName, ttl, value, domain) {
    // ttl: 数字(秒) 或 日期字符串
    var maxAge = String(ttl);
    var expires = new Date(Date.now() + 1000 * ttl).toUTCString();

    var cookie = cookieName + "=" + value
        + "; max-age=" + maxAge
        + "; expires=" + expires
        + "; path=/";

    if (domain === true || domain === "true") {
        cookie += "; domain=." + er();  // er() 返回顶级域名
    }

    cookie += "; " + lr();  // lr() 返回 SameSite 等配置

    document.cookie = cookie;
}
```

### 13.2 sr(): Cookie 删除 (main.js:1002-1005)

```javascript
function sr(cookieName) {
    hr(cookieName, -90000, '', true);   // 带 domain
    hr(cookieName, -90000, '', false);  // 不带 domain
}
```

### 13.3 Xr(): Cookie 配置存储 (main.js:1171-1187)

```javascript
function Xr(isFlag, config) {
    // config = {ff: featureName, ttl: seconds, args: value}
    Mr[config.ff] = isFlag ? config.args : '1';

    if (config.ttl > 0) {
        // 存入 localStorage key="px-ff"
        // Sr("px-ff", { [config.ff]: { ttl: Date.now() + ttlMs, val: value } })
    }
}
```

### 13.4 oh(): 设置 _px3 cookie (main.js:4276-4309)

```javascript
function oh(cookieName, ttl, cookieValue, secure, maxAge) {
    // 1. 触发事件
    Ao.trigger("sc", cookieValue, cookieName, ttl, maxAge);

    // 2. 写入 cookie
    hr(cookieName, ttl, cookieValue, secure === "true");

    // 3. 同时存入 localStorage
    //    key: "x-px-cookies"
    //    value: JSON.stringify({_px3: cookieValue})
}
```

### 13.5 localStorage 交互

```
写入点:
  - I0III0 handler → zl.setItem(Io, value)    // Io = 某个 key
  - 0II0II0I handler → zl.setItem(So, value)  // So = 某个 key
  - oh() → localStorage["x-px-cookies"] = {_px3: value}

读取点:
  - Cookie hook (cookie_hook.js) 用 Tampermonkey 拦截 document.cookie setter
  - 当 cookie name === "_px3" 时断住并打印堆栈
```

---

## 十四、事件回调系统 Ao

### 14.1 定义 (main.js:891-928)

```javascript
const Ao = {
    channels: {},

    on(event, fn, ctx)  { this.subscribe(event, fn, ctx, false); },
    one(event, fn, ctx) { this.subscribe(event, fn, ctx, true); },
    off(event, fn)      { /* 移除监听 */ },

    subscribe(event, fn, ctx, once) {
        this.channels[event] = this.channels[event] || [];
        this.channels[event].push({fn, ctx, once});
    },

    trigger(event, ...args) {
        var handlers = this.channels[event];
        if (!handlers) return;

        while (handlers.length > 0) {
            var h = handlers.shift();
            h.fn.apply(h.ctx, args);
            if (!h.once) remaining.push(h);
        }
        this.channels[event] = remaining;
    }
};
```

### 14.2 事件列表

| 事件名 | 触发者 | 参数 | 用途 |
|--------|--------|------|------|
| `"sc"` | oh() / III0II handler | (cookieValue, name, ttl, maxAge) | Cookie 设置完成 |
| `"si"` | 0III0II0 handler | (value, key, ttl, extra) | 存储完成 |
| 自定义 | I0I00I handler | (event, ...args) | 动态触发 |

### 14.3 上报系统 Rf

```javascript
let If = 0;  // 递增序号
const Sf = [];  // 发送队列
const Tf = [];  // 待发送队列

function Rf(type, data) {
    data["ZHgWeiIcE0o="] = If++;          // 序号 (base64 编码的 key)
    data["GU1rT18laH0="] = Date.now();    // 时间戳
    // 判断 wf(type, data) 是否可以立即发送
    // 可以 → Sf 队列, 否则 → Tf 队列
    Sf.push({t: type, d: data, ts: Date.now()});
}
```

---

## 十五、captcha.js 关键函数

### 15.1 位置与功能

| 函数 | 行号 | 功能 | 调用关系 |
|------|------|------|----------|
| **sha256()** | ~7000-7164 | 纯 JS SHA-256 | poi() 内使用 |
| **poi()** | 7165-7170 | PoW 单次尝试 | Bs/ws 调用 |
| **ws()** | 7171-7175 | Web Worker 循环 | Worker 内运行 |
| **Ks()** | 7176-7219 | 创建 Web Worker | Bs 调用 |
| **Ts()** | 7406-7410 | 存储 PoW 结果 | `Es=answer, Js=elapsed` |
| **Bs()** | 7411-7524 | **完整 PoW 求解器** | PX1135/PX762 入口 |

### 15.2 captcha handler 对象

```javascript
// 注册位置: captcha.js:10348
window._O1GDTa7Qhandler = {
    PX762:   Bs,       // PoW 求解器
    PX1135:  Bs,       // PoW 入口 (与 PX762 完全相同!)
    PX12634: visual,   // 视觉挑战处理
};
```

### 15.3 main.js 设置的回调

```javascript
// os() 执行时 (main.js:2589-2597) 设置到 captcha handler:
handler.PX763  = ds;     // PoW 完成回调 → 发送结果给服务器
handler.PX1078 = rs;     // 接收时间戳配置 (Wu, Zu, Ou)
handler.PX1200 = ts;     // 事件触发 (Nu)
handler.PX1145 = zu;     // 错误/通知处理
```

### 15.4 关键发现

**PX1135 === PX762 === Bs** — 完全相同的函数，注册了两个名字。

通过浏览器控制台验证:
```javascript
Object.keys(window).filter(k => k.includes('handler'))
// → ["_O1GDTa7Qhandler"]

const h = window._O1GDTa7Qhandler;
Object.keys(h)
// → ["PX762", "PX12634", "PX1135"]

h.PX1135 === h.PX762  // → true
h.PX1135.toString()   // → "function Bs(r,n,t){..."
```

---

## 十六、main.js 关键函数

### 16.1 完整函数索引

| 函数 | 行号 | 功能 | 调用者 |
|------|------|------|--------|
| **Ql** | 3933-4239 | Handler 注册表 (27个) | ih() |
| **ih()** | 4310-4339 | ob 段处理器 | processOb() |
| **oh()** | 4276-4309 | 设置 _px3 cookie | III0II handler |
| **fh()** | 4361 | 设置 to/eo | 0IIII0 handler |
| **ch()** | 4344 | 设置 no/ro | 0III0I0I handler |
| **ah()** | 4273 | 设置 ao | 0III0I00 handler |
| **hr()** | 1012-1034 | Cookie 写入 | oh, sr, 0III0II0 |
| **sr()** | 1002-1005 | Cookie 删除 | I000II handler |
| **Xr()** | 1171-1187 | Cookie 配置存储 | IIIIII, II0III |
| **qu()** | 2537-2542 | PoW 挑战入口 | 0II0I0 handler |
| **os()** | 2589-2597 | PoW worker 启动 | qu() |
| **ss()** | 2610-2612 | PoW 结果回调 | Bs 完成后 |
| **ds()** | 2659-2664 | PX763 回调 | handler.PX763 |
| **zu()** | 2516-2521 | PX1145 通知 | handler.PX1145 |
| **ls()** | 2617-2620 | 获取 captcha 模块 | os, I0I0I0 |
| **bu()** | 2462-2464 | captcha 已加载? | I0I0I0 |
| **Rr** | 1138-1165 | 常量表 ("cc") | ih() |

### 16.2 关键调用链

```
ob 响应处理:
  JSON.parse → decodeOb() → ih() → Ql[handlerKey]()

PoW 路径 A (I0I0I0):
  I0I0I0 handler → bu() → ls() → PX1135(Bs) → poi()

PoW 路径 B (0II0I0):
  0II0I0 handler → ee(suffix, 10) → qu(uuid, port, hash, diff) → os() → PX762(Bs) → poi()

Cookie 设置:
  III0II handler → oh() → Ao.trigger("sc") + hr() → document.cookie

ss() 回调链 (PoW 完成后):
  Bs 完成 → Ts(answer, elapsed) → PX763(ds) → ds() → Nu → 发送 Bundle #2
```

---

## 十七、Payload 加密与 PC 校验

### 17.1 Payload 加密对比

```
                    Collector                         Bundle
加密流程:     JSON → XOR(50) → URL encode      JSON → XOR(50) → base64
              → base64 → 20字符交织              → Jf() 20字符交织
交织key:      ee(Q(ni()), 10) (初始 no 值)      ee(Q(ni()), 10) (服务器时间戳)
偏移key:      UUID → base64 → XOR(10)           UUID → base64 → XOR(10)
去交织:       splice(offsets[i]-1, 1) 从后往前   splice(offsets[i]-1, 1) 从后往前
```

### 17.2 Bundle Jf() 交织算法 (main.js:3128)

```javascript
Jf(events, config):
  // Step 1: 获取密钥串 (o)
  o = ee(Q(ni()), 10)           // ni()=服务器时间戳 → base64 → XOR(10) → 密钥串 (20 chars)

  // Step 2: 基础加密
  jsonStr = it(events)          // 自定义 JSON 序列化 (line 299)
  xored = ee(jsonStr, 50)       // XOR 每字符 ^ 50
  a = Q(xored)                  // base64 编码

  // Step 3: 计算插入位置数组 (key = UUID, NOT appId!)
  //   jf = "cu" (line 3126), config.cu = Xa() = UUID (line 4417)
  h = ee(Q(config[jf]), 10)     // UUID → base64 → XOR(10) → hash 串
  // 第一轮: 找最大乘积 maxProduct
  maxProduct = -1
  for (i = 0; i < o.length; i++):
    row = Math.floor(i / h.length) + 1
    col = i >= h.length ? i % h.length : i
    product = h.charCodeAt(col) * h.charCodeAt(row)
    if product > maxProduct: maxProduct = product

  // 第二轮: 计算偏移量
  indices = []
  for (i = 0; i < o.length; i++):
    row = Math.floor(i / h.length) + 1
    col = i % h.length
    product = h.charCodeAt(col) * h.charCodeAt(row)
    // Qf 线性缩放到 [0, payloadLen-1]
    if product >= a.length:
      product = Qf(product, 0, maxProduct, 0, a.length-1)
      // Qf = Math.floor((t-e)/(n-e)*(a-r)+r)
    // 去重: 冲突则 +1
    while indices.includes(product): product += 1
    indices.push(product)
  indices.sort()

  // Step 4: 交织 (编码方向)
  result = ""
  pos = 0
  for (u = 0; u < o.length; u++):
    result += a.substring(pos, indices[u] - u - 1) + o[u]
    pos = indices[u] - u - 1
  result += a.substring(pos)
  // 结果: o[u] 被插入到 result 的位置 indices[u] - 1

  return result
```

> **关键**: 偏移量 key 是 `config[jf]` = `config.cu` = UUID, **不是 appId!**
> jf 变量在 line 3126 定义为 `"cu"`, 而 Jf() 调用处 (line 4420) 传入 `cu: Xa()` 即 UUID。

> **逆向解密 (去交织)**:
> 1. 用相同算法算出 offsets (key=UUID, payloadLen=交织后总长度)
> 2. 从后往前, 在 `offsets[i] - 1` 位置删除字符 (splice)
> 3. **注意: 是 `offsets[i] - 1`, 因为编码时 `a.substring(pos, n[u]-u-1) + o[u]` 使得 o[u] 落在位置 n[u]-1**

```javascript
// 去交织伪代码
chars = payload.split('')
for (i = offsets.length - 1; i >= 0; i--):
    chars.splice(offsets[i] - 1, 1)    // 关键: offset - 1!
cleanPayload = chars.join('')
// 然后: base64(cleanPayload) → XOR(50) → JSON
```

### 17.2.1 交织 Key (o) 生成逻辑

```
公式: o = ee(Q(ni()), 10) = XOR(base64(服务器时间戳), key=10)

ni() 返回 no, 由 ob 响应通过时间戳 handler 设置:
  ob response → segment → 时间戳 handler → ch(t) → no = t

注意: handler 名称随 PX 脚本版本变化!
  旧版: "0III0I0I": ch (I/0 风格)
  新版: "01101111": ch (0/1 二进制风格)

ch() 定义 (main.js:4344):
  function ch(t) { no = t, ro = Math.floor(parseInt(no) / 1e3) }

生成步骤:
  1. 从 ob 响应对应 segment 获取服务器时间戳 (13位毫秒)
  2. base64(时间戳字符串) → 20 字符
  3. XOR(base64结果, 10) → o (20 字符, 含非 base64 字符如 ^>}` 等)

示例:
  时间戳: 1771985206868
  base64: "MTc3MTk4NTIwNjg2OA=="
  XOR(10): "G^i9G^a>D^C}D`m8EK77" (20 chars)

o.length = 20 (13位时间戳 → base64 固定 20 字符, 含尾部 ==)

解码 Bundle 完整流程:
  1. 解码 ob 响应 → 从时间戳 handler 获取服务器时间戳
  2. 生成 o = ee(Q(时间戳), 10)
  3. 计算 offsets = getOffsets(o.length, payload.length, uuid)
  4. 去交织: 从后往前在 offsets[i]-1 位置删除字符
  5. base64 解码 → XOR(50) → JSON
```

### 17.3 PC 值: HMAC-MD5 变体 (main.js:596)

```
Bundle:    key = "{uuid}:{tag}:{ft}"
Collector: key = "{uuid}:v8.9.6:{ft}"

PC = jt(it(events), key):
  1. n = hex(HMAC-MD5(key, JSON(events)))    → 32 hex chars
  2. 分类每个字符:
     - digit (0-9, ascii 48-57) → 原样存入 digits
     - letter (a-f) → charCode % 10 存入 nums
       (a→7, b→8, c→9, d→0, e→1, f→2)
  3. 拼接: result = digits + nums
  4. 间隔取: return result[0] + result[2] + result[4] + ...
  → 最终约 16 位数字字符串

// R(t, e) = HMAC-MD5 (line 75):
//   无 salt: U(V(t))  → hex(MD5(t))
//   有 salt: U(F(e,t)) → hex(HMAC-MD5(salt=e, data=t))
// M() 函数的魔数 1732584193, -271733879 确认为 MD5
```

### 17.4 CS 值: 服务器下发 (NOT 客户端计算!)

```
cs 来源链:
  ob 响应 → atob → XOR(120) → split("~~~~")
    → segment[5] → III000 handler → qa = value

  mh() 构造时: l = Ho() → return qa → p.push("cs=" + l)

cs 格式: 64 hex chars (SHA-256 hash, 由服务器生成)
cs 用途: 服务器验证客户端确实处理了 ob 响应
```

### 17.5 指纹内部 PC 值

```
PX11804 = HMAC-MD5(user_agent, uuid)     → hex hash (不提取)
PX11746 = HMAC-MD5(user_agent, vid)      → hex hash
PX11371 = HMAC-MD5(user_agent, sid)      → hex hash
```

### 17.6 完整参数来源表

| 参数 | 来源 | 类型 | main.js 变量 |
|------|------|------|-------------|
| payload | `Jf(events, config)` | 客户端生成 | `v` |
| appId | 配置 | 固定值 | `e[yn]` |
| tag | 脚本硬编码 | 固定值 | `e[bn]` = `"O2MKZn0OEhI/ag=="` |
| uuid | `Xa()` | 客户端 UUID | 会话级 |
| ft | 配置 | 固定值 | `e[In]` = `388` |
| seq | `ph++` | 客户端计数器 | 递增 |
| en | 固定 `"NTA"` | base64("50") | XOR key 声明 |
| bi | 脚本硬编码 | 固定值 | `It` = `"GwNqS048KWpd..."` |
| cs | **服务器 ob 响应** | III000 handler | `Ho()` = `qa` |
| pc | HMAC-MD5 | 客户端计算 | `jt(it(t), salt)` |
| sid | UUID + 隐写 | 客户端生成 | `uuid + hh(ni())` |
| vid | visitor ID | 客户端 | `Tt()` |
| ci | challenge ID | 服务器下发 | `as()` |
| cts | 时间戳 | 客户端 | `Ua` |
| rsc | 响应计数 | 客户端 | `++Cm` (追加) |
| /ns token | GET `/ns?c=appId` | 网络指纹 | `Sm` → payload 字段 |

---

## 十八、Mobile SDK 对比

### 18.1 vs Web SDK

| 维度 | Web SDK | Mobile SDK |
|------|---------|------------|
| **AppID** | PXO1GDTa7Q | PXO97ybH4J |
| **端点** | /api/v2/collector | /api/v1/collector/mobile |
| **Payload 类型** | PX12095/PX11590/PX11547 | PX315/PX329 |
| **加密** | XOR(50) + base64 + 交织 | base64 (无 XOR/交织) |
| **PoW** | SHA-256 暴力搜索 | 数学运算 (switch-case) |
| **WASM** | captcha.js 内嵌 | 无 |
| **TLS** | Chrome TLS | okhttp3 TLS |

### 18.2 Mobile PoW 算法

```java
// appc|2|timestamp|hash|n1|n2|n3|n4|n5|n6
// pow(pow(n3, n4, n1, n6), n5, n2, n6)

int pow(int i12, int i13, int i14, int i15) {
    int op = (i15 % 10 != 0) ? i14 % (i15 % 10) : i14 % 10;
    switch (op) {
        case 0: return i13 + i12*i12;
        case 1: return i12 + i13*i13;
        case 2: return i13 * i12*i12;
        case 3: return i13 ^ i12;
        case 4: return i12 - i13*i13;
        case 5: int t = i12+783; return t*t + i13*i13;
        case 6: return i13 + (i12^i13);
        case 7: return i12*i12 - i13*i13;
        case 8: return i13 * i12;
        case 9: return (i13*i12) - i12;
    }
}

// PX257 = ByteBuffer.wrap(modelBytes).getInt() ^ powResult
```

---

## 十九、完整项目文件索引

```
ifood_PerimeterX-WAF_jsReverse/
│
├── main.js                      # PX bundle 主脚本 (10653行, 混淆)
│                                  关键位置: Ql(3933), ih(4310), oh(4276),
│                                  hr(1012), qu(2537), os(2589), ss(2610)
│
├── captcha.js                   # PX captcha 模块 (10492行, 混淆, 文件名每次变!)
│                                  关键位置: sha256(~7000), poi(7165), ws(7171),
│                                  Ks(7176), Bs(7411), registration(10348)
│
├── px_captcha.wasm              # 提取的 WASM 二进制 (~60KB)
│                                  导出: a() → PX12590, b(input) → PX12610
│
├── documents.md                 # 综合技术参考文档 (~1800行)
│
├── BUNDLE_COMPLETE_ANALYSIS.md  # ★ 本文档 — 完整知识网
│
├── CLAUDE.md                    # Claude 项目配置
│
├── js_reverse/
│   ├── ob_handlers.js           # ★ 完整还原: 解码器 + 27个Handler + PoW solver
│   │                              导出: decodeOb, processOb, Ql, ih, solvePow, poi
│   │                              全局状态: jf, to, ao, qa, $a, Lu, Mr
│   │
│   ├── cookie_hook.js           # Tampermonkey 脚本: hook _px3 cookie 写入
│   │                              拦截 document.cookie setter + cookieStore.set
│   │
│   ├── 第三个接口复用.js          # Collector #3 请求分析
│   │
│   └── 多维度对比collect请求链.js  # 多组 Collector 请求对比
│
├── utils/
│   ├── decode_ob.js             # ob 响应解码器模块
│   │                              导出: decodeOb(json) → {xorKey, segments}
│   │
│   ├── decode_ob_bundle1.js     # Bundle #1 解码测试 (硬编码数据)
│   ├── decode_ob_bundle2.js     # Bundle #2 解码测试 (硬编码数据)
│   ├── test_handlers.js         # Handler 集成测试 (Bundle #1 + #2)
│   │
│   ├── decode_bundle2_request.js # Bundle #2 请求完整解码 (sid隐写/cs验证/事件提取)
│   ├── parse_bundle2_full.js    # Bundle #2 payload 全量解析 (hex dump/non-printable分析)
│   ├── bundle2_raw.txt          # Bundle #2 原始 POST body
│   ├── bundle2_decoded.json     # Bundle #2 解码结果 JSON
│   │
│   ├── extract_wasm.js          # WASM 提取器 (10种解码路径)
│   │                              ksXWzSIG: 自定义b64(小写在前) + URI decode
│   │
│   ├── run_wasm.js              # WASM 运行器 (initWasm → {a, b})
│   │                              需要: _pxUuid, instanceof_Window=1
│   │
│   ├── run_wasm_debug.js        # WASM 调试版 (trace 所有 wbg 调用)
│   │
│   └── trigger_captcha.js       # 无限循环请求触发 captcha
│                                  POST ifood API, 100ms 间隔, 检测 403
│
└── test/
    └── ifood_intercept.js       # CDP 拦截替换 main.min.js
                                   Chrome Launcher → Network.requestIntercepted
```

---

## 二十、踩坑记录

### 20.1 不要搜索反混淆后的函数名

captcha.js / main.js 高度混淆。`Ub`, `eh`, `ih`, `ml`, `Et` 等都是反混淆后的名字。原始文件搜不到。直接使用反混淆代码。

### 20.2 分隔符是 4 个波浪号

`~~~~` (4个) 不是 `~~~` (3个)。二进制表示: `0x06 0x06 0x06 0x06` XOR `0x78` = `0x7E 0x7E 0x7E 0x7E`。

### 20.3 shift() 不是 pop()

Handler key 是段的第一个字段，用 `fields.shift()` 取出。初始误用 `pop()` 导致 key 错误。

### 20.4 PX1135 === Bs

初始以为 PX1135 和 PX762 是不同函数。浏览器 `h.PX1135.toString()` 确认就是 `function Bs(...)`。

### 20.5 I0I0I0 参数重排

Handler 接收 `(t,e,n,r,a)` 但调用 Bs 时重排为 `(n,e,r,a==="true")`。参数位置不一致是混淆故意为之。

### 20.6 captcha.js 文件名会变

每次加载的 captcha.js URL 和文件名都不同，无法直接打断点。只能通过:
- main.js (固定) 下断
- 控制台 `Object.keys(window).filter(k => k.includes('handler'))` 找入口
- CDP 拦截替换

### 20.7 Bash 中 $a 变量冲突

在 Bash 中 `node -e "console.log($a)"` 会被 shell 解释 `$a` 为 shell 变量。解决: 写入文件再执行。

### 20.8 os() → Bs() 参数映射困惑

通过 0II0I0 → qu() → os() → Bs() 路径追踪参数时，发现第3个形参 `t` 接收的是 hash 字符串而非数字，导致 `Math.ceil(+t/4)` 返回 NaN。后来发现 I0I0I0 handler 才是主路径，直接传入正确的 `(targetHash, suffix, "16", false)`。

---

## 二十一、待完成项

### 已完成 ✓

- [x] **Bundle #1 Request**: URL, Headers, POST 参数, Payload 完整结构
- [x] **Bundle #2 Request**: POST 参数差异, Payload 解密 (80+ 浏览器指纹字段)
- [x] **cs 来源确认**: 服务器 ob 响应 III000 handler 下发 (NOT 客户端计算)
- [x] **pc 算法确认**: HMAC-MD5(salt="uuid:tag:ft", data=JSON(events)) → 提取+间隔取
- [x] **sid 隐写确认**: Unicode Tag Characters (U+E0130 系列) 编码 cts 时间戳
- [x] **Jf() 交织算法**: payload = base64(XOR(JSON,50)) + UUID 驱动的字符交织 (offsets[i]-1)
- [x] **bi / tag 来源**: 均为脚本硬编码固定值
- [x] **/ns 接口**: 返回值放入 payload 字段 (Sm), 非 cs 参数
- [x] **Bundle URL & Headers**: `/assets/js/bundle`, `application/x-www-form-urlencoded`
- [x] **Fingerprint 字段映射**: Bundle #1 前 12 字段 = Collector PX12095, Bundle #2 = 80+ 浏览器指纹

### 高优先级

- [x] **Jf() 交织逆向**: 去交织算法已实现 (offsets[i]-1, UUID 算位置, 从后往前 splice)
- [ ] **Bundle 请求构造脚本**: 端到端复现 Bundle #1 → #2 → #3 请求链
- [ ] **Bundle #3 Request**: 用户按压后的完整请求格式 (需抓包)

### 中优先级

- [ ] **视觉挑战 PX12634**: 0II0III0 handler 完整逻辑
- [ ] **WASM a()/b() 详细分析**: PX12590/PX12610 具体计算
- [ ] **ss() 回调逻辑**: PoW 结果如何编码进 Bundle #2

### 低优先级

- [ ] **轨迹数据 (Se/Oe)**: 鼠标/触摸轨迹编码格式
- [ ] **WASM 二进制分析**: wasm2wat 反编译
- [ ] **TLS 指纹匹配**: Bundle 请求的 TLS 配置

---

## 附录 A: 快速参考卡

```
═══════════════ 解码 ═══════════════
ob 解码: JSON → atob(.ob) → XOR(key) → split("~~~~")
XOR key: ml(Et()) % 128 (Et()=gt, 随脚本版本变化!)
  旧版 gt="DhY8E0h7J2cKHw==" → key=120
  新版 gt="P2cLYnkKFhY7bg==" → key=86
分隔符: ~~~~ (4个波浪号, 不是3个!)

═══════════════ PoW ═══════════════
算法: sha256(suffix + hex(counter, 4位)) === targetHash
难度: 16 → 搜索空间 0..65535 → ~9ms
函数: PX1135 = PX762 = Bs (同一函数)
参数重排: handler(t,e,n,r,a) → Bs(n,e,r,a==="true")

═══════════════ Handler ═══════════════
取 key: fields.shift() (第一个, 不是最后一个)
"cc" 标记: atob("Y2M=") → 延迟执行 → unshift 到队列头
注册表: Ql (ob响应), jl (do响应)

═══════════════ 参数来源 ═══════════════
cs:   服务器 ob 响应 → III000 handler → qa (NOT 客户端算!)
pc:   HMAC-MD5("uuid:tag:ft", JSON(events)) → 提取数字 → 间隔取
sid:  uuid + Unicode Tag Chars (U+E0130 系列编码 cts)
bi:   脚本硬编码 "GwNqS048KWpd..."
tag:  脚本硬编码 "O2MKZn0OEhI/ag=="
/ns:  GET /ns?c=appId → Sm → payload 字段 (非 cs!)

═══════════════ Payload 加密 ═══════════════
Collector: JSON → XOR(50) → URL encode → base64 → 20字符交织 (UUID 算位置)
Bundle:    JSON → XOR(50) → base64 → Jf() 20字符交织 (UUID 算位置)
交织key:   o = ee(Q(ni()), 10), ni()=服务器时间戳
偏移key:   UUID (jf="cu", cu:Xa()=uuid, NOT appId!)
去交织:    从后往前 splice(offsets[i]-1, 1) → 纯净 base64

═══════════════ Cookie ═══════════════
写入: III0II handler → oh() → hr() → document.cookie
配置: IIIIII handler → Xr() → Mr[ff] = args
删除: I000II handler → sr() → hr(name, -90000, '')
Hook: cookie_hook.js (Tampermonkey)

═══════════════ WASM ═══════════════
位置: captcha.js Us()[10]
导出: a() → PX12590, b(Es) → PX12610
依赖: window._pxUuid, instanceof_Window = 1

═══════════════ main.js 关键函数 ═══════════════
mh():  4384-4444  POST 参数构造
Jf():  3128-3171  payload 加密 + 交织
jt():  596-609    pc 计算 (HMAC-MD5 变体)
hh():  4366-4373  sid 隐写编码
Ho():  1415-1417  cs 取值 (return qa)
it():  299-329    自定义 JSON 序列化
ee():  666-670    XOR 编码/解码
R():   75-84      MD5/HMAC-MD5
Am():  8376-8406  /ns 接口请求
```

---

*本文档最后更新: 2026年2月*
