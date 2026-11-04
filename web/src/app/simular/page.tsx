import type { Metadata } from "next";
import { Simulador } from "./simulador";

export const metadata: Metadata = { title: "Simular | Beta Negócios" };

export default function PaginaSimular() {
  return <Simulador />;
}
