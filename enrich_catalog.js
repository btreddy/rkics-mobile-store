import fs from 'fs';
import csv from 'csv-parser';
import { createObjectCsvWriter as createCsvWriter } from 'csv-writer';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const GEMINI_API_KEY = "AQ.Ab8RN6J5npGJ6TZKu6rtqETPa2NwcaeXrkCtvMfyB99am2vppw";
const SERPAPI_KEY = "bc480156c35dbc1e6bdeb9b5f96974cc65d514c2f22aa764da28a9c4b05c75f3";

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function getGeminiDescription(productName, brand) {
    if (!productName) return 'Professional construction chemical supplied by RKICS.';
    
    const prompt = `Write a concise, 2-sentence technical B2B description for the construction chemical product "${brand} ${productName}". Focus on its application and institutional value. Do not use marketing fluff.`;
    
    try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash-lite:generateContent?key=${GEMINI_API_KEY}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
        });
        const data = await response.json();
        
        // Catch API authentication errors explicitly
        if (data.error) {
            console.error(`\n⚠️ Gemini API Error: ${data.error.message}`);
            return 'Professional construction chemical supplied by RKICS.';
        }
        
        return data.candidates[0].content.parts[0].text.trim().replace(/\n/g, ' ');
    } catch (error) {
        console.error(`\n⚠️ Failed to connect to Gemini for ${productName}`);
        return 'Professional construction chemical supplied by RKICS.';
    }
}

async function getSerpApiImage(productName, brand) {
    if (!productName) return '';
    try {
        const query = encodeURIComponent(`${brand} ${productName} construction chemical product shot`);
        const response = await fetch(`https://serpapi.com/search.json?q=${query}&tbm=isch&api_key=${SERPAPI_KEY}`);
        const data = await response.json();
        
        if (data.error) {
            console.error(`\n⚠️ SerpApi Error: ${data.error}`);
            return '';
        }
        
        return data.images_results?.[0]?.original || '';
    } catch (error) {
        return '';
    }
}

async function processCatalog() {
    const results = [];
    
    console.log('Reading input.csv...');
    await new Promise((resolve) => {
        fs.createReadStream('input.csv')
            .pipe(csv())
            .on('data', (data) => {
                // Only push rows that actually have a product name
                if (data.name && data.name.trim() !== '') {
                    results.push(data);
                }
            })
            .on('end', resolve);
    });

    const enrichedData = [];
    const csvWriter = createCsvWriter({
        path: 'output_for_supabase.csv',
        header: [
            { id: 'brand', title: 'brand' },
            { id: 'name', title: 'name' },
            { id: 'description', title: 'description' },
            { id: 'imagePlaceholder', title: 'imagePlaceholder' },
            { id: 'price', title: 'price' } 
        ]
    });

    console.log(`Found ${results.length} valid products. Starting enrichment...\n`);

    for (let i = 0; i < results.length; i++) {
        const { brand, name } = results[i];
        console.log(`Processing [${i + 1}/${results.length}]: ${brand} | ${name}`);

        const description = await getGeminiDescription(name, brand);
        const imageUrl = await getSerpApiImage(name, brand);

        enrichedData.push({
            brand,
            name,
            description,
            imagePlaceholder: imageUrl,
            price: '' 
        });

        await delay(4500);
    }

    console.log('\nWriting to output_for_supabase.csv...');
    await csvWriter.writeRecords(enrichedData);
    console.log('Done! Ready for Supabase import.');
}

processCatalog();