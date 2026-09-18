'use client';
import Link from 'next/link';
import { products } from '@/data/products';
import { useCart } from './CartContext';

export default function Home() {
  const { cartCount, setIsCartOpen } = useCart();

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
      
      <div className="grid grid-cols-2 gap-4">
        {products.map((product) => (
          <Link href={`/product/${product.id}`} key={product.id} className="bg-white border rounded-lg p-3 shadow-sm flex flex-col hover:shadow-md transition-shadow cursor-pointer block">
            <div className="bg-gray-200 h-32 rounded mb-3 flex items-center justify-center text-center text-xs text-gray-500 p-2">
              [Image: {product.imagePlaceholder}]
            </div>
            
            <div className="flex-grow">
              <p className="text-xs text-gray-500 uppercase tracking-wide">{product.brand}</p>
              <h2 className="text-sm font-semibold leading-tight mt-1 mb-2 text-gray-800">
                {product.name}
              </h2>
            </div>
            
            <div className="mt-auto">
              <div className="flex items-center space-x-2 text-sm mb-1">
                <span className="font-bold text-green-700">₹{product.price}</span>
                <span className="line-through text-gray-400 text-xs">₹{product.originalPrice}</span>
              </div>
              <span className="text-xs text-red-500 font-medium">{product.discount}</span>
              
              <div className="w-full mt-3 bg-blue-600 text-white py-2 rounded text-sm font-semibold text-center transition-colors">
                View Details
              </div>
            </div>
          </Link>
        ))}
      </div>
    </main>
  );
}