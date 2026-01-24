import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/components/AuthProvider";

const inter = Inter({ subsets: ["latin"] });

// Fix: Removed explicit Metadata type annotation as it was causing a Module '"next"' has no exported member 'Metadata' error in this environment.
export const metadata = {
  title: "SculptAI - Phase 3",
  description: "AI-powered fitness platform with a coaching marketplace.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}