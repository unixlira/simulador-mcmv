import type { Metadata, Viewport } from "next";
import { Nunito } from "next/font/google";
import Link from "next/link";
import Script from "next/script";
import { AvisoLegal } from "@/components/aviso-legal";
import { LinkPrivacidade } from "@/components/privacidade";
import "./globals.css";

const nunito = Nunito({ variable: "--font-nunito", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Simulação de financiamento habitacional | Beta Negócios",
  description:
    "Simule o financiamento da sua casa pelo Minha Casa Minha Vida na Zona Leste de São Paulo e fale com um especialista da Beta Negócios.",
};

export const viewport: Viewport = { themeColor: "#12397c" };

const PIXEL = process.env.NEXT_PUBLIC_META_PIXEL_ID;
const GA4 = process.env.NEXT_PUBLIC_GA4_ID;

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="pt-BR" className={`${nunito.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col font-sans">
        <header className="faixa-topo text-white">
          <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-3.5">
            <Link href="/" aria-label="Início">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/logo-caixa.svg" alt="CAIXA" width={120} height={27} className="h-6 w-auto sm:h-7" />
            </Link>
            <div className="flex items-center gap-4">
              <Link href="/admin/" aria-label="Área administrativa" className="-m-2 p-2">
                <svg aria-hidden="true" viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="8" r="4" />
                  <path d="M4 21c1.5-4 4.5-6 8-6s6.5 2 8 6" strokeLinecap="round" />
                </svg>
              </Link>
              <svg aria-hidden="true" viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M4 7h16M4 12h16M4 17h16" strokeLinecap="round" />
              </svg>
            </div>
          </div>
        </header>

        <main className="flex flex-1 flex-col">{children}</main>

        <footer className="border-t border-slate-200 bg-white">
          <div className="mx-auto max-w-6xl space-y-2 px-5 py-5">
            <AvisoLegal />
            <LinkPrivacidade className="text-xs text-marca" />
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
