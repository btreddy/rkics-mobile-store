'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';

export default function AdminDashboard() {
  // Form State
  const [brand, setBrand] = useState('');
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [originalPrice, setOriginalPrice] = useState('');
  const [discount, setDiscount] = useState('');
  const [description, setDescription] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [pdsFile, setPdsFile] = useState<File | null>(null);
  
  // Dashboard State
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [products, setProducts] = useState<any[]>([]);
  
  // Edit State
  const [editingId, setEditingId] = useState<string | null>(null);
  const [existingImageUrl, setExistingImageUrl] = useState('');
  const [existingPdsUrl, setExistingPdsUrl] = useState('');

  useEffect(() => {
    fetchProducts();
  }, []);

  async function fetchProducts() {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false });
      
    if (data) setProducts(data);
  }

  function resetForm() {
    setBrand('');
    setName('');
    setPrice('');
    setOriginalPrice('');
    setDiscount('');
    setDescription('');
    setImageFile(null);
    setPdsFile(null);
    setEditingId(null);
    setExistingImageUrl('');
    setExistingPdsUrl('');
    
    const imageInput = document.getElementById('image-upload') as HTMLInputElement;
    const pdsInput = document.getElementById('pds-upload') as HTMLInputElement;
    if (imageInput) imageInput.value = '';
    if (pdsInput) pdsInput.value = '';
  }

  function handleEdit(product: any) {
    setEditingId(product.id);
    setBrand(product.brand || '');
    setName(product.name || '');
    setPrice(product.price ? product.price.toString() : '');
    setOriginalPrice(product.originalPrice ? product.originalPrice.toString() : '');
    setDiscount(product.discount || '');
    setDescription(product.description || '');
    setExistingImageUrl(product.imagePlaceholder || '');
    setExistingPdsUrl(product.pdsLink || '');
    
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setMessage('Editing product. Update the fields below and save.');
  }

  async function handleDelete(id: string) {
    if (!window.confirm('Are you sure you want to delete this product? This cannot be undone.')) {
      return;
    }

    const { error } = await supabase.from('products').delete().eq('id', id);
    
    if (error) {
      setMessage(`Error deleting: ${error.message}`);
    } else {
      setMessage('Product deleted successfully!');
      fetchProducts();
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      let finalImageUrl = existingImageUrl;
      let finalPdsUrl = existingPdsUrl;

      if (imageFile) {
        const fileExt = imageFile.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
        const { error: uploadError } = await supabase.storage
          .from('images')
          .upload(fileName, imageFile);

        if (uploadError) throw uploadError;
        const { data } = supabase.storage.from('images').getPublicUrl(fileName);
        finalImageUrl = data.publicUrl;
      }

      if (pdsFile) {
        const fileExt = pdsFile.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
        const { error: pdsUploadError } = await supabase.storage
          .from('pds')
          .upload(fileName, pdsFile);

        if (pdsUploadError) throw pdsUploadError;
        const { data } = supabase.storage.from('pds').getPublicUrl(fileName);
        finalPdsUrl = data.publicUrl;
      }

      // Bulletproof null handling for optional numbers
      const parsedPrice = price.trim() === '' ? null : parseFloat(price);
      const parsedOriginalPrice = originalPrice.trim() === '' ? null : parseFloat(originalPrice);

      const productData = {
        brand,
        name,
        price: parsedPrice,
        originalPrice: parsedOriginalPrice,
        discount,
        description,
        imagePlaceholder: finalImageUrl,
        pdsLink: finalPdsUrl,
      };

      if (editingId) {
        const { error } = await supabase
          .from('products')
          .update(productData)
          .eq('id', editingId);
        if (error) throw error;
        setMessage('Product updated successfully!');
      } else {
        const { error } = await supabase
          .from('products')
          .insert([productData]);
        if (error) throw error;
        setMessage('Product published successfully!');
      }

      resetForm();
      fetchProducts();

    } catch (error: any) {
      setMessage(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="max-w-4xl mx-auto p-6 pb-20">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-black text-gray-900">RKICS Admin Portal</h1>
        <Link href="/" className="text-blue-600 font-bold hover:underline">View Live Store →</Link>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 mb-12">
        <h2 className="text-xl font-bold mb-6 text-gray-800">
          {editingId ? 'Edit Product' : 'Add New Listing'}
        </h2>
        
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Brand</label>
              <input type="text" value={brand} onChange={e => setBrand(e.target.value)} required className="w-full border p-2 rounded outline-none focus:border-blue-500" placeholder="e.g. Sika®" />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Product Name</label>
              <input type="text" value={name} onChange={e => setName(e.target.value)} required className="w-full border p-2 rounded outline-none focus:border-blue-500" placeholder="e.g. SikaGrout-214" />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-5">
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Selling Price (₹) (Optional)</label>
              <input type="number" value={price} onChange={e => setPrice(e.target.value)} className="w-full border p-2 rounded outline-none focus:border-blue-500" placeholder="Leave blank for quote" />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Original Price (Optional)</label>
              <input type="number" value={originalPrice} onChange={e => setOriginalPrice(e.target.value)} className="w-full border p-2 rounded outline-none focus:border-blue-500" />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Discount Tag (Optional)</label>
              <input type="text" value={discount} onChange={e => setDiscount(e.target.value)} placeholder="e.g. 20% OFF" className="w-full border p-2 rounded outline-none focus:border-blue-500" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Description (Field Notes)</label>
            <textarea value={description} onChange={e => setDescription(e.target.value)} rows={4} className="w-full border p-2 rounded outline-none focus:border-blue-500" placeholder="Explain why your team relies on this in the field..."></textarea>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-2">Product Image</label>
              <input id="image-upload" type="file" accept="image/*" onChange={e => setImageFile(e.target.files?.[0] || null)} className="text-sm w-full" />
              {editingId && existingImageUrl && <p className="text-[10px] text-gray-500 mt-1">Leave empty to keep existing image.</p>}
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-2">Data Sheet (PDF)</label>
              <input id="pds-upload" type="file" accept=".pdf" onChange={e => setPdsFile(e.target.files?.[0] || null)} className="text-sm w-full" />
              {editingId && existingPdsUrl && <p className="text-[10px] text-gray-500 mt-1">Leave empty to keep existing PDF.</p>}
            </div>
          </div>

          <div className="flex gap-4 pt-4">
            <button type="submit" disabled={loading} className="flex-1 bg-blue-600 text-white font-bold py-3 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition-colors">
              {loading ? 'Processing...' : editingId ? 'Save Changes' : 'Publish Product'}
            </button>
            {editingId && (
              <button type="button" onClick={resetForm} className="px-6 bg-gray-200 text-gray-700 font-bold rounded-lg hover:bg-gray-300 transition-colors">
                Cancel Edit
              </button>
            )}
          </div>
          
          {message && <p className="text-center font-bold mt-4 text-blue-700 bg-blue-50 p-3 rounded-lg">{message}</p>}
        </form>
      </div>

      <div>
        <h2 className="text-2xl font-black mb-6 text-gray-900 border-b pb-2">Manage Existing Products</h2>
        {products.length === 0 ? (
          <p className="text-gray-500">No products uploaded yet.</p>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {products.map((product) => (
              <div key={product.id} className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 flex flex-col md:flex-row justify-between items-center gap-4">
                <div className="flex items-center gap-4 flex-1">
                  {product.imagePlaceholder && (
                    <img src={product.imagePlaceholder} alt={product.name} className="w-16 h-16 object-contain border rounded p-1 bg-gray-50" />
                  )}
                  <div>
                    <p className="text-xs font-bold text-gray-400 uppercase">{product.brand}</p>
                    <p className="font-bold text-lg text-gray-900 leading-tight">{product.name}</p>
                    {product.price ? (
                      <p className="text-green-700 font-bold">₹{product.price}</p>
                    ) : (
                      <p className="text-blue-600 font-bold text-sm bg-blue-50 px-2 py-0.5 rounded inline-block">Quote Only</p>
                    )}
                  </div>
                </div>
                <div className="flex gap-2 w-full md:w-auto">
                  <button 
                    onClick={() => handleEdit(product)}
                    className="flex-1 md:flex-none bg-slate-100 text-slate-700 px-4 py-2 rounded font-bold text-sm hover:bg-slate-200 transition-colors"
                  >
                    Edit
                  </button>
                  <button 
                    onClick={() => handleDelete(product.id)}
                    className="flex-1 md:flex-none bg-red-50 text-red-600 px-4 py-2 rounded font-bold text-sm hover:bg-red-100 transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}