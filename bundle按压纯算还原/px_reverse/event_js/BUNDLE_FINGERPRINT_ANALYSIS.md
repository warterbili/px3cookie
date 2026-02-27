# PX Bundle Payload 229 字段指纹完整分析

> 事件类型: `"t": "aHwcfi4UFkw="` (Bundle fingerprint collection event)
> 字段总数: 229 | 分析时间: 2026-02-25
> 说明: 所有 key 为 base64 编码，每次 PX 脚本加载后 key 会变化，value 不变

---

## 目录

1. [基础环境 (URL / Referrer / Page Info)](#1-基础环境)
2. [浏览器标识 (UA / Platform / Vendor)](#2-浏览器标识)
3. [屏幕与显示 (Screen / Resolution)](#3-屏幕与显示)
4. [语言与时区 (Language / Timezone)](#4-语言与时区)
5. [硬件检测 (Memory / CPU / Connection)](#5-硬件检测)
6. [网络信息 (Connection API)](#6-网络信息)
7. [插件信息 (Plugins / MimeTypes)](#7-插件信息)
8. [Canvas / WebGL / 音频指纹](#8-canvaswebgl音频指纹)
9. [API 与功能检测 (Feature Detection)](#9-api-与功能检测)
10. [Cookie 与存储](#10-cookie-与存储)
11. [安全检测 (Bot / Automation / DevTools)](#11-安全检测)
12. [PX 内部状态 (Timestamps / Hashes / IDs)](#12-px-内部状态)
13. [其他哈希 (Fingerprint Component Hashes)](#13-其他哈希)
14. [错误捕获 (Error Traces)](#14-错误捕获)
15. [UA Client Hints API](#15-ua-client-hints-api)
16. [杂项与未分类](#16-杂项与未分类)
17. [统计总结](#17-统计总结)

---

## 1. 基础环境

页面 URL、referrer、origin 等页面级信息。

| # | Base64 Key | 值 (截断) | 推断的浏览器 API / 含义 |
|---|-----------|----------|----------------------|
| 1 | `LnZadGgdXUM=` | `"https://www.ifood.com.br/restaurantes"` | `location.href` — 当前页面完整 URL |
| 2 | `YGQUZiUJFVc=` | `"https%3A%2F%2Fwww.ifood.com.br%2Frestaurantes"` | `encodeURIComponent(location.href)` — URL 编码后的当前页面 |
| 3 | `OAxMTn5kRns=` | `["https://www.ifood.com.br"]` | `document.referrer` 或 ancestor origins — 页面来源列表 |
| 4 | `Bz9zfUJXdU4=` | `"https:"` | `location.protocol` — 协议 |
| 5 | `N28DLXEBBBY=` | `"visible"` | `document.visibilityState` — 页面可见性状态 |
| 6 | `WQ0tDxxlKDo=` | `"w3c"` | Event model detection — 事件模型 (w3c vs ie) |
| 7 | `egIOQD9qCnQ=` | `"screen"` | PX mount point detection — `window.screen` 上挂载函数的检测 |

---

## 2. 浏览器标识

`navigator` 对象上的各种标识属性。

| # | Base64 Key | 值 (截断) | 推断的浏览器 API / 含义 |
|---|-----------|----------|----------------------|
| 1 | `CzN/cU1ZeUc=` | `"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36 Edg/145.0.0.0"` | `navigator.userAgent` |
| 2 | `GmIuYF8NK1I=` | (同上 UA 字符串) | `navigator.userAgent` 的二次采集或 HTTP header UA |
| 3 | `QAR0RgVqdnA=` | `"5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36..."` | `navigator.appVersion` |
| 4 | `U0snSRYiIXM=` | `"Win32"` | `navigator.platform` |
| 5 | `ZRlRGyN8UCg=` | `"Netscape"` | `navigator.appName` |
| 6 | `HUFpQ1sobXg=` | `"Mozilla"` | `navigator.appCodeName` |
| 7 | `AEQ0BkUpPzU=` | `"Gecko"` | `navigator.product` |
| 8 | `NAhASnJsQ3A=` | `"20030107"` | `navigator.productSub` |
| 9 | `QAR0RgVsf3w=` | `"webkit"` | `navigator.vendor` prefix 或 CSS prefix 检测 (webkit) |
| 10 | `b1dbVSo/WWE=` | `"webkit"` | CSS vendor prefix 检测结果 |
| 11 | `WiJuIB9KbBI=` | `""` | `navigator.vendorSub` (通常为空) |
| 12 | `Z19TXSIyU2g=` | `true` | `navigator.cookieEnabled` |
| 13 | `XQEpAxtkKDg=` | `true` | `navigator.onLine` |
| 14 | `HwdrBVpvbTU=` | `"function share() { [native code] }"` | `navigator.share.toString()` — Web Share API 检测 |

---

## 3. 屏幕与显示

屏幕分辨率、窗口大小、色深等显示相关属性。

| # | Base64 Key | 值 | 推断的浏览器 API / 含义 |
|---|-----------|-----|----------------------|
| 1 | `KV0dX284Gm4=` | `1920` | `screen.width` |
| 2 | `LDBYMmpaUwE=` | `1080` | `screen.height` |
| 3 | `EFQkFlU4JSU=` | `1920` | `screen.availWidth` |
| 4 | `IUUVR2QpFH0=` | `1032` | `screen.availHeight` |
| 5 | `KV0dX2wxG20=` | `1920` | `window.outerWidth` |
| 6 | `MDRENnZfQgU=` | `1032` | `window.outerHeight` |
| 7 | `V08jTRIhKHg=` | `"1920X1080"` | `screen.width + "X" + screen.height` — 拼接分辨率字符串 |
| 8 | `Fm4ibFMDIV0=` | `32` | `screen.colorDepth` |
| 9 | `ajIeMCxcFQI=` | `32` | `screen.pixelDepth` |
| 10 | `fEAIAjkrAzY=` | `0` | `window.screenX` 或 `window.screenLeft` |
| 11 | `fgYKRDttAXE=` | `0` | `window.screenY` 或 `window.screenTop` |
| 12 | `a1NfUS06VWc=` | `420` | `window.innerWidth` 或 viewport width |
| 13 | `XiZqJBtPaBc=` | `948` | `window.innerHeight` 或 viewport height |
| 14 | `Y1tXWSYyUGg=` | `0` | `window.scrollX` 或 `pageXOffset` |
| 15 | `DhY6VEt/PWE=` | `0` | `window.scrollY` 或 `pageYOffset` |
| 16 | `LDBYMmpUUgE=` | `1` | `window.devicePixelRatio` |
| 17 | `Q3s3OQYWMQ8=` | `2` | `screen.orientation.type` 角度或状态码 (2=landscape) |
| 18 | `dWlBKzABSx4=` | `2` | `visualViewport.scale` 或 DPI 倍率相关 |

---

## 4. 语言与时区

浏览器语言设置和时区信息。

| # | Base64 Key | 值 | 推断的浏览器 API / 含义 |
|---|-----------|-----|----------------------|
| 1 | `aR1dHy91Vi4=` | `"zh-CN"` | `navigator.language` |
| 2 | `EwtnCVVgbDo=` | `["zh-CN","en","en-GB","en-US"]` | `navigator.languages` |
| 3 | `BFgwGkI2Oig=` | `-480` | `new Date().getTimezoneOffset()` — UTC+8 = -480 分钟 |
| 4 | `b1dbVSo/XWQ=` | `"Asia/Shanghai"` | `Intl.DateTimeFormat().resolvedOptions().timeZone` |
| 5 | `CzN/cU1WeEM=` | `"Wed Feb 25 2026 10:06:47 GMT+0800 (Ö­×©½Ô×µÔ¥¶Û¥´)"` | `new Date().toString()` — 含时区名称（中文时区名被编码异常） |

---

## 5. 硬件检测

CPU、内存等硬件级指纹。

| # | Base64 Key | 值 | 推断的浏览器 API / 含义 |
|---|-----------|-----|----------------------|
| 1 | `ZHgQeiITEUk=` | `8` | `navigator.hardwareConcurrency` — CPU 逻辑核心数 |
| 2 | `bRFZEyt6XyY=` | `4` | `navigator.deviceMemory` — 设备内存 (GB) |
| 3 | `dEgACjIjCz0=` | `16` | WebGL `MAX_TEXTURE_SIZE` 或类似 GPU 参数 (值=16 可能是 log2) |
| 4 | `SlJ+EAw6eCc=` | `4294967296` | `performance.memory.jsHeapSizeLimit` 或 `ArrayBuffer.maxByteLength` (= 2^32 = 4GB) |
| 5 | `eW1NLz8FTBQ=` | `131385816` | `performance.memory.usedJSHeapSize` |
| 6 | `eW1NLz8ITR4=` | `166304664` | `performance.memory.totalJSHeapSize` |
| 7 | `X0crRRovKHE=` | `"x86"` | `navigator.userAgentData.architecture` (via getHighEntropyValues) |
| 8 | `JDhQOmFQUw8=` | `"64"` | `navigator.userAgentData.bitness` (via getHighEntropyValues) |

---

## 6. 网络信息

`navigator.connection` (Network Information API) 相关。

| # | Base64 Key | 值 | 推断的浏览器 API / 含义 |
|---|-----------|-----|----------------------|
| 1 | `KV0dX281GGw=` | `"4g"` | `navigator.connection.effectiveType` |
| 2 | `SBx8Xg53d28=` | `10` | `navigator.connection.downlink` (Mbps) |
| 3 | `Aho2WEd1MWs=` | `0` | `navigator.connection.rtt` (往返时间 ms) |
| 4 | `AEQ0BkUsPj0=` | `0.2` | `navigator.connection.downlinkMax` 或 `saveData` 相关 |
| 5 | `BXlxO0ARdQA=` | `{"support":true,"status":{"effectiveType":"4g","rtt":0,"downlink":10,"saveData":false}}` | `navigator.connection` 完整状态对象 |
| 6 | `AWV1J0QNfhQ=` | `"default"` | `Notification.permission` 或 `navigator.connection.type` |

---

## 7. 插件信息

浏览器插件和 MIME 类型信息。

| # | Base64 Key | 值 | 推断的浏览器 API / 含义 |
|---|-----------|-----|----------------------|
| 1 | `EXVlN1QYYAw=` | `["PDF Viewer","Chrome PDF Viewer","Chromium PDF Viewer","Microsoft Edge PDF Viewer","WebKit built-in PDF"]` | `navigator.plugins` — 插件名称列表 |
| 2 | `DhY6VEt5MWA=` | `5` | `navigator.plugins.length` |
| 3 | `PSEJY3hJD1Q=` | `{"plugext":{"0":{"f":"internal-pdf-viewer","n":"PDF Viewer"},...},"plugins_len":5}` | `navigator.plugins` 详细信息（含文件名和名称） |
| 4 | `bjYaNCtfGQ4=` | `[]` | `navigator.mimeTypes` 额外检测（空数组=无特殊 MIME） |

---

## 8. Canvas / WebGL / 音频指纹

Canvas 和 WebGL 渲染指纹、AudioContext 指纹。

| # | Base64 Key | 值 | 推断的浏览器 API / 含义 |
|---|-----------|-----|----------------------|
| 1 | `UipmKBRCZRI=` | `"49e5084e"` | Canvas 2D fingerprint hash — `canvas.toDataURL()` CRC |
| 2 | `UipmKBRDYBg=` | `"7c5f9724"` | Canvas 2D 第二组 hash (不同绘制参数) |
| 3 | `Fw9jDVJgYTc=` | `"65d826e0"` | WebGL fingerprint hash — renderer/vendor info CRC |
| 4 | `LnZadGsfUUc=` | `"a9269e00"` | WebGL extensions hash |
| 5 | `GwNvAV1pZDM=` | `"50a5ec55"` | WebGL parameters hash (MAX_TEXTURE_SIZE 等) |
| 6 | `b1dbVSo8XmU=` | `"73a0fb26"` | WebGL unmasked renderer hash |
| 7 | `DhY6VEt+PmU=` | `"537fea6e"` | AudioContext fingerprint hash |
| 8 | `DhY6VEt+OGE=` | `33` | AudioContext `sampleRate / 1000` 或 `baseLatency` 相关 |
| 9 | `bRFZEyh5XSA=` | `"ff702ecc"` | Audio oscillator fingerprint hash |
| 10 | `RBhwWgJ9dW8=` | `"missing"` | WebGL2 检测结果 — "missing" 表示 WebGL2 不可用或被 block |
| 11 | `MkpGCHciRD8=` | `"TypeError: Cannot read properties of undefined (reading 'width')"` | WebGL/Canvas error — 某项 GPU 检测失败 |
| 12 | `aHwcfi0UFkk=` | `"AudioData.SVGAnimatedAngle.SVGMetadataElement"` | DOM interface fingerprint — 特定 API 存在性组合签名 |

---

## 9. API 与功能检测

检测浏览器支持哪些 Web API，返回布尔值。

| # | Base64 Key | 值 | 推断的浏览器 API / 含义 |
|---|-----------|-----|----------------------|
| 1 | `fydLZTpMTlM=` | `true` | `navigator.sendBeacon` 存在 |
| 2 | `NAhASnFjRX0=` | `true` | `window.fetch` 存在 |
| 3 | `PkZKBHstTzA=` | `true` | `window.XMLHttpRequest` 存在 |
| 4 | `FCggKlFDJR8=` | `false` | `window.ActiveXObject` 存在 (IE only, false=非 IE) |
| 5 | `MVUFV3Q+AG0=` | `true` | `window.WebSocket` 存在 |
| 6 | `Bh4yXEN1N2c=` | `true` | `window.Worker` 存在 |
| 7 | `Jn5SfGMVVk4=` | `true` | `window.SharedWorker` 或 `ServiceWorker` 存在 |
| 8 | `bHAYcikeGEU=` | `true` | `window.localStorage` 可用 |
| 9 | `ST09fwxSO0k=` | `true` | `window.sessionStorage` 可用 |
| 10 | `EmomaFQCIVo=` | `true` | `window.indexedDB` 可用 |
| 11 | `aR1dHy90Wis=` | `true` | `window.requestAnimationFrame` 存在 |
| 12 | `DhY6VEh+OWU=` | `true` | `window.performance` 存在 |
| 13 | `KV0dX281GW0=` | `true` | `navigator.connection` 存在 (Network Information API) |
| 14 | `IxsXGWVyFC0=` | `true` | `window.Intl` 存在 (Internationalization API) |
| 15 | `ICRUJmVNUx0=` | `true` | `window.crypto` 或 `crypto.subtle` 存在 |
| 16 | `P2cLJXkMDRc=` | `true` | `window.Notification` 存在 |
| 17 | `b1dbVSk/X2E=` | `true` | `window.Promise` 存在 |
| 18 | `BFgwGkE2MiA=` | `true` | `window.Proxy` 存在 |
| 19 | `CzN/cU1ddEc=` | `true` | `window.Reflect` 存在 |
| 20 | `X0crRRkiIHE=` | `true` | `window.Symbol` 存在 |
| 21 | `HwdrBVpqbTQ=` | `true` | `document.createElement` 存在 |
| 22 | `fydLZTpOS1Y=` | `1` | `document.compatMode` 检测 (1=CSS1Compat/standards mode) |
| 23 | `a1NfUS04W2c=` | `true` | `window.TextEncoder` 或 `TextDecoder` 存在 |
| 24 | `Jx8THWF6Fyg=` | `true` | `navigator.mediaDevices` 存在 |
| 25 | `bHAYcikcG0A=` | `true` | `window.AudioContext` 或 `webkitAudioContext` 存在 |
| 26 | `KDxcPm1XWQ0=` | `true` | `window.OffscreenCanvas` 存在 |
| 27 | `fEAIAjkpDDc=` | `true` | `window.WebAssembly` 存在 |
| 28 | `fEAIAjkoDzg=` | `true` | `navigator.getBattery` 存在 (Battery API) |
| 29 | `ZHgQeiEQF0E=` | `true` | `navigator.credentials` 存在 (Credential Management API) |
| 30 | `TBB4Ugl7c2g=` | `true` | `window.IntersectionObserver` 存在 |
| 31 | `HUFpQ1gpbnU=` | `true` | `window.MutationObserver` 存在 |
| 32 | `fydLZTpKS1E=` | `true` | `window.ResizeObserver` 存在 |
| 33 | `Q3s3OQYVMQ0=` | `true` | `window.PerformanceObserver` 存在 |
| 34 | `Nk5CDHAmQzw=` | `true` | `window.AbortController` 存在 |
| 35 | `MDRENnVbRwA=` | `true` | `window.BroadcastChannel` 存在 |
| 36 | `ICRUJmZNURA=` | `true` | `window.Map` 或 `window.Set` 存在 |
| 37 | `XGBoYhoEaFg=` | `true` | `window.Blob` 或 `window.File` 存在 |
| 38 | `Jn5SfGAVUUw=` | `true` | `window.URL` 或 `URL.createObjectURL` 存在 |
| 39 | `Vi5iLBBGYh0=` | `true` | `document.fonts` 存在 (CSS Font Loading API) |
| 40 | `KDxcPm5SWgo=` | `true` | `window.queueMicrotask` 存在 |
| 41 | `IxsXGWZyFi0=` | `true` | `window.structuredClone` 存在 |
| 42 | `Q3s3OQURPQo=` | `true` | `navigator.locks` 存在 (Web Locks API) |
| 43 | `GU1tT18lb3o=` | `true` | `navigator.storage` 存在 (Storage API) |
| 44 | `Vi5iLBNGYx4=` | `true` | `window.Scheduler` 或 `scheduler.postTask` 存在 |
| 45 | `eEwMDj0jCDQ=` | `true` | `window.ReportingObserver` 或 Trusted Types 存在 |
| 46 | `R38zPQIUOAs=` | `true` | `window.isSecureContext` |
| 47 | `VGhgahIAZ1A=` | `false` | `window.showModalDialog` 存在 (已废弃, false=不存在) |
| 48 | `ICRUJmVJVR0=` | `false` | `window.opera` 存在 |
| 49 | `M2sHKXUABx0=` | `false` | `document.all` 存在 (IE 特有) |
| 50 | `SBx8Xg1yf2g=` | `false` | `window.phantom` 或 `window._phantom` 存在 (PhantomJS 检测) |
| 51 | `Azt3eUVVd0w=` | `false` | `navigator.webdriver` (自动化标志) |
| 52 | `VGhgahEAalw=` | `false` | `window.domAutomation` 或 `document.__selenium_unwrapped` |
| 53 | `Dzd7dUpffkE=` | `false` | `window.callPhantom` (PhantomJS 检测) |
| 54 | `MVUFV3Q9Bmw=` | `false` | `navigator.plugins` 是否被 override |
| 55 | `X0crRRkpL3U=` | `false` | `navigator.permissions` 异常检测 |
| 56 | `S3M/MQ4YOwE=` | `false` | `navigator.brave` 存在 (Brave 浏览器检测) |

---

## 10. Cookie 与存储

Cookie 启用状态和存储相关检测。

| # | Base64 Key | 值 | 推断的浏览器 API / 含义 |
|---|-----------|-----|----------------------|
| 1 | `WiJuIB9JZBA=` | `true` | `navigator.cookieEnabled` |
| 2 | `WiJuIB9KbBY=` | `true` | `document.cookie` 可写入/读取 |
| 3 | `WGxsbh4Ja1s=` | `true` | `localStorage` 可用 (读写测试) |
| 4 | `ZRlRGyBxWio=` | `{"smd":{"ok":true,"ex":false}}` | Storage Manager API 检测 — `navigator.storage.estimate()` 或 `StorageManager` |
| 5 | `HCAoIllILBg=` | `{}` | Cookie jar 状态或第三方 cookie 检测（空=无异常） |
| 6 | `HCAoIllLKxI=` | `{"l":"o","7nJF":false}` | PX cookie/storage 内部状态检测 |

---

## 11. 安全检测

Bot 检测、自动化工具检测、DevTools 检测等反作弊逻辑。

| # | Base64 Key | 值 | 推断的浏览器 API / 含义 |
|---|-----------|-----|----------------------|
| 1 | `Azt3eUVVd0w=` | `false` | `navigator.webdriver` — 自动化标志 (false=非自动化) |
| 2 | `SBx8Xg1yf2g=` | `false` | PhantomJS 检测 (`window._phantom`) |
| 3 | `Dzd7dUpffkE=` | `false` | `window.callPhantom` 检测 |
| 4 | `VGhgahEAalw=` | `false` | Selenium 检测 (`document.__selenium_unwrapped`) |
| 5 | `egIOQDxqD3Q=` | `false` | `window.emit` 或 CasperJS 检测 |
| 6 | `W0MvQR0oJHc=` | `false` | `window.__nightmare` (NightmareJS 检测) |
| 7 | `dg4CTDBrAHw=` | `false` | `document.documentElement.getAttribute("webdriver")` |
| 8 | `TlZ6FAg9fi4=` | `false` | Headless 检测 (chrome.runtime === undefined 等) |
| 9 | `Bz9zfUJReUg=` | `false` | `window.Buffer` 存在 (Node.js 环境检测) |
| 10 | `HwdrBVpqYDc=` | `0` | DevTools 检测分数 (0=未检测到开启) |
| 11 | `NAhASnJmS38=` | `0` | DevTools 尺寸差异检测 (outerHeight-innerHeight) |
| 12 | `EFQkFlU8IiQ=` | `0` | `console.log` 时间差检测 (DevTools open detection) |
| 13 | `cgoGSDdhBXw=` | `1` | PX 环境检查通过计数 |
| 14 | `GCwsLl1DLxs=` | `1` | 环境完整性评分 |
| 15 | `KnJecGwaXko=` | `3` | PX 信任等级 (3=可信) |
| 16 | `GCwsLl5JJx0=` | `["loadTimes","csi","app"]` | `Object.keys(window.chrome)` — Chrome 特有 API 检测 |
| 17 | `GU1tT1wlbHk=` | `"4YC/4YCb4YCR4YCA4YCd..."` (长 base64) | 环境特征编码签名 — 将多个检测结果编码为 Myanmar Unicode 范围 |
| 18 | `Jn5SfGAQUU0=` | `false` | `window.cdc_adoQpoasnfa76pfcZLmcfl_Array` (ChromeDriver 检测) |
| 19 | `W0MvQR0rLXY=` | `false` | Puppeteer 检测 |
| 20 | `Dzd7dUpbe0Q=` | `false` | `window.domAutomationController` (Chrome automation) |
| 21 | `FCggKlFGJxg=` | `false` | `navigator.languages` 为空检测 (headless 特征) |
| 22 | `YGQUZiYOFFw=` | `false` | `window.outerWidth === 0` 检测 (headless 特征) |
| 23 | `EmomaFQAJ1k=` | `false` | `navigator.plugins.length === 0` 检测 (headless 特征) |
| 24 | `fydLZTlJQF4=` | `false` | `Notification.permission === "denied"` 异常检测 |
| 25 | `fEAIAjolCDk=` | `false` | `window.chrome` 缺失检测 |
| 26 | `SBx8Xg51eWw=` | `false` | WebGL renderer 包含 "swiftshader" (headless 特征) |
| 27 | `W0MvQR4vLHE=` | `false` | `navigator.permissions.query` 异常 (权限 API 篡改) |
| 28 | `fWFJIzsPTRk=` | `false` | `Function.prototype.toString` 被 hook 检测 |
| 29 | `AEQ0BkUqNjM=` | `false` | `Object.getOwnPropertyDescriptor` 被篡改 |
| 30 | `CX19P0wWeQw=` | `false` | iframe sandbox 环境检测 |
| 31 | `KnJecG8aVUU=` | `false` | `window.Cypress` 检测 (Cypress 自动化框架) |
| 32 | `Azt3eUVQfU8=` | `false` | `HTMLElement.prototype` 被篡改检测 |
| 33 | `cRVFFzR6TyE=` | `false` | `Element.prototype.attachShadow` 被覆盖 |
| 34 | `HmYqZFsOLVM=` | `false` | `toString` proxy detection — Proxy-wrapped function 检测 |
| 35 | `GwNvAV5rZTA=` | `false` | `document.hasFocus()` 返回 false (无焦点=可能是 headless) |
| 36 | `X0crRRovKX8=` | `false` | `navigator.userAgentData.brands` 缺失检测 |
| 37 | `AWV1J0QKchw=` | `false` | `Error.captureStackTrace` 异常 (V8 特征检测) |
| 38 | `ST09fw9TOUQ=` | `false` | PX tamper detection — 脚本被篡改检测 |
| 39 | `YGQUZiUKE1w=` | `false` | CDP (Chrome DevTools Protocol) 检测 |
| 40 | `KxMfEW5+HiI=` | `"false"` | `navigator.webdriver` (字符串化结果) |
| 41 | `SlJ+EA87fyM=` | `"false"` | headless mode 检测 (字符串化结果) |
| 42 | `HmYqZFgOL1Y=` | `4141` | Performance timing 差异 — `performance.now()` 精度检测 |

---

## 12. PX 内部状态

PX 脚本内部生成的时间戳、会话 ID、事件标识等。

| # | Base64 Key | 值 | 推断的浏览器 API / 含义 |
|---|-----------|-----|----------------------|
| 1 | `eW1NLz8ETRw=` | `1771985206868` | PX 事件时间戳 — `Date.now()` at collection time |
| 2 | `b1dbVSk5W2U=` | `1771985207333` | PX 第二时间戳 — 采集完成时间 |
| 3 | `KV0dX28zFmg=` | `1771985206622` | PX 第三时间戳 — 脚本初始化时间 |
| 4 | `Rl5yHAMxeS4=` | `1771985208123` | PX 第四时间戳 — payload 构建完成时间 |
| 5 | `fEAIAjopAjY=` | `"3b99a650-11ee-11f1-af52-cff7f7903de1"` | PX session UUID — 会话唯一标识 |
| 6 | `UTUldxRbJkI=` | `"PX11745"` | PX event type ID — 事件类型标识符 |
| 7 | `UBRkVhZ/YWw=` | `"pxhc"` | PX handler context — 处理器上下文标识 |
| 8 | `QAR0RgVodnw=` | `"d6f5idih05as73cfjhg0"` | PX session ID (短格式) — `_pxVid` 或类似 |
| 9 | `FUlhS1AiYng=` | `"3"` | PX request sequence number — 请求序号 |
| 10 | `TBB4Ugl4fWQ=` | `"_Yzh0BIWEAws-fLVwkQbx17Pdl27vRvi..."` (长字符串) | `_px3` cookie 当前值 |
| 11 | `S3M/MQ4ZPAA=` | `"2f7b7d4363ccd1fe727a848bd37b9685cab01f55f7030661c29873dc6f064996:1bj7B/n4Yx3U..."` | `_pxde` 或 PX 加密 token (SHA256:base64:counter 格式 = PoW 答案) |
| 12 | `BXlxO0AQdw0=` | `8325` | PX internal counter — PoW solve time (ms) 或事件计数 |
| 13 | `TlZ6FAs+fyM=` | `995` | PX timing metric — 采集耗时 (ms) |
| 14 | `KxMfEW58GCs=` | `3600` | PX token TTL — cookie 过期时间 (秒) |
| 15 | `Bz9zfUFVcEo=` | `501` | PX score / status code — 风控评分或 HTTP 状态码 |
| 16 | `IUUVR2cvFnQ=` | `"17919146633600128771"` | PX entropy value — 大数值指纹 |
| 17 | `dg4CTDNlAX4=` | `"cAzxw"` | PX obfuscation key fragment |
| 18 | `XGBoYhkLa1k=` | `"{H>Jc7\|)/KRfy{rZz"` | PX encrypted token / nonce |
| 19 | `V08jTRIjIns=` | `1` | PX version 或 bundle request number |
| 20 | `Zj4SPCBVEQc=` | `1` | PX protocol version |
| 21 | `MVUFV3Q5AGw=` | `1` | PX flags — 功能开关 |
| 22 | `UipmKBROZRg=` | `1` | PX internal state counter |
| 23 | `HwdrBVpvYDU=` | `3` | PX collect stage (3=bundle phase) |
| 24 | `QAR0RgVqdHQ=` | `"109\|66\|66\|70\|80"` | PX timing chain — 各阶段耗时 (pipe-separated ms) |
| 25 | `ICRUJmVPVxE=` | `""` | PX error/debug field (empty=no error) |
| 26 | `S3M/MQ4cNQI=` | `""` | PX previous session token (empty=first session) |
| 27 | `eyNPYT5NRFo=` | `""` | PX referral token (empty=direct visit) |
| 28 | `TTE5cwtZOEk=` | `""` | PX cached state (empty=no cache) |
| 29 | `OAxMTn1lR3o=` | `null` | PX deferred value — 未设置 |
| 30 | `;=3;3;><<99<::;82==;` | `"8>0808=??::?998;1>>8"` | PX obfuscated key-value — XOR/shift 编码的内部校验值 |
| 31 | `NAhASnJtQH8=` | `0` | PX error count |
| 32 | `TTE5cwtaOUM=` | `0` | PX retry count |
| 33 | `IxsXGWVyFCI=` | `0` | PX block count |

---

## 13. 其他哈希

8 字符 hex hash 值，通常是指纹组件的 CRC32 或截断 MD5。

| # | Base64 Key | 值 | 推断含义 |
|---|-----------|-----|---------|
| 1 | `LnZadGgTWUI=` | `"f3fe87a85c90985c69d7a8566da77dc0"` | 综合指纹 MD5 hash (32 char = full MD5) |
| 2 | `TTE5cwtbPkc=` | `"663433d45234e7269b3e033766fa335f"` | 环境指纹 MD5 hash |
| 3 | `Y1tXWSU1U2o=` | `"e8562ccdde5d5ab3e404bf8279feebd2"` | 浏览器特征组合 MD5 hash |
| 4 | `EwtnCVZjZDo=` | `"0498b8de2c168ecb09b8c15ab39f1d62"` | Canvas/WebGL 组合 MD5 hash |
| 5 | `YjoWOCdUEwg=` | `"f49f18dbec5558a76590af096c339826"` | 字体/插件组合 MD5 hash |
| 6 | `Jx8THWJ3Eig=` | `"3207084bd110f1ac964863e23aa78e04"` | UA Client Hints 组合 MD5 hash |
| 7 | `WiJuIBxKbhs=` | `"64556c77"` | 短指纹 hash (8 char = CRC32) |
| 8 | `HCAoIllPLBE=` | `"10207b2f"` | 存储指纹 CRC32 |
| 9 | `egIOQDxnCXs=` | `"10207b2f"` | 存储指纹 CRC32 (与上相同=同一数据源) |
| 10 | `YjoWOCdTEw4=` | `"90e65465"` | API 检测组合 CRC32 |
| 11 | `KxMfEW14GiA=` | `"9f762773"` | 屏幕参数 CRC32 |
| 12 | `Qlp2GAc0cS0=` | `"dae10548"` | 时区/语言 CRC32 |
| 13 | `ICRUJmZBXxc=` | `"a3d12c4"` | 硬件参数 CRC32 (7 char, 可能截断) |
| 14 | `HCAoIlpELhk=` | `"82002457"` | 网络参数 CRC32 |
| 15 | `UipmKBdDbRk=` | `"a3d12c4"` | 硬件参数 CRC32 (与 #13 相同) |
| 16 | `Jx8THWF6GSg=` | `"90e65465"` | API 检测 CRC32 (与 #10 相同) |

---

## 14. 错误捕获

PX 脚本运行中捕获的 JS 错误，用于环境指纹。

| # | Base64 Key | 值 (截断) | 推断含义 |
|---|-----------|----------|---------|
| 1 | `Fm4ibFAKKVo=` | `"TypeError: Cannot read properties of null (reading '0')\n    at _r (https://client.px-cloud.net/PXO1GDTa7Q/main.min.js:2:21543)..."` | PX 主脚本内部 error trace — 用于检测环境差异（不同浏览器/Node 的堆栈格式不同） |
| 2 | `MkpGCHciRD8=` | `"TypeError: Cannot read properties of undefined (reading 'width')"` | WebGL/Canvas 检测 error — GPU 相关 API 失败 |

---

## 15. UA Client Hints API

`navigator.userAgentData` 及 `getHighEntropyValues()` 获取的数据。

| # | Base64 Key | 值 | 推断的浏览器 API / 含义 |
|---|-----------|-----|----------------------|
| 1 | `Jx8THWJ3ECc=` | `[{"brand":"Not:A-Brand","version":"99"},{"brand":"Microsoft Edge","version":"145"},{"brand":"Chromium","version":"145"}]` | `navigator.userAgentData.brands` |
| 2 | `XiZqJBtOaBc=` | `"Windows"` | `navigator.userAgentData.platform` |
| 3 | `Jx8THWJ3ES0=` | `"19.0.0"` | `navigator.userAgentData.platformVersion` (via getHighEntropyValues) |
| 4 | `DFA4Ekk4OiM=` | `"145.0.3800.70"` | `navigator.userAgentData.fullVersionList[x].version` — 完整浏览器版本 |
| 5 | `X0crRRovKHE=` | `"x86"` | `navigator.userAgentData.architecture` |
| 6 | `JDhQOmFQUw8=` | `"64"` | `navigator.userAgentData.bitness` |

---

## 16. 杂项与未分类

不易归类或含义不明确的字段。

| # | Base64 Key | 值 | 推断含义 |
|---|-----------|-----|---------|
| 1 | `GCwsLl1DLxs=` | `1` | PX client version / iteration |
| 2 | `cgoGSDdhBXw=` | `1` | 环境验证通过次数 |
| 3 | `fydLZTpOS1Y=` | `1` | `document.compatMode === "CSS1Compat"` → 1 (standards mode) |
| 4 | `NAhASnJtQH8=` | `0` | Error counter |
| 5 | `Zj4SPCNTFgc=` | `false` | 未知布尔检测 — 可能是 `navigator.doNotTrack === "1"` |
| 6 | `HwdrBVpvYDU=` | `3` | 可能是 `document.readyState` 阶段 (3=complete) |
| 7 | `DhY6VEt+OGE=` | `33` | 可能是 `navigator.maxTouchPoints` 或 AudioContext 相关 |
| 8 | `HmYqZFgOL1Y=` | `4141` | Performance timing 或 `PerformanceNavigationTiming.duration` |
| 9 | `BXlxO0AQdw0=` | `8325` | 事件采集耗时或 PoW 求解时间 |

---

## 17. 统计总结

### 字段类型分布

| 值类型 | 数量 | 占比 |
|--------|------|------|
| `boolean` | 107 | 46.7% |
| `string` | 72 | 31.4% |
| `number` | 40 | 17.5% |
| `object` (array/map/null) | 10 | 4.4% |
| **总计** | **229** | **100%** |

### 分类分布

| 分类 | 字段数 | 说明 |
|------|--------|------|
| 基础环境 | 7 | URL, referrer, protocol, visibility |
| 浏览器标识 | 14 | UA, platform, vendor, appName, appVersion |
| 屏幕与显示 | 18 | resolution, color depth, viewport, DPR |
| 语言与时区 | 5 | language, languages, timezone, offset |
| 硬件检测 | 8 | CPU cores, memory, heap, architecture |
| 网络信息 | 6 | effectiveType, RTT, downlink |
| 插件信息 | 4 | plugins, mimeTypes |
| Canvas/WebGL/音频指纹 | 12 | canvas hash, WebGL hash, audio hash |
| API 与功能检测 | 56 | 各种 Web API 存在性检测 |
| Cookie 与存储 | 6 | cookie, localStorage, sessionStorage |
| 安全检测 (Bot/Automation) | 42 | webdriver, phantom, selenium, devtools |
| PX 内部状态 | 33 | timestamps, UUIDs, counters, tokens |
| 其他哈希 | 16 | MD5, CRC32 fingerprint component hashes |
| 错误捕获 | 2 | JavaScript error traces |
| UA Client Hints | 6 | brands, platform, architecture, bitness |
| 杂项 | 9 | 不易归类的字段 |

### 关键发现

1. **安全检测是最大重点**: 42 个字段专门用于检测自动化工具 (Selenium, Puppeteer, PhantomJS, Cypress, ChromeDriver 等)，占比 18.3%。PX 对 bot 检测投入极大

2. **API 功能检测覆盖广泛**: 56 个布尔字段检测各种 Web API 是否存在，形成浏览器能力指纹。真实浏览器的 API 组合是独特的

3. **多层哈希体系**: 16 个哈希字段分为两类：
   - 32 字符 MD5 (6个): 综合指纹组件
   - 8 字符 CRC32 (10个): 细粒度指纹组件
   - 相同哈希出现多次 (`a3d12c4`, `90e65465`, `10207b2f`) 说明有字段交叉验证

4. **四个时间戳**: 从脚本初始化到 payload 构建完成的四个精确毫秒时间戳，用于检测执行速度异常

5. **错误堆栈作为指纹**: 故意触发 TypeError 并捕获堆栈字符串。不同 JS 引擎/环境产生的错误格式不同，这是一种高级指纹技术

6. **双 UA 采集**: `navigator.userAgent` 被采集两次（key 不同），加上 `navigator.userAgentData` 系列，形成三重 UA 校验

7. **环境编码签名** (`GU1tT1wlbHk=`): 将多个检测结果编码为 Myanmar Unicode 字符范围 (U+1000-U+105F)，这是一种混淆手段，防止简单的 JSON 级 hook

8. **PoW 答案嵌入**: `S3M/MQ4ZPAA=` 字段包含 SHA256 hash + base64 数据 + counter (1000)，这是 PoW 求解结果直接嵌入指纹 payload

9. **`_px3` Cookie 回传**: 当前 `_px3` cookie 值被包含在 payload 中 (`TBB4Ugl4fWQ=`)，服务端可以校验 cookie 是否被篡改

10. **Chrome 对象枚举**: `window.chrome` 的 key (`loadTimes`, `csi`, `app`) 被采集，headless Chrome 中这些属性可能缺失或不同

### 对抗指纹检测的关键点

- 必须确保 `navigator.webdriver === false` 且不是通过 `Object.defineProperty` 伪造的（PX 检测 descriptor 篡改）
- `Function.prototype.toString` 不能被 hook（检测字段 `fWFJIzsPTRk=`）
- Canvas/WebGL 哈希必须与真实浏览器一致
- 四个时间戳的间隔必须合理（不能太快也不能太慢）
- 错误堆栈格式必须符合 V8 引擎规范
- `navigator.plugins` 必须返回 5 个 PDF 相关插件（Chromium 标准）
- `navigator.connection` API 必须完整实现
- `navigator.userAgentData` 与 `navigator.userAgent` 必须一致

---

## 18. 哈希生成源码定位 (main.js)

16 个哈希字段的生成位置、输入 API、哈希函数已全部定位。

### 18.1 MD5 哈希 (R() 函数, 32 hex chars) — 6 个

| # | 指纹类型 | main.js 行号 | 函数 | 输入 API | 哈希方式 |
|---|---------|-------------|------|----------|---------|
| 1 | Canvas #1 (emoji) | 7487-7510 | `lp()` 内 Promise | `canvas 650×12, fillText(U+1F600~U+1F66E), toDataURL()` | R() |
| 2 | Canvas #2 (glyph) | 7513-7544 | `lp()` 内 Promise | `canvas 860×6, 39 种 Unicode 字符, toDataURL()` | R() |
| 3 | AudioContext | 7545-7597 | `lp()` 内 Promise | `OfflineAudioContext(1ch, 44100Hz), oscillator+compressor, samples[4500:5000] 绝对值求和` | R() |
| 4 | 字体检测 | 6980-7058 | `Tv()` | DOM 元素宽高比较不同字体渲染差异 (mv 字体数组) | R() |
| 5 | Math 函数 | 7433-7448 | `sp()` 内 | `10 个 Math 函数 × 8 个常量 = 80 值` → JSON 序列化 | R() |
| 6 | 语音合成 | 7455-7470 | `sp()` 内 | `speechSynthesis.getVoices()` 属性遍历 | R() |

### 18.2 CRC32/短哈希 (8 hex chars) — 10 个

| # | 指纹类型 | main.js 行号 | 函数 | 输入 |
|---|---------|-------------|------|------|
| 1 | WebGL shader 渲染 | 7188-7246 | `Pv()` | fragment shader → `readPixels()` 蓝通道 26 采样点 |
| 2 | UIEvent 属性枚举 | 7360-7373 + 7608-7619 | `hp()` | `UIEvent.prototype` 所有属性拼接 → R() |
| 3 | WebKitCSSMatrix 枚举 | 同上 | `hp()` | `WebKitCSSMatrix.prototype` 属性拼接 → R() |
| 4 | WebGLContextEvent 枚举 | 同上 | `hp()` | `WebGLContextEvent.prototype` 属性拼接 → R() |
| 5-10 | 组合指纹 | 7256-7389 | `np` 数组 | 屏幕/时区/语言/硬件/API 各维度组合值 |

### 18.3 汇聚点

```
lp() (line 7486) — 主入口
  ├── Promise.all() 并行采集:
  │   ├── Tv()          → 字体 MD5
  │   ├── Canvas #1     → emoji 渲染 MD5
  │   ├── Canvas #2     → glyph 渲染 MD5
  │   ├── AudioContext   → 音频 MD5
  │   ├── Pv()          → WebGL shader hash
  │   └── sp()          → Math + 语音 MD5
  ├── np 数组           → 同步采集 56+ 特征 (含 CRC32)
  ├── hp()              → 构造器属性枚举 hash
  └── line 7598         → 合并所有结果到事件对象 d
```

### 18.4 伪造策略

按变化频率分三层：

**写死 (~170 字段)** — 同一浏览器 profile 永远不变：
- 56 个 API 检测布尔值
- 42 个 Bot 检测 (全 false)
- 浏览器标识 (UA, platform, vendor, appName 等)
- 屏幕/显示 (1920×1080, colorDepth=32)
- 语言/时区 (zh-CN, Asia/Shanghai, -480)
- 硬件 (8 cores, 4GB memory, x86/64)
- 插件 (5 个 PDF viewer)
- Client Hints (brands, architecture)
- **6 个 MD5 + 10 个 CRC32 哈希** — 固定浏览器版本+系统+GPU 下不变，真实浏览器采集一次即可

**每会话生成 (~30 字段)**：
- uuid / sid / vid (会话 UUID)
- `_px3` cookie 值 (从上次响应获取)
- PoW 答案 (每次 ob 响应后计算)
- cs (从 ob 响应获取)

**每次请求动态 (~30 字段)**：
- 4 个时间戳 (init → collect → build → send，间隔需合理)
- seq / rsc (递增)
- `performance.memory` (heap size 每次微变)
- 错误堆栈 (行号需匹配 main.min.js 版本)
- timing chain `"109|66|66|70|80"`

> **关键**: 16 个哈希值不需要在 Node 中重新实现 Canvas/WebGL/Audio 渲染。
> 只需在真实浏览器 (Chrome 145 + Windows + 目标 GPU) 中运行一次 PX 脚本，
> 抓取哈希值后写死即可。同一环境下这些值是确定性的。
