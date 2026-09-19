'use client';
import { useState } from 'react';
import { useCart } from './CartContext';

export function CartDrawer() {
  const { isCartOpen, setIsCartOpen, cart, removeFromCart, cartTotal } = useCart();
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [utrNumber, setUtrNumber] = useState('');

  const handleClose = () => {
    setIsCartOpen(false);
    // Reset state after drawer slides out
    setTimeout(() => {
      setIsCheckingOut(false);
      setUtrNumber('');
    }, 300);
  };

  const handleWhatsAppSubmit = () => {
    const itemsList = cart.map(i => `${i.quantity}x ${i.name}`).join('%0A');
    
    let message = `Hello RKICS,%0A%0AI am placing an order for the following items:%0A%0A${itemsList}%0A%0AOrder Total: ₹${cartTotal}`;
    
    if (utrNumber.trim() !== '') {
      message += `%0APayment Reference (UTR): ${utrNumber}`;
    }
    
    message += `%0A%0APlease confirm receipt and delivery dispatch.`;
    
    // Replace with your actual RKICS WhatsApp number (include country code 91)
    window.open(`https://wa.me/917013007595?text=${message}`, '_blank');
    handleClose();
  };

  return (
    <>
      {/* Dark background overlay */}
      {isCartOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity"
          onClick={handleClose}
        />
      )}
      
      {/* Sliding Drawer */}
      <div className={`fixed top-0 right-0 h-full w-80 bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out flex flex-col ${isCartOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        
        <div className="p-4 border-b flex justify-between items-center bg-gray-50">
          <h2 className="text-lg font-bold text-gray-800">
            {isCheckingOut ? 'Secure Payment' : 'Your Cart'}
          </h2>
          <button onClick={handleClose} className="text-gray-500 hover:text-gray-800 font-bold text-2xl leading-none">&times;</button>
        </div>
        
        <div className="flex-grow p-4 overflow-y-auto">
          {cart.length === 0 ? (
            <p className="text-gray-500 text-center mt-10">Your cart is empty.</p>
          ) : !isCheckingOut ? (
            /* Step 1: Cart Review */
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
          ) : (
            /* Step 2: Payment Screen */
            <div className="flex flex-col items-center animate-fade-in">
              <div className="bg-blue-50 text-blue-800 w-full p-3 rounded-lg text-center mb-4 border border-blue-100">
                <p className="text-xs uppercase font-bold tracking-wider mb-1">Amount to Pay</p>
                <p className="text-2xl font-black">₹{cartTotal}</p>
              </div>

              <p className="text-sm text-gray-600 text-center mb-4">Scan using GPay, PhonePe, or Paytm</p>
              
              {/* QR Code Image */}
              <div className="border p-2 rounded-xl bg-white shadow-sm mb-4">
                <img src="/images/upi-qr.png" alt="RKICS UPI QR Code" className="w-48 h-48 object-contain" />
              </div>

              <p className="text-xs font-bold text-gray-500 mb-6">UPI ID: payments@rkics</p>

              <div className="w-full">
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Transaction Reference (UTR)</label>
                <input 
                  type="text" 
                  placeholder="e.g. 312456789012" 
                  value={utrNumber}
                  onChange={(e) => setUtrNumber(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                />
                <p className="text-[10px] text-gray-500 mt-1">Enter the 12-digit UTR number after completing the payment.</p>
              </div>
            </div>
          )}
        </div>
        
        {cart.length > 0 && (
          <div className="p-4 border-t bg-white shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)]">
            {!isCheckingOut ? (
              <>
                <div className="flex justify-between font-bold text-lg mb-4 text-gray-800">
                  <span>Total:</span>
                  <span className="text-green-700">₹{cartTotal}</span>
                </div>
                <button 
                  onClick={() => setIsCheckingOut(true)}
                  className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700 transition-colors"
                >
                  Proceed to Pay
                </button>
                <button 
                  onClick={handleWhatsAppSubmit}
                  className="w-full bg-white text-gray-600 border border-gray-300 py-2 mt-2 rounded-lg font-semibold text-sm hover:bg-gray-50 transition-colors"
                >
                  Request Quote without Paying
                </button>
              </>
            ) : (
              <>
                <button 
                  onClick={handleWhatsAppSubmit}
                  disabled={!utrNumber.trim()}
                  className="w-full bg-green-600 text-white py-3 rounded-lg font-bold hover:bg-green-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  Confirm & Send Order
                </button>
                <button 
                  onClick={() => setIsCheckingOut(false)}
                  className="w-full bg-white text-gray-600 py-2 mt-2 rounded-lg font-semibold text-sm hover:bg-gray-50 transition-colors"
                >
                  ← Back to Cart
                </button>
              </>
            )}
          </div>
        )}
      </div>
    </>
  );
}