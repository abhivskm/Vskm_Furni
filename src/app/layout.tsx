import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import { AdminProvider } from "@/context/AdminContext";
import { SiteDataProvider } from "@/context/SiteDataContext";
import Navbar from "@/components/Navbar";
import ContactFooter from "@/components/ContactFooter";
import AdminBar from "@/components/admin/AdminBar";
import { connectDB } from "@/lib/db";
import Settings from "@/models/Settings";
import { DEFAULT_CONTENT, flattenContent } from "@/lib/content";

const inter = Inter({ variable: "--font-inter", subsets: ["latin"] });
const playfair = Playfair_Display({ variable: "--font-playfair", subsets: ["latin"] });

/** Tab title / description come from the editable content map, with a safe fallback if the DB is down. */
export async function generateMetadata(): Promise<Metadata> {
  let content: Partial<Record<string, string>> = {};
  try {
    await connectDB();
    const doc = await Settings.findOne({ key: "site" }).lean();
    content = flattenContent(doc?.content);
  } catch {
    // fall through to defaults
  }
  return {
    title: content["seo.title"] || DEFAULT_CONTENT["seo.title"],
    description: content["seo.description"] || DEFAULT_CONTENT["seo.description"],
  };
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${playfair.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col">
        <AdminProvider>
          <SiteDataProvider>
            <Navbar />
            <main className="flex-1">{children}</main>
            <ContactFooter />
            <AdminBar />
          </SiteDataProvider>
        </AdminProvider>
      </body>
    </html>
  );
}
