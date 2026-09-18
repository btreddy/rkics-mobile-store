'use client';
import { useCart } from './CartContext';

export function CartDrawer() {
  const { isCartOpen, setIsCartOpen, cart, removeFromCart, cartTotal } = useCart();

  // Format the cart into a readable message for WhatsApp or Email
  const handleCheckout = () => {
    const itemsList = cart.map(i => `${i.quantity}x ${i.name}`).join('%0A');
    const message = `Hello RKICS,%0A%0AI would like to request a quote for the following construction chemicals:%0A%0A${itemsList}%0A%0AEstimated Total: ₹${cartTotal}%0A%0APlease let me know the final bulk pricing and delivery options.`;
    
    // Option 1: WhatsApp (Replace with your actual WhatsApp Business number, include country code e.g. 91 for India)
    window.open(`https://wa.me/917013007595?text=${message}`, '_blank');
    
    // Option 2: Email (Uncomment the line below to use email instead of WhatsApp)
    // window.open(`mailto:info@rkics.com?subject=B2B Quote Request&body=${message}`);
  };

  return (
    <>
      {/* Dark background overlay */}
      {isCartOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity"
          onClick={() => setIsCartOpen(false)}
        />
      )}
      
      {/* Sliding Drawer */}
      <div className={`fixed top-0 right-0 h-full w-80 bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out flex flex-col ${isCartOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="p-4 border-b flex justify-between items-center bg-gray-50">
          <h2 className="text-lg font-bold text-gray-800">Your Quote Cart</h2>
          <button onClick={() => setIsCartOpen(false)} className="text-gray-500 hover:text-gray-800 font-bold text-2xl leading-none">&times;</button>
        </div>
        
        <div className="flex-grow p-4 overflow-y-auto">
          {cart.length === 0 ? (
            <p className="text-gray-500 text-center mt-10">Your cart is empty.</p>
          ) : (
            cart.map(item => (
              <div key={item.id} className="flex justify-between items-center mb-4 border-b pb-3">
                <div className="pr-2">
                  <p className="font-semibold text-sm text-gray-800 leading-tight mb-1">{item.name}</p>
                  <p className="text-xs text-gray-500">Qty: {item.quantity} x ₹{item.price}</p>
                </div>
                <button onClick={() => removeFromCart(item.id)} className="text-red-500 bg-red-50 px-2 py-1 rounded text-xs font-bold hover:bg-red-100 transition">
                  Remove
                </button>
              </div>
            ))
          )}
        </div>
        
        {cart.length > 0 && (
          <div className="p-4 border-t bg-white shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)]">
            <div className="flex justify-between font-bold text-lg mb-4 text-gray-800">
              <span>Est. Total:</span>
              <span className="text-green-700">₹{cartTotal}</span>
            </div>
            <button 
              onClick={handleCheckout}
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700 transition-colors flex justify-center items-center gap-2"
            >
              Request Quote via WhatsApp
            </button>
          </div>
        )}
      </div>
    </>
  );
}