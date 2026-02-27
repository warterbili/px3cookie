# Bundle #3 按压验证指纹分析

> 解码自 `bundle3_payload.txt`，seq=5，5 个事件，共 244 字段

## 1. 事件概览

| # | type (base64) | 事件码 | 字段数 | 描述 |
|---|--------------|--------|--------|------|
| 0 | `egIAQDxqCXU=` | — | 78 | 浏览器指纹（WebGL/Canvas/UA，与 Bundle #1 相同） |
| 1 | `DhY0VEt6O2U=` | — | 20 | mouseout 单次交互事件 |
| 2 | **`PX561`** | PX561 | **95** | **核心：按压验证 + WASM 结果 + 鼠标轨迹** |
| 3 | `bHAWcioaE0I=` | — | 27 | captcha 完成回调（onSolvedCallback） |
| 4 | `GwNhAV5qbTo=` | PX11994 | 24 | 交互总结（差分轨迹 + DOM 统计） |

## 2. 公共尾部字段（所有 5 个事件共享）

每个事件末尾都带有以下 12 个公共字段：

| 键 | 值 | 来源 | 分类 |
|----|-----|------|------|
| `LVEXU2s1GmM=` | 2→4→6→7→8 | 全局事件序号，递增 | 写活 |
| `MkpICHQiQzo=` | 5076→35646→43632 | `performance.now()` 当前时间 | 写活 |
| `ZRlfGyNzUyA=` | `true` | PX 初始化完成标志 | 写死 |
| `Bh48XENxOW4=` | `1771991268575` | 服务器时间戳（/ns 响应） | 写活(session) |
| `PSEHY3tIA1c=` | UUID | `_pxUuid`，ob `ooIIoo` handler 生成 | 写活(session) |
| `UBRqVhV8YWA=` | `bPb2hiak...` (176字符) | `_px3` cookie 加密后的 token | 写活(session) |
| `dg4MTDNmB3s=` | `1003.200...` | `performance.timeOrigin` 精度值 | 写活(session) |
| `SlJwEAw8eis=` | `false` | 检测标志 | 写死 |
| `LnZUdGsYWUE=` | `"PX11745"` | 公共事件标记（硬编码） | 写死 |
| `bRFXEyt6XCk=` | `"pxhc"` | PX Human Challenge 标识 | 写死 |
| `W0MhQR4tKHs=` | `false` | 检测标志 | 写死 |
| `ST0zfwxXPk4=` | `c61dbd8a...` (695字符) | `_px3` 完整 cookie 值（hash:token:iterations:encrypted） | 写活(session) |

---

## 3. PX561 事件 — 完整 95 字段分析

### 3.1 布尔标志类（写死）

| 键 | 值 | 推测来源 |
|----|-----|---------|
| `ZRlfGyNzUyA=` | `true` | PX 初始化标志 |
| `T3c1NQkTOwQ=` | `true` | captcha 可见性 |
| `UTUrdxRZJEM=` | `true` | challenge 类型标志 |
| `NSkPa3BBAFk=` | `true` | 按压检测启用 |
| `UiNhKBRAZh8=` | `true` | 交互验证通过 |
| `Hm8tZFsOK1c=` | `true` | 环境检测通过 |
| `R3Y0PQIXMgc=` | `true` | 功能支持标志 |
| `cgMBSDdiBnI=` | `true` | 功能支持标志 |
| `cyJAaTZDQF8=` | `true` | 验证完成标志 |
| `VidlLBBAZB8=` | `false` | bot 检测结果（非 bot） |
| `eEULDj4oDjU=` | `false` | 自动化工具检测 |
| `NAFHSnJiQng=` | `false` | devtools 检测 |
| `GwpoAV5qbDQ=` | `false` | 模拟器检测 |
| `DXh+M0gYcwg=` | `false` | headless 检测 |
| `OSQKb3xFDl0=` | `false` | selenium 检测 |
| `YG0TZiUMFVY=` | `false` | puppeteer 检测 |
| `cH0DdjUcBU0=` | `false` | phantom 检测 |
| `AWxyJ0QOdBE=` | `false` | 代理检测 |
| `FwZkDVJnZDg=` | `false` | 检测标志 |
| `SlJwEAw8eis=` | `false` | 检测标志 |
| `W0MhQR4tKHs=` | `false` | 检测标志 |

**共 21 个布尔标志，全部写死。**

### 3.2 屏幕/布局常量（写死）

| 键 | 值 | 来源 |
|----|-----|------|
| `PAlPQnplT3M=` | `1920` | `screen.width` |
| `cRxCFzd/TiQ=` | `1080` | `screen.height` |
| `V0YkTRImIX4=` | `948` | captcha iframe `clientWidth` |
| `RTA2ewNQO00=` | `631` | captcha iframe `clientHeight` |
| `dEEHCjIhAT8=` | `505` | 按钮 `offsetTop` (Y 位置) |
| `XGlvYhoFaVQ=` | `530` | 按钮 `clientY` 区域 |
| `KntZcG8aXkU=` | `8` | `devicePixelRatio` 相关或 DOM 层级 |
| `FUBmS1MhZ3w=` | `4294967296` | `2^32`，`performance.memory.jsHeapSizeLimit` 或常量 |
| `RBF3WgFzcWA=` | `4` | `navigator.hardwareConcurrency` |
| `aHUbfi0XHUs=` | `1` | 常量 |

**共 10 个，同浏览器 profile 下写死。**

### 3.3 字符串常量（写死）

| 键 | 值 | 来源 |
|----|-----|------|
| `TlZ0FAg/fCI=` | `"visible"` | `document.visibilityState` |
| `RTA2ewNcOks=` | `"pointerdown"` | 事件类型字符串 |
| `JVAWW2M8G28=` | `"pointerup"` | 事件类型字符串 |
| `VGFnahINZFw=` | `"zh-CN"` | `navigator.language` |
| `LnZUdGsYWUE=` | `"PX11745"` | 公共事件标记 |
| `bRFXEyt6XCk=` | `"pxhc"` | PX Human Challenge 标识 |
| `Dh89VEt6P2Y=` | `[""]` | 键盘输入记录（空 = 无输入） |

**共 7 个，全部写死。**

### 3.4 Session 级字段（每会话生成一次）

| 键 | 值 | 来源 | 说明 |
|----|-----|------|------|
| `PSEHY3tIA1c=` | `a4cb3e50-...` | `_pxUuid` | ob `ooIIoo` handler 赋值 |
| `UBRqVhV8YWA=` | `bPb2hiak...` | `_px3` token | ob `IIIooo` handler 下发 |
| `ST0zfwxXPk4=` | `c61dbd8a...` | `_px3` 完整值 | hash:token:1000:encrypted |
| `Bh48XENxOW4=` | `1771991268575` | `/ns` 响应时间戳 | Am() 请求获取 |
| `QlNxGAcxci4=` | `1771991229618` | 页面加载时间戳 | captcha 页面加载时确定 |
| `Vi5sLBNGYR8=` | `f1085bff...` (32字符) | MD5 指纹哈希 | 同浏览器 profile 不变 |
| `dgcFTDNhAXs=` | `ef643ce8...` (128字符) | SHA-512 综合指纹 | 同浏览器 profile 不变 |
| `dg4MTDNmB3s=` | `1003.200...` | `performance.timeOrigin` 精度 | 同 session 不变 |
| `ZjcVPCNXGQc=` | `"v2.7.7"` | PX captcha SDK 版本 | 跟随脚本版本 |
| `Q3IwOQYQMwg=` | `"hgb"` | 挑战类型 (hold-gesture-button) | 服务器决定 |
| `M2IAKXYEBBM=` | `51` | 按钮宽度偏移 | 页面布局相关 |
| `eypIYT1IT1I=` | `52` | 按钮高度 | 页面布局相关 |
| `WitpIB9IbxE=` | `2508` | 超时/时间差值 | session 内固定 |
| `NkdFDHMlQzs=` | `97` | 挑战难度参数 | 服务器决定 |

**共 14 个。其中 `Vi5sLBNGYR8=` 和 `dgcFTDNhAXs=` 同浏览器可写死，其余需从前序请求获取。**

### 3.5 错误堆栈（写活）

| 键 | 值 (截取) | 来源 |
|----|----------|------|
| `EmooaFQOLV4=` | `"TypeError: Cannot read properties of null (reading '0') at _r (...main.min.js:2:21514) at fs (...) at os (...) at ...captcha.js...:2:582448 at Ws (...captcha.js...:2:334970) at Object.A [as onSolvedCallback] ..."` | `try/catch` 捕获的调用栈 |

**1256 字符。包含 uuid 和 vid 在 captcha.js URL 中，每 session 不同。写活：替换 URL 中的 uuid/vid 即可。**

### 3.6 WASM 相关字段（伪造极难）

| 键 | 值 | 来源 | 说明 |
|----|-----|------|------|
| `Fw9tDVJiaTY=` | `"4YCJ4YGQ4YCa..."` (376字符) | Myanmar Unicode 编码数据 | WASM `a()` 输入/输出，每次挑战不同 |
| `Slt5EA85fiI=` | `"440be25d..."` (64字符 hex) | WASM 哈希 = **PX12590** | SHA-256，captcha challenge answer |
| `MD1DNnVfRgQ=` | `"DAwWSmob..."` (128字符) | 动态挑战结果 = **PX12573** | WASM `b()` 输出，含特殊字符 |
| `Slt5EA85fyQ=` | `100` | WASM confidence score | 可能固定写 `100` |
| `InNReGcSXUM=` | `"succeeded"` | WASM 执行状态 | 成功固定 `"succeeded"` |
| `AE0zBkUsPjQ=` | `"e57afe9b..."` (114字符 hex) | sensor 数据（加密传感器） | WASM 加密输出 |
| `CXR6P08TfA==` | `"cbe24292..."` (64字符 hex) | SHA-256 验证哈希 | 依赖 WASM 运行时 |

**共 7 个。`Slt5EA85fiI=`、`MD1DNnVfRgQ=`、`AE0zBkUsPjQ=` 是伪造的最大障碍，必须执行 `px_captcha.wasm` 的 `a()/b()` 函数才能生成正确值。**

### 3.7 鼠标轨迹（伪造难度高）

| 键 | 值 | 说明 |
|----|-----|------|
| `PAlPQnlqS3k=` | **544 点** `"x,y,timestamp"` | 完整轨迹（每帧采样） |
| `EmMhaFQBLFI=` | **150 点** `"x,y,timestamp"` | 过滤轨迹（约半数采样） |

**轨迹分析：**
```
起点: (680, 669) t=33487  ← 页面右上方
经过: (403, 889) t=33620  ← 向左下移动，到达按钮区域
停留: (352, 525) t=33853→36850  ← 在按钮上停留约 3 秒（长按）
松开后: (384, 511) t=39610  ← 松开后轻微移动
```

**采样规则：**
- 完整轨迹: 每 1-3ms 采样一次
- 过滤轨迹: 每 2ms 采样（隔一个取一个）
- 轨迹必须呈现贝塞尔曲线特征（加速→减速→停止）
- 服务端有轨迹分析模型，检测直线/匀速/跳变等异常

### 3.8 交互事件计时数组（写活）

| 键 | 值 | 说明 |
|----|-----|------|
| `QlNxGAQ+dyw=` | 32 项对象数组 | 详细交互事件（mouseover/mouseout/click/pointerup） |

每项结构：
```json
{
  "PX12343": "mouseout",   // 事件类型
  "PX11652": 0,            // 固定 0
  "PX11699": 35646,        // performance.now() 时间戳
  "PX12270": "true"        // 固定 "true"
}
```

**事件序列：**
```
mouseout/mouseover 成对出现 × 14 次  ← 鼠标穿越 Shadow DOM 边界
click × 1 次                        ← 按下按钮
mouseover × 2 次                    ← 按钮内移动
mouseout/mouseover × 4 次           ← 按钮内边界穿越
pointerup × 1 次                    ← 松开按钮
```

### 3.9 Pointer 事件（写活）

#### pointerdown

| 键 | 值 | 来源 |
|----|-----|------|
| `TTg+cwtVPkQ=` | `309.5` | pointerdown `offsetX` |
| `RBF3WgF0dGw=` | `17.44` | pointerdown `offsetY` |
| `Ln9ddGgYWEU=` | `602.5` | pointerdown `clientX` |
| `WitpIBxJaRA=` | `364` | pointerdown `clientY` |
| `eWRKLz8HSR8=` | `37468` | pointerdown `performance.now()` |

#### pointerup

| 键 | 值 | 来源 |
|----|-----|------|
| `Lx4cFWp6GiM=` | `309.5` | pointerup `offsetX` |
| `WitpIBxIaBs=` | `17.44` | pointerup `offsetY` |
| `Dz58dUlefEI=` | `602.5` | pointerup `clientX` |
| `YQxSByduVTY=` | `364` | pointerup `clientY` |
| `HCkvIllJKhc=` | `38936` | pointerup `performance.now()` |

**按压时长 = 38936 - 37468 = 1468ms（约 1.5 秒长按）。**

**注意：`offsetX/Y` 精确到小数点（309.5, 17.44），说明是真实浏览器事件，不是整数坐标。**

### 3.10 时间相关字段（写活）

| 键 | 值 | 来源 |
|----|-----|------|
| `aR1THy92VyQ=` | `40522` | `performance.now()` 偏移量 |
| `MkpICHQhQD0=` | `4` | 事件内部序号 |
| `MkpICHQiQzo=` | `43632` | 当前 `performance.now()` |
| `IxIQGWVzFiI=` | `83672695` | 累计计数器（大数值） |
| `RBF3WgJ9cGs=` | `146665135` | 累计计数器 |
| `V0YkTREhJXg=` | `5592` | 时间差（captcha 显示到交互） |
| `InNReGQUV0s=` | `38954` | pointerup 后的 `performance.now()` |
| `Slt5EA86fSY=` | `38957` | WASM 执行完成时间 |
| `JxYUHWFxEw==` | `12217.200...` | 高精度 `performance.now()` |
| `QlNxGAc0fSg=` | `[5515, 1466]` | 时间间隔：[按压前等待, 按压持续时长] |
| `Czp4cU5Ye0Y=` | `[1771991261025, 1771991267105]` | 绝对时间戳数组（关键交互时刻） |
| `IxIQGWZwEy0=` | `[1771991266541]` | WASM 调用时刻 |
| `CXR6P0wWfQw=` | `814` | 时间差/坐标值 |
| `AhMxWEdxNmg=` | `1658` | 时间差（从按压到 WASM 完成） |

**时间戳必须单调递增，间隔合理。按压时长 `QlNxGAc0fSg=[5515, 1466]` 中 1466ms 必须与 pointerdown/up 时间差一致。**

### 3.11 计数器/零值（写活但简单）

| 键 | 值 | 来源 |
|----|-----|------|
| `YjoYOCReHAs=` | `1` | 点击次数 |
| `BXl/O0MccQ4=` | `0` | 失败计数 |
| `KDxSPm5XXA4=` | `0` | 重试计数 |
| `eyNBYT1KTFo=` | `0` | 超时计数 |
| `MD1DNnVbQQE=` | `1` | captcha 尝试次数 |
| `JxYUHWFxFi8=` | `241` | 按钮内 offsetX（基于按钮尺寸计算） |
| `LVEXU2s1GmM=` | `6` | 全局事件序号 |

### 3.12 DOM 探测（写活）

| 键 | 值 | 来源 |
|----|-----|------|
| `MkNBCHQuRTw=` | `["nodeType","ELEMENT_NODE","matches",...]` (18 项) | Shadow DOM 属性遍历结果 |

**完整值：**
```json
["nodeType","ELEMENT_NODE","matches","closest","innerHTML","outerHTML",
 "insertAdjacentElement","insertAdjacentHTML","insertAdjacentText",
 "setHTMLUnsafe","getHTML","after","animate","append","before",
 "getAnimations","prepend","replaceChildren"]
```

**这是对 captcha 按钮所在 Shadow DOM 元素的属性探测，用于检测 DOM 是否被篡改。同浏览器版本固定，可写死。**

---

## 4. 事件 #0 — 浏览器指纹（78 字段）

与 Bundle #1 的指纹事件基本相同（WebGL/Canvas/UA/插件等），不再重复。参见 `BUNDLE_FINGERPRINT_ANALYSIS.md`。

额外注意：
- `RBh+WgJ8ems=` = `"1771991229173"` — 服务器时间戳（字符串形式）
- `ChIwUE99P2o=` — 错误堆栈（含 main.min.js 行号），每次 PX 更新会变
- `PSEHY3tKDlQ=` = `"https://www.ifood.com.br/restaurantes"` — 当前页面 URL

## 5. 事件 #1 — mouseout 事件（20 字段）

| 键 | 值 | 来源 |
|----|-----|------|
| `HUFnQ1gtank=` | `629` | clientX |
| `HCAmIllJKhQ=` | `164` | clientY |
| `Rl58HAMwcS0=` | `"mouseout"` | 事件类型 |
| `KnJQcGwZWEA=` | `"DIV"` | 目标元素 tagName |
| `aR1THy92VyQ=` | `32536` | `performance.now()` |
| `EmooaFQOLV0=` | `"true"` | 事件冒泡 |
| `aR1THyx0WCw=` | `true` | isTrusted |

**+ 12 个公共尾部字段。鼠标坐标和时间写活，其余写死。**

## 6. 事件 #3 — captcha 完成回调（27 字段）

| 键 | 值 | 说明 | 分类 |
|----|-----|------|------|
| `egsJQD9vCHU=` | `"pxCaptcha"` | captcha 类型标识 | 写死 |
| `Tl99FAg/cCY=` | `"www.ifood.com.br"` | 目标域名 | 写死 |
| `BXB2O0ARegw=` | `"https://cw-marketplace..."` | 被拦截的 API URL | 写死 |
| `X04sRRovIXE=` | `true` | 验证通过标志 | 写死 |
| `fy5MZTpKTF4=` | `false` | 移动端标志 | 写死 |
| `aHUbfi0XHkQ=` | `false` | 离线标志 | 写死 |
| `HUFnRV8p` | `"a91ae960-..."` | captcha instance ID (= POST 的 `ci`) | 写活(session) |
| `ZjcVPCNXGQc=` | `"v2.7.7"` | SDK 版本 | 写活 |
| `WitpIB9IbxE=` | `2508` | 超时值 | 写活 |
| `Fw9tDVJiaTY=` | Myanmar 编码 | WASM 数据（同 PX561） | 写活 |
| `aR1THy92VyQ=` | `40522` | performance.now() | 写活 |
| `T3c1NQkTOwQ=` | `true` | 可见性 | 写死 |
| `TlZ0FAg/fCI=` | `"visible"` | visibilityState | 写死 |
| `EmooaFQOLV4=` | 错误堆栈 | 含 uuid/vid | 写活 |

**+ 12 个公共尾部字段。**

## 7. 事件 #4 — PX11994 交互总结（24 字段）

| 键 | 值 | 说明 | 分类 |
|----|-----|------|------|
| `R389PQITNw8=` | `"PX11994"` | 事件码 | 写死 |
| `SlJwEAw2fiY=` | `"https://www.ifood.com.br/restaurantes"` | 当前页面 URL | 写死 |
| `PABGQnlsTXA=` | `{"DIV":1,"#px-captcha":2}` | DOM 交互计数 | 写活 |
| `QAR6RgZhcHE=` | UUID | = `_pxUuid` | 写活(session) |
| `cgoISDRvAX4=` | `0` | 计数器 | 写活 |
| `PkZEBHsvTzM=` | `true` | 标志 | 写死 |
| `OkJAAHwsRDE=` | `"0,0,32537\|-3,1,32538\|..."` | **差分鼠标轨迹**（dx,dy,timestamp） | 写活 |
| `YQVbByRuVDQ=` | `""` | 键盘输入（空） | 写死 |
| `EXVrN1QcYQU=` | `1771991228053` | 绝对时间戳 | 写活 |
| `YQVbByduXz0=` | 25 点数组 | 轨迹子集（采样） | 写活 |
| `a1NRUS04W2o=` | `"631x0"` | 视口位置 | 写死 |
| `QSU7ZwRIMlU=` | 16 项对象数组 | 详细交互记录（含坐标、DOM 信息） | 写活 |

**差分轨迹格式 `dx,dy,timestamp`：**
```
0,0,32537    ← 起始点
-3,1,32538   ← 向左3px 向下1px
-5,3,32538   ← 向左5px 向下3px
...
```

---

## 8. 伪造难度分级

### Tier 1 — 写死（约 50 个字段）
直接硬编码，同浏览器 profile 不变：
- 21 个布尔标志
- 10 个屏幕/布局常量
- 7 个字符串常量
- 12 个公共字段中的固定部分

### Tier 2 — 简单写活（约 25 个字段）
需要运行时数据但容易伪造：
- 计数器（递增即可）
- `performance.now()` 系列（单调递增，间隔合理）
- 绝对时间戳（当前时间）
- 零值计数器
- 错误堆栈（模板替换 uuid/vid）
- DOM 属性列表（同浏览器版本固定）

### Tier 3 — Session 依赖（约 15 个字段）
需要从前序请求链获取：
- UUID（ob `ooIIoo` handler）
- `_px3` cookie（ob `IIIooo` handler）
- 服务器时间戳（ob `oIIIoooo` handler）
- `/ns` 响应时间戳
- captcha instance ID (`ci`)
- SDK 版本号
- 挑战类型和难度参数

### Tier 4 — 鼠标轨迹（5 个字段，伪造难度高）
需要贝塞尔曲线生成器：
- `PAlPQnlqS3k=` — 544 点完整轨迹
- `EmMhaFQBLFI=` — 150 点过滤轨迹
- `OkJAAHwsRDE=` — 差分轨迹
- `YQVbByduXz0=` — 25 点采样轨迹
- `QlNxGAQ+dyw=` — 32 项交互事件时序
- pointerdown/up 坐标 + offsetX/Y

**要求：**
1. 曲线必须从页面中心到按钮（约 `(680,669)` → `(352,525)`）
2. 呈现加速→匀速→减速→停止的自然运动
3. 有轻微抖动（±1-2px 随机噪声）
4. 按压持续 1-3 秒
5. pointerdown/up 的 offsetX/Y 必须是浮点数
6. 过滤轨迹 ≈ 完整轨迹的半数采样

### Tier 5 — WASM 计算（3 个字段，已破解）

| 字段 | PX 代号 | 说明 |
|------|---------|------|
| `Slt5EA85fiI=` | PX12590 | `Ys.a()` 输出，64 字符 hex，非确定性（含随机数+UUID） |
| `MD1DNnVfRgQ=` | PX12573 | `Ys.b(Es)` 输出，127 字符编码串，确定性（Es+UUID→固定结果） |
| `AE0zBkUsPjQ=` | — | sensor 加密数据 (114 字符 hex) |

**已在 Node.js 中完全复现！** 详见 `bundle/bundle_actual_analysis.md` 第 4 章。

**复现方案（`utils/run_wasm.js`）：**
```javascript
const { initWasm } = require('./utils/run_wasm');
const { a, b } = await initWasm(uuid);  // 传入 _pxUuid
const px12590 = a();        // → Slt5EA85fiI=
const px12610 = b(Es);      // → MD1DNnVfRgQ= (Es = PoW 原像)
```

**关键依赖：**
- `window._pxUuid` — `b()` 必须读取，缺失返回空字符串
- `Es` = PoW 原像 — `sha256(candidate) === targetHash` 的反向查找结果
- PoW 算法 `poi()` 已完全逆向，搜索空间约 64 万次，秒级完成

---

## 9. 总结

| 分级 | 字段数 | 难度 | 方案 |
|------|--------|------|------|
| Tier 1 写死 | ~50 | 零 | 硬编码 |
| Tier 2 简单写活 | ~25 | 低 | 递增计数器 + 时间戳 |
| Tier 3 Session | ~15 | 中 | 前序请求链获取 |
| Tier 4 轨迹 | ~5 | 高 | 贝塞尔曲线生成器 |
| Tier 5 WASM | ~3 | **已破解** | `utils/run_wasm.js` 直接调用 |

**结论：所有 5 个 Tier 均已攻破，全部字段可程序化生成。WASM `a()/b()` 已在 Node.js 中完全复现（`utils/run_wasm.js`），不再是瓶颈。剩余工作：组装端到端构造脚本，将各 Tier 字段串联为完整 Bundle #3 请求。**
