// collector #1 event 模板
// 基于 7 次抓包解码对比生成
//
// key 随 PX 脚本版本变化，值的逻辑不变
// 与 bundle#1 结构相似但有差异: 少了 PX版本号/pxhc/_px3, 多了 PoW

const fetchNs = require('../../ifood_PerimeterX-WAF_jsReverse/px_reverse/reverse/ns');

// ─── 来源: main3.js:3004 var Sl = 0; ───
// 事件全局递增计数器, 每次调用 Ml() 后 Sl++
// collector #1 = 0, collector #2 = 1, ...
var eventSeq = 0;

// ─── 模拟 performance.now() ───
// 浏览器中 performance.now() = 页面导航开始 → 构建event 的总耗时
// 实测 7 次范围: 378, 890, 983, 1275, 1720, 1577, 1835
// Node 中无页面加载过程, 用随机值模拟
function simulatePerformanceNow() {
    return Math.floor(300 + Math.random() * 1600);
}

/**
 * 获取 ns 数据 (供后续 collector #2+ 使用)
 *
 * 来源: main3.js:8434-8452
 *   var bm = null, Sm = -1;
 *   Em = function(uuid, host) {
 *       url = host + "/ns?c=" + uuid;
 *       GET url → 200 时:
 *           bm = responseText;           // ns 响应体
 *           Sm = performance.duration;   // ns 请求耗时
 *   }
 *
 * @param {string} uuid
 * @returns {Promise<{ nsResponse: string|null, nsDuration: number }>}
 */
async function getNsData(uuid) {
    const { sm, duration } = await fetchNs(uuid);
    return {
        nsResponse: sm,       // bm: ns 响应体文本, 赋给 "Ah44WEdyM24="
        nsDuration: duration   // Sm: ns 请求耗时 ms, 赋给 "DFQ2Ekk4PSU="
    };
}

/**
 * 构建 collector #1 event
 *
 * collector #1 是首次 collect 请求, 此时 ns 请求已发出但尚未返回,
 * 所以 nsResponse=null, nsDuration=0
 *
 * @param {string} uuid  - UUID v1
 * @param {object} [opts]
 * @param {string}  [opts.url]         - 页面 URL, 默认 ifood 首页
 * @param {string}  [opts.platform]    - navigator.platform, 默认 "Win32"
 * @param {number}  [opts.timezone]    - 时区偏移秒, 默认 3600
 * @param {string}  [opts.nsResponse]  - ns 响应体, 首次=null
 * @param {number}  [opts.nsDuration]  - ns 请求耗时, 首次=0
 * @param {string}  [opts.px3]         - _px3 cookie 值, 首次无cookie不传
 */
function buildCollector1Event(uuid, opts) {
    opts = opts || {};
    var now = Date.now();
    var event = {
        "t": "EFAqFlU5LiE=",
        "d": {
            // ─── 来源: main3.js:4430-4433 → Ss (当前页面 URL) ───
            "U08pSRUgIH4=": "https://www.ifood.com.br/restaurantes",

            // ─── 来源: 固定值 0, collector 始终=0 (bundle#1 对应字段=1) ───
            "ZR1fGyB2Ui4=": 0,

            // ─── 来源: navigator.platform ───
            "JDxeOmFRVgA=": "Win32",

            // ─── 来源: main3.js:3004 Ml() → Sl++, 事件全局递增计数器 ───
            "cHAKdjYQB0Y=": eventSeq++,

            // ─── 来源: main3.js:1571-1574 ci() → Math.round(performance.now()) ───
            // ci() || Ct(), 优先 performance.now(), 降级 +new Date
            // Node 中无页面加载, 用实测范围随机模拟 (378~1835)
            "Rlp8HAA2dy4=": simulatePerformanceNow(),

            // ─── 来源: 时区偏移(秒), new Date().getTimezoneOffset() * -60 ───
            "JxsdHWJwFCc=":3600,

            // ─── 来源: main3.js:10450-10451 uo = (new Date).getTime() ───
            // PX 脚本初始化时记录的时间戳 (更早)
            "FCwuKlJGKx0=": now,

            // ─── 来源: main3.js:9225 (new Date).getTime() ───
            // 构建/发送 event 时的当前时间戳 (更晚, 实测差值 5~9ms)
            "BFw+GkE3Oyg=": now + Math.floor(5 + Math.random() * 5),

            // ─── 来源: Pa() → uuid ───
            "eEgCDj4lBjo=": uuid,

            // ─── 来源: main3.js:8434,8445 bm ───
            // 初始 null, ns 请求 200 后 = responseText
            // collector #1 时 ns 尚未返回, 所以 = null
            "Ah44WEdyM24=": null,

            // ─── 来源: main3.js:8435,8452 Sm ───
            // 初始 -1, ns 发送时置 0, ns 返回后 = performance.duration
            // collector #1 时 ns 尚未返回, 所以 = 0
            "DFQ2Ekk4PSU=": 0,

            // ─── 来源: main3.js:523-534 kt ───
            // PX 脚本是否第一方部署, ifood 用第三方加载 → false
            "QSE7ZwdLMVw=": false
        }
    };

    // ─── 来源: main3.js:4422-4428 ur("_px3") ───
    // 读取 _px3 cookie, 首次访问无 cookie 时此字段不存在
    if (opts.px3) {
        event.d["BX1/O0ATcgo="] = opts.px3;
    }

    return [event];
}

module.exports = { buildCollector1Event, getNsData };
