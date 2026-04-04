"""
extract_latlong.py
------------------
Opens 10 minimal Chrome windows in a grid (left→right, then next row),
navigates each Google Maps "link" URL, waits for the redirect that embeds
@lat,lng in the final URL, and immediately writes results back into
all-task-7-overview-clean.csv (adds/updates columns latitude & longitude).

Run:
    python data_crawler/extract_latlong.py

Dependencies:
    pip install selenium webdriver-manager
"""

import csv
import re
import time
import os
import threading
from concurrent.futures import ThreadPoolExecutor, as_completed
from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options
from webdriver_manager.chrome import ChromeDriverManager

# ─── SETTINGS ──────────────────────────────────────────────────────────────────
NUM_WORKERS   = 10          # chrome windows
NAV_WAIT      = 3.0         # initial pause after get() before polling
POLL_INTERVAL = 0.5         # check URL every N seconds
POLL_TIMEOUT  = 10.0        # give up after this many seconds total
MAX_RETRIES   = 2
WIN_W         = 380         # width of each chrome window
WIN_H         = 280         # height of each chrome window
WIN_GAP       = 6           # gap between windows (px)
TITLE_H       = 50          # chrome title bar + OS frame height estimate
COLS          = 5           # windows per row
CSV_PATH      = os.path.join(os.path.dirname(__file__), 'all-task-7-overview-clean.csv')
PROGRESS_FILE = os.path.join(os.path.dirname(__file__), '.latlong_done')
# ───────────────────────────────────────────────────────────────────────────────

COORD_RE = re.compile(r'@(-?\d+\.\d+),(-?\d+\.\d+)')
csv_lock = threading.Lock()
print_lock = threading.Lock()


def log(msg: str):
    with print_lock:
        print(msg, flush=True)


def load_done() -> set:
    if not os.path.exists(PROGRESS_FILE):
        return set()
    with open(PROGRESS_FILE, encoding='utf-8') as f:
        return {line.strip() for line in f if line.strip()}


def save_done(place_id: str):
    with open(PROGRESS_FILE, 'a', encoding='utf-8') as f:
        f.write(place_id + '\n')


def read_csv() -> tuple[list[str], list[dict]]:
    with open(CSV_PATH, encoding='utf-8', newline='') as f:
        reader = csv.DictReader(f)
        fields = reader.fieldnames or []
        rows = list(reader)
    return fields, rows


def write_rows_full(fields: list[str], rows: list[dict]):
    with open(CSV_PATH, 'w', encoding='utf-8', newline='') as f:
        writer = csv.DictWriter(f, fieldnames=fields, quoting=csv.QUOTE_ALL)
        writer.writeheader()
        writer.writerows(rows)


def update_row_in_csv(place_id: str, lat: str, lng: str, fields: list[str]):
    """Thread-safe in-place update of a single row."""
    with csv_lock:
        _, rows = read_csv()
        for row in rows:
            if row['place_id'] == place_id:
                row['latitude'] = lat
                row['longitude'] = lng
                break
        write_rows_full(fields, rows)


def make_driver(idx: int) -> webdriver.Chrome:
    opts = Options()
    opts.add_argument('--disable-gpu')
    opts.add_argument('--no-sandbox')
    opts.add_argument('--disable-dev-shm-usage')
    opts.add_argument('--disable-blink-features=AutomationControlled')
    opts.add_experimental_option('excludeSwitches', ['enable-automation'])
    opts.add_experimental_option('useAutomationExtension', False)
    opts.add_argument('--log-level=3')
    service = Service(ChromeDriverManager().install())
    driver = webdriver.Chrome(service=service, options=opts)

    col = idx % COLS
    row_num = idx // COLS
    x = col * (WIN_W + WIN_GAP)
    y = row_num * (WIN_H + WIN_GAP + TITLE_H)
    driver.set_window_rect(x=x, y=y, width=WIN_W, height=WIN_H)
    log(f'Window {idx}: col={col} row={row_num} → pos({x},{y}) size({WIN_W}×{WIN_H})')
    return driver


def get_coords(driver: webdriver.Chrome, url: str) -> tuple[str, str] | None:
    for attempt in range(1, MAX_RETRIES + 1):
        try:
            driver.get(url)
            time.sleep(NAV_WAIT)               # let page start loading
            deadline = time.time() + POLL_TIMEOUT
            while time.time() < deadline:
                m = COORD_RE.search(driver.current_url)
                if m:
                    return m.group(1), m.group(2)
                time.sleep(POLL_INTERVAL)
            log(f'  timeout attempt {attempt}: url={driver.current_url[:90]}')
        except Exception as e:
            log(f'  exception attempt {attempt}: {e}')
            time.sleep(2)
    return None


def worker(worker_id: int, driver: webdriver.Chrome, tasks: list[dict], fields: list[str]):
    try:
        for row in tasks:
            pid  = row['place_id']
            link = row.get('link', '').strip('"').strip()
            if not link:
                log(f'[w{worker_id}] {pid[:22]} — skip (no link)')
                continue
            log(f'[w{worker_id}] {pid[:22]} ...')
            result = get_coords(driver, link)
            if result:
                lat, lng = result
                update_row_in_csv(pid, lat, lng, fields)
                save_done(pid)
                log(f'[w{worker_id}] {pid[:22]} → {lat},{lng}  ✓')
            else:
                update_row_in_csv(pid, '', '', fields)
                save_done(pid)
                log(f'[w{worker_id}] {pid[:22]} → FAILED')
    finally:
        driver.quit()


def main():
    fields, rows = read_csv()

    if 'latitude' not in fields:
        fields = fields + ['latitude', 'longitude']
        for r in rows:
            r.setdefault('latitude', '')
            r.setdefault('longitude', '')
        write_rows_full(fields, rows)
        log('Added latitude/longitude columns to CSV.')

    done = load_done()
    log(f'Total rows: {len(rows)}, already done: {len(done)}')
    pending = [r for r in rows if r['place_id'] not in done and not r.get('latitude')]
    log(f'Pending: {len(pending)}')

    if not pending:
        log('All rows already processed.')
        return

    buckets: list[list] = [[] for _ in range(NUM_WORKERS)]
    for i, r in enumerate(pending):
        buckets[i % NUM_WORKERS].append(r)

    # Create ALL drivers FIRST in main thread so window positions are deterministic
    log('Opening Chrome windows...')
    drivers = []
    for i in range(NUM_WORKERS):
        if not buckets[i]:
            continue
        drivers.append((i, make_driver(i)))
        time.sleep(0.3)   # brief pause between opens to let OS settle positions

    with ThreadPoolExecutor(max_workers=NUM_WORKERS) as pool:
        futs = [
            pool.submit(worker, i, drv, buckets[i], fields)
            for i, drv in drivers
        ]
        for fut in as_completed(futs):
            exc = fut.exception()
            if exc:
                log(f'Worker error: {exc}')

    log(f'\nDone. CSV updated: {CSV_PATH}')


if __name__ == '__main__':
    main()
