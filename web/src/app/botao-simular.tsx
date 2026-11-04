"use client";

import Link from "next/link";
import { evento } from "@/lib/analytics";

export function BotaoSimular() {
  return (
    <Link
      href="/simular"
      onClick={() => evento("inicio_simulacao")}
      className="mt-8 inline-flex w-full items-center justify-center rounded-2xl bg-destaque px-8 py-4 text-lg font-bold text-white shadow-lg transition hover:bg-destaque-escura sm:w-auto"
    >
      Simular agora
    </Link>
  );
}
