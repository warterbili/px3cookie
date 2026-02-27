# CLAUDE.md

## 项目概述

针对 ifood.com.br 的 PerimeterX WAF JS 逆向项目。仅限学术研究用途。

## 当前进度

- [x] 定位 payload 生成函数（`window.screen` 上挂载的 PX 加密函数链）
- [x] 复现第三个 collect 请求，主动生成 `_px3` cookie
- [x] 实现 cookie 自动替换（写入 `document.cookie` + `localStorage.x-px-cookies`）
- [x] Bundle #1 请求完整逆向（16 字段 payload, POST 参数生成链）
- [x] Bundle #2 请求完整逆向（228 字段浏览器指纹 payload）
- [x] ob 响应解码（gt→XOR key→handler 执行→状态更新）
- [x] PoW 算法还原（SHA-256 暴力搜索）
- [x] payload 加密/交织算法还原（Jf: XOR→base64→UUID 驱动交织）
- [x] POST 参数生成链（cs/pc/sid/vid/cts 等全部还原）
- [x] /ns 端点逆向（`GET tzm.px-cloud.net/ns?c={uuid}`）
- [x] CLI 解码工具（decode_payload.js, decode_ob.js）
- [x] Event builder（bundle#1.js, bundle#2.js）
- [ ] **下一步：Bundle #3 请求（用户按键验证 + WASM）**
- [ ] 端到端 Bundle 请求构建脚本（#1 → ob → /ns → #2 → ob → #3）

## 关键标识

| 项目 | 值 |
|------|-----|
| AppID | `PXO1GDTa7Q` |
| Collector | `collector-pxo1gdta7q.px-cloud.net/api/v2/collector` |
| Bundle | `collector-pxo1gdta7q.px-cloud.net/assets/js/bundle` |
| /ns 端点 | `tzm.px-cloud.net/ns?c={uuid}` |
| PX 主脚本 | `client.px-cloud.net/PXO1GDTa7Q/main.min.js` |
| 核心 Cookie | `_px3` |
| PX 函数挂载点 | `window.screen.*`（s/u/q/r/p/m/n/o 等） |

## 目录结构

```
github/                    # 主工作目录
  reverse/                 # 核心逆向模块 (可 require 复用)
    ob.js                  # ob 响应解码 + 27 handler + PoW solver
    payload.js             # payload 加密/解密/交织
    pc.js                  # pc 校验 (HMAC-MD5 变体)
    sid.js                 # sid 隐写 (Unicode Tag Characters)
    uuid.js                # UUID v1 生成器
    ns.js                  # /ns 端点请求 (参数: uuid, NOT appId)
  script/                  # CLI 解码工具
    decode_payload.js      # curl 请求文件 → 解码 payload → json/
    decode_ob.js           # ob 响应 JSON → 解码 → result/ (gt 必填)
  event/                   # event builder (payload 数据模板)
    bundle#1.js            # Bundle #1 (16 fields)
    bundle#2.js            # Bundle #2 (228 fields 浏览器指纹)
  json/                    # 解码后的 payload JSON
  result/                  # ob 响应解码结果
  request/                 # 原始 curl 抓包
  responce/                # 原始 ob 响应 JSON
  bundle/                  # bundle 知识文档 (bundle#1.md, bundle#2.md)
main.js                    # PX 主脚本 (10653 lines, 混淆)
captcha.js                 # PX captcha 模块 (含 WASM, 文件名每次变)
BUNDLE_COMPLETE_ANALYSIS.md
BUNDLE_FINGERPRINT_ANALYSIS.md
documents.md               # PX 逆向参考资源汇总
```

## 约束

- 回答精简，不废话
- 这是 JS 逆向项目，重点关注：混淆代码分析、加密算法还原、请求链构造、WASM 逆向
- 不要添加不必要的注释、类型标注或文档
- 代码风格跟随项目现有风格（中文注释、ES6+）
- 涉及加密/编码分析时，给出具体的字段映射和算法推断，不要泛泛而谈
- 分析 PX 混淆代码时，优先关注 `window.screen` 上挂载的函数和数据流
- 不要自作主张重构现有逆向脚本
