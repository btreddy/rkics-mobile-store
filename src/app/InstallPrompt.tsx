'use client';

import { useState, useEffect } from 'react';

export function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [showIOSModal, setShowIOSModal] = useState(false);
  const [dismissed, setDismissed] = useState(true);

  useEffect(() => {
    // Check if running in standalone mode (already installed)
    const checkStandalone = 
      window.matchMedia('(display-mode: standalone)').matches || 
      (window.navigator as any).standalone === true;
    
    setIsStandalone(checkStandalone);
    if (checkStandalone) return;

    // Check if dismissed recently (within 2 days)
    const lastDismissed = localStorage.getItem('rkics_pwa_dismissed');
    if (lastDismissed) {
      const daysSince = (Date.now() - parseInt(lastDismissed, 10)) / (1000 * 60 * 60 * 24);
      if (daysSince < 2) return;
    }
    setDismissed(false);

    // Detect iOS
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isAppleDevice = /iphone|ipad|ipod/.test(userAgent);
    setIsIOS(isAppleDevice);

    // Android / Desktop Chromium beforeinstallprompt listener
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setDismissed(false);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);

    // Force update any stale service worker from previous deployment
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.getRegistration().then((registration) => {
        if (registration) {
          registration.update();
        }
      });
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setDeferredPrompt(null);
        setDismissed(true);
      }
    } else if (isIOS) {
      setShowIOSModal(true);
    }
  };

  const handleDismiss = () => {
    setDismissed(true);
    localStorage.setItem('rkics_pwa_dismissed', Date.now().toString());
  };

  if (isStandalone || dismissed) return null;
  if (!deferredPrompt && !isIOS) return null;

  return (
    <>
      {/* Floating Bottom Install Banner for Mobile */}
      <aside 
        aria-label="App installation prompt"
        className="fixed bottom-4 left-4 right-4 z-40 max-w-md mx-auto bg-slate-900 text-white p-3.5 rounded-2xl shadow-2xl border border-slate-700 flex items-center justify-between gap-3 animate-fade-in"
      >
        <div className="flex items-center gap-3">
          <img 
            src="/icon-192x192.png" 
            alt="RKICS Logo" 
            className="w-10 h-10 rounded-xl bg-white p-1 object-contain shrink-0" 
          />
          <div>
            <p className="text-xs font-bold leading-tight">Install RKICS Store</p>
            <p className="text-[11px] text-slate-300 leading-tight">Quick access & works offline</p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={handleInstallClick}
            className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold px-3.5 py-2 rounded-xl transition shadow-sm active:scale-95"
          >
            Install
          </button>
          <button
            onClick={handleDismiss}
            className="text-slate-400 hover:text-white text-lg px-1.5 transition leading-none"
            aria-label="Dismiss"
          >
            &times;
          </button>
        </div>
      </aside>

      {/* iOS Instructions Modal */}
      {showIOSModal && (
        <div 
          className="fixed inset-0 z-50 bg-black/60 flex items-end sm:items-center justify-center p-4 backdrop-blur-sm"
          onClick={() => setShowIOSModal(false)}
        >
          <div 
            className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl text-slate-900 border border-slate-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-base">Install RKICS on iPhone</h3>
              <button 
                onClick={() => setShowIOSModal(false)} 
                className="text-slate-400 hover:text-slate-600 text-2xl leading-none font-bold"
              >
                &times;
              </button>
            </div>

            <ol className="space-y-3.5 text-xs text-slate-600 mb-6">
              <li className="flex items-start gap-2.5">
                <span className="font-bold text-blue-600 bg-blue-50 w-5 h-5 rounded-full flex items-center justify-center shrink-0">1</span>
                <span>Tap the <strong>Share</strong> button (box with an arrow pointing up) at the bottom of Safari.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="font-bold text-blue-600 bg-blue-50 w-5 h-5 rounded-full flex items-center justify-center shrink-0">2</span>
                <span>Scroll down and select <strong>&quot;Add to Home Screen&quot;</strong>.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="font-bold text-blue-600 bg-blue-50 w-5 h-5 rounded-full flex items-center justify-center shrink-0">3</span>
                <span>Tap <strong>&quot;Add&quot;</strong> in the top right corner to finish.</span>
              </li>
            </ol>

            <button
              onClick={() => setShowIOSModal(false)}
              className="w-full bg-blue-600 text-white font-bold py-2.5 rounded-xl text-xs hover:bg-blue-700 transition"
            >
              Got it
            </button>
          </div>
        </div>
      )}
    </>
  );
}
