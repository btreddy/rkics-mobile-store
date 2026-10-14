'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';

export default function AdminDashboard() {
  const router = useRouter();

  // Security State
  const [isAuthChecking, setIsAuthChecking] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Form State
  const [brand, setBrand] = useState('');
  const [name, setName] = useState('');
  const [category, setCategory] = useState(''); // NEW: Category State
  const [price, setPrice] = useState('');
  const [originalPrice, setOriginalPrice] = useState('');
  const [discount, setDiscount] = useState('');
  const [description, setDescription] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [pdsFile, setPdsFile] = useState<File | null>(null);

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [products, setProducts] = useState<any[]>([]);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [existingImageUrl, setExistingImageUrl] = useState('');
  const [existingPdsUrl, setExistingPdsUrl] = useState('');

  // Pre-defined Solution Categories
  const solutionCategories = [
    "Waterproofing",
    "Tile Adhesives & Grouts",
    "Concrete Admixtures",
    "Repair & Protection",
    "Industrial Flooring",
    "Sealants & Bonding"
  ];

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push('/login');
      } else {
        setIsAuthenticated(true);
        fetchProducts();
      }
      setIsAuthChecking(false);
    };
    checkAuth();
  }, [router]);

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
    setCategory('');
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
    setCategory(product.category || '');
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
    if (!window.confirm('Are you sure you want to delete this product?')) return;
    const { error } = await supabase.from('products').delete().eq('id', id);
    if (error) {
      setMessage(`Error: ${error.message}`);
    } else {
      setMessage('Product deleted!');
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
        const { error: uploadError } = await supabase.storage.from('images').upload(fileName, imageFile);
        if (uploadError) throw uploadError;
        finalImageUrl = supabase.storage.from('images').getPublicUrl(fileName).data.publicUrl;
      }

      if (pdsFile) {
        const fileExt = pdsFile.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
        const { error: pdsUploadError } = await supabase.storage.from('pds').upload(fileName, pdsFile);
        if (pdsUploadError) throw pdsUploadError;
        finalPdsUrl = supabase.storage.from('pds').getPublicUrl(fileName).data.publicUrl;
      }

      const parsedPrice = price.trim() === '' ? null : parseFloat(price);
      const parsedOriginalPrice = originalPrice.trim() === '' ? null : parseFloat(originalPrice);

      const productData = {
        brand,
        name,
        category, // Include category in database submission
        price: parsedPrice,
        originalPrice: parsedOriginalPrice,
        discount,
        description,
        imagePlaceholder: finalImageUrl,
        pdsLink: finalPdsUrl,
      };

      if (editingId) {
        const { error } = await supabase.from('products').update(productData).eq('id', editingId);
        if (error) throw error;
        setMessage('Product updated successfully!');
      } else {
        const { error } = await supabase.from('products').insert([productData]);
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

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  const filteredProducts = products.filter(product => {
    const searchLower = searchTerm.toLowerCase();
    return (
      (product.name && product.name.toLowerCase().includes(searchLower)) ||
      (product.brand && product.brand.toLowerCase().includes(searchLower)) ||
      (product.category && product.category.toLowerCase().includes(searchLower))
    );
  });

  if (isAuthChecking) return <div className="min-h-screen flex items-center justify-center bg-gray-50"><p className="text-gray-500 font-medium">Verifying access...</p></div>;
  if (!isAuthenticated) return null;

  return (
    <main className="max-w-4xl mx-auto p-6 pb-20">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-black text-gray-900">RKICS Admin Portal</h1>
        <div className="flex items-center gap-4">
          <Link href="/" className="text-blue-600 font-bold hover:underline">View Live Store →</Link>
          <button onClick={handleSignOut} className="text-sm font-bold text-red-600 bg-red-50 px-4 py-2 rounded-lg hover:bg-red-100 transition-colors">Sign Out</button>
        </div>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 mb-12">
        <h2 className="text-xl font-bold mb-6 text-gray-800">{editingId ? 'Edit Product' : 'Add New Listing'}</h2>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Brand</label>
              <input type="text" value={brand} onChange={e => setBrand(e.target.value)} required className="w-full border p-2 rounded outline-none focus:border-blue-500" placeholder="e.g. Sika®" />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Product Name</label>
              <input type="text" value={name} onChange={e => setName(e.target.value)} required className="w-full border p-2 rounded outline-none focus:border-blue-500" placeholder="e.g. SikaGrout-214" />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Problem / Solution</label>
              <select
                value={category}
                onChange={e => setCategory(e.target.value)}
                className="w-full border p-2 rounded outline-none focus:border-blue-500 bg-white"
              >
                <option value="">Select a Category...</option>
                {solutionCategories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-5">
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Selling Price (₹)</label>
              <input type="number" value={price} onChange={e => setPrice(e.target.value)} className="w-full border p-2 rounded outline-none focus:border-blue-500" placeholder="Quote Only" />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Original Price</label>
              <input type="number" value={originalPrice} onChange={e => setOriginalPrice(e.target.value)} className="w-full border p-2 rounded outline-none focus:border-blue-500" />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Discount Tag</label>
              <input type="text" value={discount} onChange={e => setDiscount(e.target.value)} placeholder="e.g. 20% OFF" className="w-full border p-2 rounded outline-none focus:border-blue-500" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Description</label>
            <textarea value={description} onChange={e => setDescription(e.target.value)} rows={4} className="w-full border p-2 rounded outline-none focus:border-blue-500" placeholder="Explain the field use case..."></textarea>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-2">Product Image</label>
              <input id="image-upload" type="file" accept="image/*" onChange={e => setImageFile(e.target.files?.[0] || null)} className="text-sm w-full" />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-2">Data Sheet (PDF)</label>
              <input id="pds-upload" type="file" accept=".pdf" onChange={e => setPdsFile(e.target.files?.[0] || null)} className="text-sm w-full" />
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
        <h2 className="text-2xl font-black mb-4 text-gray-900 border-b pb-2">Manage Existing Products</h2>
        <div className="mb-6">
          <input
            type="text"
            placeholder="🔍 Search products by name, brand, or category..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full border border-gray-300 p-3 rounded-lg outline-none focus:border-blue-500 shadow-sm"
          />
        </div>

        {filteredProducts.length === 0 ? (
          <p className="text-gray-500 bg-gray-50 p-4 rounded-lg border border-gray-100">No products match your search.</p>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {filteredProducts.map((product) => (
              <div key={product.id} className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 flex flex-col md:flex-row justify-between items-center gap-4">
                <div className="flex items-center gap-4 flex-1">
                  {product.imagePlaceholder && (
                    <img src={product.imagePlaceholder} alt={product.name} className="w-16 h-16 object-contain border rounded p-1 bg-gray-50" />
                  )}
                  <div>
                    <div className="flex gap-2 items-center mb-1">
                      <p className="text-xs font-bold text-gray-400 uppercase">{product.brand}</p>
                      {product.category && (
                        <span className="text-[10px] bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full font-bold">
                          {product.category}
                        </span>
                      )}
                    </div>
                    <p className="font-bold text-lg text-gray-900 leading-tight">{product.name}</p>
                    {product.price ? (
                      <p className="text-green-700 font-bold">₹{product.price}</p>
                    ) : (
                      <p className="text-blue-600 font-bold text-sm bg-blue-50 px-2 py-0.5 rounded inline-block">Quote Only</p>
                    )}
                  </div>
                </div>
                <div className="flex gap-2 w-full md:w-auto">
                  <button onClick={() => handleEdit(product)} className="flex-1 md:flex-none bg-slate-100 text-slate-700 px-4 py-2 rounded font-bold text-sm hover:bg-slate-200 transition-colors">Edit</button>
                  <button onClick={() => handleDelete(product.id)} className="flex-1 md:flex-none bg-red-50 text-red-600 px-4 py-2 rounded font-bold text-sm hover:bg-red-100 transition-colors">Delete</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}