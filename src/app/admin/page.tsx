'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { products as localProducts } from '@/data/products';

export default function MigrationPage() {
  const router = useRouter();
  const [status, setStatus] = useState("Ready to migrate.");
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Security Lock: Check for an active Supabase session before rendering
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        // Unauthorized visitor: redirect to login
        router.push('/login');
      } else {
        // Authorized admin: unlock the page
        setIsAuthenticated(true);
      }
      setLoading(false);
    };
    
    checkAuth();
  }, [router]);

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

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  // Show a blank or loading state while checking credentials
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-gray-500 font-medium">Verifying access...</p>
      </div>
    );
  }

  // Double-lock: Do not render the HTML if they bypassed the redirect
  if (!isAuthenticated) return null;

  return (
    <main className="p-8 max-w-2xl mx-auto min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Database Migration Tool</h1>
        <button 
          onClick={handleSignOut}
          className="text-sm font-bold text-red-600 bg-red-50 px-4 py-2 rounded-lg hover:bg-red-100 transition-colors"
        >
          Sign Out
        </button>
      </div>
      
      <button 
        onClick={handleMigration} 
        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded font-bold transition-colors mb-4 block"
      >
        Push Local Data to Supabase
      </button>
      <p className="text-gray-700 font-semibold">{status}</p>
    </main>
  );
}