# 🥡 ifood 平台分析报告

> **作者**：lsd  
> **平台网址**：[https://www.ifood.com.br/](https://www.ifood.com.br/)  
> **反爬框架**：PerimeterX WAF

---

## 📖 简介

本项目旨在系统性分析 ifood 平台的反爬机制、数据抓取流程及防护绕过策略，帮助研究者理解 PerimeterX WAF 的工作原理与应对方案。

---

## 📚 目录

- [🥡 ifood 平台分析报告](#-ifood-平台分析报告)
  - [📖 简介](#-简介)
  - [📚 目录](#-目录)
  - [1️⃣ 抓包分析](#1️⃣-抓包分析)
    - [1.1 请求特征](#11-请求特征)
      - [📦 请求详情整理](#-请求详情整理)
      - [🔗 URL 查询参数](#-url-查询参数)
      - [🧾 Headers（加密与关键标识字段）](#-headers加密与关键标识字段)
      - [🧠 Body 参数](#-body-参数)
    - [1.2 \_px3 生成行为链](#12-_px3-生成行为链)
  - [2️⃣ 反爬框架分析](#2️⃣-反爬框架分析)
    - [2.1 PerimeterX 初步切入点](#21-perimeterx-初步切入点)
      - [2.1.1 hook 后堆栈详细分析](#211-hook-后堆栈详细分析)
      - [2.1.2 collect 请求链的详细分析](#212-collect-请求链的详细分析)
      - [2.1.3 ah 函数的第一个参数的生成详细分析](#213-ah-函数的第一个参数的生成详细分析)
    - [2.2 解决方案，复现第三个 collect 请求做到无感请求的发送](#22-解决方案复现第三个-collect-请求做到无感请求的发送)
      - [2.2.1 第三个 collect 的复现](#221-第三个-collect-的复现)
    - [2.3 完整的执行 js 逆向流程](#23-完整的执行-js-逆向流程)
  - [3️⃣ cookie 更换流程](#3️⃣-cookie-更换流程)
    - [3.1 抓取逻辑](#31-抓取逻辑)
    - [3.2 发送 detail 的接口来测试](#32-发送-detail-的接口来测试)
  - [结论与展望](#结论与展望)
  - [📄 License](#-license)

---

## 1️⃣ 抓包分析

### 1.1 请求特征

- 目标请求分析 URL: `https://cw-marketplace.ifood.com.br/v2/bm/home`

#### 📦 请求详情整理

**请求方法**：`POST`  
**请求模式**：`cors`  
**Referrer**：`https://www.ifood.com.br/`  
**ReferrerPolicy**：`strict-origin-when-cross-origin`  
**Credentials**：`omit`

---

#### 🔗 URL 查询参数

| 参数名      | 示例值                                 | 说明                                                                          |
| ----------- | -------------------------------------- | ----------------------------------------------------------------------------- |
| `latitude`  | `-23.4585022`                          | 用户纬度                                                                      |
| `longitude` | `-46.48904890000001`                   | 用户经度                                                                      |
| `channel`   | `IFOOD`                                | 渠道标识                                                                      |
| `size`      | `20`                                   | 返回结果数量                                                                  |
| `section`   | `e92172a2-72c3-49e6-88b8-0dc170cf2e47` | 页面区块 ID                                                                   |
| `cursor`    | `BHBzAPSol60N...`                      | 翻页游标(由上一个接口的最后部分返回 cursor，客户端无法生成，属于后端返回的值) |
| `alias`     | `HOME_FOOD_DELIVERY`                   | 首页外卖推荐区块                                                              |

---

#### 🧾 Headers（加密与关键标识字段）

以下为请求中与 **加密验证、设备标识、会话追踪** 相关的关键 Headers，其他如 `accept`、`content-type`、`sec-fetch-*` 等均为浏览器自动附带的标准头，可忽略。

| Header                     | 示例值                                 | 说明                                                   | 生成方式                                |
| -------------------------- | -------------------------------------- | ------------------------------------------------------ | --------------------------------------- |
| `x-client-application-key` | `41a266ee-51b7-4c37-9e9d-5cd331f280d5` | 客户端应用 Key，用于标识前端应用版本                   | 从 cookie 中获取`aFasterAppKey` 的值    |
| `x-device-model`           | `Windows Edge`                         | 设备模型标识，用于设备指纹生成                         | 浏览器环境自动识别生成                  |
| `x-ifood-device-id`        | `3412f255-7532-4d81-9026-b7f8afa775b0` | 设备唯一 ID（UUID），用于追踪设备会话                  | 从 cookie 中获取`aDeviceId` 的值        |
| `x-ifood-session-id`       | `75ca0a0f-354a-44f1-a708-fdcbea6bab54` | 会话 ID，用于区分用户会话                              | 从 cookie 中获取`aSessionId`的值        |
| `x-px-cookies`             | `_px3=...; _pxvid=...; pxcts=...`      | **PerimeterX 加密验证 Cookie**，包含行为签名与加密令牌 | 由 PerimeterX JS SDK 动态生成并加密验证 |

> 🔒 **说明**：
>
> - `x-px-cookies` 是最核心的加密字段，由 PerimeterX 动态生成，用于验证请求合法性。
> - 不携带`x-px-cookies`，携带了过期或者错误的这个参数，将会触发 ifood 的人机验证风控。
>   所以如何正确生成\_px3 cookie 就是发送无感请求的关键

---

#### 🧠 Body 参数

```json
{
  "supported-headers": ["OPERATION_HEADER"],
  "supported-cards": [
    "MERCHANT_LIST",
    "CATALOG_ITEM_LIST",
    "CATALOG_ITEM_LIST_V2",
    "CATALOG_ITEM_LIST_V3",
    "FEATURED_MERCHANT_LIST",
    "CATALOG_ITEM_CAROUSEL",
    "CATALOG_ITEM_CAROUSEL_V2",
    "CATALOG_ITEM_CAROUSEL_V3",
    "BIG_BANNER_CAROUSEL",
    "IMAGE_BANNER",
    "MERCHANT_LIST_WITH_ITEMS_CAROUSEL",
    "SMALL_BANNER_CAROUSEL",
    "NEXT_CONTENT",
    "MERCHANT_CAROUSEL",
    "MERCHANT_TILE_CAROUSEL",
    "SIMPLE_MERCHANT_CAROUSEL",
    "INFO_CARD",
    "MERCHANT_LIST_V2",
    "ROUND_IMAGE_CAROUSEL",
    "BANNER_GRID",
    "MEDIUM_IMAGE_BANNER",
    "MEDIUM_BANNER_CAROUSEL",
    "RELATED_SEARCH_CAROUSEL",
    "ADS_BANNER"
  ],
  "supported-actions": [
    "catalog-item",
    "item-details",
    "merchant",
    "page",
    "card-content",
    "last-restaurants",
    "webmiddleware",
    "reorder",
    "search",
    "groceries",
    "home-tab"
  ],
  "feed-feature-name": "",
  "faster-overrides": ""
}
```

> 🔒 **说明**：
> -body 部分暂时未作解密。携带一样即可

---

### 1.2 \_px3 生成行为链

- 资料汇总
  `https://www.zenrows.com/blog/perimeterx-bypass#what-is-perimeterx`
  `https://blog.csdn.net/hero706309/article/details/131736540`

网上开源资料得知，\_px3 的生成有一套完整的行为逻辑链，需要去先访问 collect 接口来做进一步的加解密，才能生成\_px3

## 2️⃣ 反爬框架分析

### 2.1 PerimeterX 初步切入点

- 因为这个是跟 cookie 相关。我这里的想法是写一个 js 注入的 hook，如果网页写入新的\_px3，然后就会被 hook 到并打印调用堆栈。这样可以直接定位，cookie 写入和生成的位置。
- cookie_hook.js 这个文件中是让 AI 生成的油猴 hook 脚本。当网页设置键名中包含`px`的 cookie，就会触发这个脚本。需要注意的是，debugger 只有在打开开发者工具时才会断住，然后会在控制台打印堆栈。

#### 2.1.1 hook 后堆栈详细分析

![关键堆栈](./捕获.PNG)
可以看到上面我通过堆栈调用和查看堆栈函数的输入输出，定位到了生成 px3 的函数。关键位置是`u=ee` 这里。`i(a)`是字符串`'split'`，`i(o)`是字符串`'~~~'`。
`f=af(n)` n 就是传进来的参数`At()`。经过测试这里是写死的，是字符串`'Y1pWHi0oXXVx'`。然后经过 af 函数，就变成了定值，字符串`'504'`。需要注意的是这里所有的值在同一个 ob 混淆中不会变化，但是如果网页更新了他的加密脚本。这些 ob 混淆的值就会变化。为什么这么说，因为如果你去查看 af 函数的实现，它内部写死了一个偏移量，然后通过这个偏移量去读取一个固定的字符串。更新脚本后，这些值就会变化。这就是典型的 ob 混淆。经过检测，ifood 网站更新加密脚本的频率还是很频繁的，所以需要经常去维护这个 js 逆向的过程。
然后是 s，s 来自于`J(u)`，u 又来自于`Df(e)`,这里的 e 就是第二个 collect 接口的返回值。需要注意的是，这里传入的是字符串形式的响应数据。也就是 json 字符串。
我这里是这么处理的，`JSON.stringify(JSON.parse(text))`先转成 js 对象，再转成字符串。

#### 2.1.2 collect 请求链的详细分析

经过上面的初步 hook，我们发现获取第二个接口的 collect 很关键。

根据我们前面网上开源的相关逆向资料，我们知道 collect 接口是一个完整的请求链，先从第一个 collect 接口开始，拿到返回值，然后通过返回值再去构造第二个 collect 接口的载荷，然后拿到第二个接口的返回值，然后写入 cookie。因为我们 hook 到的写入 cookie 的时机正好此时是拿到第二个 collect 的时候。
![collect请求分析](./捕获1.png)

下面详细分析一下这个 collect 请求链的构成一个每次请求有什么变化。

```JavaScript
//  这是第一次collect的载荷
payload: aUkQRhAIEH9kY3dkAWMGdgBzDxAeEFYQCEkQU1h/VH9xSmh1Y1EPEAgQWkZGQkEIHR1FRUUcW1RdXVYcUV1fHFBAHUBXQUZTR0BTXEZXQRAeEGtYQWp9cVZkdGMCDxAIAh4QfWFFf1ABSndxA2cPEAgQZVtcAQAQHhBmZnMGUUVGZH1Zfw8QCAIeEHpncF1jA0FCUHp3DxAIAwcCAR4QdXECRn5eA3Z5SmMPEAgBBAICHhBnAl1fYWBnXn56Bg8QCAMFBAQDAwEFBgEEAwQeEHpFaENwZEJda3ZRDxAIAwUEBAMDAQUGAQQBAh4QcXQCC3pZBgN8W10PEAgQAwBQBFYBUQIfVlEKCh8DA1QCH1NUBQsfVAcCV1FRVlFTU1ALEB4QZwJdX2Fga1h7XAoPEAhcR15eHhBxWn8dZ3cLBH0AUQ8QCAIeEGABBktiY3dgfEVrDxAIVFNeQVceEHlcfFRRdQpramd3DxAIEFMACgpXCwsAUVYDVwtQUQoHCgZUCgICAQJWUAQKUVQGVAoDCwtQUQFWBgYLVGwEEUFdRBwsEVgYCVwYDVFMDBQAIVkBXS19De3^FXXFNZdVZRfksKcQRSrBWcLemJ1AUV4U0RXYEsZVl1gXXVwU2YEQx10}dVwLfUhBdD3YAfwBEQEFQA1xfUFNKMLYV9wXQRQSH5UC2t88Z3l/XWMPDwgDAgICCDGhxBnhQXAJwUHlhBmsNHfV5dUwFVHWJ9aFhKBX5qZ1dFC2admdgF5fntaWkZGcF9DAgtiS0V6A>XsAAHxcVWhDf3AKUUpzcwAAe0FkUwt8AVxAXVECY1tGe395AVgGXl8FQXUEeENkQmtwWwZmdARQDAl1zX1FWX3Z AGphAH92B1gdSGB`cVmdcQ1AKV2J8B1NEcHxKdRkEZBlre3FCU0AZQnkDSHZiXKRl5U15EUVl6cXdlQ1odZ38ZeUJAHRlQB0pAe1}ZxW0V5f15eWh0CAXwEXmhoaHtwAUtHYX94Q0UZWnNEamh4alcFBV9ddl92UUdqX3BoAHNHBFV2QWNnCmFTBXGKsBBWVFVmJDYAJKBE7hEC3lleWZWSlEKcGcDRX8FSn13VlhQBnlUfAAdeHt3cBlmWQVYWVFReWEKWF1FCwVmf1pQGWRKdEpwexkHBWRBXHsAa0dYBkpUUQVafwFxHV9LfGR7FXwJVSlBDQ0t3RQ8QT09v
appId: PXO1GDTa7Q
tag: Y1pWHi0oXXVx
uuid: 12b6d3c0-dc88-11f0-af79-f50eccdcaab9
ft: 379
seq: 0
en: NTA
bi: eE0NRC1zSmU EG1hYRgxZ3ltHwNqQUNmdFkdCUIJQU95a0x/PAdLfhYffz95agYde35HelBMTicRHAoKaSAJPmFZXTk9TD5pb28ZHD0KRGx0XB47RgxNGS5lR38mFgQ=
pc: 3373851112179979
sid: fccdfec4-dc81-11f0-9ee7-aceda280d695
vid: e728783d-db03-11f0-84d6-026153ed9e52
cts: fcce00fe-dc81-11f0-9ee7-aceda280d695
rsc: 1
```

```JavaScript
// 这是第二次collect的载荷
payload: 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^4eEHh2XmB9X3hmZGNBDxAIEAtUBQQABQUBEB4QflxWUFZ1QWtqZ3cPEAgQVlNXAwIHBgoQHhB3RUJfcWRoXlB2ew8QCBAQHhBmcHQHZ1VCA1EAfw8QCBBTAVYDAFEGEB4Qd2pgWXwDUWBrRUUPEAgQCgACAgAGBwUQHhB3X0FcU3RRdn5kWQ8QCBBTAiVYDAFEGEB4Qe2djZ2AAY0N3emcPEAgQf11IW15eUx0HHAISGmVbXFZdRUESfGYSAwIcAgkSZVtcBAYJEkoEBhsSc0JCXldlV1B5W0YdBwEFHAEEEhp5emZ/fh4SXltZVxJ1V1FZXRsScVpAXV9XHQMAChwCHAIcAhJhU1RTQFsdBwEFHAEEEndWVR0DAAocAhwCHAIQHhB6X1FAaHRBeH5kCg8QCFRTXkFXHhBRVUF6YXZgRHZ6Ag8QCBALAlcEBwYEBxAeEFFgYHd0SGALZkt7DxAIAR4QU1h/VH9xSmp1Y3cPEAgDBwEEHhB9cwN8ZlwHX2ABAg8QCAoEBh4QV1V/YmN2C0d2AX8PEAgDBwEEHhBhZkUKVEVK8YGJ3Zw8QCAoABh4QaAMHYWphe0pldVUPEAgQAwcBBGoKBAYQHhB dnRof19eVmVFfw8QCAAGHhBoWApmYnFwY3VjBg8QCDAAGHhB5ZEVRagBFAHRfQQ8QCAIeEHlKe1d3ZQcGdHFjDxAIAh4QdlpRBWR3Wh1/dXsPEAgHBwoeEHBIB0tUZ3hlUWcGDxAIBQYKHhB2SGgEVmdCV1R3Yw8QCAIeEGIAa3l4al19dnBzDxAIAh4QYgBreXhqWWJxSmMPEAhGQEdXHhB0XwpYUHR/dnhe`OUQ8QCFRTXkFXHhBkdV5aU1p3c1MDcw8QCBBFV1BZW0YQHhBzSEIAV2doZlFnXQ8QCBBaRkZCQQgQHhB5XHxUUXUKU2V3cw8QCBBUR1xRRltdXBJBWlNAVxobEkkSaVxTRltEVxJRXVZXbxJPEB4QdV9/RGt0Cnl5dHcPEAgQc0FbUx1hWlNcVVpTWxrAeEHlkRVFqAEUDdXVdDxAIEEUBURAeEGoCa0NgYF1EfgF3DxAIEEFRQFdXXBAeEHxhVXNTAXBwcANFDxAISRBCXkdVV0pGEAhJEAIQCEkQVBAIEFtcRldAXFNeH0JWVB9EW1dFV0AQHhBcEAgQYnZ0EmRbV0VXQBBPHhADEAhJEFQQCBBbXEZXQFxTXGh9CVlQfRFtXRVdAEB4QXBAIEHFaQF1fVxJidnQSZFtXRVdAEE8eEAAQCEkQVBAIEFtcRldAXFNeH0JWVB9EW1dFV0AQHhBcEAgQcVpAXV9bR18SYnZ0EmRbV0VXQBBPHhABEAhJEFQQCBBbXEZXQFxTXh9CVlQfRFtXRVdAEB4QXBAIEH9bUUBdQV1UpRhJ3VlVXEmJ2dBJkW1dFV0AQTx4QBhAISRBUEAgQW1xGV0BcU14fQlZUH0RbV0VXQBAeEFwQCBBlV1B5W0YSUEdbXkYfW1wSYnZ0EE9PHhBCXkdVW1xBbV5XXBAIB08eEHdFQl9xZGhYUHZVDxAISRBBX1YQCEkQXVkQCEZAR1ceEFdKEAhUU15BV09PHhB1RXhHc2QHQFNIQQ8QCElPHhB6cXdCe15ee3taYw8QCFRTXkFXHhB6cXdCe15ee35gaw8QCFRTXkFXHhBUZXB7e0hVeiGZgcw8QCBBWVgMHVFYDBxAeEHFIeBlRZwdQVwJdDxAISRBBR0JCXUBGEAhGQEdXHhBBRlNGR0EQCEkQV1RUV1FGW0RXZktCVxAIEAFVEB4QQEZGEAgGAgIeEFZdRVxeW1xZEAgDHAceEEFTRFd2U0ZTEAhUU15BV09PHhBzZWACeAJjfFRaYw8QCBBWV1RTR15GEB4Qf2Rjd2QBYwt2X1EPEAgBHhBRemd0VlhnUXYCfw8QCFRTXkFXHhBmZnMGUUVGZ31ZZw8QCBBRV1RQCgEBUV:FTB1ZTB1QBClMAAgZQUwdXBgADU1FUUxAeEGABBktiY3tmf2NRDxAIEFYHAFEBWVMCAEJHQQUBCwQERAECEB4QeHZeYH1feGFkRQYPEAgQUQQBClBUVAYDCgpXBgUGBwULVgMLAgtUUVAABgALB1cQHhBxdAILelkGS31xAg8QCBABAVMCB1QAU1AKBQIEVgcHVAtUVwAEC1QAAFZXClRUVBAeEHB0WUp1WXdFf0tZDxAIEFYCUAIKBgRUBQVRAAQAB1cEUVRRB1ZTVAYEBgtTAwQBEB4QfnZ0aH9fXlBlRWMPEAhpVFNeQVceHwsEAhwDAW8eEGhYCmZicXxkd2NrDxAIEGB6e2RDfQt9EB4QYF4LSHpzfwNRYVkPEAhUU15BVx4Qf1lGenF6Y1tgZnsPEAgQBgtXBwIKBlcQHhB ZHNrZwBBBnoAfw8QCBAFUQdUCwUABhAeEH52dGh/X15UZVVVDxAIEAQHVgoABFcCEB4QYV58HXdzCgVWYX8PEAgQUwsABAtXAgIQHhB SmtTdGVeC3dxUQ8QCBAHAlMHV1EHBxAeEGFwAwtqVQMBV2UGDxAIEAUBUwJUUAAEEB4Qd0VCX3FkaFVrWAoPEAhGQEdXHhBgXgtIenN/A1ZLQQ8QCEZAR1ceEHB0WUp1WXdIfGEGDxAIRkBHVx4QawNCZWVha0VnX0UPEAhUU15BVx4Qa3VnZGhbZ2J3ZEUPEAhGQEdXHhB dnRof19eUGpjWQ8QCDEZAR1ceEHBaCkhqd3wDfF8GDxAIRkBHVx4Qc0hCAFdnaGFWd38PEAhpbx4QaGBaY3VLcEtnW10PEAhJEGZkfgVWEAhUU15BVx4Qf1pIEAhGQEdXHhBjEAhGQEdXTx4QfFkLdnZ6f19gWAIPEAgQUQcEAgZWClAQHhBlW3xEe3ALeFBgfw8QCEkQVXMGaxAIVFNeQVdPHhB6Z3BdYwNBQFNccw8QCBADBAEHAQoDBwsEAAIFBgYBBAEEBhAeEAkOCw0LAAkNAQ4KCA8MDAsOCw4MEA^gQCg0IDggDCg4CDQkLDA8PCA0IDQ8QHhBgZlVFV0VwY3wCAg8QCAEGCwseEHRfClhQdH90e2QGDxAIVFNeQVceEH52dGh/X15RamNZDxAIAB4QZmZzBlFFRmR9WX8PEAgDHhB6Z3BdYwNBQlB6dw8QCAYAAQceEFMDeFdnYQILagB3DxAIAwUEBAMDAQUGBAEHAh4QdXECRn5eA3Z5SmMPEAgBBAICHhBnAl1fYWBnXn56Bg8QCAMFBAQDAwEFBgEEAwQeEHpFaENwZEJda3ZRDxAIAwUEBAMDAQUHAgoHBR4QcXQCC3pZBgN8W10PEAgQAwBQBFYBUQIfVlEKCh8DA1QCH1NUBQsfVAcCV1FRVlFTU1ALEB4QZwJdX2Fga1h7XAoPEAgQQ3dIS1kKR3FwZ3htSmtzRHZzBgB1elwKaFp4VgJBBF1Yf2BKc2RaR3t2d1RUBnxtfXZGZXV6H1s_fYmQLX0RUQ3xIX19EVnsAVB9HH0ZmR0tQXUVzAQZVQF5DCn0DQ1FYUXl V2FQfV92WkNbQnBeYQNja2ZVS15BA1FUeUNRUF0FcWR1V31rZ21nBmVmUVVdeAIFRVFYS1oFUEcBVHdUSGpmBVtVSHsPEB4QcVp/HWd3CwR9AFEPEAgBBAUKHAoCAgICAgICAgAFCwYeEGABBktiY3dgfEVrDxAIVFNeQVceEHlcfFRRdQpramd3DxAIEFMACgpXCwsAUVYDVwtQUQoHCgZUCgICAQJWUAQKUVQGVAoDCwtQUQFWBgYLVwEEUFdRBwsEVgYCVwYDVFMDBQAIVkBXS19De3FXXFNZdVZRfksKcQRrBWcLemJ1AUV4U09RXYEsZVl1gXXVwU2YEQx10dVwLfUhBd3YAfwBEQEFQA1xfUFMLYV9wXQRQSH5UC2t8Z3l/XWMPDwgDAgICCGhxBnhQXAJwUHlhBmsHfV5dUwFVHWJ9aFhKBX5qZ1dFC2dmdgF5fntaWkZGcF9DAgtiS0V6AXsAAHxcVWhDf3AKUUpzcwAAe0FkUwt8AVxAXVECY1tGe395AVgGXl8FQXUEeENkQmtwWwZmdARQAl1zX1FWX3Z AGphAH92B1gdSGBcVmdcQ1AKV2J8B1NEcHxKdRkEZBlre3FCU0AZQnkDSHZiXRl5U15EUVl6cXdlQ1odZ38ZeUJAHRlQB0pAe1ZxW0V5f15eWh0CAXwEXmhoaHtwAUtHYX94Q0UZWnNEamh4alcFBV9ddl92UUdqX3BoAHNHBFV2QWNnCmFTBXsBBWVFVmJDYAJKBEhEC3lleWZWSlEKcGcDRX8FSn13VlhQBnlUfAAdeHt3cBlmWQVYWVFReWEKWF1FCwVmf1pQGWRKdEpwexkHBWRBXHsAa0dYBkpUUQVafwFxHV9LfGRFXwJVSlBDQ0t3RQ8QT08eSRBGEAgQY3NkA2BVaEFRAX8PEB4QVhAISRBgZlVFV0VwYHxnWQ8QCBBQBVcFUwBTAlFTB1dXBQsLAwNQAAYDBQEDUVdWUQUGAxAeEFADaFNkYVkHamVnDxAIEFBXVFdUBlcDV1ZXC1BXCgsCUwNXB1AKBQNWAlcDClNUEB4QfHNecGFcdFxhXF0PEAgQZVdQeVtGEB4QUwN4V2dhAgVlX2MPEAgQZVdQeVtGEmVXUHV EB4QflxWUFZ1QVBlWWMPEAgQZVdQdX4SAxwEKCEhp9QldcdX4Sd2ESABwCEnFaQF1fW0dfGxAeEH52dGh/X0JrZXNrDxAIaRBzfHV d21bXEFGU1xRV1ZtU0BAU0tBEB4Qd2pmbVBeV1xWbV9bXF9TShAeEHdqZm1RXltCbVFdXEZAXV4QHhB3amZtUV1eXUBtUEdUVFdAbVpTXlRtVF5dU0YQHhB3a7mZtVldCRlptUV5TX0IQHhB3amZtVltBWF1bXEZtRltfV0BtQ0dXQEsQHhB3amZtVF5dU0ZtUF5XXFYQHhB3amZtVEBTVW1WV0JGWhAeEHdqZm1CXV5LVV1cbV1UVEFXRm1RXlNfQhAeEHdqZm1BWlNWV0BtRldKRkdAV21eXVYQHhB3amZtRldKRkdAV21RXV9CQFdBQVtdXG1QQkZREB4Qd2pmbUZXSkZHQFdtUV1fQkBXQUFbXVxtQFVGURAeEHdqZm1GV0pGR0BXbVRbXkZXQG1TXFtBXUZAXUJbURAeEHdqZm1GV0pGR0BXbV9bQEBdQG1RXlNfQm1GXW1XVlVXEB4Qd2pmbUFgdXAQHhB5emBtQlNAU15eV15tQVpTVldAbVFdX0JbXlcQHhB9d2FtV15XX1dcRm1bXFZXSm1HW1xGEB4QfXdhbVRQXW1AV1xWV0BtX1tCX1NCEB4QfXdhbUFGU1xWU0BWbVZXQFtEU0ZbRFdBEB4QfXdhbUZXSkZHQFdtVF5dU0YQHhB9d2FtRldKRkdAV21UXl1TRm1eW1xXU0AQHhB9d2FtRldKRkdAV21aU15UbVReXVNGEB4QfXdhbUZXSkZHQFdtWlNeVG1UXl1TRm1eW1xXU0AQHhB9d2FtRFdARldKbVNAQFNLbV1QWFdRRhAeEGV3cHV bVBeV1xWbVRHXFFtV0pGV1xWV1YQHhBld3B1fm1RXV5dQG1QR1RUV0BtVF5dU0YQHhBld3B1fm1RXV9CQFdBQVdWbUZXSkZHQFdtQQFGURAeEGV3cHV bVFdX0JAV0FBV1ZtRldKRkdAV21BAUZRbUFAVVAQHhBld3B1fm1WV1BHVW1AV1xWV0BXQG1bXFRdEB4QZXdwdX5tVldQR1VtQVpTVldAQRAeEGV3cHV bVZXQkZabUZXSkZHQFcQHhBld3B1fm1WQFNFbVBHVFRXQEEQHhBld3B1fm1eXUFXbVFdXEZXSkYQHhBld3B1fm1fR15GW21WQFNFEB4QZXdwdX5tQl1eS1VdXG1fXVZXEG8eEGdbRlx5cFZ1a2B/DxAIaRBpAx4SA28QHhBpAx4SAwIABm8QHgoeEEtXQRAeCh4ABh4KHgMEHgEAHgME7AQoGHgMCAAYeAwQBCgYeAwQeAwQBCgYeAQIeAwQeAwQeBgILBx4QaQEABQQFHhIBAAUEBW8QHhBcXW1UQhAeAAEeAwAFHgMABR4AAR4DAAUeAwAFHgABHgMABR4DAAUeAAEeAwAFHgMABR4AAR4DAAUeAwAFHgABHgMABR4DAAUeAAEeAwAFHgMABR4AAR4DAAUeAwAFHgABHgMABR4DAAUeAAEeAwAFHgMABR4AAR4DAAUeAwAFHgABHgMABR4DAAVvHhBUS2h5aGZCeGZkZw8QCBB1XV1VXlcSe1xRHBIafGR7dntzGxAeEHpncF1jA0FdUAFjDxAIEHN8dX53Ehp8ZHt2e3MeEnxke3Z7cxJ1V3RdQFFXEnVmahIDBAcCEhoCSgICAgIDdAsDGxJ2W0BXUUYBdgMDEkRBbQdtAhJCQW0HbQIeEnYBdgMDGxAeEFFgYHd0SFYLYGF3DxAIEGVXUHV EnV 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
appId: PXO1GDTa7Q
tag: Y1pWHi0oXXVx
uuid: 12b6d3c0-dc88-11f0-af79-f50eccdcaab9
ft: 379
seq: 2
en: NTA
bi: eE0NRC1zSmU EG1hYRgxZ3ltHwNqQUNmdFkdCUIJQU95a0x/PAdLfhYffz95agYde35HelBMTicRHAoKaSAJPmFZXTk9TD5pb28ZHD0KRGx0XB47RgxNGS5lR38mFgQ=
cs: 40af48428835c3ced356fa1ada8d65cd98faced40a33085824fef093c07853ce
pc: 2916133311672298
sid: fccdfec4-dc81-11f0-9ee7-aceda280d695󠄱󠄷󠄶󠄶󠄱󠄱󠄳󠄷󠄴󠄵󠄵󠄷󠄸
vid: e728783d-db03-11f0-84d6-026153ed9e52
cts: fcce00fe-dc81-11f0-9ee7-aceda280d695
rsc: 2
```

经过上面的分析，以及多维度对比多个请求链。`多维度对比collect请求链.js`(也就是，同一个请求链不同请求次数，以及不同请求链相同请求次数。多维度对比)，得出以下结论。

1.如何判断是不是同一请求链？
答：经过不同请求链的反复对比，以及堆栈跟踪。最终发现，是 uuid 参数，这个参数是用来保持是不是同一个会话请求链的不同请求的关键。这个参数由每次刷新网页生成，然后一直保存。相当于每次识别是不是同一个网页的参数。然后这个值也参与 pc 和 payload 参数的生成，是识别是不是同一个会话(请求链)的最关键参数。下面这个就是 uuid 参数的生成函数，可以看到如果 uuid 存在则不生成一直使用同一个如果不存在就生成。
![uuid会话保持参数](./捕获2.png)

2.如何判断是同一个请求链的第几次请求？
答：初步来看，服务器判断是请求链的第几次请求，是通过这里负载的 seq 和 rsc 参数，seq 在第一次请求时是 0，第二次请求是 2，然后第三次请求时是 3，然后每次都加 1。rsc 参数在第一次请求时是 1，第二次请求是 2，然后每次都加 1。但是实际上后续我们可以发现，payload 的生成和 pc 的生成中也使用了递增的参数，也是和第几次请求有关。但实际上我发现这个 seq，rsc 还有用于生辰 payload 和 pc 的递增参数可能不是那么重要，实际上只要比前一次大就行(甚至可能随机一个数也可以，最好 10 以内)。后面关于 payload 和 pc 生成我也会讲这部分。
另外识别是第几次请求，payload 和 pc 也是很关键的参数，甚至比上面的递增数还要关键

3.从上面来看，payload 和 pc 值的生成就是 collect 请求的关键。
答：是的。可以发现每一次的第一个请求的 payload 都很短，第二次 collect 以及后续的 collect 请求的 payload 都很长。这里可以推测第一次请求的 collect 实际上没有检测什么重要的环境。第二次以及后续 collect 肯定做了很深的环境检测。我们现在来具体分析一下 payload 和 pc 是怎么生成的。
首先这里我么就需要去发起前两次 collect 的请求的堆栈中找线索。

- 第一次 collect 请求堆栈
  ![第一次collect堆栈](./捕获3.PNG)
- 第二次 collect 请求堆栈
  ![第二次collect堆栈](./捕获4.PNG)

这里跟踪堆栈可以得到。生辰 payload 和 pc 以及其他参数的位置就是这个 Qm 的上面。
![payload和pc生成](./捕获5.PNG)
具体的生成函数是 ah，这里使用了 var 全局定义变量的写法，但是写在了 for 循环的条件括号中。
![ah函数](./捕获6.PNG)

我们先分析一下第一次 collect 请求的 ah 的传参
这里是 I 和 Jm
我们先看一下 Jm 的生成，Jm 很关键。
![Jm生成](./捕获7.PNG)
Jm 的生成位置如上。这里 Dn 调用了一个自定义深度拷贝函数，将一个对象 Yn 添加到这个 Jm 中。
下面是这个 Dn 复制函数。
![Dn复制函数](./捕获8.PNG)
这是 Jm 对象的内容

```JavaScript
{
    "DXzc": [
        "https://collector-PXO1GDTa7Q.px-cloud.net/api/v2/collector",
        "https://collector-PXO1GDTa7Q.px-cloud.net/b/s",
        "https://collector-PXO1GDTa7Q.px-cdn.net/api/v2/collector",
        "https://collector-PXO1GDTa7Q.px-cdn.net/b/s",
        "https://collector-PXO1GDTa7Q.pxchk.net/api/v2/collector",
        "https://collector-PXO1GDTa7Q.pxchk.net/b/s"
    ],
    "W2uJ": 0,
    "tyHF": 0,
    "Z7qq": 4,
    "hRFM": "PXO1GDTa7Q",
    "e0pk": "Y1pWHi0oXXVx",
    "sY39": "379",
    "channels": {
        "xhrSuccess": [
            {
                "once": false
            }
        ],
        "xhrResponse": [
            {
                "once": false
            }
        ],
        "xhrFailure": [
            {
                "once": false
            }
        ]
    },
    "params": null
}
```

虽然这里 ah 的第二个传参很重要。但是后续分析 ah 我们可以知道，Jm 其实不参与 pc 和 payload 的生成。所以可以不分析。

#### 2.1.3 ah 函数的第一个参数的生成详细分析

1.第一次 collect 请求的 I 的生成
ah 的第一个参数 I 的生成相当重要。我们打上断点跟栈发现。I 的生成来源于 e。e 的生成来源于 qm 函数。
![I生成](./捕获9.PNG)
继续往上找我们可以找到关键的函数，ml
![关键函数ml](./捕获10.PNG)
最后我们可以发现初始的 I 的生成来源于这里。
当然以上我们都是根据第一个 collect 来分析的 I 的生成，后续的 I 的生成是走的不一样的路径。

第一次 collect 的 I 的初始生成位置
![第一次collect的I生成](./捕获11.PNG)

```JavaScript
{
    "ajMfMCxZGQc=": "https://www.ifood.com.br/restaurantes",
    "JVgQW2A2FG0=": undefined，
    "YjsXOCdVFQ0=": 0,
    "OSwMb3xEC1U=": "Win32"
    "UitnKBREbR0=": undefined,
}
```

初始的 n 都是固定的值、
然后经过 ml，再添加一些值
![ml添加值](./捕获12.PNG)
这里 ml 的第一个参数传参基本都是固定的`"MVQEV3Q4D2A="`,第二个参数就是 n
这里 ml 做了一些赋值
![ml添加值](./捕获13.PNG)
把这两个值添加到原来的 n 中
这里 fl 是从 0 开始的一个递增数字
后面是 ni 函数，ni 函数如下

```JavaScript
        function ni() {
            if (ei())
                return Math.round(r.performance.now())
        }
```

这里的 r 是 window。也就是用来检测网页窗口开启了多长时间的函数

最后把所有的东西拼起来，变成 h1 对象，这个 h1 对象就是后面的 e

```JavaScript
hl.push({
                t: t,
                d: e,
                ts: (new Date).getTime()
            })
```

这里的 t 就是`"MVQEV3Q4D2A="`，ts 是时间戳

然后 e 再经过 for 循环赋值，就变成了最后的 I 数组
![I生成](./捕获14.PNG)

```JavaScript
[
    {
        "t": "MVQEV3Q4D2A=",
        "d": {
            "ajMfMCxZGQc=": "https://www.ifood.com.br/restaurantes",
            "YjsXOCdVFQ0=": 0,
            "OSwMb3xEC1U=": "Win32",
            "TTA4cwtVOkM=": 0,
            "HUBoQ1spbHE=": 21553,
            "GC0tLl1DKxQ=": 3600,
            "U0omSRUlLH4=": 1766372237438,
            "HwZqBVpoYDc=": 1766372789540,
            "CF09Hk41Nio=": "ed09dda0-dee1-11f0-b70d-1989e097f5b3",
            "U0omSRYjIn8=": null,
            "ChM/UE96O2c=": 0,
            "JVgQW2A2FG0=": undefined,
            "UitnKBREbR0=": undefined,
            "a1JeUS09X2E=": undefined
        }
    }
]
```

好的接下来我们认真分析一下这里所有键都代表了什么意思，也就是去看 for 循环中，到底赋值了哪些东西。
那这里我就先说最重要的部分了
这里的`"ChM/UE96O2c="`和`"U0omSRYjIn8="`这两个键很重要，而且第一次携带这两个值必须是 0 和 null，但是后续的 collect 请求一定不能是这个
我就直接说这里的键是什么意思了，以及为什么第一次必须是这个值，后续一定不能是这个值的原因。
在网页发起第一次 collect 请求时，其实会先去 发送一个 ns 的请求来向服务器获取`"U0omSRYjIn8="`这个键的值，而`"ChM/UE96O2c="`这个键其实是监控了发起这个 ns 的请求用了多少时间的性能监控参数。
具体的位置是在 for 循环的这里
![关键赋值](./捕获15.PNG)
但是我是怎么找到这里的 am 和 om 的值的定义位置的？
我是通过全局搜索 am 和 om 关键字来找到的。一般定义的话都是 var am
所以我们需要全局搜索 am 记住一定要在 am 之前带上空格，这样可以更精准的匹配。
![am寻找](./捕获16.PNG)

这里我们可以很清晰的看到 am 和 om 的定义位置以及他们的具体作用。
我们可以直接将他们挂载达到 window 上来全局使用这个东西。

为什么说第一次 collect 一定是 null 和 0 呢
因为我们在第一次发起 collect 请求时，同步发起 ns 的请求，这个时候，服务器还没有返回值，这里 om 请求时间也一定是 0
如果这里的值不是 null 和 0 那么就会导致服务器判定为这不是第一次 collect 请求，返回的 ob 值就会不对。 2.第二个 collect 请求的 I 的生成
第二个 collect 请求和第一次完全不同。因为第二次的 I 生成过于复杂。这里找到了堆栈以及生成的逻辑。我还是略微简述一下。因为我发现后续网页也会自己更新 cookie，会发送第三次第四次请求，然后直接复用浏览器自己当前的请求链，伪造后续的第三次，第四次请求会简单很多。
所以我们的思路是，不去直接构造整个请求链，比如从开始的第一次 collect，到第二次 collect，到第三次 collect。这个方案理论上可行，但是第二次请求的 I 构造过于麻烦，而且检测的点很多。所以我们暂时不用这个方案
这里我们用第二个方案，用 playwright 去访问 ifood 目标网页后，网页自己会构造第一个 collect 和第二个 collect 然后我们直接复用这个请求链，去构造后续的第三次 collect 以及后续的 collect 来达到更换 cookie 的目的。

这里我还是简述一下第二个 collect 是如何构造 I 的吧

首先是第一次 collect 请求后返回的 ob
传入 cT 函数进行解码，解码成指令集形式，然后交给 Lf 函数去执行
![ct解码执行](./捕获17.PNG)
这里会生成一些东西，然后会给第二次 collect 的 I 的生成用到。最明显的就是第一次返回的 ob 中会有服务器时间戳，构造第二次 I 的时候要带上

然后会执行 cT 中的 iT 函数，进一步进入 iT 中跟栈，发现最终生成 I 的关键函数，Md 函数
![关键位置MD](./捕获18.PNG)
这里 md 就是生成 I 的前一部分的关键位置。
这里细说一下就是，里面有个 for 循环，这个 for 循环做了两个检测，其中一个检测就是时间检测，如果运行时间超过定下的时间就会报错，所以你在 for 循环内部打断点是不行的，会报错。

然后就是传参，这里传参也很有说法，r 是 0， a 是前面的回调函数，如果你自己把 Md 载到全局上的话，a 就写成空的匿名函数就行

然后如果你要把 Md 挂载到全局自己使用这个函数，需要在函数内部写

```JavaScript
n = [...n]
// 利用展开赋值来固定n，不然这里使用了shift 你只能运行Md一次，原数组n就会被改变，添加了这个就可以防止原数组被改变，可以所次调用n
```

然后就是前两个了，e 和 n 相当关键，
这里的 n，是前面生成的 h
![h的生成](./捕获19.PNG)
h 的生成每次都是随机的，可以把这个 h 通过挂载到全局的方式暴露到全局

这个 e 的生成位置是在这里
![e参数位置](./捕获20.PNG)
这里 ts 很好理解，这里 qo。就是我说的服务器返回的服务器时间戳。大概就是第一个 ob 解码出来的`"OllllOOl|"`的后面就是了。

然后 Md 在运行完成后就会生成很长的一个对象

```JavaScript
{
    "ts": 1766388014549,
    "ZRhQGyNwUSg=": 1766387893649,
    "bjcbNCtdGQA=": "PHVM3vKL5",
    "WiNvIB9JbRM=": {
        "gA4Y": false
    },
    "bRBYEyh5XiU=": true,
    "FCkhKlFGIBg=": "109|66|66|70|80",
    "HUBoQ1sranQ=": 952,
    "X0YqRRkjK38=": true,
    "b1ZaVSk8WGU=": true,
    "CXx8P0wQfAw=": "false",
    "LndbdGsfW0c=": "false",
    "cypGaTZHRl8=": 1,
    "S3I+MQ0YPAo=": 1,
    "bjcbNCtZEAc=": "",
    "eWxMLz8IRhw=": [
        "loadTimes",
        "csi",
        "app"
    ],
    "dg8DTDNlCXo=": true,
    "MktHCHQiRTI=": "49e5084e",
    "LVAYU2s4H2M=": "7c5f9724",
    "LDFZMmlfWgg=": "65d826e0",
    "SlN/EA87dSM=": "a9269e00",
    "LxYaFWl9ECc=": "50a5ec55",
    "SB19Xg13eW4=": "73a0fb26",
    "EwpmCVZgYj8=": true,
    "Rl9zHAM1dys=": true,
    "BFkxGkEzNS4=": true,
    "Y1pWWSYwUmw=": false,
    "YGUVZiUPEVw=": true,
    "LDFZMmlbXQk=": true,
    "Bh8zXEN1Nm4=": true,
    "HUBoQ1sranA=": "12906076689351525080",
    ":92;=;<==328>:>9>;3;": ";83:<:=<<239?;?8?:2:",
    "RTgwewBQN00=": 7185,
    "Y1pWWSYwVGI=": "aP~7j?Xh<]Y;SWS",
    "IntXeGcXU0M=": [
        "PDF Viewer",
        "Chrome PDF Viewer",
        "Chromium PDF Viewer",
        "Microsoft Edge PDF Viewer",
        "WebKit built-in PDF"
    ],
    "a1JeUS48VGU=": 5,
    "b1ZaVSk/X2E=": true,
    "MktHCHckRDI=": true,
    "BXhwO0MXeg0=": true,
    "Tld7FAgzcSA=": true,
    "W0IuQR0rJHA=": "zh-CN",
    "OSwMb3xEC1U=": "Win32",
    "CzJ+cU1YdEI=": [
        "zh-CN",
        "en",
        "en-GB",
        "en-US"
    ],
    "BXhwO0MTdw0=": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36 Edg/128.0.0.0",
    "ZHkReiEVEE8=": true,
    "RTgwewNXO0k=": -480,
    "FCkhKlJDIRk=": 8,
    "fWBIIzsKTxY=": 4,
    "Q3o2OQYWPAo=": "Gecko",
    "Zj8TPCBaEQY=": "20030107",
    "X0YqRRopKXM=": "5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36 Edg/128.0.0.0",
    "GwJuAV1mbjo=": true,
    "XGFpYhoJbVQ=": true,
    "Bh8zXENzNGo=": 2,
    "VQggCxNsIDg=": "Netscape",
    "NAlBSnJhRHE=": "Mozilla",
    "MVQEV3c+AWE=": true,
    "UTQkdxRaIkQ=": 400,
    "T3Y6NQkZPwU=": false,
    "Fm8jbFAFKV0=": 1.45,
    "Qlt3GAQycys=": "3g",
    "dg8DTDBrBnk=": true,
    "GmMvYF8OLVI=": true,
    "QSQ0ZwROMFQ=": true,
    "V04iTRInIHk=": "x86",
    "JVgQW2AxEm4=": "64",
    "KxIeEW57HCs=": [
        {
            "brand": "Chromium",
            "version": "128"
        },
        {
            "brand": "Not;A=Brand",
            "version": "24"
        },
        {
            "brand": "Microsoft Edge",
            "version": "128"
        }
    ],
    "Tld7FAs+eS8=": false,
    "DFE5Ekk4OiA=": "",
    "LxYaFWp/GSY=": "Windows",
    "fyZKZTpPSVU=": "10.0.0",
    "Tld7FAs+eCU=": "128.0.2739.79",
    "U0omSRYjIHM=": true,
    "CF09Hk00OyU=": true,
    "T3Y6NQoZPgU=": "fd0bbe0ff56fcd816bdb2d95938a7842",
    "aRxcHyx2ViU=": true,
    "NSgAa3NCClw=": 8,
    "MktHCHchQjg=": false,
    "Fm8jbFMFIV4=": false,
    "Zj8TPCNVEQY=": "RHIVqO9O",
    "SlN/EAw6fis=": "64556c77",
    "X0YqRRkvKn8=": "",
    "Q3o2OQYUMwo=": "10207b2f",
    "a1JeUS02WGo=": "10207b2f",
    "V04iTRImJns=": "90e65465",
    "eWxMLz8DSxs=": true,
    "Jn9TfGMXU0g=": true,
    "Rl9zHAA0eC8=": true,
    "WQwsDx9lLzo=": true,
    "VQggCxBhIDk=": true,
    "cypGaTZDRl8=": "4YC/4YCb4YCR4YCA4YCd4YCB4YCd4YCU4YCG4YGS4YCm4YCa4YCX4YCf4YCQ4YCT4YGS4YC94YCc4YCe4YCb4YCc4YCX4YGS4YGa4YC84YCT4YCG4YCH4YCA4YCT4YCe4YGb4YGS4YGf4YGS4YCo4YCH4YCe4YCH4YGS4YGa4YCh4YCd4YCH4YCG4YCa4YGS4YCz4YCU4YCA4YCb4YCR4YCT4YGb",
    "O2IOIX4LDhQ=": "3207084bd110f1ac964863e23aa78e04",
    "SlN/EA87dSQ=": null,
    "IUQUR2QqEHU=": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36 Edg/128.0.0.0",
    "HmcrZFsJLV8=": false,
    "cgsHSDRvDH0=": "90e65465",
    "TTA4cwtUOkU=": "f5c01200745f61fa7b68104a4a5b646c",
    "R34yPQITMQc=": "d54f1d83t85s739q9oog",
    "JDlROmJSVw4=": "c638bff4188e474579d1909fcb24295e",
    "CF09Hk4yOC0=": "0801fdb5b72182d4abf533d5c5a8dd99",
    "BFkxGkEwMyk=": "d0b0846f77c2625e6cfc5daf4649a163",
    "ajMfMCxXGQE=": 1536,
    "OA1NTn5mR30=": 864,
    "egMPQD9uD3M=": 1536,
    "STw8fwxRPEU=": 824,
    "Z15SXSIxWGg=": "1536X864",
    "LDFZMmldWwM=": 24,
    "Zj8TPCBQGQ4=": 24,
    "KVwcX2w2Fms=": 0,
    "KxIeEW54FCQ=": 0,
    "Dhc7VEh/MGI=": 150,
    "Bz5yfUJWcU4=": 748,
    "DzZ6dUpefEQ=": 0,
    "P2YKJXoODBA=": 0,
    "P2YKJXkPCxQ=": true,
    "Fm8jbFMDJlc=": false,
    "Nk9DDHMmRj0=": "c562ed9d",
    "Rl9zHAM1cSk=": false,
    "cRREFzR9TyI=": 3,
    "YjsXOCdVFQ0=": 0,
    "SlN/EAw6fio=": 3,
    "T3Y6NQkTMAM=": "TypeError: Cannot read properties of null (reading '0')\n    at kr (https://client.px-cloud.net/PXO1GDTa7Q/main.min.js:1190:21)\n    at Fd (https://client.px-cloud.net/PXO1GDTa7Q/main.min.js:6228:27)\n    at Md (https://client.px-cloud.net/PXO1GDTa7Q/main.min.js:5849:30)\n    at https://client.px-cloud.net/PXO1GDTa7Q/main.min.js:6943:17",
    "ajMfMCxZGQc=": "https://www.ifood.com.br/restaurantes",
    "NAlBSnJgSn8=": [],
    "Fw5iDVJiYjw=": "https%3A%2F%2Fwww.ifood.com.br%2Frestaurantes",
    "XidrJBhIahE=": false,
    "GUxsT1wiaXU=": true,
    "MktHCHQhTD4=": false,
    "Bh8zXENxOGo=": false,
    "MktHCHciRD4=": true,
    "DFE5Ekk4OiU=": "TypeError: Cannot read properties of undefined (reading 'width')",
    "STw8fwxVP0s=": "webkit",
    "Zj8TPCNWEAk=": 33,
    "CzJ+cU5bfUs=": false,
    "PAFJQnloT3U=": false,
    "T3Y6NQofMQQ=": false,
    "Fm8jbFMGKFs=": "AudioData.SVGAnimatedAngle.SVGMetadataElement",
    "LDFZMmlbWwQ=": [
        false,
        -960.13
    ],
    "VGlhahEAa1A=": "webkit",
    "Azp2eUZTcUo=": "https:",
    "KnNfcG8aWEA=": "function share() { [native code] }",
    "GmMvYF8KKFE=": "Asia/Shanghai",
    "KVwcX2w1GGo=": "w3c",
    "X0YqRRovL3E=": "screen",
    "NSgAa3BBB1w=": {
        "plugext": {
            "0": {
                "f": "internal-pdf-viewer",
                "n": "PDF Viewer"
            },
            "1": {
                "f": "internal-pdf-viewer",
                "n": "Chrome PDF Viewer"
            },
            "2": {
                "f": "internal-pdf-viewer",
                "n": "Chromium PDF Viewer"
            },
            "3": {
                "f": "internal-pdf-viewer",
                "n": "Microsoft Edge PDF Viewer"
            },
            "4": {
                "f": "internal-pdf-viewer",
                "n": "WebKit built-in PDF"
            }
        },
        "plugins_len": 5
    },
    "EwpmCVZjbDg=": {
        "smd": {
            "ok": true,
            "ex": false
        }
    },
    "GwJuAV5razs=": {},
    "HCEpIllIIhQ=": false,
    "HCEpIllILRY=": false,
    "fWBIIzgJTRA=": "dd15fd15",
    "CzJ+cU5be0o=": {
        "support": true,
        "status": {
            "effectiveType": "3g",
            "rtt": 400,
            "downlink": 1.45,
            "saveData": false
        }
    },
    "AWR0J0QNfhQ=": "default",
    "MVQEV3Q9Dmc=": 3,
    "cHUFdjUcD0M=": false,
    "cypGaTVFRFg=": false,
    "Bh8zXEB2MGs=": false,
    "eyJOYT5PT1A=": false,
    "CF09Hk0yOyw=": false,
    "cHUFdjYeBEw=": false,
    "W0IuQR0pLnA=": false,
    "dWhAKzMHShA=": false,
    "ICVVJmZBVB0=": false,
    "WQwsDx9kKD0=": false,
    "AEU1BkUoNzY=": false,
    "b1ZaVSk5X28=": false,
    "ajMfMC9cHAU=": false,
    "bHEZcikbHEE=": false,
    "STw8fw9VPEQ=": 36133392,
    "ZRhQGyNxVyw=": 2172649472,
    "eyJOYT1GT1A=": 38991028,
    "XidrJBhDbRY=": "Mon Dec 22 2025 15:39:06 GMT+0800 (中国标准时间)",
    "dWhAKzMBQB8=": false,
    "cHUFdjYfD0A=": false,
    "STw8fw9YP08=": false,
    "NAlBSnFmQH0=": true,
    "FUhgS1Akank=": 0,
    "aRxcHy92WSU=": false,
    "Jn9TfGAQVUc=": "visible",
    "aH0dfi0SFks=": false,
    "UitnKBREbR0=": 0,
    "Bh8zXENyNG4=": 1536,
    "TBF5Ugl+e2Q=": false,
    "Zj8TPCBVFA8=": 824,
    "Zj8TPCBbFwk=": "missing",
    "YGUVZiULElA=": true,
    "ICVVJmZMUxQ=": true,
    "fWBIIzsJThk=": false,
    "RTgwewNQNk8=": true,
    "EFUlFlU8IiQ=": 1,
    "LxYaFWp+GyY=": 0,
    "Jn9TfGAaWE8=": 8,
    "ChM/UEx3PmU=": 0,
    "LDFZMmpbWAI=": 8,
    "dg8DTDBnAXc=": 8,
    "ZRhQGyByUio=": {
        "TVL7d": false,
        "Mhz": true,
        "Q": true
    },
    "LDFZMmlcXQk=": 2
}
```

差不多是这样，里面的有些 undefined 没有显示。

然后经过回调函数中的操作，删除操作
如下
![回调操作](./捕获21.PNG)
比如这里的 delete

然后再下一步
![下一步](./捕获22.PNG)
这里 ml ，ml 中的操作我前面说过了不说了

然后再下一步，生成第二个 I 的下半部分
![zv](./捕获23.PNG)
这里的逻辑是获取一个 localstorage 中键值对的值
然后将这个值，通过 lv 函数转成网页需要的形式
![lv](./捕获24.PNG)
这里 lv 中删了两个键值对，需要注意一下，里面的 zv(e)就是删除用的。然后最后是 Av 函数，这个函数就是 ml。
至此就把前面的第一部分和第二部分给拼起来了，拼成了 h1

然后这个 h1 传给 e，e 再通过 for 循环变成 I，再传入 ah 中生辰我们需要的 payload 和 pc 等参数。

然后上面还有个小点需要说一下，这里如果 Zv 函数没有找到 localstorage 中对应的键名的话，有一个更新函数，Kv，在 Zv 中存在，Kv 函数的作用就是如果 localstorage 不存在的话就去重新生成这个 localstorage 然后写入。

以上就是第二次请求的 collect 的一些参数的形成逻辑。
但是我这里不用复现这个请求，这里只做技术分析，下面我将详细讲一下，我的解决方案。

### 2.2 解决方案，复现第三个 collect 请求做到无感请求的发送

- 为什么不能完整复现从第一个 collect 开始的真个请求链
  因为经过测试我发现，第二个请求的检测点太多了。复现完整的从 1 开始的 collect 请求，效果不好（暂时没成功）。
  而且既然我们选择使用自动化工具 playwright+scrapy 的方式，那么我们就需要先进到他的网页中，网页自己会创建前两个请求，我可以利用他的原本的会话来实现，cookie 的自己替换。

#### 2.2.1 第三个 collect 的复现

- 第一步： 构造 I
  经过多次测试，发现第三个接口的 I，参数是固定的。我已经全部整理好了，列在下方

```JavaScript
window.screen.t += 1;
var a = 4;
var b = 4;
const pxvid = document.cookie.match(/_pxvid=([^;]+)/)?.[1] || "";
console.log(pxvid);
const pxcts = document.cookie.match(/pxcts=([^;]+)/)?.[1] || "";
console.log(pxcts);
const pxsid = sessionStorage.getItem("pxsid") || "";
console.log(pxsid);
window.screen.aa = [
  {
    t: "Ahs3WER/PGs=",
    d: {
      "BXhwO0MTdw0=":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36 Edg/128.0.0.0",
      "CF09Hk4yOC0=": window.screen.s(pxsid, navigator.userAgent),
      "CF09Hk41Nio=": window.screen.u(),
      "ChM/UE96O2c=": window.screen.x, // 数值不同：666.0999999940395 vs 882.7000000029802
      "DFE5Ekk8Pik=": window.screen.t, // 数值不同：2 vs 1
      "FCkhKlFBJx0=": 0,
      "HUBoQ1gub3c=": 0,
      "HUBoQ1spbHE=": Math.round(window.performance.now()), // 数值不同：1517080 vs 243926
      "HwZqBVpoYDc=": new Date()["getTime"](), // 时间戳不同
      "JDlROmJSVw4=": window.screen.s(pxvid, navigator.userAgent),
      "JVgQW2AyE2w=": undefined,
      "KnNfcG8YXUE=":
        document.cookie.match(/(?:^|; )_px3=([^;]*)/)?.[1] || null, // 第二组存在，第一组无
      "M2oGKXYABhs=": undefined,
      "R34yPQERNwY=": false,
      "TTA4cwtUOkU=": window.screen.s(window.screen.u(), navigator.userAgent),
      "TTA4cwtVOkM=": window.screen.v++, // 数值不同：8 vs 7
      "U0omSRYjIn8=": window.screen.y, // 加密字符串不同
      "XidrJBhCaBU=": true,
      "ajMfMCxZGQc=": "https://www.ifood.com.br/restaurantes",
      "bjcbNChSGQY=": 240000,
    },
  },
];
```

差不多就是上面这些。因为 ifood 网页经常更新，所以下次可能就不是这些加密键名了。需要自己打断点找一下。我后面会教怎么找到这些东西。

那么我来具体解释一下这上面的键值对都代表了什么，去哪里找。
首先一些常见的写死的我就不说了。从上往下我介绍一下。
这里值的定义大部分我都是通过全局搜索的方式找到了。而且基本都是集中在一个地方
![全局搜索](./捕获25.PNG)
`"CF09Hk4yOC0="` 就是在这里定义的，然后通过打断点，确定传入的参数是什么。第一个参数是 sessionStorage 中的 pxsid，第二个参数是 navigator.userAgent。
`"CF09Hk41Nio="`的值就是 uuid，也即是我前面展示过的函数。
`"DFE5Ekk8Pik="` 的值就是 Al，和上图中的一样，我们通过全局搜索找到 Al 的定义位置，然后通过下面这种方式，将 Al 挂载到全局变量 t 上，这样 Al 和 t 就绑定在一起了。

```JavaScript
        Object.defineProperty(window.screen, 't', {
  get() {
    return Al;
  },
  set(v) {
    console.log('set 被调用，v =', v);
    Al = v;
  }
});
```

`"ChM/UE96O2c="`和`"U0omSRYjIn8="` 我要合起来说。我前面不是说 collect 请求之前要先发 ns 的请求嘛，没错这两个值就是和 ns 有关
![全局搜索](./捕获26.PNG)
这里的我写的 window.screen.z 就是网页用来发送 ns 请求的函数。我把它挂载到全局 z 上，这样我们就可以随时随地想法就发了。
ns 的返回值就是这里的 y，也就是`"U0omSRYjIn8="` ，然后这这里的`"ChM/UE96O2c="`，其实是性能监控参数，用来监控这个请求发起到返回响应用了多久时间。也像我这里一样挂载到全局 x 上就可以了

然后像是`"JDlROmJSVw4="`和`"TTA4cwtUOkU="` 逻辑和第一个`"CF09Hk4yOC0="` 一样，只不过传入的参数不太一样。

`"TTA4cwtVOkM="`其实是 fl，这里我么也像 Al 一样做一个全局挂载
![全局搜索](./捕获27.PNG)

`"XidrJBhCaBU="` 这个写成 false 也可以，写成 true 也可以，暂时不知道什么作用。
`"KnNfcG8YXUE="` 这个就是目前 cookie 中存在的\_px3 的值

- 通过 I 生辰 pc 和 payload
  经过反复的堆栈查找，我终于在 ah 函数内部确定了，pc 的生成和 payload 的生成
  ![全局搜索](./捕获28.PNG)

pc 的生成依靠这里的 h = oe() 这里。这里的 h 就是 pc 生成位置，
这里看到 oe 的第一个传参是 ut(t)，这里的 t 就是上面我们构成的 aa

第二个参数，我们改写一下就是`[window.screen.u(), "Y1pWHi0oXXVx", "379"].join(":")`
这里的`window.screen.u()`就是 uuid

所以我们很清晰了只要把 oe 还有 ut 挂载到全局对象上就可以了。

payload 的生成，则是下面的 Ul(t,d)函数，这里的 t 还是 aa，d 就是上面的自定义对象

我分解一下就是下面的这个东西，然后这里还是要说一句，里面写死的一些值，如果网页更新，一定会变化，所以我下面会高速你如果网页更新了，你应该怎么做。

```JavaScript
window.screen.bb = {
  vid: pxvid,
  tag: "Y1pWHi0oXXVx",
  appID: "PXO1GDTa7Q",
  cu: window.screen.u(),
  cs: window.screen.y,
  pc: window.screen.cc,
};
```

这里我们需要去挂载这里的 Ul 函数。

### 2.3 完整的执行 js 逆向流程

> 技术栈说明，使用 playwright+scrapy，playwright 用来替换网页原文件，以及做 cookie 的轮换，scrapy 拿到轮换的 cookie 用来发送请求
> 第二种技术路线，直接在 playwright 种发送请求，拿到数据后，再用 scrapy 去 pipline 清洗。

1.首先我们需要精准抓包到第三次 collect 的设置 cookie 的请求，使用我们的油猴 hook，在第一次断住的时候放开，等待(大约 5-10 分钟)，网页自己会发送第三次 collect 请求，来替换旧的 cookie，这个时候会被 hook 断住。 2.查找堆栈
![全局搜索](./捕获29.PNG)
你可以像我一样，在 Ul 函数入口位置写一个 console.log 调试，这样就可以知道，传入的 t 是什么了。这样我们就可以确定上面的 aa 是什么。这很重要，根据 t 的键值对和值的来源构造 aa，就像我上面做的一样。这一步很难。如果不会可以来找 lsd 询问。

关键就是这里 Ul 传入的参数的 t 的构造。

3.挂载到全局
根据这里 t 的构造。我们需要把一些东西挂载到全局，让我们随时随地来使用。
按照 t 的键值对我们一步步来挂载

首先是，U 函数
![全局搜索](./捕获31.PNG)
![全局搜索](./捕获30.PNG)
你需要在这里打上断点，然后有一些耐心等待几十分钟，等到网页自己换 cookie 的时候就会被断住。然后像上面这个图一样，把 U 函数挂载到全局上.

然后是 uuid
![全局搜索](./捕获32.PNG)
建议在这个 for 循环的内部 Ma 的位置打断点，然后把 Ma 函数挂载到全局上

然后是关于 ns 请求的。你需要全局搜索(空格)am 或者(空格)om 然后找到定义位置，把发送 ns 请求的函数连同 am om 都要挂载到全局对象上，就像我上面的截图一样(解释 ns 请求的那个截图)。

然后就是 Al 和 fl 递增数字，像我上面那样通过 Object.defineProperty 挂载到全局对象上

然后 aa 的所有键值对已经可以出来了
然后就是用 aa 去生成 payload 和 pc
可以看到 payload 的生成依赖 pc
这里我们根据前面的分析需要将 ae ut 还有 Ul 等函数都要挂载到全局对象上

![全局搜索](./捕获33.PNG)
![全局搜索](./捕获34.PNG)
![全局搜索](./捕获35.PNG)
如上图所示。

至此所有文件替换的准备工作都已经完成

## 3️⃣ cookie 更换流程

### 3.1 抓取逻辑

- 利用 playwright 打开浏览器，跳转到网页，在请求阶段替换 main.main.js 文件。
- 等待网页稳定后，我们可以进行 cookie 替换
- 构造 aa

```JavaScript
window.screen.z(window.screen.u(), "https://tzm.px-cloud.net");
console.log(window.screen.y)
console.log(window.screen.x)
window.screen.t += 1;
var a = 1;
var b = 4;
const pxvid = document.cookie.match(/_pxvid=([^;]+)/)?.[1] || "";
console.log(pxvid);
const pxcts = document.cookie.match(/pxcts=([^;]+)/)?.[1] || "";
console.log(pxcts);
const pxsid = sessionStorage.getItem("pxsid") || "";
console.log(pxsid);
window.screen.aa = [
  {
    t: "Ahs3WER/PGs=",
    d: {
      "BXhwO0MTdw0=":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36 Edg/128.0.0.0",
      "CF09Hk4yOC0=": window.screen.s(pxsid, navigator.userAgent),
      "CF09Hk41Nio=": window.screen.u(),
      "ChM/UE96O2c=": window.screen.x, // 数值不同：666.0999999940395 vs 882.7000000029802
      "DFE5Ekk8Pik=": window.screen.t, // 数值不同：2 vs 1
      "FCkhKlFBJx0=": 0,
      "HUBoQ1gub3c=": 0,
      "HUBoQ1spbHE=": Math.round(window.performance.now()), // 数值不同：1517080 vs 243926
      "HwZqBVpoYDc=": new Date()["getTime"](), // 时间戳不同
      "JDlROmJSVw4=": window.screen.s(pxvid, navigator.userAgent),
      "JVgQW2AyE2w=": undefined,
      "KnNfcG8YXUE=":
        document.cookie.match(/(?:^|; )_px3=([^;]*)/)?.[1] || null, // 第二组存在，第一组无
      "M2oGKXYABhs=": undefined,
      "R34yPQERNwY=": false,
      "TTA4cwtUOkU=": window.screen.s(window.screen.u(), navigator.userAgent),
      "TTA4cwtVOkM=": window.screen.v++, // 数值不同：8 vs 7
      "U0omSRYjIn8=": window.screen.y, // 加密字符串不同
      "XidrJBhCaBU=": false,
      "ajMfMCxZGQc=": "https://www.ifood.com.br/restaurantes",
      "bjcbNChSGQY=": 240000,
    },
  },
];
```

> 这里首先发起 ns 请求，更新 am 和 om 也就是 cs 参数，然后通过我们刚刚的挂载到全局的一些函数变量构造 aa

- 把 aa 送入 pc 和 payload 生成函数种生成对应的加密值

```JavaScript
// [window.screen.u(), "Y1pWHi0oXXVx", "379"].join(":")
window.screen.cc = window.screen.q(
  window.screen.r(window.screen.aa),
  [window.screen.u(), "Y1pWHi0oXXVx", "379"].join(":")
);
console.log(window.screen.r(window.screen.aa))
console.log(window.screen.cc)

// window.screen.p()

window.screen.bb = {
  vid: pxvid,
  tag: "Y1pWHi0oXXVx",
  appID: "PXO1GDTa7Q",
  cu: window.screen.u(),
  cs: window.screen.y,
  pc: window.screen.cc,
};
console.log(window.screen.bb)

window.screen.dd = window.screen.p(window.screen.aa, window.screen.bb);
```

- 通过 payload 和 pc 构造请求

```JavaScript
fetch("https://collector-pxo1gdta7q.px-cloud.net/api/v2/collector", {
  method: "POST",
  mode: "cors",
  credentials: "omit",
  headers: {
    accept: "*/*",
    "accept-language": "zh-CN,zh;q=0.9,en;q=0.8,en-GB;q=0.7,en-US;q=0.6",
    "cache-control": "no-cache",
    "content-type": "application/x-www-form-urlencoded",
    pragma: "no-cache",
    priority: "u=1, i",
    "sec-ch-ua":
      '"Chromium";v="128", "Not;A=Brand";v="24", "Microsoft Edge";v="128"',
    "sec-ch-ua-mobile": "?0",
    "sec-ch-ua-platform": '"Windows"',
    "sec-fetch-dest": "empty",
    "sec-fetch-mode": "cors",
    "sec-fetch-site": "cross-site",
  },
  referrer: "https://www.ifood.com.br/",
  referrerPolicy: "strict-origin-when-cross-origin",
  body: new URLSearchParams({
    // 固定参数（不会变化）
    appId: "PXO1GDTa7Q",
    tag: "Y1pWHi0oXXVx",
    ft: "379",
    en: "NTA",
    bi: "eE0NRC1zSmU+EG1hYRgxZ3ltHwNqQUNmdFkdCUIJQU95a0x/PAdLfhYffz95agYde35HelBMTicRHAoKaSAJPmFZXTk9TD5pb28ZHD0KRGx0XB47RgxNGS5lR38mFgQ=",
    sid: pxsid,
    vid: pxvid,
    cts: pxcts ,

    // 动态参数（服务器校验相关，占位符）
    uuid: window.screen.u(), // 每条请求链唯一
    seq: a++, // 阶段序号（0, 2, 3...）
    rsc: b++, // 阶段计数（1, 2, 3...）
    pc: window.screen.cc, // 随机数或时间戳
    payload: window.screen.dd, // 加密数据体
    cs: window.screen.y, // 校验码（从第二阶段开始出现）
  }),
})
```

> 这里的 bi 是写死的，然后 seq 和 rsc 是要一样的数值，我这里是 10 开始的
> ![bi](./捕获36.PNG)

- 然后拿到返回的 ob 我们还需要解码函数
  这里我忘记说了。解码函数也需要挂载到全局上，解码函数就是我一开始说的 u=ee 那个位置，我们需要把 ee 函数，还有 J 函数，还有 Df 函数都要挂载到全局上。才可以。完成解码后我们需要把 cookie 的\_px3 替换成解码后的值。就完成了 cookie 的自定义更新了。最好也将 locastorage 中的"x-px-cookies"也更新一下

```JavaScript
.then(res => res.text())
.then(text => {
  // 将响应尽量标准化为 JSON 字符串，无法解析时回退为原文
  const raw  JSON.stringify(JSON.parse(text))

  // 120 === parseInt("504", 10) % 128
  const px3Value =
    window.screen
      .m(window.screen.n(window.screen.o(raw)), parseInt("504", 10) % 128)
      .split("~~~")
      .find(s => s.includes("_px3"))
      ?.match(/\|\d+\|(.+?)\|true/)?.[1] ?? "";

  // 无条件创建/更新 _px3（未解析到则写空）
  document.cookie = `_px3=${px3Value}; path=/; domain=.ifood.com.br; Secure; SameSite=None`;
  // 获取 cookie 中的 _px3 和 _pxvid
  const px3 = document.cookie.match(/(?:^|; )_px3=([^;]*)/)?.[1] || "";
  const pxvid = document.cookie.match(/(?:^|; )_pxvid=([^;]*)/)?.[1] || "";
  // 按照给定格式拼接
  const combined = `_px3=${px3};_pxvid=${pxvid}`;
  // 无论存在与否都重写 localStorage
  localStorage.setItem("x-px-cookies", combined);
})
.catch(err => {
  console.error("请求出错：", err);
});

```

### 3.2 发送 detail 的接口来测试

```JavaScript
// 从 cookie 中提取 _px3、_pxvid、pxcts 并拼接成完整字符串
function getPxCookies() {
  const getCookie = (name) => {
    const match = document.cookie.match(
      new RegExp("(?:^|; )" + name + "=([^;]*)")
    );
    return match ? decodeURIComponent(match[1]) : "";
  };
  const px3 = getCookie("_px3");
  const pxvid = getCookie("_pxvid");
  const pxcts = getCookie("pxcts");
  return `_px3=${px3}; _pxvid=${pxvid}; pxcts=${pxcts}, true`;
}

function fetchRestaurants(cursor) {
  const url = `https://cw-marketplace.ifood.com.br/v2/bm/home?latitude=-23.4585022&longitude=-46.48904890000001&channel=IFOOD&size=20&alias=HOME_FOOD_DELIVERY`;

  const headers = {
    accept: "application/json, text/plain, */*",
    "accept-language": "pt-BR,pt;q=1",
    app_version: "9.129.4",
    browser: "Windows",
    "cache-control": "no-cache, no-store",
    "content-type": "application/json",
    country: "BR",
    platform: "Desktop",
    pragma: "no-cache",
    priority: "u=1, i",
    "sec-ch-ua":
      '"Chromium";v="128", "Not;A=Brand";v="24", "Microsoft Edge";v="128"',
    "sec-ch-ua-mobile": "?0",
    "sec-ch-ua-platform": '"Windows"',
    "sec-fetch-dest": "empty",
    "sec-fetch-mode": "cors",
    "sec-fetch-site": "same-site",
    "x-client-application-key": "41a266ee-51b7-4c37-9e9d-5cd331f280d5",
    "x-device-model": "Windows Edge",
    "x-ifood-device-id": "3412f255-7532-4d81-9026-b7f8afa775b0",
    "x-ifood-session-id": "e8479db0-6c54-4ab5-95fa-a5dbaaab62a3",
    "x-px-cookies": getPxCookies(),
  };

  const body = {
    "supported-headers": ["OPERATION_HEADER"],
    "supported-cards": [
      "MERCHANT_LIST",
      "CATALOG_ITEM_LIST",
      "CATALOG_ITEM_LIST_V2",
      "CATALOG_ITEM_LIST_V3",
      "FEATURED_MERCHANT_LIST",
      "CATALOG_ITEM_CAROUSEL",
      "CATALOG_ITEM_CAROUSEL_V2",
      "CATALOG_ITEM_CAROUSEL_V3",
      "BIG_BANNER_CAROUSEL",
      "IMAGE_BANNER",
      "MERCHANT_LIST_WITH_ITEMS_CAROUSEL",
      "SMALL_BANNER_CAROUSEL",
      "NEXT_CONTENT",
      "MERCHANT_CAROUSEL",
      "MERCHANT_TILE_CAROUSEL",
      "SIMPLE_MERCHANT_CAROUSEL",
      "INFO_CARD",
      "MERCHANT_LIST_V2",
      "ROUND_IMAGE_CAROUSEL",
      "BANNER_GRID",
      "MEDIUM_IMAGE_BANNER",
      "MEDIUM_BANNER_CAROUSEL",
      "RELATED_SEARCH_CAROUSEL",
      "ADS_BANNER",
    ],
    "supported-actions": [
      "catalog-item",
      "item-details",
      "merchant",
      "page",
      "card-content",
      "last-restaurants",
      "webmiddleware",
      "reorder",
      "search",
      "groceries",
      "home-tab",
    ],
  };

  return fetch(url, {
    method: "POST",
    headers,
    referrer: "https://www.ifood.com.br/",
    referrerPolicy: "strict-origin-when-cross-origin",
    body: JSON.stringify(body),
    mode: "cors",
    credentials: "omit",
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error("Network response was not ok: " + response.status);
      }
      return response.json();
    })
    .then((data) => {
      console.log("响应 JSON 数据:", data);
      return data;
    })
    .catch((error) => {
      console.error("请求失败:", error);
    });
}

// 示例调用
var cursor =
  "BHBzAPSol60NAO7SzNcXAIi6sowJALKN-bEZAI65-YwOAIK3wIsRAMynmqwOAMTKi5IdAAYAKAI=";
fetchRestaurants(cursor);

```

测试是可以拿到数据的。然后这里有个要点就是翻页不是传统的 page 翻页，而是游标翻页，这里的 cursor 需要在上一次的 json 数据的末尾来获取。

---
## 结论与展望

- ifood使用的安全技术真的很难。而且风控十分严格。
- 这里极限一个礼拜也只能堆栈分析到这个地步了。下一步就是做全链路的请求链构造。难度也是有的。但是我已经分析的基本透彻了，花一点时间也可以模拟出来，但是对于日常的爬虫爬取我认为已经够了。
- 这里更换文件的技术手段我认为是现阶段最好的过js前端加密的方式，省去了补环境的工作。大大提高了效率。

---

## 📄 License

本项目仅供学习与研究使用，禁止用于任何商业或非法用途。
