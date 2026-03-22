import json
import os
import sys
import pandas as pd
from playwright.sync_api import sync_playwright
from utils import clean_currency, clean_integer
import time

# Configuration mapping for different elections
ELECTION_CONFIGS = {
    "delhi2020": {
        "url": "https://myneta.info/delhi2020/index.php?action=summary&subAction=all_candidates&sort=candidate#summary",
        "output": "candidates_delhi2020.json"
    },
    "maharashtra2024": {
        "url": "https://myneta.info/maharashtra2024/index.php?action=summary&subAction=all_candidates&sort=candidate#summary",
        "output": "candidates_maharashtra2024.json"
    },
    "loksabha2024": {
        "url": "https://myneta.info/loksabha2024/index.php?action=summary&subAction=all_candidates&sort=candidate#summary",
        "output": "candidates_loksabha2024.json"
    }
}

OUTPUT_DIR = "output"

def fetch_page_with_playwright(url):
    """
    Fetches the HTML content of the page using Playwright to bypass JS challenges.
    """
    print(f"[*] Launching browser to fetch: {url}")
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(
            user_agent='Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36'
        )
        page = context.new_page()
        
        try:
            page.goto(url, wait_until="networkidle", timeout=60000)
            time.sleep(3) # Ensure dynamic content
            content = page.content()
            return content
        except Exception as e:
            print(f"[!] Error with Playwright: {e}")
            return None
        finally:
            browser.close()

def parse_candidates(html):
    """
    Parses the candidate table from the HTML.
    """
    if not html:
        return []

    try:
        df_list = pd.read_html(html)
        print(f"[*] Found {len(df_list)} tables.")
        target_table = None
        for i, df in enumerate(df_list):
            cols = [str(c).lower() for c in df.columns]
            print(f"[*] Table {i} columns: {cols}")
            if any('candidate' in c for c in cols) and any('constituency' in c for c in cols):
                target_table = df
                break
        
        if target_table is None:
            # Fallback for different header structures
            for i, df in enumerate(df_list):
                first_row = [str(cell).lower() for cell in df.iloc[0]]
                if any('candidate' in cell for cell in first_row):
                    target_table = df
                    target_table.columns = target_table.iloc[0]
                    target_table = target_table[1:]
                    break
        
        if target_table is None:
            print("[!] Could not identify candidate table.")
            return []
            
        candidates = []
        # Normalizing columns for easier access
        target_table.columns = [str(c).title() for c in target_table.columns]
        
        for _, row in target_table.iterrows():
            name_raw = str(row.get('Candidate', ''))
            if not name_raw or 'Candidate' in name_raw or name_raw == 'nan':
                continue
                
            name = name_raw.split('\n')[0].strip()
            constituency = str(row.get('Constituency', '')).strip()
            party = str(row.get('Party', '')).strip()
            criminal_cases = str(row.get('Criminal Case', row.get('Criminal Cases', '0')))
            net_worth = str(row.get('Total Assets', '0'))
            
            candidates.append({
                "id": len(candidates) + 1,
                "name": name,
                "constituency": constituency,
                "party": party,
                "criminalCases": clean_integer(criminal_cases),
                "netWorth": clean_currency(net_worth)
            })
            
        print(f"[*] Successfully parsed {len(candidates)} candidates.")
        return candidates
    except Exception as e:
        print(f"[!] Parsing error: {e}")
        return []

def save_as_json(data, filename):
    filepath = os.path.join(OUTPUT_DIR, filename)
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    with open(filepath, 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=2, ensure_ascii=False)
    print(f"[*] Saved to {filepath}")

def main():
    election = sys.argv[1] if len(sys.argv) > 1 else "delhi2020"
    if election not in ELECTION_CONFIGS:
        print(f"[!] Unknown election: {election}. Choices: {list(ELECTION_CONFIGS.keys())}")
        return

    config = ELECTION_CONFIGS[election]
    html = fetch_page_with_playwright(config["url"])
    candidates = parse_candidates(html)
    if candidates:
        save_as_json(candidates, config["output"])
    else:
        print(f"[!] Scraping failed for {election}.")

if __name__ == "__main__":
    main()
