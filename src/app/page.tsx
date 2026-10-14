'use client';
import { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { useCart } from './CartContext';

export default function Home() {
  const { cartCount, setIsCartOpen } = useCart();
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBrand, setSelectedBrand] = useState('All');
  const [selectedCategory, setSelectedCategory] = useState('All'); 

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

  // Dynamically extract unique brands
  const uniqueBrands = useMemo(() => {
    const brands = products
      .map(p => p.brand)
      .filter(Boolean)
      .map(brand => brand.replace(/[®™]/g, '').trim().toUpperCase());
      
    return ['All', ...Array.from(new Set(brands)).sort()];
  }, [products]);

  // Dynamically extract unique categories
  const uniqueCategories = useMemo(() => {
    const categories = products
      .map(p => p.category)
      .filter(Boolean);
      
    return ['All', ...Array.from(new Set(categories)).sort()];
  }, [products]);

  // Real-time filtering logic
  const filteredProducts = products.filter(product => {
    const searchLower = searchQuery.toLowerCase();
    
    const matchesSearch = 
      product.name?.toLowerCase().includes(searchLower) ||
      product.brand?.toLowerCase().includes(searchLower) ||
      product.sub_category?.toLowerCase().includes(searchLower);
                          
    const productBrandClean = product.brand?.replace(/[®™]/g, '').trim().toUpperCase();
    const matchesBrand = selectedBrand === 'All' || productBrandClean === selectedBrand;
    
    const matchesCategory = selectedCategory === 'All' || product.category === selectedCategory;
    
    return matchesSearch && matchesBrand && matchesCategory;
  });

  return (
    <main className="p-4 max-w-md mx-auto bg-gray-50 min-h-screen">
      <header className="flex justify-between items-center mb-4 py-2 bg-gray-50 z-20">
        <h1 className="text-xl font-bold text-gray-800">RKICS Store</h1>
        <button 
          onClick={() => setIsCartOpen(true)}
          className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-bold cursor-pointer hover:bg-blue-200 transition shadow-sm"
        >
          Cart: {cartCount}
        </button>
      </header>

      {/* STICKY SEARCH & FILTER BAR */}
      <div className="sticky top-0 z-10 bg-gray-50 pb-3 pt-1 shadow-sm flex flex-col gap-3">
        {/* Global Search Bar */}
        <div className="relative">
          <input
            type="text"
            placeholder="Search products or systems..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full border-2 border-gray-200 rounded-xl py-3 pl-10 pr-4 outline-none focus:border-blue-500 transition-colors text-sm font-medium text-gray-700 shadow-sm"
          />
          <span className="absolute left-3 top-3.5 text-gray-400">🔍</span>
        </div>

        {/* Dropdown Filters Side-by-Side */}
        <div className="grid grid-cols-2 gap-2">
          <select 
            value={selectedBrand} 
            onChange={(e) => setSelectedBrand(e.target.value)}
            className="w-full border-2 border-gray-200 rounded-lg px-2 py-2.5 text-sm font-semibold text-gray-700 outline-none focus:border-blue-500 bg-white cursor-pointer shadow-sm truncate"
          >
            {uniqueBrands.map(brand => (
              <option key={brand} value={brand}>
                {brand === 'All' ? 'All Brands' : brand}
              </option>
            ))}
          </select>
          
          <select 
            value={selectedCategory} 
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full border-2 border-gray-200 rounded-lg px-2 py-2.5 text-sm font-semibold text-gray-700 outline-none focus:border-blue-500 bg-white cursor-pointer shadow-sm truncate"
          >
            {uniqueCategories.map(cat => (
              <option key={cat} value={cat}>
                {cat === 'All' ? 'All Solutions' : cat}
              </option>
            ))}
          </select>
        </div>

        {/* Results Counter & Quick Clear */}
        <div className="flex justify-between items-center px-1">
          { (searchQuery !== '' || selectedBrand !== 'All' || selectedCategory !== 'All') ? (
            <button 
              onClick={() => {
                setSearchQuery('');
                setSelectedBrand('All');
                setSelectedCategory('All');
              }}
              className="text-xs font-bold text-red-600 hover:underline"
            >
              Clear Filters
            </button>
          ) : (
            <div></div> // Empty div to push counter to the right
          )}
          <div className="text-xs font-bold text-blue-700 bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-100 shadow-sm ml-auto">
            {filteredProducts.length} {filteredProducts.length === 1 ? 'Item' : 'Items'}
          </div>
        </div>
      </div>

      {loading ? (
        <div className="text-center text-gray-500 py-10 text-sm font-medium animate-pulse">Loading live catalogs...</div>
      ) : (
        <>
          {filteredProducts.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 font-medium">No items found matching your filters.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4 mt-2">
              {filteredProducts.map((product) => (
                <Link 
                  href={`/product/${product.id}`} 
                  key={product.id} 
                  className="bg-white border rounded-lg p-3 shadow-sm flex flex-col hover:shadow-md transition-shadow cursor-pointer"
                >
                  <div className="bg-gray-50 h-32 rounded mb-2 flex items-center justify-center text-center text-xs text-gray-500 p-2 overflow-hidden border border-gray-100">
                    {product.imagePlaceholder?.startsWith('http') ? (
                      <img src={product.imagePlaceholder} alt={product.name} className="h-full object-contain mix-blend-multiply" />
                    ) : (
                      <span>[No Image]</span>
                    )}
                  </div>
                  
                  <div className="flex-grow">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{product.brand}</p>
                    <h2 className="text-sm font-bold leading-tight mt-1 mb-1 text-gray-900 line-clamp-2">
                      {product.name}
                    </h2>
                    
                    {/* Visual Category Tags */}
                    <div className="flex flex-wrap gap-1 mb-2">
                      {product.category && (
                        <span className="text-[9px] bg-purple-50 border border-purple-100 text-purple-700 px-1.5 py-0.5 rounded font-bold uppercase tracking-wider">
                          {product.category}
                        </span>
                      )}
                      {product.sub_category && (
                        <span className="text-[9px] bg-blue-50 border border-blue-100 text-blue-700 px-1.5 py-0.5 rounded font-bold uppercase tracking-wider line-clamp-1">
                          {product.sub_category}
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <div className="mt-auto">
                    {product.price ? (
                      <>
                        <div className="flex items-baseline space-x-2 text-sm mb-1">
                          <span className="font-black text-green-700 text-base">₹{product.price}</span>
                          {product.originalPrice && (
                            <span className="line-through text-gray-400 text-xs font-semibold">₹{product.originalPrice}</span>
                          )}
                        </div>
                        {product.discount && (
                          <span className="text-[10px] text-red-600 font-bold bg-red-50 px-2 py-0.5 rounded inline-block mb-2">{product.discount}</span>
                        )}
                        <div className="w-full mt-2 bg-blue-600 text-white py-2.5 rounded-lg text-sm font-bold text-center transition-colors">
                          View Details
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="mb-2 mt-1">
                          <span className="text-[10px] font-bold text-blue-700 bg-blue-50 border border-blue-100 px-2 py-1 rounded-md inline-block">
                            Quote on Request
                          </span>
                        </div>
                        <div className="w-full mt-2 bg-slate-800 text-white py-2.5 rounded-lg text-sm font-bold text-center transition-colors">
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
        <p className="font-semibold text-gray-500">© {new Date().getFullYear()} RKICS</p>
        <Link href="/admin" prefetch={false} className="text-gray-400 hover:text-blue-600 font-medium mt-3 inline-block transition-colors">
          Admin Portal
        </Link>
      </footer>
    </main>
  );
}