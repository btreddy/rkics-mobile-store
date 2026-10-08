import pandas as pd
import re

def clean_price(price_val):
    if pd.isna(price_val):
        return None
    # Remove any ₹ symbols, commas, or text to ensure it is a clean number for Supabase
    cleaned = re.sub(r'[^\d.]', '', str(price_val))
    try:
        return float(cleaned) if cleaned else None
    except ValueError:
        return None

def main():
    print("Loading your reviewed file...")
    # Read the file you just finished reviewing
    df = pd.read_excel("RKICS_Products_Enriched_2.xlsx")

    # 1. Clean the price column to ensure it is a pure number for the database
    df['price'] = df['price'].apply(clean_price)

    # 2. Drop the helper column that Supabase doesn't understand
    if 'suggested_price' in df.columns:
        df = df.drop(columns=['suggested_price'])

    # 3. Ensure the exact columns match your Next.js and Supabase format
    # We keep only the columns your database actually uses
    allowed_columns = [
        'id', 'brand', 'name', 'price', 'originalPrice', 
        'discount', 'imagePlaceholder', 'description', 'pdsLink', 'created_at'
    ]
    
    # Filter out any other stray columns
    final_cols = [col for col in allowed_columns if col in df.columns]
    df = df[final_cols]

    # Export the final clean file
    output_filename = "RKICS_Final_Upload.xlsx"
    df.to_excel(output_filename, index=False)
    print(f"Success! Cleaned data saved to {output_filename}")
    print("You can now safely upload this file into your Next.js Admin portal.")

if __name__ == "__main__":
    main()