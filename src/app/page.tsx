'use client';
import { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { useCart } from './CartContext';

export default function Home() {
  const { cartCount, setIsCartOpen } = useCart();
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBrand, setSelectedBrand] = useState('All');

  useEffect(() => {
    async function loadProducts() {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && data) {
        setProducts(data);
      }
      setLoading(false);
    }
    loadProducts();
  }, []);

  // Dynamically extract unique brands, strip symbols, and force Uppercase
  const uniqueBrands = useMemo(() => {
    const brands = products
      .map(p => p.brand)
      .filter(Boolean)
      .map(brand => brand.replace(/[®™]/g, '').trim().toUpperCase());
      
    return ['All', ...Array.from(new Set(brands)).sort()];
  }, [products]);

  // Real-time filtering logic (Search + Brand Dropdown)
  const filteredProducts = products.filter(product => {
    const searchLower = searchQuery.toLowerCase();
    const matchesSearch = product.name?.toLowerCase().includes(searchLower) ||
                          product.brand?.toLowerCase().includes(searchLower);
                          
    // Clean the product's brand before checking if it matches the dropdown
    const productBrandClean = product.brand?.replace(/[®™]/g, '').trim().toUpperCase();
    const matchesBrand = selectedBrand === 'All' || productBrandClean === selectedBrand;
    
    return matchesSearch && matchesBrand;
  });

  return (
    <main className="p-4 max-w-md mx-auto bg-gray-50 min-h-screen">
      <header className="flex justify-between items-center mb-4 py-2 bg-gray-50 z-20">
        <h1 className="text-xl font-bold text-gray-800">RKICS Store</h1>
        <button 
          onClick={() => setIsCartOpen(true)}
          className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-bold cursor-pointer hover:bg-blue-200 transition"
        >
          Cart: {cartCount}
        </button>
      </header>

      {/* STICKY SEARCH & FILTER BAR */}
      <div className="sticky top-0 z-10 bg-gray-50 pb-4 pt-1 shadow-sm flex flex-col gap-3">
        {/* Global Search Bar */}
        <div className="relative">
          <input
            type="text"
            placeholder="Search products or systems..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full border-2 border-gray-200 rounded-xl py-3 pl-10 pr-4 outline-none focus:border-blue-500 transition-colors text-sm font-medium text-gray-700"
          />
          <span className="absolute left-3 top-3.5 text-gray-400">
            🔍
          </span>
        </div>

        {/* Brand Dropdown & Product Counter */}
        <div className="flex items-center justify-between">
          <select 
            value={selectedBrand} 
            onChange={(e) => setSelectedBrand(e.target.value)}
            className="border-2 border-gray-200 rounded-lg px-3 py-2 text-sm font-semibold text-gray-700 outline-none focus:border-blue-500 bg-white cursor-pointer"
          >
            {uniqueBrands.map(brand => (
              <option key={brand} value={brand}>
                {brand === 'All' ? 'All Catalogs' : brand}
              </option>
            ))}
          </select>
          <div className="text-xs font-bold text-blue-700 bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-100">
            {filteredProducts.length} {filteredProducts.length === 1 ? 'Item' : 'Items'}
          </div>
        </div>
      </div>

      {loading ? (
        <div className="text-center text-gray-500 py-10 text-sm">Loading live catalogs...</div>
      ) : (
        <>
          {filteredProducts.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 font-medium">No items found.</p>
              <button 
                onClick={() => {
                  setSearchQuery('');
                  setSelectedBrand('All');
                }}
                className="mt-4 text-blue-600 text-sm font-bold underline"
              >
                Clear Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4 mt-2">
              {filteredProducts.map((product) => (
                <Link 
                  href={`/product/${product.id}`} 
                  key={product.id} 
                  className="bg-white border rounded-lg p-3 shadow-sm flex flex-col hover:shadow-md transition-shadow cursor-pointer block"
                >
                  <div className="bg-gray-100 h-32 rounded mb-3 flex items-center justify-center text-center text-xs text-gray-500 p-2 overflow-hidden">
                    {product.imagePlaceholder?.startsWith('http') ? (
                      <img src={product.imagePlaceholder} alt={product.name} className="h-full object-contain" />
                    ) : (
                      <span>[Image: {product.name}]</span>
                    )}
                  </div>
                  
                  <div className="flex-grow">
                    <p className="text-xs text-gray-500 uppercase tracking-wide">{product.brand}</p>
                    <h2 className="text-sm font-semibold leading-tight mt-1 mb-2 text-gray-800 line-clamp-2">
                      {product.name}
                    </h2>
                  </div>
                  
                  <div className="mt-auto">
                    {product.price ? (
                      <>
                        <div className="flex items-center space-x-2 text-sm mb-1">
                          <span className="font-bold text-green-700">₹{product.price}</span>
                          {product.originalPrice && (
                            <span className="line-through text-gray-400 text-xs">₹{product.originalPrice}</span>
                          )}
                        </div>
                        {product.discount && (
                          <span className="text-xs text-red-500 font-medium mb-1 block">{product.discount}</span>
                        )}
                        <div className="w-full mt-3 bg-blue-600 text-white py-2 rounded text-sm font-semibold text-center transition-colors">
                          View Details
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="mb-2 mt-1">
                          <span className="text-xs font-bold text-blue-700 bg-blue-50 border border-blue-100 px-2 py-1 rounded inline-block">
                            Quote on Request
                          </span>
                        </div>
                        <div className="w-full mt-3 bg-[#25D366] text-white py-2 rounded text-sm font-semibold text-center transition-colors shadow-sm">
                          Get Quote
                        </div>
                      </>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </>
      )}
      
      <footer className="mt-12 py-8 px-4 border-t border-gray-200 text-center text-xs text-gray-400">
        <p className="mb-4 max-w-sm mx-auto text-[10px] leading-relaxed text-gray-400/80 text-justify">
          RKICS is a marketing and business-support brand. Products and services are supplied, quoted, invoiced and warranted by the specific legal entity identified in the applicable quotation, invoice or agreement. Associated firms may operate independently with separate registrations, responsibilities and commercial terms.
        </p>
        <p>© {new Date().getFullYear()} RKICS</p>
        <Link href="/admin/dashboard" className="text-gray-400 hover:text-gray-600 underline mt-2 inline-block">
          Admin Portal
        </Link>
      </footer>
    </main>
  );
}