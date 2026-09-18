'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { useCart } from './CartContext';

export default function Home() {
  const { cartCount, setIsCartOpen } = useCart();
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

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

  return (
    <main className="p-4 max-w-md mx-auto bg-gray-50 min-h-screen">
      <header className="flex justify-between items-center mb-6 py-2 border-b sticky top-0 bg-gray-50 z-10">
        <h1 className="text-xl font-bold text-gray-800">RKICS Store</h1>
        <button 
          onClick={() => setIsCartOpen(true)}
          className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-bold cursor-pointer hover:bg-blue-200 transition"
        >
          Cart: {cartCount}
        </button>
      </header>

      {loading ? (
        <div className="text-center text-gray-500 py-10 text-sm">Loading live products...</div>
      ) : (
        <div className="grid grid-cols-2 gap-4">
          {products.map((product) => (
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
                <div className="flex items-center space-x-2 text-sm mb-1">
                  <span className="font-bold text-green-700">₹{product.price}</span>
                  {product.originalPrice && (
                    <span className="line-through text-gray-400 text-xs">₹{product.originalPrice}</span>
                  )}
                </div>
                {product.discount && (
                  <span className="text-xs text-red-500 font-medium">{product.discount}</span>
                )}
                
                <div className="w-full mt-3 bg-blue-600 text-white py-2 rounded text-sm font-semibold text-center transition-colors">
                  View Details
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
      <footer className="mt-12 py-6 border-t border-gray-200 text-center text-xs text-gray-400">
  <p>© {new Date().getFullYear()} Integrated Concrete Solutions</p>
  <Link href="/admin/dashboard" className="text-gray-400 hover:text-gray-600 underline mt-1 inline-block">
    Admin Portal
  </Link>
</footer>
    </main>
  );
}