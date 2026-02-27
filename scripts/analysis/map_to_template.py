#!/usr/bin/env python3
"""
Transform iFood raw_v2 data to standard JSONL templates.
Input:  ~/reversation/ifood-web/data/merchants_raw_v2.jsonl
Output: ~/reversation/ifood-web/data/output/{outlet_information,outlet_meal,meal_option,option_relation}.jsonl

Schema (from template.xlsx):
  outlet_information: id_outlet, id_platform, platform, name, category, cuisine, description,
                      street, house_number, address, city, postal_code, country, region,
                      source_country, lat, lon, rating, review_nr, price_level, delivery_cost,
                      icon_url, status, flag_close, pickup_available, url, opening_hours,
                      is_promotion, is_grabsupermarket, promotion, telephone, last_refresh
  outlet_meal:        id_outlet, id_platform, platform, id_category, category, id_meal,
                      name, description, price, image_url, position, last_refresh
  meal_option:        id_outlet, id_platform, platform, id_meal, id_category, id_option,
                      name, category, price, is_sold_out, last_refresh
  option_relation:    id_outlet, id_platform, platform, id_meal, id_category, id_option, option_level
"""

import json
import sys
from datetime import datetime, timezone
from pathlib import Path

PLATFORM = "ifood"
SOURCE_COUNTRY = "BR"


def now_str():
    return datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M:%S")


# ── outlet_information ────────────────────────────────────────

def map_outlet_information(raw: dict) -> dict:
    gql = raw.get("graphql_raw") or {}
    m = gql.get("merchant") or {}
    mx = gql.get("merchantExtra") or {}

    mid = raw.get("id")

    # Address from merchantExtra
    addr = mx.get("address") or {}
    street = addr.get("streetName")
    house_number = addr.get("streetNumber")
    if street and house_number:
        address = f"{street} {house_number}"
    elif street:
        address = street
    elif house_number:
        address = house_number
    else:
        address = None

    lat = addr.get("latitude")
    lon = addr.get("longitude")

    # Delivery fee
    delivery_fee_obj = m.get("deliveryFee") or {}
    delivery_value = delivery_fee_obj.get("value")
    delivery_cost = round(delivery_value / 100, 2) if delivery_value is not None else None

    # Pickup
    features = m.get("features") or []
    pickup_available = "TAKEOUT" in features

    # URL
    slug = m.get("slug")
    url = f"https://www.ifood.com.br/delivery/{slug}" if slug else None

    # Opening hours (shifts)
    shifts = mx.get("shifts")
    opening_hours = json.dumps(shifts, ensure_ascii=False) if shifts else None

    # Category
    main_cat = m.get("mainCategory") or {}
    category = main_cat.get("name")

    # Icon
    resources = m.get("resources") or []
    icon_url = None
    for r in resources:
        if r.get("type") == "LOGO":
            icon_url = r.get("fileName")
            break

    # Rating
    rating = m.get("userRating")
    review_nr = mx.get("userRatingCount")

    available = m.get("available")
    status = "open" if available else "closed"

    return {
        "id_outlet": mid,
        "id_platform": PLATFORM,
        "platform": PLATFORM,
        "name": m.get("name"),
        "category": category,
        "cuisine": category,
        "description": mx.get("description"),
        "street": street,
        "house_number": house_number,
        "address": address,
        "city": addr.get("city"),
        "postal_code": addr.get("zipCode"),
        "country": addr.get("country") or SOURCE_COUNTRY,
        "region": addr.get("state"),
        "source_country": SOURCE_COUNTRY,
        "lat": lat,
        "lon": lon,
        "rating": rating,
        "review_nr": review_nr,
        "price_level": m.get("priceRange"),
        "delivery_cost": delivery_cost,
        "icon_url": icon_url,
        "status": status,
        "flag_close": not bool(available),
        "pickup_available": pickup_available,
        "url": url,
        "opening_hours": opening_hours,
        "is_promotion": None,
        "is_grabsupermarket": False,
        "promotion": None,
        "telephone": mx.get("phoneIf"),
        "last_refresh": now_str(),
    }


# ── outlet_meal ───────────────────────────────────────────────

def map_outlet_meals(raw: dict) -> list:
    mid = raw.get("id")
    catalog = raw.get("catalog_raw") or {}
    meals = []
    ts = now_str()

    for cat in catalog.get("menu") or []:
        cat_id = cat.get("code") or cat.get("id")
        cat_name = cat.get("name") or cat.get("description")

        for item in cat.get("itens") or []:
            logo = item.get("logoUrl")
            price = item.get("unitMinPrice") if item.get("unitMinPrice") is not None else item.get("unitPrice")

            meals.append({
                "id_outlet": mid,
                "id_platform": PLATFORM,
                "platform": PLATFORM,
                "id_category": cat_id,
                "category": cat_name,
                "id_meal": item.get("id"),
                "name": item.get("description"),
                "description": item.get("details"),
                "price": price,
                "image_url": logo,
                "position": None,
                "last_refresh": ts,
            })

    return meals


# ── meal_option ───────────────────────────────────────────────

def map_meal_options(raw: dict) -> list:
    """One record per garnish item (option) per meal."""
    mid = raw.get("id")
    catalog = raw.get("catalog_raw") or {}
    options = []
    ts = now_str()

    for cat in catalog.get("menu") or []:
        cat_id = cat.get("code") or cat.get("id")
        cat_name = cat.get("name") or cat.get("description")

        for item in cat.get("itens") or []:
            item_id = item.get("id")
            choices = item.get("choices") or []

            for choice_group in choices:
                for garnish in choice_group.get("garnishItens") or []:
                    avail = garnish.get("availability") or garnish.get("enabled")
                    is_sold_out = False
                    if isinstance(avail, str):
                        is_sold_out = avail.upper() != "AVAILABLE"
                    elif isinstance(avail, bool):
                        is_sold_out = not avail

                    options.append({
                        "id_outlet": mid,
                        "id_platform": PLATFORM,
                        "platform": PLATFORM,
                        "id_meal": item_id,
                        "id_category": cat_id,
                        "id_option": garnish.get("id"),
                        "name": garnish.get("description"),
                        "category": choice_group.get("name"),
                        "price": garnish.get("unitPrice"),
                        "is_sold_out": is_sold_out,
                        "last_refresh": ts,
                    })

    return options


# ── option_relation ───────────────────────────────────────────

def map_option_relations(raw: dict) -> list:
    """One record per garnish item showing meal-option relationship."""
    mid = raw.get("id")
    catalog = raw.get("catalog_raw") or {}
    relations = []

    for cat in catalog.get("menu") or []:
        cat_id = cat.get("code") or cat.get("id")

        for item in cat.get("itens") or []:
            item_id = item.get("id")
            choices = item.get("choices") or []

            for level, choice_group in enumerate(choices, start=1):
                for garnish in choice_group.get("garnishItens") or []:
                    relations.append({
                        "id_outlet": mid,
                        "id_platform": PLATFORM,
                        "platform": PLATFORM,
                        "id_meal": item_id,
                        "id_category": cat_id,
                        "id_option": garnish.get("id"),
                        "option_level": level,
                    })

    return relations


# ── Main ──────────────────────────────────────────────────────

def main():
    input_file = Path.home() / "reversation/ifood-web/data/merchants_raw_v2.jsonl"
    output_dir = Path.home() / "reversation/ifood-web/data/output"
    output_dir.mkdir(parents=True, exist_ok=True)

    files = {
        "info":     output_dir / "outlet_information.jsonl",
        "meal":     output_dir / "outlet_meal.jsonl",
        "option":   output_dir / "meal_option.jsonl",
        "relation": output_dir / "option_relation.jsonl",
    }

    counts = {k: 0 for k in files}
    errors = 0

    print(f"Input:  {input_file}")
    print(f"Output: {output_dir}")
    print("-" * 60)

    with open(input_file, encoding="utf-8") as infile, \
         open(files["info"],     "w", encoding="utf-8") as f_info, \
         open(files["meal"],     "w", encoding="utf-8") as f_meal, \
         open(files["option"],   "w", encoding="utf-8") as f_opt, \
         open(files["relation"], "w", encoding="utf-8") as f_rel:

        for line_no, line in enumerate(infile, 1):
            line = line.strip()
            if not line:
                continue
            try:
                raw = json.loads(line)

                info = map_outlet_information(raw)
                f_info.write(json.dumps(info, ensure_ascii=False) + "\n")
                counts["info"] += 1

                for meal in map_outlet_meals(raw):
                    f_meal.write(json.dumps(meal, ensure_ascii=False) + "\n")
                    counts["meal"] += 1

                for opt in map_meal_options(raw):
                    f_opt.write(json.dumps(opt, ensure_ascii=False) + "\n")
                    counts["option"] += 1

                for rel in map_option_relations(raw):
                    f_rel.write(json.dumps(rel, ensure_ascii=False) + "\n")
                    counts["relation"] += 1

                if line_no % 500 == 0:
                    print(f"  [{line_no:>5}] info={counts['info']} meal={counts['meal']} "
                          f"option={counts['option']} relation={counts['relation']}")

            except Exception as e:
                errors += 1
                print(f"Error line {line_no}: {e}", file=sys.stderr)

    print("-" * 60)
    print("✅ Done!")
    print(f"  outlet_information : {counts['info']:>8,} records")
    print(f"  outlet_meal        : {counts['meal']:>8,} records")
    print(f"  meal_option        : {counts['option']:>8,} records")
    print(f"  option_relation    : {counts['relation']:>8,} records")
    print(f"  errors             : {errors:>8,}")
    for name, path in files.items():
        size = path.stat().st_size
        print(f"  {path.name}: {size/1024/1024:.1f} MB")


if __name__ == "__main__":
    main()
