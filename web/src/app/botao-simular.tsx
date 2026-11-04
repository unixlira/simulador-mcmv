"use client";

import Link from "next/link";
import { evento } from "@/lib/analytics";

export function BotaoSimular() {
  return (
    <Link
      href="/simular"
      onClick={() => evento("inicio_simulacao")}
      className="botao-agua mt-8 flex w-full items-center justify-center rounded-full px-8 py-4 text-lg font-extrabold tracking-wide text-white uppercase shadow-lg shadow-black/20 transition hover:brightness-110 sm:mx-auto sm:max-w-sm lg:mx-0"
    >
      Simule
    </Link>
  );
}
