#!/usr/bin/env python3
"""
iFood Raw Details Fetcher
Fetches complete raw API responses (GraphQL + catalog) for discovered merchants.
Saves complete original responses with zero transformation.

Target: 5000 merchants from progress.json discovered_ids
Output: ~/reversation/ifood-web/data/merchants_raw_v2.jsonl
"""

import json
import sys
import os
import time
import threading
import queue
import random
import string
from datetime import datetime
from typing import Optional, Dict, Set
import urllib3

urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)

# ── Paths ─────────────────────────────────────────────────────

PROJECT_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
sys.path.insert(0, PROJECT_ROOT)

PROGRESS_FILE = os.path.join(PROJECT_ROOT, "data", "progress.json")
OUTPUT_FILE = os.path.join(PROJECT_ROOT, "data", "merchants_raw_v2.jsonl")

# ── iFood API Config ──────────────────────────────────────────

GRAPHQL_URL = "https://cw-marketplace.ifood.com.br/v1/merchant-info/graphql"
CATALOG_URL = "https://cw-marketplace.ifood.com.br/v1/merchants/restaurant/{merchant_id}/catalog"
ITEM_URL = "https://cw-marketplace.ifood.com.br/v1/merchants/restaurant/{merchant_id}/items/{item_id}"

# Default location (São Paulo)
DEFAULT_LAT = -23.5505
DEFAULT_LNG = -46.6333

HEADERS = {
    "Accept": "application/json, text/plain, */*",
    "Content-Type": "application/json",
    "accept-language": "pt-BR,pt;q=0.9",
    "x-client-application-key": "41a266ee-51b7-4c37-9e9d-5cd331f280d5",
    "referer": "https://www.ifood.com.br/",
    "origin": "https://www.ifood.com.br",
    "platform": "Desktop",
    "app_version": "9.139.0",
    "Country": "BR",
    "browser": "Mac OS",
}

GRAPHQL_QUERY = """query ($merchantId: String!) { merchant (merchantId: $merchantId, required: true) { available availableForScheduling contextSetup { catalogGroup context regionGroup } currency deliveryFee { originalValue type value } deliveryMethods { catalogGroup deliveredBy id maxTime minTime mode originalValue priority schedule { now shifts { dayOfWeek endTime interval startTime } timeSlots { availableLoad date endDateTime endTime id isAvailable originalPrice price startDateTime startTime } } subtitle title type value state } deliveryTime distance features id mainCategory { code name } minimumOrderValue name paymentCodes preparationTime priceRange resources { fileName type } slug tags takeoutTime userRating } merchantExtra (merchantId: $merchantId, required: false) { address { city country district latitude longitude state streetName streetNumber timezone zipCode } categories { code description friendlyName } companyCode configs { bagItemNoteLength chargeDifferentToppingsMode nationalIdentificationNumberRequired orderNoteLength } deliveryTime description documents { CNPJ { type value } MCC { type value } } enabled features groups { externalId id name type } id locale mainCategory { code description friendlyName } merchantChain { externalId id name } metadata { ifoodClub { banner { action image priority title } } } minimumOrderValue minimumOrderValueV2 name phoneIf priceRange resources { fileName type } shifts { dayOfWeek duration start } shortId tags takeoutTime test type userRatingCount } }"""

# ── Proxy Config ──────────────────────────────────────────────

PROXY_TEMPLATE = "http://brd-customer-hl_26f509b3-zone-residential-country-us-session-{SESSION}:b179936rlgcl@brd.superproxy.io:33335"

# ── Settings ──────────────────────────────────────────────────

TARGET_COUNT = 5000
NUM_WORKERS = 20
REQUEST_DELAY = 0.3
MAX_RETRIES = 3

# ── Load & Resume ─────────────────────────────────────────────


def load_merchant_ids(limit=TARGET_COUNT):
    """Load merchant IDs: use 补充_ids.json if exists, else first N from progress.json"""
    supplement_file = os.path.join(PROJECT_ROOT, "data", "补充_ids.json")
    if os.path.exists(supplement_file):
        with open(supplement_file) as f:
            ids = json.load(f)
        print(f"[INFO] Using supplement list: {len(ids)} IDs from 补充_ids.json")
        return ids
    with open(PROGRESS_FILE) as f:
        data = json.load(f)
    discovered = data.get("discovered_ids", [])
    return discovered[:limit]


def load_completed_ids(output_file):
    """Load already completed merchant IDs from output JSONL"""
    completed = set()
    if not os.path.exists(output_file):
        return completed
    
    with open(output_file, 'r') as f:
        for line in f:
            try:
                record = json.loads(line)
                if "id" in record:
                    completed.add(record["id"])
            except:
                continue
    
    return completed


# ── PX Cookie Generator ───────────────────────────────────────

from px_cookie_generator import PXCookieGenerator


class WorkerSession:
    """Each worker has its own session with persistent proxy + PX cookie"""
    
    def __init__(self, worker_id: int, verbose: bool = False):
        self.worker_id = worker_id
        self.verbose = verbose
        
        # Generate unique session ID for this worker
        self.session_id = ''.join(random.choices(string.ascii_lowercase + string.digits, k=12))
        self.proxy = PROXY_TEMPLATE.replace("{SESSION}", self.session_id)
        
        # Initialize PX cookie generator with this session's proxy
        self.px_gen = PXCookieGenerator(verbose=verbose, proxy=self.proxy)
        self.session = self.px_gen.session  # curl_cffi session
        
        # Cookie state
        self.cookies = {}
        self.cookie_ts = 0
        
        self.log(f"Worker initialized with session {self.session_id[:8]}")
    
    def log(self, msg):
        if self.verbose:
            ts = time.strftime("%H:%M:%S")
            print(f"[W{self.worker_id}] [{ts}] {msg}", flush=True)
    
    def ensure_cookie(self):
        """Refresh PX cookie if older than 4 minutes"""
        if time.time() - self.cookie_ts < 240 and self.cookies:
            return
        
        self.log("Refreshing PX cookie...")
        try:
            px3 = self.px_gen.generate()
            if not px3:
                raise RuntimeError("Empty PX cookie")
            
            self.cookies = {"_px3": px3}
            self.cookie_ts = time.time()
            self.log(f"PX cookie refreshed (len={len(px3)})")
        except Exception as e:
            self.log(f"Cookie generation failed: {e}")
            # Try one more time with a fresh generator
            time.sleep(2)
            self.px_gen = PXCookieGenerator(verbose=self.verbose, proxy=self.proxy)
            self.session = self.px_gen.session
            px3 = self.px_gen.generate()
            if not px3:
                raise RuntimeError("Failed to generate PX cookie after retry")
            self.cookies = {"_px3": px3}
            self.cookie_ts = time.time()
            self.log(f"PX cookie refreshed (retry, len={len(px3)})")
    
    def request(self, method: str, url: str, **kwargs):
        """Make request with retry/backoff"""
        for attempt in range(5):
            try:
                self.ensure_cookie()
                
                if method == "GET":
                    resp = self.session.get(
                        url, headers=HEADERS, cookies=self.cookies,
                        timeout=20, **kwargs
                    )
                else:  # POST
                    resp = self.session.post(
                        url, headers=HEADERS, cookies=self.cookies,
                        timeout=20, **kwargs
                    )
                
                if resp.status_code == 200:
                    return resp.json()
                elif resp.status_code in (403, 429):
                    wait = min(5 * (2 ** attempt), 60)
                    self.log(f"[{resp.status_code}] Backing off {wait}s, rotating IP + cookie...")
                    # 换 IP：重新生成 session_id + proxy
                    self.session_id = ''.join(random.choices(string.ascii_lowercase + string.digits, k=12))
                    self.proxy = PROXY_TEMPLATE.replace("{SESSION}", self.session_id)
                    self.px_gen = PXCookieGenerator(verbose=self.verbose, proxy=self.proxy)
                    self.session = self.px_gen.session
                    self.cookie_ts = 0  # 强制刷新 cookie
                    time.sleep(wait)
                elif resp.status_code == 500:
                    self.log(f"[500] Server error, retrying in 3s...")
                    time.sleep(3)
                else:
                    self.log(f"[{resp.status_code}] {resp.text[:200]}")
                    return None
            
            except Exception as e:
                self.log(f"Request error: {e}")
                time.sleep(2)
        
        return None


# ── Fetch Functions ───────────────────────────────────────────


def fetch_graphql_detail(session: WorkerSession, merchant_id: str) -> Optional[dict]:
    """Fetch GraphQL detail and return complete 'data' field"""
    url = f"{GRAPHQL_URL}?latitude={DEFAULT_LAT}&longitude={DEFAULT_LNG}&channel=IFOOD"
    body = {
        "query": GRAPHQL_QUERY,
        "variables": {"merchantId": merchant_id}
    }
    
    response = session.request("POST", url, json=body)
    if not response:
        return None
    
    # Return complete data field (includes both merchant and merchantExtra)
    return response.get("data")


def fetch_catalog(session: WorkerSession, merchant_id: str) -> Optional[dict]:
    """Fetch catalog, then enrich needChoices items with full choices via /items/{id}"""
    url = CATALOG_URL.format(merchant_id=merchant_id)
    url = f"{url}?latitude={DEFAULT_LAT}&longitude={DEFAULT_LNG}"
    
    response = session.request("GET", url)
    if not response:
        return None
    
    catalog_data = response.get("data")
    if not catalog_data:
        return None

    # Enrich items that need choices
    for cat in catalog_data.get("menu", []):
        for item in cat.get("itens", []):
            if item.get("needChoices") and not item.get("choices"):
                iid = item.get("id")
                if not iid:
                    continue
                item_url = ITEM_URL.format(merchant_id=merchant_id, item_id=iid)
                item_url = f"{item_url}?latitude={DEFAULT_LAT}&longitude={DEFAULT_LNG}"
                item_resp = session.request("GET", item_url)
                if item_resp:
                    enriched = (item_resp.get("data", {}).get("menu") or [{}])
                    enriched_item = (enriched[0].get("itens") or [{}])[0] if enriched else {}
                    choices = enriched_item.get("choices")
                    if choices:
                        item["choices"] = choices
                time.sleep(0.2)

    return catalog_data


# ── Worker Thread ─────────────────────────────────────────────


def worker_thread(
    worker_id: int,
    task_queue: queue.Queue,
    completed_ids: Set[str],
    completed_lock: threading.Lock,
    file_lock: threading.Lock,
    stats: Dict,
    stats_lock: threading.Lock
):
    """Worker thread that processes merchants"""
    session = WorkerSession(worker_id, verbose=True)
    
    while True:
        try:
            merchant_id = task_queue.get(timeout=5)
        except queue.Empty:
            session.log("Queue empty, exiting")
            break
        
        # Skip if already completed
        with completed_lock:
            if merchant_id in completed_ids:
                task_queue.task_done()
                continue
        
        session.log(f"Processing {merchant_id}")
        
        # Retry loop
        success = False
        for retry in range(MAX_RETRIES):
            try:
                # Fetch GraphQL detail
                graphql_raw = fetch_graphql_detail(session, merchant_id)
                time.sleep(REQUEST_DELAY)
                
                if not graphql_raw:
                    session.log(f"GraphQL failed for {merchant_id} (retry {retry+1}/{MAX_RETRIES})")
                    time.sleep(2)
                    continue
                
                # Fetch catalog
                catalog_raw = fetch_catalog(session, merchant_id)
                time.sleep(REQUEST_DELAY)
                
                if not catalog_raw:
                    session.log(f"Catalog failed for {merchant_id} (retry {retry+1}/{MAX_RETRIES})")
                    time.sleep(2)
                    continue
                
                # Build output record
                record = {
                    "id": merchant_id,
                    "graphql_raw": graphql_raw,
                    "catalog_raw": catalog_raw,
                    "fetched_at": datetime.utcnow().isoformat() + "Z"
                }
                
                # Write to JSONL (thread-safe)
                with file_lock:
                    with open(OUTPUT_FILE, 'a') as f:
                        f.write(json.dumps(record, ensure_ascii=False) + "\n")
                
                # Mark as completed
                with completed_lock:
                    completed_ids.add(merchant_id)
                
                # Update stats
                with stats_lock:
                    stats["completed"] += 1
                    if stats["completed"] % 100 == 0:
                        session.log(f"✓ Progress: {stats['completed']}/{stats['total']} completed, {stats['failed']} failed")
                
                success = True
                break
            
            except Exception as e:
                session.log(f"Error processing {merchant_id}: {e}")
                time.sleep(2)
        
        if not success:
            with stats_lock:
                stats["failed"] += 1
            session.log(f"✗ FAILED {merchant_id} after {MAX_RETRIES} retries")
        
        task_queue.task_done()
    
    session.log("Worker exiting")


# ── Main ──────────────────────────────────────────────────────


def main():
    print("=" * 60)
    print("iFood Raw Details Fetcher")
    print("=" * 60)
    
    # Load merchant IDs
    print(f"Loading merchant IDs from {PROGRESS_FILE}...")
    merchant_ids = load_merchant_ids(TARGET_COUNT)
    print(f"Loaded {len(merchant_ids)} merchant IDs")
    
    # Check for existing progress
    completed_ids = load_completed_ids(OUTPUT_FILE)
    print(f"Found {len(completed_ids)} already completed")
    
    # Build task list
    tasks = [mid for mid in merchant_ids if mid not in completed_ids]
    print(f"Tasks to process: {len(tasks)}")
    
    if not tasks:
        print("Nothing to do!")
        return
    
    # Create output directory
    os.makedirs(os.path.dirname(OUTPUT_FILE), exist_ok=True)
    
    # Setup queues and locks
    task_queue = queue.Queue()
    for mid in tasks:
        task_queue.put(mid)
    
    completed_lock = threading.Lock()
    file_lock = threading.Lock()
    stats_lock = threading.Lock()
    
    stats = {
        "total": len(tasks),
        "completed": len(completed_ids),
        "failed": 0
    }
    
    # Launch workers
    print(f"\nStarting {NUM_WORKERS} workers...")
    workers = []
    for i in range(NUM_WORKERS):
        t = threading.Thread(
            target=worker_thread,
            args=(i + 1, task_queue, completed_ids, completed_lock, file_lock, stats, stats_lock),
            daemon=True
        )
        t.start()
        workers.append(t)
        time.sleep(0.5)  # Stagger worker starts
    
    print(f"Workers launched. Processing {len(tasks)} merchants...")
    print(f"Output: {OUTPUT_FILE}")
    print("-" * 60)
    
    # Wait for completion
    for t in workers:
        t.join()
    
    # Final stats
    print("\n" + "=" * 60)
    print("COMPLETE")
    print("=" * 60)
    print(f"Total processed: {stats['completed']}")
    print(f"Failed: {stats['failed']}")
    print(f"Output: {OUTPUT_FILE}")
    print("=" * 60)


if __name__ == "__main__":
    main()
