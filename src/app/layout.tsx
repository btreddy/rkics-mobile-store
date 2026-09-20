import type { Metadata, Viewport } from "next";
import "./globals.css";
import { CartProvider } from "./CartContext";
import { CartDrawer } from "./CartDrawer";

export const viewport: Viewport = {
  themeColor: "#2563eb",
};

export const metadata: Metadata = {
  title: "RKICS Mobile Store",
  description: "Construction Chemicals Store and Technical Execution",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "RKICS Store",
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  // This matches your GBP exactly so Google connects the website to the Maps listing
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "name": "Premier Engineering Systems (RKICS)",
    "image": "https://store.rkics.com/icon-512.png",
    "@id": "https://store.rkics.com",
    "url": "https://store.rkics.com",
    "telephone": "+917013007595",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "Plot No. 170, Street No. 23, Telecomnagar, Gachibowli",
      "addressLocality": "Hyderabad",
      "postalCode": "500032",
      "addressRegion": "TS",
      "addressCountry": "IN"
    },
    "geo": {
      "@type": "GeoCoordinates",
      "latitude": 17.440081, // You can update these with exact maps coordinates later if needed
      "longitude": 78.348915
    }
  };

  return (
    <html lang="en">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="bg-gray-100">
        <CartProvider>
          {children}
          <CartDrawer />
        </CartProvider>
      </body>
    </html>
  );
}