"use client";

import Link from "next/link";
import { evento } from "@/lib/analytics";

// Botão amarelo "Simular Agora" do banner da versão 2 (imagem do Lira de 04/11).
export function BotaoSimularAgora() {
  return (
    <Link
      href="/simular"
      onClick={() => evento("inicio_simulacao")}
      className="group flex w-full items-center gap-4 rounded-full bg-gradient-to-b from-[#ffd23f] to-[#f9b200] px-6 py-3.5 text-[#0d2b6b] no-underline shadow-[0_0_0_3px_rgba(255,210,63,0.35),0_10px_30px_rgba(0,0,0,0.3)] transition hover:brightness-105 sm:max-w-xl sm:px-8 sm:py-4"
    >
      <svg aria-hidden="true" viewBox="0 0 24 24" className="size-8 shrink-0 sm:size-10" fill="none" stroke="currentColor" strokeWidth="1.8">
        <rect x="3" y="5" width="18" height="16" rx="2.5" />
        <path d="M3 10h18M8 3v4M16 3v4" strokeLinecap="round" />
        <path d="M7.5 13.5h2M11 13.5h2M14.5 13.5h2M7.5 17h2M11 17h2" strokeLinecap="round" strokeWidth="2.2" />
      </svg>
      <span aria-hidden="true" className="h-9 w-0.5 shrink-0 bg-[#0d2b6b]/70 sm:h-11" />
      <span className="flex-1 text-2xl font-extrabold tracking-tight sm:text-[2.1rem]">Simular Agora</span>
      <svg aria-hidden="true" viewBox="0 0 24 24" className="size-7 shrink-0 transition group-hover:translate-x-1 sm:size-8" fill="none" stroke="currentColor" strokeWidth="3">
        <path d="M9 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </Link>
  );
}
