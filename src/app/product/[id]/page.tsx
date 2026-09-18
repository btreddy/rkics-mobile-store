'use client';
import { products } from '@/data/products';
import Link from 'next/link';
import { useCart } from '../../CartContext';
import { use } from 'react';

export default function ProductDetail({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const product = products.find((p) => p.id === resolvedParams.id);
  const { addToCart, cartCount } = useCart();

  if (!product) return <div className="p-8 text-center text-gray-600">Product not found</div>;

  return (
    <main className="max-w-md mx-auto bg-white min-h-screen pb-20">
      <header className="flex justify-between items-center p-4 border-b sticky top-0 bg-white shadow-sm z-10">
        <div className="flex items-center">
          <Link href="/" className="text-blue-600 mr-4 font-bold text-xl">←</Link>
          <h1 className="text-lg font-bold text-gray-800 truncate">Details</h1>
        </div>
        <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-bold">
          Cart: {cartCount}
        </div>
      </header>

      <div className="bg-gray-100 h-64 flex flex-col items-center justify-center text-gray-500 border-b">
        <span className="text-xs">Image Path:</span>
        <span className="font-bold">{product.imagePlaceholder}</span>
      </div>

      <div className="p-5">
        <p className="text-sm text-gray-500 uppercase tracking-wide mb-1">{product.brand}</p>
        <h1 className="text-2xl font-bold text-gray-900 mb-2 leading-tight">{product.name}</h1>
        
        <div className="flex items-baseline space-x-3 mb-4">
          <span className="text-2xl font-bold text-green-700">₹{product.price}</span>
          <span className="line-through text-gray-400">₹{product.originalPrice}</span>
          <span className="bg-red-100 text-red-600 px-2 py-1 text-xs font-bold rounded">{product.discount}</span>
        </div>

        {/* Local PDS Download Link */}
        {product.pdsLink && (
          <a
            href={product.pdsLink}
            download
            className="inline-flex items-center gap-2 mb-5 text-sm font-semibold text-blue-700 bg-blue-50 border border-blue-200 py-2.5 px-4 rounded-lg hover:bg-blue-100 active:bg-blue-200 transition"
          >
            <span>📄</span>
            <span>Download Product Data Sheet (PDS)</span>
          </a>
        )}

        <hr className="my-5 border-gray-200" />
        <h3 className="font-bold text-gray-800 mb-2">Product Description</h3>
        <p className="text-gray-600 text-sm leading-relaxed mb-6">{product.description}</p>

        <div className="flex space-x-3 mt-8">
          <button 
            onClick={() => addToCart(product)} 
            className="flex-1 bg-white border-2 border-blue-600 text-blue-600 py-3 rounded-lg font-bold hover:bg-blue-50 transition-colors"
          >
            Add to Cart
          </button>
        </div>
      </div>
    </main>
  );
}