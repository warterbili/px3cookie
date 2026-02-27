#!/usr/bin/env python3
"""
纯算 PX Cookie 30 分钟压测
- 生成 cookie → 持续请求 API → 遇 403 刷新 cookie → 循环
- 不保存数据，只统计成功/失败/403
"""

import json
import subprocess
import sys
import os
import time
from curl_cffi import requests as curl_requests
from curl_cffi import CurlOpt

PX_COOKIE_JS = os.path.join(os.path.dirname(os.path.abspath(__file__)), "px_cookie.js")
TEST_DURATION = 30 * 60  # 30 分钟


def log(msg):
    ts = time.strftime("%H:%M:%S")
    print(f"[{ts}] {msg}", flush=True)


def generate_cookie():
    """调用 node px_cookie.js 纯算生成 cookie"""
    start = time.time()
    proc = subprocess.Popen(
        ["node", PX_COOKIE_JS],
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        cwd=os.path.dirname(PX_COOKIE_JS),
    )
    try:
        stdout, stderr = proc.communicate(timeout=30)
    except subprocess.TimeoutExpired:
        proc.kill()
        proc.wait()
        return None, None, 0

    elapsed = round(time.time() - start, 1)
    text = stdout.decode("utf-8", errors="replace").strip()

    for line in text.split("\n"):
        line = line.strip()
        if not line:
            continue
        try:
            r = json.loads(line)
            return r.get("px3"), r.get("pxvid"), elapsed
        except json.JSONDecodeError:
            continue
    return None, None, elapsed


def main():
    session = curl_requests.Session(impersonate="chrome131")
    session.curl.setopt(CurlOpt.RESOLVE, [
        "cw-marketplace.ifood.com.br:443:104.18.36.141",
        "www.ifood.com.br:443:23.210.216.151",
    ])
    headers = {
        "accept": "application/json",
        "x-client-application-key": "41a266ee-51b7-4c37-9e9d-5cd331f280d5",
        "referer": "https://www.ifood.com.br/",
        "origin": "https://www.ifood.com.br",
    }
    lat, lng = -23.5505, -46.6333

    # 统计
    stats = {"cookie_ok": 0, "cookie_fail": 0, "api_200": 0, "api_403": 0, "api_429": 0, "api_other": 0, "api_error": 0}
    start_time = time.time()

    log(f"=== 纯算 PX Cookie 30 分钟压测开始 ===")
    log(f"cookie 生成: node px_cookie.js (纯算)")
    log(f"API 请求: curl_cffi chrome131")
    log("")

    cookie_num = 0

    while time.time() - start_time < TEST_DURATION:
        elapsed_min = round((time.time() - start_time) / 60, 1)

        # 生成 cookie
        cookie_num += 1
        log(f"--- Cookie #{cookie_num} (已运行 {elapsed_min} min) ---")
        px3, pxvid, gen_time = generate_cookie()

        if not px3:
            stats["cookie_fail"] += 1
            log(f"Cookie 生成失败 ({gen_time}s)")
            time.sleep(2)
            continue

        stats["cookie_ok"] += 1
        log(f"Cookie 生成成功 ({gen_time}s) px3={px3[:40]}...")

        cookies = {"_px3": px3}
        if pxvid:
            cookies["_pxvid"] = pxvid

        # 用这个 cookie 持续请求 API，直到 403 或超时
        req_count = 0
        cookie_start = time.time()

        while time.time() - start_time < TEST_DURATION:
            # 每 4 分钟主动刷新 cookie
            if time.time() - cookie_start > 240:
                log(f"Cookie #{cookie_num} 使用 4 分钟，主动刷新")
                break

            try:
                resp = session.get(
                    f"https://cw-marketplace.ifood.com.br/v2/cardstack/search/home"
                    f"?latitude={lat}&longitude={lng}&channel=IFOOD&alias=HOME_MULTICATEGORY_V10",
                    headers=headers,
                    cookies=cookies,
                    timeout=15,
                )
                req_count += 1
                code = resp.status_code

                if code == 200:
                    stats["api_200"] += 1
                elif code == 403:
                    stats["api_403"] += 1
                    log(f"!!! 403 出现 (第 {req_count} 次请求, cookie 用了 {round(time.time()-cookie_start)}s)")
                    break
                elif code == 429:
                    stats["api_429"] += 1
                else:
                    stats["api_other"] += 1
                    log(f"异常状态码: {code}")

                # 每 10 次请求打一次日志
                if req_count % 10 == 0:
                    s = stats
                    log(f"  Cookie #{cookie_num}: {req_count} reqs | 200={s['api_200']} 429={s['api_429']} 403={s['api_403']} err={s['api_error']}")

            except Exception as e:
                stats["api_error"] += 1
                log(f"请求异常: {e}")

            time.sleep(1)  # 1s 间隔

        log(f"Cookie #{cookie_num} 共发了 {req_count} 次 API 请求")
        log(f"当前统计: {stats}")
        log("")

    # 最终报告
    total_time = round((time.time() - start_time) / 60, 1)
    log("=" * 60)
    log(f"=== 测试完成 ({total_time} min) ===")
    log(f"Cookie 生成: {stats['cookie_ok']} 成功, {stats['cookie_fail']} 失败")
    log(f"API 请求: {stats['api_200']} x 200, {stats['api_429']} x 429, {stats['api_403']} x 403, {stats['api_other']} x 其他, {stats['api_error']} x 异常")
    total_api = stats["api_200"] + stats["api_403"] + stats["api_429"] + stats["api_other"] + stats["api_error"]
    if total_api > 0:
        log(f"成功率: {stats['api_200']/total_api*100:.1f}%")
        log(f"403 率: {stats['api_403']/total_api*100:.1f}%")
    log("=" * 60)


if __name__ == "__main__":
    main()
