import json
import random
from datetime import datetime, timedelta

# Setup parameters
start_time = datetime(2025, 10, 22, 0, 0, 0)
interval = timedelta(minutes=10)
steps = 144  # 24 hours * 6 intervals/hour

chaos_to_divine = []
divine_to_mirror = []

# Generate Chaos Orb → Divine Orb prices (70 → 160 chaos per divine)
chaos_prices = [70 + (90 * (i / (steps - 1))) + random.uniform(-2, 2) for i in range(steps)]
for i in range(steps):
    sell = round(chaos_prices[i], 2)
    buy = round(sell - random.uniform(1, 4), 2)
    chaos_to_divine.append({
        "time": {"$date": (start_time + i * interval).isoformat() + "Z"},
        "from_currency": "Chaos Orb",
        "to_currency": "Divine Orb",
        "sell_price": sell,
        "buy_price": buy
    })

# Generate Divine Orb → Mirror of Kalandra prices (200 → 1000 divines per mirror)
mirror_prices = [200 + (800 * (i / (steps - 1))) + random.uniform(-20, 20) for i in range(steps)]
for i in range(steps):
    sell = round(mirror_prices[i], 2)
    buy = round(sell - random.uniform(5, 20), 2)
    divine_to_mirror.append({
        "time": {"$date": (start_time + i * interval).isoformat() + "Z"},
        "from_currency": "Divine Orb",
        "to_currency": "Mirror of Kalandra",
        "sell_price": sell,
        "buy_price": buy
    })

# Combine all data points
all_data = chaos_to_divine + divine_to_mirror

# Save JSON to file
with open("market_data.json", "w", encoding="utf-8") as f:
    json.dump(all_data, f, indent=2)

print("✅ Market data successfully saved to 'market_data.json'")