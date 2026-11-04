import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import Link from "next/link";
import Script from "next/script";
import { AvisoLegal } from "@/components/aviso-legal";
import "./globals.css";

const inter = Inter({ variable: "--font-inter", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Simulação de financiamento habitacional | Beta Negócios",
  description:
    "Simule o financiamento da sua casa pelo Minha Casa Minha Vida na Zona Leste de São Paulo e fale com um especialista da Beta Negócios.",
};

export const viewport: Viewport = { themeColor: "#1b3a6b" };

const PIXEL = process.env.NEXT_PUBLIC_META_PIXEL_ID;
const GA4 = process.env.NEXT_PUBLIC_GA4_ID;

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="pt-BR" className={`${inter.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col font-sans">
        <header className="bg-marca text-white">
          <div className="mx-auto flex max-w-3xl items-center px-5 py-4">
            <Link href="/" className="text-lg font-bold tracking-tight">
              Beta <span className="text-destaque">Negócios</span>
            </Link>
          </div>
        </header>

        <main className="flex-1">{children}</main>

        <footer className="border-t border-slate-200 bg-white">
          <div className="mx-auto max-w-3xl space-y-2 px-5 py-6">
            <AvisoLegal />
            <Link href="/privacidade" className="text-xs text-marca underline">
              Política de privacidade
            </Link>
          </div>
        </footer>

        {PIXEL && (
          <Script id="meta-pixel">{`!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');fbq('init','${PIXEL}');fbq('track','PageView');`}</Script>
        )}
        {GA4 && (
          <>
            <Script src={`https://www.googletagmanager.com/gtag/js?id=${GA4}`} />
            <Script id="ga4">{`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}gtag('js',new Date());gtag('config','${GA4}');`}</Script>
          </>
        )}
      </body>
    </html>
  );
}
