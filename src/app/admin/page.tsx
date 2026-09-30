'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import * as XLSX from 'xlsx';
import { products as initialProducts } from '@/data/products';
import { supabase } from '@/lib/supabase'; // Ensure this path matches your Supabase client file

export default function AdminPage() {
  const router = useRouter();
  const [output, setOutput] = useState("");
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

  const handleExport = () => {
    const worksheet = XLSX.utils.json_to_sheet(initialProducts);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Products");
    XLSX.writeFile(workbook, "RKICS_Products.xlsx");
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const binaryString = event.target?.result;
      const workbook = XLSX.read(binaryString, { type: 'binary' });
      const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
      const parsedData = XLSX.utils.sheet_to_json(firstSheet);
      
      setOutput(JSON.stringify(parsedData, null, 2));
    };
    reader.readAsBinaryString(file);
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
        <h1 className="text-2xl font-bold text-gray-800">Store Admin: Bulk Manage Products</h1>
        <button 
          onClick={handleSignOut}
          className="text-sm font-bold text-red-600 bg-red-50 px-4 py-2 rounded-lg hover:bg-red-100 transition-colors"
        >
          Sign Out
        </button>
      </div>
      
      <div className="flex gap-4 mb-8">
        <button onClick={handleExport} className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded font-bold transition-colors">
          1. Download Current Excel
        </button>
        
        <label className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded font-bold cursor-pointer transition-colors">
          2. Upload Modified Excel
          <input type="file" accept=".xlsx, .xls" onChange={handleImport} className="hidden" />
        </label>
      </div>

      {output && (
        <div>
          <p className="font-bold text-red-600 mb-2">3. Copy this data and replace the contents of src/data/products.ts:</p>
          <pre className="bg-gray-100 p-4 rounded text-xs overflow-auto max-h-96 border border-gray-300 shadow-inner">
            {`export const products = ${output};`}
          </pre>
        </div>
      )}
    </main>
  );
}