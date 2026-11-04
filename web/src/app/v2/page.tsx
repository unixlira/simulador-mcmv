import type { Metadata } from "next";
import { BotaoSimularAgora } from "./botao-simular-agora";

// Versão 2 da tela inicial: banner igual à imagem do Lira de 04/11 (uploads/20261104093351-1.jpg).
// A versão 1 continua em "/". Selo recortado da imagem; família nova (ChatGPT) com o prédio atrás e sem migalhas de pão (04/11, imagem 20261104105123-1.jpg).
export const metadata: Metadata = { alternates: { canonical: "/" } };

const AMARELO = "text-[#ffc20e]";

function Vantagem({ icone, children }: { icone: React.ReactNode; children: React.ReactNode }) {
  return (
    <li className="flex flex-col items-center gap-1.5 px-1.5 text-center sm:flex-row sm:justify-center sm:gap-3 sm:px-3 sm:text-left">
      <span className="shrink-0 text-white [&>svg]:size-7 sm:[&>svg]:size-10">{icone}</span>
      <span className="text-[0.7rem] leading-tight font-semibold sm:text-[0.95rem]">{children}</span>
    </li>
  );
}

export default function HomeV2() {
  return (
    <section className="relative flex flex-1 flex-col overflow-hidden bg-gradient-to-br from-[#0a3a9c] via-[#0b4fc0] to-[#0d63d6] text-white">
      {/* Foto da família com o prédio ao fundo, à direita, sumindo no azul */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[340px] sm:h-[420px] lg:inset-y-0 lg:right-0 lg:left-auto lg:h-auto lg:w-[52%]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/v2-familia.webp"
          alt="Família sorrindo abraçada em frente a um condomínio"
          width={475}
          height={510}
          className="h-full w-full object-cover object-[70%_20%] [mask-image:linear-gradient(to_bottom,black_55%,transparent)] lg:object-center lg:[mask-image:linear-gradient(to_right,transparent,black_22%)]"
        />
      </div>

      <div className="relative mx-auto w-full max-w-6xl flex-1 px-5 pt-4 pb-8 sm:px-8 lg:pt-5 lg:pb-14">
        {/* Selo do programa: no celular fica sobre a foto, no computador entre o texto e a família */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/v2-selo-mcmv.webp"
          alt="Minha Casa Minha Vida"
          width={175}
          height={160}
          className="absolute top-4 right-4 w-24 rounded-2xl [mask-image:radial-gradient(ellipse_at_center,black_78%,transparent_100%)] sm:w-32 lg:top-8 lg:right-auto lg:left-[44%] lg:w-40"
        />

        <div className="mt-[230px] max-w-xl sm:mt-[310px] lg:mt-6">
          <h1 className="text-[2.6rem] leading-[1.02] font-extrabold tracking-tight drop-shadow-md sm:text-6xl lg:text-[4.2rem]">
            Minha Casa,
            <br />
            <span className={AMARELO}>Minha Vida</span>
          </h1>
          <p className="mt-3 text-xl leading-snug font-bold drop-shadow sm:text-2xl lg:text-[1.9rem]">
            Mais que mudar de endereço,
            <br />
            <span className={`${AMARELO} font-extrabold`}>é mudar de vida.</span>
          </p>
          <svg aria-hidden="true" viewBox="0 0 300 12" className="mt-1 w-56 sm:w-72">
            <path d="M2 10 C 90 0, 200 0, 298 6" stroke="#ffc20e" strokeWidth="3" fill="none" strokeLinecap="round" />
          </svg>

          <div className="mt-5 flex items-center gap-3 rounded-2xl border-2 border-[#ffc20e] bg-[#0a3480]/80 px-4 py-3 shadow-lg backdrop-blur-sm sm:max-w-xl sm:px-5">
            <svg aria-hidden="true" viewBox="0 0 24 24" className="size-9 shrink-0 text-[#ffc20e] sm:size-11" fill="currentColor">
              <path d="M12 2a7 7 0 0 0-7 7c0 5.2 7 13 7 13s7-7.8 7-13a7 7 0 0 0-7-7zm0 9.5A2.5 2.5 0 1 1 12 6.5a2.5 2.5 0 0 1 0 5z" />
            </svg>
            <p className="flex-1 text-sm leading-tight font-semibold sm:text-lg">
              Simulação disponível para a
              <br />
              <strong className={`${AMARELO} text-base font-extrabold sm:text-xl`}>Zona Leste de São Paulo</strong>
              <br />e região!
            </p>
            <svg aria-hidden="true" viewBox="0 0 64 48" className="hidden h-14 w-auto shrink-0 text-[#ffc20e] sm:block" fill="none" stroke="currentColor" strokeWidth="1.6">
              <path d="M2 46h60" strokeLinecap="round" />
              <path d="M6 46V28h9v18M15 46V20h10v26M25 46V8l6-4 6 4v38M37 46V16h10v30M47 46V24h11v22" strokeLinejoin="round" />
              <path d="M29 12h4M29 18h4M29 24h4M29 30h4M29 36h4M18 26h4M18 32h4M18 38h4M40 22h4M40 28h4M40 34h4M50 30h5M50 36h5M9 33h3M9 39h3" strokeLinecap="round" />
            </svg>
          </div>

          <div className="mt-6 flex items-center gap-3 sm:-ml-10">
            <svg aria-hidden="true" viewBox="0 0 24 24" className="hidden size-8 shrink-0 text-[#ffc20e] sm:block" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M4 5l4 3M2 12h5M4 19l4-3" strokeLinecap="round" />
            </svg>
            <BotaoSimularAgora />
          </div>
        </div>
      </div>

      {/* Faixa das vantagens, com a curva amarela em cima */}
      <div className="relative bg-[#0a2f78]">
        <svg aria-hidden="true" viewBox="0 0 1200 40" preserveAspectRatio="none" className="absolute -top-8 left-0 h-10 w-full">
          <path d="M0 40 C 400 40, 800 30, 1200 0 L1200 40 Z" fill="#0a2f78" />
          <path d="M0 38 C 400 38, 800 28, 1200 0" stroke="#ffc20e" strokeWidth="4" fill="none" />
        </svg>
        {/* Três colunas em qualquer tela; no computador sobra espaço à direita para a Ca flutuante não cobrir o texto */}
        <ul className="relative mx-auto grid max-w-6xl grid-cols-3 divide-x-2 divide-[#ffc20e] px-2 py-4 sm:px-6 sm:py-6 lg:pr-72 2xl:pr-6">
          <Vantagem
            icone={
              <svg viewBox="0 0 24 24" className="size-10" fill="currentColor">
                <path d="M12 3 2 12h3v8h5v-5h4v5h5v-8h3z" />
              </svg>
            }
          >
            Subsídios
            <br />
            do Governo
          </Vantagem>
          <Vantagem
            icone={
              <svg viewBox="0 0 24 24" className="size-10" fill="none" stroke="currentColor" strokeWidth="2.6">
                <path d="M19 5 5 19" strokeLinecap="round" />
                <circle cx="7" cy="7" r="2.6" />
                <circle cx="17" cy="17" r="2.6" />
              </svg>
            }
          >
            Parcelas
            <br />
            acessíveis
          </Vantagem>
          <Vantagem
            icone={
              <svg viewBox="0 0 24 24" className="size-10">
                <circle cx="12" cy="12" r="11" fill="currentColor" />
                <path d="M7 12.5l3.2 3.2L17 9" stroke="#0a2f78" strokeWidth="2.6" fill="none" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            }
          >
            Realize seu
            <br />
            sonho da casa própria
          </Vantagem>
        </ul>
      </div>
    </section>
  );
}
