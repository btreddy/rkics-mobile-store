import type { Metadata } from "next";
import "./globals.css";
import { CartProvider } from "./CartContext";
import { CartDrawer } from "./CartDrawer";

export const metadata: Metadata = {
  title: "RKICS Mobile Store",
  description: "Construction Chemicals Store",
};

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