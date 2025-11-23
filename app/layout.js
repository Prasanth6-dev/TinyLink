import localFont from "next/font/local";
import "./globals.css";
import Navbar from "@/components/Navbar"; 


const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata = {
  title: "TinyLink - URL Shortener",
  description: "Shorten URLs, track clicks, and manage your links",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-purple-50`}
      > 
      <Navbar/>
        {children}
      </body>
    </html>
  );
}
