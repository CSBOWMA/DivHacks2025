import requests, sqlite3, pandas as pd
import json

API_KEY = "cb0c3712fd83d081cfbf31de4c25fb33"
BASE = "http://api.nessieisreal.com/enterprise"

def fetch(endpoint):
    url = f"{BASE}/{endpoint}?key={API_KEY}"
    r = requests.get(url)
    r.raise_for_status()
    return r.json()

def flatten_lists(df):
    for col in df.columns:
        df[col] = df[col].apply(
            lambda x: json.dumps(x) if isinstance(x, (list, dict)) else x
        )
    return df


conn = sqlite3.connect("nessie.db")

for table in ["customers", "accounts", "bills", "deposits", "merchants", "transfers", "withdrawals"]:
    print(f"→ pulling {table}")
    data = fetch(table)
    if not data:
        print(f"  (no records yet)")
        continue
    df = pd.json_normalize(data)
    df = flatten_lists(df)
    df.to_sql(table, conn, if_exists="replace", index=False)

conn.close()
print("done")
