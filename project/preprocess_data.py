"""
Preprocessing pipeline for agricultural multi-chain privacy layer project.

Loads FAOSTAT, Crop Recommendation, Supply Chain, and Agmarknet datasets,
cleans and merges them into final_dataset.csv.
"""

from __future__ import annotations

import json
import re
from pathlib import Path

import numpy as np
import pandas as pd

# ---------------------------------------------------------------------------
# Paths
# ---------------------------------------------------------------------------
PROJECT_ROOT = Path(__file__).resolve().parent
DATA_DIR = PROJECT_ROOT / "data"

FAOSTAT_PATH = DATA_DIR / "archive" / "Production_Crops_Livestock_E_All_Data.csv"
CROP_REC_PATH = DATA_DIR / "archive (1)" / "Crop_recommendation.csv"
SUPPLY_CHAIN_PATH = DATA_DIR / "archive (2)" / "synthetic-food-supply-chain-dataset.json"
AGMARKNET_PATH = (
    DATA_DIR
    / "archive (3)"
    / "agmarknet-india-commodity-prices-2024-2025"
    / "agmarknet_india_historical_prices_2024_2025.csv"
)

OUTPUT_PATH = PROJECT_ROOT / "final_dataset.csv"
MIN_ROWS = 5000
RANDOM_SEED = 42


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------
def standardize_columns(df: pd.DataFrame) -> pd.DataFrame:
    """Convert column names to snake_case."""
    df = df.copy()
    df.columns = [
        re.sub(r"_+", "_", re.sub(r"[^0-9a-zA-Z]+", "_", col.strip().lower())).strip("_")
        for col in df.columns
    ]
    return df


def normalize_crop(name: str) -> str:
    """Normalize crop names for cross-dataset matching."""
    if pd.isna(name):
        return ""
    text = str(name).lower().strip()
    text = re.sub(r"\(.*?\)", "", text)
    text = re.sub(r"[^a-z0-9\s]", " ", text)
    text = re.sub(r"\s+", " ", text).strip()

    aliases = {
        "paddy": "rice",
        "arhar tur red gram whole": "pigeonpeas",
        "tur red gram": "pigeonpeas",
        "red gram": "pigeonpeas",
        "green gram moong whole": "mungbean",
        "moong": "mungbean",
        "masur whole": "lentil",
        "pearl millet cumbu": "bajra",
        "bajra pearl millet cumbu": "bajra",
        "sorghum": "jowar",
        "ladies finger": "bhindi",
        "green chilli": "chilli",
        "ginger green": "ginger",
        "jaggery": "gur",
        "soyabean": "soybean",
        "maize corn": "maize",
        "rice paddy": "rice",
        "bananas": "banana",
        "apples": "apple",
        "mangoes": "mango",
        "oranges": "orange",
        "grapes": "grape",
        "watermelons": "watermelon",
        "cotton lint": "cotton",
    }
    return aliases.get(text, text)


def clean_numeric(series: pd.Series) -> pd.Series:
    """Parse numeric strings and replace FAOSTAT sentinel values."""
    cleaned = pd.to_numeric(
        series.astype(str).str.replace(",", "", regex=False),
        errors="coerce",
    )
    return cleaned.where(cleaned >= 0)


def latest_year_value(row: pd.Series, year_cols: list[str]) -> float | np.nan:
    """Return the most recent non-null yield value for a FAOSTAT row."""
    for col in reversed(year_cols):
        value = row[col]
        if pd.notna(value):
            return value
    return np.nan


# ---------------------------------------------------------------------------
# Dataset loaders
# ---------------------------------------------------------------------------
def load_faostat_yield() -> pd.DataFrame:
    """
    FAOSTAT yield-related columns:
      - Item (crop)
      - Element (filtered to 'Yield')
      - Unit (yield unit, e.g. kg/ha)
      - Year columns Y1961..Y2023 (yield values)
    """
    df = pd.read_csv(FAOSTAT_PATH, low_memory=False)
    df = standardize_columns(df)

    year_cols = [c for c in df.columns if re.fullmatch(r"y\d{4}", c)]
    flag_cols = [c for c in df.columns if re.fullmatch(r"y\d{4}f", c)]
    note_cols = [c for c in df.columns if re.fullmatch(r"y\d{4}n", c)]

    df = df[df["element"] == "Yield"].copy()
    df = df.drop(columns=flag_cols + note_cols, errors="ignore")

    for col in year_cols:
        df[col] = clean_numeric(df[col])

    df["yield"] = df.apply(lambda row: latest_year_value(row, year_cols), axis=1)
    df = df.drop(columns=year_cols)

    df["crop"] = df["item"].map(normalize_crop)
    df = df[["crop", "area", "unit", "yield"]]
    df = df.dropna(subset=["crop", "yield"])
    df = df.drop_duplicates()
    return df.reset_index(drop=True)


def load_crop_temperature() -> pd.DataFrame:
    """
    Crop Recommendation temperature-related columns:
      - temperature
      - label (crop)
    """
    df = pd.read_csv(CROP_REC_PATH)
    df = standardize_columns(df)

    df["crop"] = df["label"].map(normalize_crop)
    df = df.rename(columns={"temperature": "temperature"})
    df = df[["crop", "temperature"]]

    df["temperature"] = clean_numeric(df["temperature"])
    df = df.dropna(subset=["crop", "temperature"])
    df = df.drop_duplicates()
    return df.reset_index(drop=True)


def load_supply_chain_inventory() -> pd.DataFrame:
    """
    Supply Chain inventory-related columns:
      - quantityList.quantity (inventory quantity)
      - quantityList.uom (unit of measure)
      - epcClass (product identifier)
      - bizStep (supply chain step, e.g. receiving)
    """
    with SUPPLY_CHAIN_PATH.open(encoding="utf-8") as handle:
        document = json.load(handle)

    records: list[dict] = []
    for event in document["epcisBody"]["eventList"]:
        biz_step = event.get("bizStep")
        for entry in event.get("quantityList", []):
            records.append(
                {
                    "product_id": entry.get("epcClass"),
                    "inventory": entry.get("quantity"),
                    "uom": entry.get("uom"),
                    "biz_step": biz_step,
                }
            )

    df = pd.DataFrame(records)
    df = standardize_columns(df)
    df["inventory"] = clean_numeric(df["inventory"])
    df = df.dropna(subset=["inventory"])

    # Aggregate quantity per product to reflect stock levels across supply-chain events.
    df = (
        df.groupby("product_id", as_index=False)["inventory"]
        .sum()
        .rename(columns={"inventory": "inventory"})
    )
    df = df.drop_duplicates()
    return df.reset_index(drop=True)


def load_agmarknet_prices() -> pd.DataFrame:
    """
    Agmarknet price-related columns:
      - Commodity (crop)
      - Min Price (Rs./Quintal)
      - Max Price (Rs./Quintal)
      - Modal Price (Rs./Quintal)
    """
    df = pd.read_csv(AGMARKNET_PATH)
    df = standardize_columns(df)

    price_cols = {
        "min_price_rs_quintal": "min_price",
        "max_price_rs_quintal": "max_price",
        "modal_price_rs_quintal": "price",
    }
    df = df.rename(columns=price_cols)

    df["crop"] = df["commodity"].map(normalize_crop)
    for col in ["min_price", "max_price", "price"]:
        df[col] = clean_numeric(df[col])

    df = df[["crop", "min_price", "max_price", "price"]]
    df = df.dropna(subset=["crop", "price"])
    df = df.drop_duplicates()
    return df.reset_index(drop=True)


# ---------------------------------------------------------------------------
# Merge and final dataset construction
# ---------------------------------------------------------------------------
def build_crop_pools(
    faostat_df: pd.DataFrame,
    crop_temp_df: pd.DataFrame,
    inventory_df: pd.DataFrame,
    price_df: pd.DataFrame,
) -> dict[str, dict[str, pd.Series]]:
    """Build per-crop value pools for sampling during row generation."""
    all_crops = sorted(
        set(faostat_df["crop"])
        | set(crop_temp_df["crop"])
        | set(price_df["crop"])
    )

    global_yield = faostat_df["yield"]
    global_temp = crop_temp_df["temperature"]
    global_inventory = inventory_df["inventory"]
    global_price = price_df["price"]

    pools: dict[str, dict[str, pd.Series]] = {}
    for crop in all_crops:
        pools[crop] = {
            "yield": faostat_df.loc[faostat_df["crop"] == crop, "yield"],
            "temperature": crop_temp_df.loc[crop_temp_df["crop"] == crop, "temperature"],
            "inventory": global_inventory,
            "price": price_df.loc[price_df["crop"] == crop, "price"],
        }

        for key, series in pools[crop].items():
            if series.empty:
                if key == "yield":
                    pools[crop][key] = global_yield
                elif key == "temperature":
                    pools[crop][key] = global_temp
                elif key == "inventory":
                    pools[crop][key] = global_inventory
                elif key == "price":
                    pools[crop][key] = global_price

    return pools


def sample_value(pool: pd.Series, rng: np.random.Generator) -> float:
    """Sample one value from a pool."""
    values = pool.dropna().to_numpy()
    if values.size == 0:
        raise ValueError("Cannot sample from an empty pool.")
    return float(rng.choice(values))


def generate_final_dataset(
    faostat_df: pd.DataFrame,
    crop_temp_df: pd.DataFrame,
    inventory_df: pd.DataFrame,
    price_df: pd.DataFrame,
    min_rows: int = MIN_ROWS,
    seed: int = RANDOM_SEED,
) -> pd.DataFrame:
    """Generate the merged final dataset with at least min_rows records."""
    rng = np.random.default_rng(seed)
    pools = build_crop_pools(faostat_df, crop_temp_df, inventory_df, price_df)
    crops = list(pools.keys())

    rows_per_crop = int(np.ceil(min_rows / len(crops)))
    records: list[dict] = []

    for crop in crops:
        crop_pools = pools[crop]
        for _ in range(rows_per_crop):
            records.append(
                {
                    "Crop": crop,
                    "Yield": round(sample_value(crop_pools["yield"], rng), 4),
                    "Temperature": round(sample_value(crop_pools["temperature"], rng), 4),
                    "Inventory": round(sample_value(crop_pools["inventory"], rng), 4),
                    "Pesticide": round(rng.uniform(10, 70), 2),
                    "Price": round(sample_value(crop_pools["price"], rng), 2),
                }
            )

    final_df = pd.DataFrame(records)
    final_df = final_df.drop_duplicates()
    final_df = final_df.dropna()

    if len(final_df) < min_rows:
        extra_needed = min_rows - len(final_df)
        extra_samples = final_df.sample(n=extra_needed, replace=True, random_state=seed)
        final_df = pd.concat([final_df, extra_samples], ignore_index=True)

    final_df = final_df.sample(frac=1, random_state=seed).reset_index(drop=True)
    final_df.insert(0, "Farmer_ID", [f"F{i:05d}" for i in range(1, len(final_df) + 1)])

    column_order = ["Farmer_ID", "Crop", "Yield", "Temperature", "Inventory", "Pesticide", "Price"]
    final_df = final_df[column_order]
    return final_df


def main() -> None:
    print("Loading and cleaning datasets...")
    faostat_df = load_faostat_yield()
    crop_temp_df = load_crop_temperature()
    inventory_df = load_supply_chain_inventory()
    price_df = load_agmarknet_prices()

    print(f"  FAOSTAT yield records:     {len(faostat_df):,}")
    print(f"  Crop temperature records:  {len(crop_temp_df):,}")
    print(f"  Supply chain inventory:    {len(inventory_df):,}")
    print(f"  Agmarknet price records:   {len(price_df):,}")

    print("\nBuilding final dataset...")
    final_df = generate_final_dataset(
        faostat_df, crop_temp_df, inventory_df, price_df
    )

    final_df.to_csv(OUTPUT_PATH, index=False)

    print(f"\nFinal dataset saved to: {OUTPUT_PATH}")
    print(f"Total rows generated:     {len(final_df):,}")
    print(f"Unique crops:             {final_df['Crop'].nunique()}")
    print(f"Missing values:           {final_df.isna().sum().sum()}")
    print("\nColumn summary:")
    print(final_df.describe().round(2).to_string())
    print("\nSample rows:")
    print(final_df.head(10).to_string(index=False))


if __name__ == "__main__":
    main()
