import type { Metadata } from "next";
import "./globals.css";
import { StoreHydrator } from "@/components/layout/StoreHydrator";
import { DesktopSidebar, MobileNavigation, TopHeader } from "@/components/layout/AppNavigation";

export const metadata: Metadata = {
  title: "Man Matters Companion — Independent Wellness Prototype",
  description:
    "A browser-based, AI-assisted post-purchase wellness companion concept for managing products, daily routines, progress observations, and contextual assistance.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="bg-wellness-bg text-wellness-primary antialiased">
        <StoreHydrator>
          {/* Global Disclaimer Header Banner */}
          <div className="bg-wellness-surface-alt border-b border-wellness-border text-[11px] text-wellness-secondary px-4 py-1.5 text-center flex items-center justify-center gap-2">
            <span className="inline-block w-2 h-2 rounded-full bg-wellness-warning/80" />
            <span>
              <strong>Independent Prototype</strong> — Not an official Man Matters service or medical tool. No clinical diagnosis or prescription.
            </span>
          </div>

          <div className="flex min-h-screen">
            {/* Desktop Left Sidebar */}
            <DesktopSidebar />

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col min-w-0 pb-16 md:pb-6">
              <TopHeader />
              <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto w-full">
                {children}
              </main>
            </div>
          </div>

          {/* Mobile Bottom Navigation */}
          <MobileNavigation />
        </StoreHydrator>
      </body>
    </html>
  );
}
