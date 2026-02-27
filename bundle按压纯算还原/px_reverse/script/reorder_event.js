#!/usr/bin/env node
/**
 * 按 event_json/ 中的字段顺序重排 event_js/ 中的 builder
 *
 * 用法: node script/reorder_event.js <json文件> <js文件>
 * 示例: node script/reorder_event.js event_json/bundle#2.json event_js/bundle#2.js
 *
 * 输出到 stdout, 重定向到文件即可
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const jsonFile = path.resolve(ROOT, process.argv[2]);
const jsFile = path.resolve(ROOT, process.argv[3]);

// 1. 从 JSON 提取 key 顺序
const jsonArr = JSON.parse(fs.readFileSync(jsonFile, 'utf8'));
const jsonKeys = Object.keys(jsonArr[0].d);

// 2. 从 JS 提取 key → {lines, comment} 映射
const jsRaw = fs.readFileSync(jsFile, 'utf8');
const jsLines = jsRaw.split('\n');

const entries = new Map();
let headerLines = [];    // "d": { 之前的所有行
let footerLines = [];    // 最后一个 entry 之后的所有行
let inBody = false;
let bodyStartLine = -1;
let bodyEndLine = -1;

// 找到 "d": { 的位置
for (let i = 0; i < jsLines.length; i++) {
    if (!inBody && /^\s*"d":\s*\{/.test(jsLines[i])) {
        inBody = true;
        bodyStartLine = i + 1;
        headerLines = jsLines.slice(0, i + 1);
        continue;
    }
}

// 提取 body 内的每个 entry (key → 完整文本)
let i = bodyStartLine;
while (i < jsLines.length) {
    const line = jsLines[i];

    // 检测 body 结束 (只有 } 或 }) 的行)
    if (/^\s*\}/.test(line) && !line.match(/^\s*"[^"]+"/)) {
        bodyEndLine = i;
        footerLines = jsLines.slice(i);
        break;
    }

    // 检测 key 行
    const m = line.match(/^\s*"([^"]+)":\s/);
    if (m) {
        const key = m[1];
        let entryLines = [line];

        // 处理多行值: 跟踪 bracket depth
        let depth = 0;
        for (const ch of line) {
            if (ch === '[' || ch === '{') depth++;
            if (ch === ']' || ch === '}') depth--;
        }
        // 如果行尾有逗号或 // 注释，且 depth <= 0，说明是单行
        // 否则继续读
        while (depth > 0 && i + 1 < jsLines.length) {
            i++;
            entryLines.push(jsLines[i]);
            for (const ch of jsLines[i]) {
                if (ch === '[' || ch === '{') depth++;
                if (ch === ']' || ch === '}') depth--;
            }
        }

        entries.set(key, entryLines.join('\n'));
    }
    // 跳过纯注释行 (section dividers)
    i++;
}

// 3. 按 JSON 顺序输出
const output = [];
output.push(...headerLines);
output.push('');

for (let k = 0; k < jsonKeys.length; k++) {
    const key = jsonKeys[k];
    if (entries.has(key)) {
        let entry = entries.get(key);
        // 确保尾部有逗号
        if (k < jsonKeys.length - 1) {
            entry = entry.replace(/,?\s*$/, ',');
        }
        output.push(entry);
    } else {
        const comma = k < jsonKeys.length - 1 ? ',' : '';
        output.push(`            "${key}": null${comma}  // !! MISSING - 需要补充`);
    }
}

output.push(...footerLines);
console.log(output.join('\n'));
