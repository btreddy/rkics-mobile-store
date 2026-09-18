'use client';
import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { products as localProducts } from '@/data/products';

export default function MigrationPage() {
  const [status, setStatus] = useState("Ready to migrate.");

  const handleMigration = async () => {
    setStatus("Migrating data...");
    
    const { error } = await supabase
      .from('products')
      .upsert(localProducts, { onConflict: 'id' }); // upsert prevents duplicate IDs

    if (error) {
      setStatus(`Error: ${error.message}`);
    } else {
      setStatus("Success! Local products pushed to Supabase.");
    }
  };

  return (
    <main className="p-8 max-w-2xl mx-auto min-h-screen">
      <h1 className="text-2xl font-bold mb-6 text-gray-800">Database Migration Tool</h1>
      <button 
        onClick={handleMigration} 
        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded font-bold transition-colors mb-4"
      >
        Push Local Data to Supabase
      </button>
      <p className="text-gray-700 font-semibold">{status}</p>
    </main>
  );
}