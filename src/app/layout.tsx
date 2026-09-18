import type { Metadata, Viewport } from "next";
import "./globals.css";
import { CartProvider } from "./CartContext";
import { CartDrawer } from "./CartDrawer";

export const viewport: Viewport = {
  themeColor: "#2563eb",
};

export const metadata: Metadata = {
  title: "RKICS Mobile Store",
  description: "Construction Chemicals Store",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "RKICS Store",
  },
};

// ... rest of your RootLayout function remains exactly the same

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className="bg-gray-100">
        <CartProvider>
          {children}
          <CartDrawer />
        </CartProvider>
      </body>
    </html>
  );
}