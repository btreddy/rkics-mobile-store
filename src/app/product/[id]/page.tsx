'use client';
import { useEffect, useState, use } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { useCart } from '../../CartContext';

export default function ProductDetail({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { addToCart, cartCount, setIsCartOpen } = useCart();

  useEffect(() => {
    async function loadProduct() {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', resolvedParams.id)
        .single();

      if (!error && data) {
        setProduct(data);
      }
      setLoading(false);
    }
    loadProduct();
  }, [resolvedParams.id]);

  if (loading) return <div className="p-8 text-center text-gray-500">Loading details...</div>;
  if (!product) return <div className="p-8 text-center text-gray-600">Product not found.</div>;

  return (
    <main className="max-w-md mx-auto bg-white min-h-screen pb-20">
      {/* Product SEO Schema for Google */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Product",
            "name": product.name,
            "image": product.imagePlaceholder?.startsWith('http') ? product.imagePlaceholder : "https://store.rkics.com/icon-512.png",
            "description": product.description || `Buy ${product.name} in bulk. Supplied by RKICS in Hyderabad.`,
            "brand": {
              "@type": "Brand",
              "name": product.brand || "Construction Chemical"
            },
            ...(product.price && {
              "offers": {
                "@type": "Offer",
                "priceCurrency": "INR",
                "price": product.price,
                "availability": "https://schema.org/InStock",
                "seller": {
                  "@type": "Organization",
                  "name": "Premier Engineering Systems (RKICS)"
                }
              }
            })
          })
        }}
      />

      <header className="flex justify-between items-center p-4 border-b sticky top-0 bg-white shadow-sm z-10">
        <div className="flex items-center">
          <Link href="/" className="text-blue-600 mr-4 font-bold text-xl">←</Link>
          <h1 className="text-lg font-bold text-gray-800 truncate">Details</h1>
        </div>
        <button 
          onClick={() => setIsCartOpen(true)}
          className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-bold hover:bg-blue-200 transition"
        >
          Cart: {cartCount}
        </button>
      </header>

      <div className="bg-gray-100 h-64 flex flex-col items-center justify-center text-gray-500 border-b overflow-hidden">
        {product.imagePlaceholder?.startsWith('http') ? (
          <img src={product.imagePlaceholder} alt={product.name} className="h-full object-contain p-4" />
        ) : (
          <div className="text-center p-4">
            <p className="text-xs text-gray-400">Image Reference:</p>
            <p className="font-semibold text-sm">{product.imagePlaceholder || 'No image uploaded'}</p>
          </div>
        )}
      </div>

      <div className="p-5">
        <p className="text-sm text-gray-500 uppercase tracking-wide mb-1">{product.brand}</p>
        <h1 className="text-2xl font-bold text-gray-900 mb-2 leading-tight">{product.name}</h1>
        
        <div className="flex items-baseline space-x-3 mb-4">
          {product.price ? (
            <>
              <span className="text-2xl font-bold text-green-700">₹{product.price}</span>
              {product.originalPrice && (
                <span className="line-through text-gray-400">₹{product.originalPrice}</span>
              )}
              {product.discount && (
                <span className="bg-red-100 text-red-600 px-2 py-1 text-xs font-bold rounded">{product.discount}</span>
              )}
            </>
          ) : (
            <span className="text-xl font-bold text-blue-800 bg-blue-50 px-3 py-1 rounded">Price on Request</span>
          )}
        </div>

        {product.pdsLink && (
          <a
            href={product.pdsLink}
            target="_blank"
            rel="noopener noreferrer"
            download
            className="inline-flex items-center gap-2 mb-5 text-sm font-semibold text-blue-700 bg-blue-50 border border-blue-200 py-2.5 px-4 rounded-lg hover:bg-blue-100 active:bg-blue-200 transition"
          >
            <span>📄</span>
            <span>Download Product Data Sheet (PDS)</span>
          </a>
        )}

        <hr className="my-5 border-gray-200" />
        <h3 className="font-bold text-gray-800 mb-2">Product Description</h3>
        <p className="text-gray-600 text-sm leading-relaxed mb-6 whitespace-pre-wrap">{product.description || 'No description provided.'}</p>

        <div className="flex space-x-3 mt-8">
          {product.price ? (
            <button 
              onClick={() => addToCart(product)} 
              className="flex-1 bg-white border-2 border-blue-600 text-blue-600 py-3 rounded-lg font-bold hover:bg-blue-50 transition-colors"
            >
              Add to Cart
            </button>
          ) : (
            <button 
              onClick={() => window.open(`https://wa.me/917013007595?text=Hi RKICS, I would like to request a bulk quote and lead time for ${product.name}.`, '_blank')}
              className="flex-1 bg-[#25D366] text-white py-3 rounded-lg font-bold hover:bg-[#1EBE55] transition-colors flex items-center justify-center gap-2 shadow-lg"
            >
              Request Quote via WhatsApp
            </button>
          )}
        </div>
      </div>

      <footer className="mt-12 py-8 px-4 border-t border-gray-200 text-center text-xs text-gray-400">
        <p className="mb-4 max-w-sm mx-auto text-[10px] leading-relaxed text-gray-400/80 text-justify">
          RKICS is a marketing and business-support brand. Products and services are supplied, quoted, invoiced and warranted by the specific legal entity identified in the applicable quotation, invoice or agreement. Associated firms may operate independently with separate registrations, responsibilities and commercial terms.
        </p>
        <p>© {new Date().getFullYear()} RKICS</p>
        <Link href="/admin/dashboard" prefetch={false} className="text-gray-400 hover:text-gray-600 underline mt-2 inline-block">
          Admin Portal
        </Link>
      </footer>
    </main>
  );
}