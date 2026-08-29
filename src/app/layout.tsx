import type { Metadata } from "next";
import "./globals.css";
import PwaRegistration from "@/components/pwa-registration";

export const metadata: Metadata = {
  title: "RecoveryOS | AI Revenue Recovery",
  description: "A judge-ready AI revenue recovery command center.",
  applicationName: "RecoveryOS",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full"><PwaRegistration />{children}</body>
    </html>
  );
}
