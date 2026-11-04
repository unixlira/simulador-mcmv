import type { Metadata } from "next";
import { TextoPrivacidade } from "@/components/privacidade";

export const metadata: Metadata = { title: "Política de privacidade | Beta Negócios" };

// Endereço mantido para quem tiver o link; no site a política abre em modal (LinkPrivacidade).
export default function Privacidade() {
  return (
    <article className="mx-auto max-w-3xl px-5 py-10">
      <h1 className="mb-4 text-2xl font-bold text-titulo">Política de privacidade</h1>
      <TextoPrivacidade />
    </article>
  );
}
