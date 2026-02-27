# 鼠标数据池扩充指南

## 快速用法

抓到新的 bundle#3 请求后，把 curl 文件放到 `request/` 目录，然后对我说：

> **扩充鼠标数据池：request/X.txt**

我会自动完成：解码 → 提取鼠标字段 → 追加到 `mouse_pool.json`

## 手动扩充（不需要我）

```bash
# 1. 解码 curl 请求（需要先提取 serverTs）
node script/decode_payload.js request/X.txt <serverTs> b3_newX

# 2. 重新生成数据池（修改 gen_mouse_pool.js 的 sources 数组，加入新文件名）
node script/gen_mouse_pool.js
```

## 当前数据池

| # | 来源 | hold(ms) | 轨迹点(full) | 交互数 |
|---|------|----------|-------------|--------|
| 0 | b3_verify | 7810 | 360 | 36 |
| 1 | b3_test4 | 7350 | 101 | 19 |
| 2 | b3_test5 | 10641 | 274 | 20 |

## 文件位置

- 数据池：`event_js/mouse_pool.json`
- 生成脚本：`script/gen_mouse_pool.js`
- 骨架模板：`event_js/2.js`（字段注释 `[POOL.xxx]` 标记映射关系）
