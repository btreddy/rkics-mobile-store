import Link from 'next/link';

export default function PrivacyPolicy() {
  return (
    <main className="max-w-3xl mx-auto bg-white min-h-screen pb-20 p-6 md:p-12">
      <header className="mb-8 border-b pb-6">
        <Link href="/" className="text-blue-600 font-bold mb-6 inline-block hover:underline">
          ← Back to Store
        </Link>
        <h1 className="text-3xl font-black text-gray-900">Privacy Policy</h1>
        <p className="text-sm text-gray-500 mt-2">Last Updated: September 2026</p>
      </header>

      <div className="space-y-8 text-gray-700 leading-relaxed">
        <section>
          <h2 className="text-xl font-bold text-gray-900 mb-3">1. Introduction</h2>
          <p>
            RKICS ("we", "our", or "us") operates as a marketing and business-support brand. This Privacy Policy explains how we collect, use, and protect your information when you use our website and submit inquiries for construction chemicals and technical execution services.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-gray-900 mb-3">2. Information We Collect</h2>
          <p>
            When you request a bulk quote, site assessment, or product data sheet, we may collect the following professional information:
          </p>
          <ul className="list-disc pl-5 mt-3 space-y-1 text-gray-600">
            <li>Authorized Person Name</li>
            <li>Company or Project Name</li>
            <li>Mobile Number and Contact Details</li>
            <li>Specific product requirements and project scope</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-bold text-gray-900 mb-3">3. How We Use Your Information</h2>
          <p>
            The information collected is used strictly for B2B commercial purposes, including:
          </p>
          <ul className="list-disc pl-5 mt-3 space-y-1 text-gray-600">
            <li>Responding to your specific supply or technical execution inquiries.</li>
            <li>Providing bulk quotations, Product Data Sheets (PDS), and technical consultation.</li>
            <li>Coordinating site visits or material deliveries.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-bold text-gray-900 mb-3">4. Data Sharing and Processing</h2>
          <p>
            Because RKICS acts as a marketing umbrella, your data is processed directly by our officially registered execution and supply entities (such as Premier Engineering Systems and Integrated Concrete Solutions) in order to fulfill your requests, issue formal quotations, and manage invoicing. <strong>We do not sell, rent, or trade your personal or corporate information to outside third parties.</strong>
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-gray-900 mb-3">5. Contact Us</h2>
          <p>
            If you have any questions or concerns about this Privacy Policy or how your data is handled, please contact our technical sales team via WhatsApp at +91 7013007595.
          </p>
        </section>
      </div>

      <footer className="mt-16 py-8 border-t border-gray-200 text-center text-xs text-gray-400">
        <p className="mb-4 max-w-sm mx-auto text-[10px] leading-relaxed text-gray-400/80 text-justify">
          RKICS is a marketing and business-support brand. Products and services are supplied, quoted, invoiced and warranted by the specific legal entity identified in the applicable quotation, invoice or agreement. Associated firms may operate independently with separate registrations, responsibilities and commercial terms.
        </p>
        <p>© {new Date().getFullYear()} RKICS</p>
      </footer>
    </main>
  );
}