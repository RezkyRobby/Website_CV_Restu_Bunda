import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import { MotionProvider } from "@/components/motion";
import "./globals.css";

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-plus-jakarta-sans",
});

export const metadata: Metadata = {
  title: "CV Restu Bunda Mariyati",
  description: "Platform penempatan tenaga kerja yang resmi, hangat, dan terpercaya.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="id">
      <body className={plusJakartaSans.variable}>
        <MotionProvider>{children}</MotionProvider>
      </body>
    </html>
  );
}
