import pandas as pd
import requests
import time
import json

# Your free API key from https://serper.dev
SERPER_API_KEY = "2a28ce61f5730ef41e8d1426253ed448a9858d33"

def search_google(query):
    url = "https://google.serper.dev/search"
    payload = json.dumps({"q": query, "gl": "in"}) # 'in' targets India pricing
    headers = {
        'X-API-KEY': SERPER_API_KEY,
        'Content-Type': 'application/json'
    }
    response = requests.post(url, headers=headers, data=payload)
    return response.json()

def enrich_product(brand, name):
    print(f"Researching: {brand} {name}...")
    enriched_data = {
        "suggested_description": "",
        "pds_link": "",
        "suggested_price": ""
    }

    # 1. Find PDS (Data Sheet)
    pds_query = f"{brand} {name} product data sheet filetype:pdf"
    pds_results = search_google(pds_query)
    if 'organic' in pds_results and len(pds_results['organic']) > 0:
        # Grab the first PDF link
        for result in pds_results['organic']:
            if result['link'].endswith('.pdf'):
                enriched_data["pds_link"] = result['link']
                break

    # 2. Find Official Description
    desc_query = f"site:{brand.lower()}.com {name} overview"
    desc_results = search_google(desc_query)
    if 'organic' in desc_results and len(desc_results['organic']) > 0:
        enriched_data["suggested_description"] = desc_results['organic'][0].get('snippet', '')

    # 3. Find Pricing Data (IndiaMart / Competitors)
    price_query = f"buy {brand} {name} price in India"
    price_results = search_google(price_query)
    if 'organic' in price_results:
        # Extract snippets to find ₹ symbols and numbers for your review
        price_snippets = [res.get('snippet', '') for res in price_results['organic'] if '₹' in res.get('snippet', '') or 'Rs' in res.get('snippet', '')]
        enriched_data["suggested_price"] = " | ".join(price_snippets[:2]) # Combine top 2 price mentions

    return enriched_data

def main():
    # 1. Load the Excel file you downloaded from your Admin Page
    print("Loading products_rows.csv...")
    df = pd.read_csv("products_rows.csv")

    # Create new columns if they don't exist
    if 'suggested_price' not in df.columns:
        df['suggested_price'] = ""
    
    # 2. Loop through products and enrich
    for index, row in df.iterrows():
        # Skip if already fully populated
        if pd.notna(row.get('price')) and pd.notna(row.get('pdsLink')):
            continue
            
        brand = str(row['brand'])
        name = str(row['name'])
        
        data = enrich_product(brand, name)
        
        df.at[index, 'description'] = data['suggested_description']
            
        if pd.isna(row.get('pdsLink')) or str(row.get('pdsLink')).strip() == "":
            df.at[index, 'pdsLink'] = data['pds_link']
            
        df.at[index, 'suggested_price'] = data['suggested_price']
        
        # Pause to avoid hitting API rate limits
        time.sleep(1)

    # 3. Export for your manual review
    output_filename = "RKICS_Products_Enriched.xlsx"
    df.to_excel(output_filename, index=False)
    print(f"\nDone! Please review pricing in {output_filename}")

if __name__ == "__main__":
    main()