// collector #2 event 模板
// 基于 8 次抓包解码对比生成 (忽略第3次224字段的特殊情况)
// 203 个字段, 其中 166 个固定, 37 个动态 (含 1 个 anti-tamper 动态 key/value)
// 其中 8 个浏览器环境字段虽样本间有波动但纯算写死 (标注 "纯算固定")
//
// key 随 PX 脚本版本变化，值的逻辑不变

var { generateHash } = require('../../ifood_PerimeterX-WAF_jsReverse/px_reverse/reverse/hash');
var { hmacMD5 } = require('../../ifood_PerimeterX-WAF_jsReverse/px_reverse/reverse/pc');
var { generateMemory } = require('../../ifood_PerimeterX-WAF_jsReverse/px_reverse/reverse/memory');

// XOR cipher (main3.js te() line 657-661)
function te(t, e) {
    for (var n = "", r = 0; r < t.length; r++)
        n += String.fromCharCode(e ^ t.charCodeAt(r));
    return n;
}

/**
 * 构建 collector #2 event (指纹采集)
 */
function buildCollector2Event(uuid, opts) {
    opts = opts || {};
    var now = Date.now();
    var mem = generateMemory();
    // 时间线: initTime → +2~4s → now(build) → +1~1.5s → sendTs
    // initTime: PX脚本启动时间 (main3.js L10450: uo = (new Date).getTime())
    // 串联时由编排脚本传入 opts.initTime, 单独运行时自动伪造
    var initTime = opts.initTime || (now - 2000 - Math.floor(Math.random() * 2000));
    var sendDelta = 1000 + Math.floor(Math.random() * 500);
    var sendTs = now + sendDelta;
    var perfNow = Math.round(sendTs - initTime);
    var event = {
        "t": "XQUnAxtpIzE=",
        "d": {
            // ─── 来源: ob 响应 state.no — 服务器时间戳 ───
            "N2sNLXEGAx4=": opts.serverNo,
            "YQFbByRuVjQ=": true,
            "JxsdHWJxEy8=": "109|66|66|70|80",
            "FU1vS1MjYnw=": 1682,
            "ajYQMCxWHgo=": true,
            "LDRWMmpbWwI=": true,
            "a1dRUS4+XmI=": "false",
            "ICBaJmVNVRU=": "false",
            "KDhSPm1QXQg=": 1,
            "ZR1fGyNyUiA=": 1,
            "YQFbByRqXzQ=": "",
            "DzN1dUlScEY=": ["loadTimes","csi","app"],
            "R3s9PQIUOAs=": true,
            "NkpMDHAgQT0=": false,
            "PkJEBHguSDM=": false,
            "OkZAAH8uTjE=": false,
            "TBR2Ugl+f2A=": false,
            "FU1vS1MjYXE=": false,
            "MDBKNnZeRQc=": false,
            "TlJ0FAg4cS8=": false,
            "FCwuKlJNIBE=": false,
            "DzN1dUlefkc=": false,
            "ICBaJmVIVxY=": false,
            "WGhibh4CaFQ=": false,
            "VGxuahEGYl8=": false,
            "VipsLBNFZh8=": false,
            "eWlDLzwGTh4=": [-931.5],
            "BX1/O0AScg4=": false,
            "RT0/ewNcNko=": 1920,
            "DhI0VEh8MWc=": 1080,
            "Ql54GAc2dys=": 1920,
            "RT0/ewBVMEE=": 1032,
            "eydBYT5NRFQ=": "1920X1080",
            "DXV3M0gcegI=": 32,
            "JnpcfGAQWU4=": 32,
            "ICBaJmVPXxI=": 0,
            "KDhSPm1XVws=": 0,
            "eWlDLz8ERxk=": 1872,
            "DFQ2Ekk5OiE=": 948,
            "bRVXEyh4XiI=": 0,
            "DFQ2Ekk5Pyc=": 0,
            "NkpMDHAmQj0=": true,
            "Ql54GAc3ciM=": false,
            "fyNFZTpPQF8=": "webkit",
            "W0chQR4rKXI=": "https:",
            "MDBKNnVcQgY=": "function share() { [native code] }",
            "b1NVVSo/XWQ=": "Asia/Shanghai",
            "KVkTX2w1GGo=": "w3c",
            "KnZQcG8aWkQ=": "screen",
            "KDhSPm1UWgk=": {"plugext":{"0":{"f":"internal-pdf-viewer","n":"PDF Viewer"},"1":{"f":"internal-pdf-viewer","n":"Chrome PDF Viewer"},"2":{"f":"internal-pdf-viewer","n":"Chromium PDF Viewer"},"3":{"f":"internal-pdf-viewer","n":"Microsoft Edge PDF Viewer"},"4":{"f":"internal-pdf-viewer","n":"WebKit built-in PDF"}},"plugins_len":5},
            "aRlTHyx1Vi4=": {"smd":{"ok":true,"ex":false}},
            "HCQmIllILBg=": {},
            "W0chQR4rJXc=": false,
            "M28JKXYDAh0=": false,
            "VipsLBNGZh8=": "f1a38a60",
            // navigator.connection 网络状态, 实际 rtt 有 0/200 波动, downlink 有 10/9.5 波动, 纯算固定
            "EFAqFlU8IC0=": {"support":true,"status":{"effectiveType":"4g","rtt":0,"downlink":10,"saveData":false}},
            "O2cBIX4LBBI=": "default",
            "FmosbFMGKVw=": 3,
            "OkZAAH8qRTU=": false,
            // ─── Kt("" + Math.floor((ao * 2863) / vid.charCodeAt(9))), ao=Math.floor(state.no/1e3), vid=_pxvid cookie ───
            "RT0/ewBRNUo=": generateHash(opts.serverNo, opts.vid),
            "fgIERDtrD38=": ["PDF Viewer","Chrome PDF Viewer","Chromium PDF Viewer","Microsoft Edge PDF Viewer","WebKit built-in PDF"],
            "UBBqVhV7b2I=": 5,
            "CFgyHk40OCo=": true,
            "aHgSfi0SHkQ=": true,
            "QAB6RgZqf3A=": true,
            "NAxOSnJtS34=": true,
            "eydBYT1LRFA=": "zh-CN",
            "JDxeOmFRVgA=": "Win32",
            // navigator.languages, 实际偶尔只有 ["zh-CN"], 纯算固定4种
            "LDRWMmpbUwE=": ["zh-CN","en","en-GB","en-US"],
            "fgIERDhsDHI=": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36 Edg/145.0.0.0",
            "NS0Pa3BEAV4=": true,
            "FU1vS1Mna3k=": -480,
            "X0MlRRksKnY=": 8,
            // navigator.languages.length, 与 LDRWMmpbUwE= 对应, 纯算固定4
            "cy9JaTVAQVw=": 4,
            "SlZwEA8/dSM=": "Gecko",
            "b1NVVSkzWG8=": "20030107",
            "LnJUdGsYWEI=": "5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36 Edg/145.0.0.0",
            "FCwuKlJNIRE=": true,
            "UBBqVhZ9YWA=": true,
            "VGxuahEFZlw=": 2,
            "aHgSfi4ZHU0=": "Netscape",
            "SBhyXg51eGU=": "Mozilla",
            "Z1tdXSE0V2s=": true,
            // navigator.connection.rtt, 实际有 0/200 波动, 纯算固定0
            "QAB6RgVrc3U=": 0,
            "RT0/ewNXNUs=": false,
            // navigator.connection.downlink, 实际有 10/9.5 波动, 纯算固定10
            "S3cxMQ0YNAA=": 10,
            "OSkDb39FCFw=": "4g",
            "HwNlBVlibzA=": true,
            "O2cBIX4PDBM=": true,
            "GUljT1wmaHw=": true,
            "egYAQD9qDXQ=": "x86",
            "WiZgIB9KbRU=": "64",
            "Mk5ICHciRTI=": [{"brand":"Not:A-Brand","version":"99"},{"brand":"Microsoft Edge","version":"145"},{"brand":"Chromium","version":"145"}],
            "IUEbR2QtFnw=": false,
            "ZHweeiEQEkg=": "",
            "VGxuahEAYlk=": "Windows",
            "OkZAAH8qTDA=": "19.0.0",
            "AEA6BkUsNjc=": "145.0.3800.70",
            "XGRmYhkIb1g=": true,
            "FU1vS1AhZnA=": true,
            // canvas 指纹 hash, sample7无痕模式不同, 纯算固定
            "Em4oaFcEI1g=": "f49f18dbec5558a76590af096c339826",
            "VGxuahEDa1A=": true,
            "OkZAAHwpRTc=": 16,
            "T3M1NQocPwU=": false,
            "O2cBIX0LDBs=": "49e5084e",
            "OSkDb39EC18=": "7c5f9724",
            "BFw+GkE3MiA=": "65d826e0",
            "Bzt9fUJWeE4=": "a9269e00",
            "SlZwEAw4dSI=": "50a5ec55",
            "DzN1dUpcfkU=": "73a0fb26",
            "eydBYT5ISlc=": true,
            "OSkDb3xGCFg=": true,
            "cRFLFzR+QCM=": true,
            "CXlzP0wWeAo=": false,
            "WQkjDxxmKDU=": true,
            "PARGQnlrTXk=": true,
            "KnZQcG8ZWkI=": true,
            // performance.memory.usedJSHeapSize (main3.js Dd() line 6269), 40~140MB 随机
            "YGAaZiYMFV0=": mem.usedJSHeapSize,
            // performance.memory.jsHeapSizeLimit (main3.js Dd() line 6270), 固定 4GB
            "FU1vS1MhZ3w=": mem.jsHeapSizeLimit,
            // performance.memory.totalJSHeapSize (main3.js Dd() line 6271), used*1.1~1.5 随机
            "EFAqFlYxJCc=": mem.totalJSHeapSize,
            // new Date().toString() — 如 "Fri Feb 27 2026 19:54:41 GMT+0800 (...)", 已验证
            "eWlDLz8ISh0=": new Date(now).toString(),
            "ZjocPCBWEwg=": false,
            "Bzt9fUFUeEs=": false,
            "XiJkJBhDaBQ=": false,
            "HCQmIllOKBU=": true,
            "HmIkZFsLIVY=": 0,
            "XiJkJBhNbh4=": false,
            // document.visibilityState, 实际有 "visible"/"hidden", 纯算固定 "visible"
            "aHgSfi4SG0U=": "visible",
            "Mk5ICHckTD0=": false,
            "UBBqVhZ6b2M=": 0,
            "BFw+GkE0Nig=": 1920,
            "bHQWcikeG0Q=": false,
            "Bzt9fUFUdU4=": 1032,
            "CFgyHk45OSs=": "missing",
            "Ix8ZGWZ0ES8=": true,
            "GCgiLl5EKxw=": true,
            "Ui5oKBRCYRI=": false,
            "Z1tdXSE2VGk=": true,
            // performance.navigation.type (main3.js Dd() line 6314), 实际有 0=navigate/1=reload, 纯算固定0
            "eWlDLzwFSx0=": 0,
            "Y19ZWSYyV2o=": 0,
            // Ft().cssFromResourceApi (main3.js line 547,552) performance.getEntriesByType("resource") CSS计数, 样本: 6,3,3,3,9,11,11, 纯算固定3
            "LVUXU2s1E2A=": 3,
            // Ft().imgFromResourceApi (main3.js line 546,551) img资源计数, 样本: 10,0,0,0,8,8,13, 纯算固定0
            "LxMVFWlyGyA=": 0,
            // Ft().fontFromResourceApi (main3.js line 548,553) .woff字体计数, 样本: 8,8,6,8,8,8,8, 纯算固定8
            "VQ0vCxNiITs=": 8,
            // Ft().cssFromStyleSheets (main3.js line 540-543) document.styleSheets计数, 样本: 5,3,3,3,8,10,10, 纯算固定3
            "JDxeOmJRUwE=": 3,
            "DXV3M0gZcwY=": 2,
            "ZR1fGyB2Ui4=": 0,
            // history.length (main3.js Kd() line 6524), 样本: 3,3,3,3,2,3,2, 纯算固定2
            "STkzfw9VPUU=": 2,
            // _r() → null[0] 主动触发 TypeError 取 stack (main3.js L1206-1212), 同版本固定, 已验证
            "cHAKdjYQD0A=": "TypeError: Cannot read properties of null (reading '0')\n    at _r (https://client.px-cloud.net/PXO1GDTa7Q/main.min.js:1208:21)\n    at Kd (https://client.px-cloud.net/PXO1GDTa7Q/main.min.js:6529:27)\n    at Zd (https://client.px-cloud.net/PXO1GDTa7Q/main.min.js:6157:30)\n    at https://client.px-cloud.net/PXO1GDTa7Q/main.min.js:5857:17\n    at r (https://www.ifood.com.br/_next/static/chunks/pages/_app-8759a56d911cf8d5.js:3:3515401)",
            // location.href (main3.js:2654), 实际有 "/" 和 "/inicio", 纯算固定首页
            "U08pSRUgIH4=": "https://www.ifood.com.br/",
            "ajYQMCxaFAU=": [],
            // ─── 待确认: encodeURIComponent(referrer), 首次为空后续有值 ───
            "FU1vS1AkYHo=": "",
            "Ql54GAQ0di0=": false,
            "DzN1dUpffEM=": true,
            "LxMVFWp8GCU=": "3Jzg9oNbX",
            // ─── 来源: ob 响应 state.to — session_id 大整数字符串 ───
            "HUVnQ1sranA=": opts.stateTo,
            // ─── 来源: ob 响应 handler o111ooo1 的 args[0] (4~5位数字), 已验证 ───
            "Em4oaFcDIF4=": opts.o111ooo1,
            "KVkTX281HWQ=": "64556c77",
            "V0stTREnInc=": "",
            "Az95eUZUc0o=": "10207b2f",
            "SlZwEAw3eSs=": "10207b2f",
            "VipsLBNHZxo=": "90e65465",
            "Yj4YOCRUEAw=": true,
            "aRlTHyx0XCs=": true,
            "Rlp8HAA0eC8=": true,
            "TTU3cwtZO0Y=": true,
            "SlZwEA86fyI=": true,
            "VQ0vCxBhID0=": "4YC/4YCb4YCR4YCA4YCd4YCB4YCd4YCU4YCG4YGS4YCi4YCT4YCH4YCe4YCb4YCc4YCT4YGS4YC94YCc4YCe4YCb4YCc4YCX4YGS4YGf4YGS4YCi4YCd4YCe4YCb4YCB4YCa4YGS4YGa4YCi4YCd4YCe4YCT4YCc4YCW4YGb",
            "Yj4YOCdSFw0=": "3207084bd110f1ac964863e23aa78e04",
            "FU1vS1Agan8=": null,
            "KVkTX2wyGG0=": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36 Edg/145.0.0.0",
            "a1dRUS48WGo=": false,
            "NkpMDHArSDk=": "90e65465",
            // HMAC-MD5(key=userAgent, message=uuid) (main3.js Gl() line 3071, N(Pa(),t) 其中 t=navigator.userAgent)
            "fyNFZTlCSFM=": hmacMD5(opts.uuid, opts.userAgent),
            // ─── 来源: ob 响应 state.appId ───
            "dEwOCjEkAjA=": opts.appId,
            // HMAC-MD5(data=_pxvid, key=userAgent) (main3.js N(Xt(), ua) line 3072)
            "dgoMTDBkBXg=": hmacMD5(opts.vid, opts.userAgent),
            // HMAC-MD5(data=pxsid, key=userAgent) (main3.js N(Zo(), ua) line 3074)
            "dEwOCjImBDk=": hmacMD5(opts.pxsid, opts.userAgent),
            // MD5(_pxvid) (main3.js $o() line 2526, localStorage "px_hvd")
            "BFw+GkEwMyk=": hmacMD5(opts.vid),
            "R3s9PQIQNwc=": true,
            "Rlp8HAA1eCo=": false,
            "NkpMDHMhSDo=": false,
            "dW1PKzABQx0=": true,
            "MVELV3Q9B2A=": "TypeError: Cannot read properties of undefined (reading 'width')",
            "dytNbTJHQVk=": "webkit",
            "XQUnAxhpKzY=": 33,
            "RBx+WgFwcmA=": false,
            "LxMVFWp/HCI=": false,
            "fgIERDtuAHU=": false,
            "Z1tdXSI3WWo=": "AudioData.SVGAnimatedAngle.SVGMetadataElement",
            "WiZgIB9JbRc=": "jgS",
            "EFAqFlU/Jy0=": "vaz*+UR!<c(URM8",
            "Rlp8HAMydyc=": 1,
            // ─── 来源: 事件全局递增计数器 Sl++ (同 collector #1), collector #2 = 1 ───
            "cHAKdjYQB0Y=": 1,
            // Math.round(performance.now()) — ≈ sendTs-initTs, 样本: 3885/4754/4325, 已验证
            "Rlp8HAA2dy4=": perfNow,
            // (new Date).getTime() — event 构建时间戳, init后 2~4s, 已验证
            "Yj4YOCRUFgg=": now,
            // ─── 来源: 时区偏移(秒), 同 collector #1 ───
            "JxsdHWJwFCc=": 3600,
            // uo = (new Date).getTime() — PX init 时间戳 (同 collector #1)
            "FCwuKlJGKx0=": initTime,
            // (new Date).getTime() — event 发送时间戳, build后 1~1.5s, 已验证
            "BFw+GkE3Oyg=": sendTs,
            // Pa() → uuid (同 collector #1)
            "eEgCDj4lBjo=": uuid,
            // ─── 来源: bm — ns 响应体 (同 collector #1), 有ns响应时为字符串, 否则null ───
            "Ah44WEdyM24=": opts.bm != null ? opts.bm : null,
            // ─── 来源: Sm — ns 请求耗时 ms (同 collector #1), 有ns响应时为数字, 否则0 ───
            "DFQ2Ekk4PSU=": opts.sm || 0,
            // ─── 来源: kt — PX 第一方部署检测 (同 collector #1), ifood=false ───
            "QSE7ZwdLMVw=": false,
            // ─── 来源: ur("_px3") — _px3 cookie 值 (同 collector #1), ob resp1 下发后有值 ───
            "BX1/O0ATcgo=": opts._px3 || ""
        }
    };

    // Anti-tamper checksum (main3.js $d() line 6586)
    // key = te(state.to, state.no % 10 + 2), value = te(state.to, state.no % 10 + 1)
    var stateTo = opts.stateTo;   // HUVnQ1sranA= field, 20-char numeric string from ob
    var stateNo = opts.serverNo;  // N2sNLXEGAx4= field, server timestamp from ob
    event.d[te(stateTo, stateNo % 10 + 2)] = te(stateTo, stateNo % 10 + 1);

    return [event];
}

module.exports = { buildCollector2Event };
