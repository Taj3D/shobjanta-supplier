import type { Metadata } from "next";
import { Hind_Siliguri } from "next/font/google";
import Script from "next/script";
import "./globals.css";

const hindSiliguri = Hind_Siliguri({
  variable: "--font-hind-siliguri",
  subsets: ["bengali", "latin"],
  weight: ["400", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "সবজান্তা সাপ্লাইয়ার | পাকিস্তানি বাসমতি চাল - জারে সিল করা",
  description:
    "যশোরে প্রথম জারের বাসমতি! পাকিস্তান থেকে এনে ফুডগ্রেড এয়ারটাইট জারে সিল করা ১০০% লম্বা দানা বাসমতি চাল। ৩ কেজির জার মাত্র ৳১০৫০। ক্যাশ অন ডেলিভারি!",
  keywords: [
    "বাসমতি চাল",
    "পাকিস্তানি বাসমতি",
    "সবজান্তা সাপ্লাইয়ার",
    "যশোর",
    "জারে চাল",
    "এয়ারটাইট জার",
    "বাসমতি রাইস",
  ],
  icons: {
    icon: "https://i.ibb.co/W4RwVdqy/image-cabe2751.png",
  },
  openGraph: {
    title: "সবজান্তা সাপ্লাইয়ার | পাকিস্তানি বাসমতি চাল",
    description:
      "যশোরে প্রথম জারের বাসমতি! ৩ কেজির জার মাত্র ৳১০৫০। ক্যাশ অন ডেলিভারি!",
    url: "https://shobjanta-supplier.vercel.app",
    siteName: "সবজান্তা সাপ্লাইয়ার",
    type: "website",
    images: [
      {
        url: "https://i.ibb.co/Y4WjrpLD/Whats-App-Image-2026-04-30-at-23-53-16.jpg",
        width: 800,
        height: 800,
        alt: "পাকিস্তানি বাসমতি চাল জার",
      },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="bn">
      <head>
        {/* Facebook Pixel — lazy loaded on user interaction to avoid blocking */}
        <Script id="fb-pixel" strategy="lazyOnload">
          {`
            !function(f,b,e,v,n,t,s)
            {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
            n.callMethod.apply(n,arguments):n.queue.push(arguments)};
            if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
            n.queue=[];t=b.createElement(e);t.async=!0;
            t.src=v;s=b.getElementsByTagName(e)[0];
            s.parentNode.insertBefore(t,s)}(window, document,'script',
            'https://connect.facebook.net/en_US/fbevents.js');
            fbq('init', '918051034554872');
            fbq('track', 'PageView');
          `}
        </Script>
      </head>
      <body className={`${hindSiliguri.variable} antialiased`} suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
