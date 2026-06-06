"""
Generate crop-specific compliance rules from final_dataset.csv.
"""

from pathlib import Path

import pandas as pd

PROJECT_ROOT = Path(__file__).resolve().parent
INPUT_PATH = PROJECT_ROOT / "final_dataset.csv"
OUTPUT_PATH = PROJECT_ROOT / "crop_rules.csv"

# Fixed compliance thresholds (same for all crops)
MAX_PESTICIDE = 50
MIN_INVENTORY = 5
MIN_TEMPERATURE = 10
MAX_TEMPERATURE = 35


def generate_crop_rules(df: pd.DataFrame) -> pd.DataFrame:
    """Compute per-crop compliance rules from the final dataset."""
    rules = (
        df.groupby("Crop")
        .agg(
            MinYield=("Yield", lambda s: round(s.quantile(0.25), 4)),
            MinPrice=("Price", lambda s: round(s.quantile(0.25), 2)),
            MaxPrice=("Price", lambda s: round(s.quantile(0.75), 2)),
        )
        .reset_index()
    )

    rules["MaxPesticide"] = MAX_PESTICIDE
    rules["MinInventory"] = MIN_INVENTORY
    rules["MinTemperature"] = MIN_TEMPERATURE
    rules["MaxTemperature"] = MAX_TEMPERATURE

    column_order = [
        "Crop",
        "MinYield",
        "MaxPesticide",
        "MinInventory",
        "MinTemperature",
        "MaxTemperature",
        "MinPrice",
        "MaxPrice",
    ]
    return rules[column_order].sort_values("Crop").reset_index(drop=True)


def main() -> None:
    df = pd.read_csv(INPUT_PATH)
    rules = generate_crop_rules(df)
    rules.to_csv(OUTPUT_PATH, index=False)

    print(f"Analyzed {len(df):,} records across {df['Crop'].nunique()} crops.")
    print(f"Saved crop rules to: {OUTPUT_PATH}")
    print(f"Total rules generated: {len(rules)}")
    print("\nSample rules:")
    print(rules.head(10).to_string(index=False))


if __name__ == "__main__":
    main()
