'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import * as XLSX from 'xlsx';
import { supabase } from '@/lib/supabase';

export default function AdminPage() {
  const router = useRouter();
  const [status, setStatus] = useState("Ready for database sync.");
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Security Lock
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push('/login');
      } else {
        setIsAuthenticated(true);
      }
      setLoading(false);
    };
    checkAuth();
  }, [router]);

  const handleExport = async () => {
    setStatus("Fetching live database snapshot...");

    // Pull the real, live data from Supabase
    const { data, error } = await supabase.from('products').select('*');

    if (error) {
      setStatus(`Download Error: ${error.message}`);
      return;
    }

    // Convert live data to Excel and download
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Live_Products");
    XLSX.writeFile(workbook, "RKICS_Live_Database.xlsx");

    setStatus("Download complete! Edit the file in Excel, then upload it back here.");
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setStatus("Reading Excel file...");

    const reader = new FileReader();
    reader.onload = async (event) => {
      const binaryString = event.target?.result;
      const workbook = XLSX.read(binaryString, { type: 'binary' });
      const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
      const parsedData = XLSX.utils.sheet_to_json(firstSheet);

      setStatus(`Found ${parsedData.length} rows. Syncing changes to live database...`);

      // Upsert overwrites existing rows based on their 'id'
      const { error } = await supabase
        .from('products')
        .upsert(parsedData, { onConflict: 'id' });

      if (error) {
        setStatus(`Upload Failed: ${error.message}`);
      } else {
        setStatus("Success! Live database has been updated with your Excel changes.");
      }

      // Clear the input so you can upload again if needed
      e.target.value = '';
    };
    reader.readAsBinaryString(file);
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-gray-50"><p>Verifying access...</p></div>;
  }

  if (!isAuthenticated) return null;

  return (
    <main className="p-8 max-w-2xl mx-auto min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Store Admin: Live Database Sync</h1>
        <button
          onClick={handleSignOut}
          className="text-sm font-bold text-red-600 bg-red-50 px-4 py-2 rounded-lg hover:bg-red-100 transition-colors"
        >
          Sign Out
        </button>
      </div>

      <p className="text-gray-600 mb-8">
        Download a snapshot of your live store data. Edit prices, descriptions, or categories in Excel, then upload it back. The system will automatically detect the changes and update the live website.
      </p>

      <div className="flex gap-4 mb-8">
        <button onClick={handleExport} className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded font-bold transition-colors">
          1. Download Live Database (Excel)
        </button>

        <label className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded font-bold cursor-pointer transition-colors">
          2. Upload Modified Excel
          <input type="file" accept=".xlsx, .xls" onChange={handleImport} className="hidden" />
        </label>
      </div>

      <div className="bg-gray-100 p-4 rounded-lg border border-gray-300 shadow-inner">
        <p className="font-bold text-gray-700">System Status:</p>
        <p className="text-sm text-blue-700 font-mono mt-1">{status}</p>
      </div>
    </main>
  );
}