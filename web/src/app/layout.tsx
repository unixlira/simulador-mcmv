import type { Metadata, Viewport } from "next";
import { Nunito } from "next/font/google";
import Link from "next/link";
import Script from "next/script";
import { AVISO } from "@/components/aviso-legal";
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

        <footer className="rodape text-white">
          <div aria-hidden="true" className="h-1 bg-gradient-to-r from-destaque via-destaque to-agua" />
          <div className="mx-auto grid max-w-6xl gap-5 px-6 py-8 sm:grid-cols-[1fr_auto] sm:items-center sm:gap-8">
            <div>
              <p className="text-lg font-extrabold tracking-tight">Beta Negócios</p>
              <p className="mt-1 text-sm text-white/75">Simulação de financiamento habitacional na Zona Leste de São Paulo</p>
            </div>
            <LinkPrivacidade className="inline-flex w-fit items-center gap-2 rounded-full border border-white/25 px-4 py-2 text-sm font-semibold no-underline! transition hover:border-white/60 hover:bg-white/10">
              <svg aria-hidden="true" viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 3l7 3v5c0 4.5-3 8.3-7 10-4-1.7-7-5.5-7-10V6z" strokeLinejoin="round" />
                <path d="M9 12l2 2 4-4" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              Política de Privacidade
            </LinkPrivacidade>
          </div>
          <div className="border-t border-white/10">
            <div className="mx-auto flex max-w-6xl flex-col gap-3 px-6 py-5 text-xs leading-relaxed text-white/60 sm:flex-row sm:items-start sm:justify-between sm:gap-8">
              <p className="max-w-3xl">{AVISO}</p>
              <p className="shrink-0">© {new Date().getFullYear()} Beta Negócios</p>
            </div>
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
