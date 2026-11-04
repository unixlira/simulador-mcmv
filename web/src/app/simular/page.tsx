import type { Metadata } from "next";
import { Simulador } from "./simulador";

export const metadata: Metadata = { title: "Simular | Beta Negócios" };

export default function PaginaSimular() {
  return (
    <section className="mx-auto max-w-md px-5 py-8">
      <Simulador />
    </section>
  );
}
