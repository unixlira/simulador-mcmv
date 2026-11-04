import type { Metadata } from "next";
import { Painel } from "./painel";

export const metadata: Metadata = { title: "Painel | Beta Negócios", robots: { index: false, follow: false } };

export default function PaginaAdmin() {
  return (
    <section className="mx-auto max-w-6xl px-5 py-8">
      <Painel />
    </section>
  );
}
