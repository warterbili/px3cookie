# Collector #1 OB 响应解码分析

gt = `"DhI0E0h7J2cKHw=="`, XOR key = 83

## 时序概览

3 个响应对应 collector 的 3 次请求循环: collect → ob 响应 → 解析状态 → 下次 collect

| | resp 1 (首次) | resp 2 (中间) | resp 3 (完成) |
|---|---|---|---|
| 段数 | 9 | 8 | 10 |
| `_px3` cookie | 有 (首次下发) | 无 | 无 |
| `pxsid` | 无 | 无 | 有 |
| `cts` | 无 | 无 | 有 |
| `no` 时间戳 | 1772172371991 | 1772172610088 | 1772176017914 |

## Handler 说明

### 固定 handler (每次都有)

| handler 类型 | 二进制标识 | 作用 | 对应 state 字段 |
|---|---|---|---|
| `cookie_config` | `o1111o` | cookie 属性配置: cc, ttl=60, SameSite=Lax | `state.cookies.cc` |
| `control_flag` | `1o1o11` | 控制标志, 值=`"cu"` → 后续交织算法参数 | `state.jf` |
| `session_id` | `ooo11o` | 会话 ID, 每次不同的大整数 | `state.to` |
| `timestamp` | `o111oo1o` | 服务器时间戳 (毫秒) | `state.no` |
| `app_id` | `o111o1` | 应用标识, 每次不同 | `state.appId` |
| `challenge_hash` | `1o1111` | cs 哈希 (64位 hex) | `state.qa` |
| `feature_flags` | `o111oo` | 功能开关: `ai:0` | `state.features` |
| `unknown` | `o111ooo1` | 4~5位数字 (6598/5953/5325), 用途待确认 | — |

### 条件 handler (仅特定响应)

| handler 类型 | 二进制标识 | 仅出现 | 作用 |
|---|---|---|---|
| `set_cookie` | `o11111` | resp 1 | 首次下发 `_px3` cookie, ttl=330, secure=true, maxAge=300 |
| `pxsid` | `oo1o1o` | resp 3 | 会话 ID (UUID), 用于 `sid` 参数 |
| `cts` | `o11o11o1` | resp 3 | 会话追踪 UUID + flag="true" |

## 对后续请求/event 的影响

### 请求参数 (POST params)

| 参数 | 来源 | 说明 |
|---|---|---|
| `cs` | `state.qa` | 每次响应更新, 下次请求必须带 |
| `no` | `state.no` | 服务器时间戳, 传入下次请求 |
| `sid` | `state.pxsid` | resp 3 后才有, 含 Unicode 隐写时间戳 |
| `cts` | `state.cts` | resp 3 后才有 |
| `vid` | — | 3次响应均为 null |

### Event 字段

| event 字段 | 来源 |
|---|---|
| `BX1/O0ATcgo=` (_px3) | resp 1 下发的 `_px3` cookie 值, collector #2+ 需要带上 |

### 加密/交织

| 参数 | 来源 | 说明 |
|---|---|---|
| `jf="cu"` | control_flag handler | payload 加密时 UUID 交织的参数名 |
| XOR key=83 | `ml(gt) % 128` | ob 解码的 XOR 密钥 |
