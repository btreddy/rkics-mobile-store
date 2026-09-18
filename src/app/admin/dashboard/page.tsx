'use client';
import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';

export default function AdminDashboard() {
  const [name, setName] = useState('');
  const [brand, setBrand] = useState('Sika®');
  const [price, setPrice] = useState('');
  const [originalPrice, setOriginalPrice] = useState('');
  const [discount, setDiscount] = useState('');
  const [description, setDescription] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [status, setStatus] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setStatus('Uploading assets and saving product...');

    try {
      const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '') + '-' + Date.now();
      let imageUrl = '';
      let pdsUrl = '';

      // 1. Upload image if selected
      if (imageFile) {
        const fileExt = imageFile.name.split('.').pop();
        const filePath = `${slug}.${fileExt}`;
        const { error: imgError } = await supabase.storage.from('images').upload(filePath, imageFile);
        if (imgError) throw imgError;
        const { data: imgData } = supabase.storage.from('images').getPublicUrl(filePath);
        imageUrl = imgData.publicUrl;
      }

      // 2. Upload PDF if selected
      if (pdfFile) {
        const filePath = `${slug}.pdf`;
        const { error: pdfError } = await supabase.storage.from('pds').upload(filePath, pdfFile);
        if (pdfError) throw pdfError;
        const { data: pdfData } = supabase.storage.from('pds').getPublicUrl(filePath);
        pdsUrl = pdfData.publicUrl;
      }

      // 3. Insert record into database
      const { error: dbError } = await supabase.from('products').insert([{
        id: slug,
        brand,
        name,
        price: parseFloat(price),
        originalPrice: originalPrice ? parseFloat(originalPrice) : null,
        discount: discount || null,
        description,
        imagePlaceholder: imageUrl,
        pdsLink: pdsUrl
      }]);

      if (dbError) throw dbError;

      setStatus('Product published successfully!');
      setName('');
      setPrice('');
      setOriginalPrice('');
      setDiscount('');
      setDescription('');
      setImageFile(null);
      setPdfFile(null);
    } catch (err: any) {
      setStatus(`Error: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <main className="p-6 max-w-xl mx-auto min-h-screen bg-gray-50">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Add New Listing</h1>
        <Link href="/" className="text-sm font-semibold text-blue-600 hover:underline">View Store →</Link>
      </div>

      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-4">
        <div>
          <label className="block text-xs font-bold text-gray-600 uppercase mb-1">Brand</label>
          <input 
            type="text" 
            required 
            value={brand} 
            onChange={(e) => setBrand(e.target.value)} 
            className="w-full border rounded-lg p-2.5 text-sm"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-gray-600 uppercase mb-1">Product Name</label>
          <input 
            type="text" 
            required 
            placeholder="e.g. SikaGrout®-214 IN (30 KG)" 
            value={name} 
            onChange={(e) => setName(e.target.value)} 
            className="w-full border rounded-lg p-2.5 text-sm"
          />
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-bold text-gray-600 uppercase mb-1">Selling Price (₹)</label>
            <input 
              type="number" 
              required 
              placeholder="480" 
              value={price} 
              onChange={(e) => setPrice(e.target.value)} 
              className="w-full border rounded-lg p-2.5 text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-600 uppercase mb-1">Original Price (₹)</label>
            <input 
              type="number" 
              placeholder="600" 
              value={originalPrice} 
              onChange={(e) => setOriginalPrice(e.target.value)} 
              className="w-full border rounded-lg p-2.5 text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-600 uppercase mb-1">Discount Tag</label>
            <input 
              type="text" 
              placeholder="20% OFF" 
              value={discount} 
              onChange={(e) => setDiscount(e.target.value)} 
              className="w-full border rounded-lg p-2.5 text-sm"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-gray-600 uppercase mb-1">Product Description</label>
          <textarea 
            rows={3} 
            placeholder="Technical details, coverage, or application instructions..." 
            value={description} 
            onChange={(e) => setDescription(e.target.value)} 
            className="w-full border rounded-lg p-2.5 text-sm"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-gray-600 uppercase mb-1">Product Image</label>
          <input 
            type="file" 
            accept="image/*" 
            onChange={(e) => setImageFile(e.target.files?.[0] || null)} 
            className="w-full text-xs text-gray-500 file:mr-3 file:py-2 file:px-3 file:rounded-lg file:border-0 file:bg-blue-50 file:text-blue-700 file:font-semibold hover:file:bg-blue-100"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-gray-600 uppercase mb-1">Product Data Sheet (PDF)</label>
          <input 
            type="file" 
            accept="application/pdf" 
            onChange={(e) => setPdfFile(e.target.files?.[0] || null)} 
            className="w-full text-xs text-gray-500 file:mr-3 file:py-2 file:px-3 file:rounded-lg file:border-0 file:bg-blue-50 file:text-blue-700 file:font-semibold hover:file:bg-blue-100"
          />
        </div>

        <button 
          type="submit" 
          disabled={saving} 
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg transition disabled:bg-gray-400"
        >
          {saving ? 'Publishing...' : 'Publish Product to Store'}
        </button>

        {status && (
          <p className="text-sm font-semibold text-center mt-2 text-gray-700">{status}</p>
        )}
      </form>
    </main>
  );
}