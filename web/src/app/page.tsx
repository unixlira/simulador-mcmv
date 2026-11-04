import { BotaoSimular } from "./botao-simular";

export default function Home() {
  return (
    <section className="mx-auto max-w-3xl px-5 py-12 sm:py-20">
      <p className="text-sm font-semibold uppercase tracking-wide text-destaque">Minha Casa Minha Vida</p>
      <h1 className="mt-3 text-3xl font-bold leading-tight text-marca sm:text-5xl">
        Simulação para a Zona Leste de São Paulo
      </h1>
      <p className="mt-4 max-w-xl text-lg text-slate-600">
        Informe sua renda e veja em um minuto o valor do imóvel, o subsídio e a primeira parcela.
        Depois, um especialista da Beta Negócios tira suas dúvidas no WhatsApp.
      </p>
      <BotaoSimular />
      <ul className="mt-10 grid gap-3 text-sm text-slate-600 sm:grid-cols-3">
        <li className="rounded-xl bg-white p-4 shadow-sm">Prazo de até 420 meses</li>
        <li className="rounded-xl bg-white p-4 shadow-sm">Subsídio conforme renda e dependentes</li>
        <li className="rounded-xl bg-white p-4 shadow-sm">Sem custo para simular</li>
      </ul>
    </section>
  );
}
