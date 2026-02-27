#!/usr/bin/env python3
"""
纯算 PX Cookie 测试 — 调用 px_cookie.js 生成 cookie，curl_cffi 验证 API

流程:
1. subprocess 调用 node px_cookie.js → 纯算生成 _px3 (Node 原生 https 发 collector)
2. curl_cffi chrome131 带 _px3 请求 iFood API → 验证 cookie 有效性
"""

import json
import subprocess
import sys
import os
import time
from typing import Optional, Dict

from curl_cffi import requests as curl_requests
from curl_cffi import CurlOpt

IFOOD_BASE = "https://www.ifood.com.br"
PX_COOKIE_JS = os.path.join(os.path.dirname(os.path.abspath(__file__)), "px_cookie.js")

# DNS 直连映射，避免 curl_cffi c-ares 解析超时
DNS_RESOLVE = [
    "cw-marketplace.ifood.com.br:443:104.18.36.141",
    "www.ifood.com.br:443:23.210.216.151",
]


class PXPureCookieGenerator:
    def __init__(self, verbose=True, proxy=None):
        self.verbose = verbose
        self.proxy = proxy
        self.session = curl_requests.Session(impersonate="chrome131")
        self.session.curl.setopt(CurlOpt.RESOLVE, DNS_RESOLVE)
        if proxy:
            self.session.proxies = {"http": proxy, "https": proxy}
            self.session.verify = False
        self._px3 = None
        self._pxvid = None

    def log(self, msg):
        if self.verbose:
            print(f"[PX-PURE] {msg}", file=sys.stderr)

    def generate(self) -> Optional[str]:
        """调用 px_cookie.js 纯算生成 _px3 cookie"""
        self.log("Starting pure-calc PX cookie generation...")

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
            self.log("Node process timed out")
            return None

        stdout_text = stdout.decode("utf-8", errors="replace")
        stderr_text = stderr.decode("utf-8", errors="replace")

        if self.verbose and stderr_text.strip():
            for line in stderr_text.strip().split("\n"):
                print(f"  [NODE] {line}", file=sys.stderr)

        if proc.returncode != 0:
            self.log(f"Node exited with code {proc.returncode}")
            return None

        # 解析 stdout: px_cookie.js 输出 JSON 行
        px3 = None
        pxvid = None
        for line in stdout_text.strip().split("\n"):
            line = line.strip()
            if not line:
                continue
            try:
                result = json.loads(line)
                px3 = result.get("px3")
                pxvid = result.get("pxvid")
                self.log(f"Node returned status: {result.get('status')}")
            except json.JSONDecodeError:
                continue

        if px3:
            self._px3 = px3
            self._pxvid = pxvid
            self.log(f"Success! _px3 length: {len(self._px3)}")
            return self._px3

        self.log(f"Failed to generate _px3. stdout: {stdout_text[:200]}")
        return None

    def get_cookies_dict(self) -> Dict[str, str]:
        cookies = {}
        if self._px3:
            cookies["_px3"] = self._px3
        if self._pxvid:
            cookies["_pxvid"] = self._pxvid
        return cookies

    def verify(self, lat=-23.5505, lng=-46.6333) -> bool:
        """用 curl_cffi chrome131 验证 cookie 对 iFood API 是否有效"""
        if not self._px3:
            self.log("No _px3 cookie to verify")
            return False

        self.log(f"Verifying _px3 via curl_cffi chrome131...")

        headers = {
            "accept": "application/json",
            "x-client-application-key": "41a266ee-51b7-4c37-9e9d-5cd331f280d5",
            "referer": "https://www.ifood.com.br/",
            "origin": "https://www.ifood.com.br",
        }
        cookies = {"_px3": self._px3}
        if self._pxvid:
            cookies["_pxvid"] = self._pxvid

        try:
            resp = self.session.get(
                f"https://cw-marketplace.ifood.com.br/v2/cardstack/search/home"
                f"?latitude={lat}&longitude={lng}&channel=IFOOD&alias=HOME_MULTICATEGORY_V10",
                headers=headers,
                cookies=cookies,
                timeout=15,
            )
            self.log(f"Cardstack home: {resp.status_code}")

            resp2 = self.session.get(
                f"https://cw-marketplace.ifood.com.br/v1/search/autocomplete"
                f"?latitude={lat}&longitude={lng}&channel=IFOOD&term=pizza",
                headers=headers,
                cookies=cookies,
                timeout=15,
            )
            self.log(f"Search autocomplete: {resp2.status_code}")

            if resp.status_code == 200:
                data = resp.json()
                sections = data.get("sections", [])
                self.log(f"Success! Got {len(sections)} sections")
                return True
            else:
                self.log(f"Failed: {resp.status_code} {resp.text[:200]}")
                return False

        except Exception as e:
            self.log(f"Verification failed: {e}")
            return False


def main():
    gen = PXPureCookieGenerator(verbose=True)

    px3 = gen.generate()
    if px3:
        print(f"\n{'='*60}")
        print(f"Generated _px3: {px3[:80]}...")
        print(f"_pxvid: {gen._pxvid}")
        print(f"{'='*60}\n")

        if gen.verify():
            print("Cookie verified - API returned 200!")
        else:
            print("Cookie verification failed")
    else:
        print("Failed to generate _px3 cookie")


if __name__ == "__main__":
    main()
