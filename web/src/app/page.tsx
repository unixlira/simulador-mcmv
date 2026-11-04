import { ArcosFundo, Familia } from "@/components/visual";
import { BotaoSimular } from "./botao-simular";

// Tela 1 da imagem: fundo azul, título, família e o botão SIMULE.
export default function Home() {
  return (
    <section className="fundo-azul relative flex flex-1 overflow-hidden text-white">
      <ArcosFundo />
      <div className="relative mx-auto grid w-full max-w-6xl flex-1 grid-rows-[auto_1fr_auto] px-6 pt-10 pb-12 lg:grid-cols-2 lg:grid-rows-1 lg:items-center lg:gap-10 lg:py-16">
        <div className="z-10 lg:order-1">
          <h1 className="text-[1.7rem] leading-tight font-extrabold sm:text-4xl xl:text-[2.6rem]">
            Minha Casa, Minha Vida
            <br />
            Zona Leste
          </h1>
          <p className="mt-2 max-w-md text-base text-white/90 sm:text-lg">
            Simule o financiamento da sua casa em um minuto, sem custo.
          </p>
          <div className="hidden lg:block">
            <BotaoSimular />
          </div>
        </div>
        <div className="-mt-6 flex justify-end lg:order-2 lg:mt-0 lg:justify-center">
          <Familia className="h-auto w-[62%] max-w-[300px] sm:w-[45%] lg:w-full lg:max-w-[380px]" />
        </div>
        <div className="lg:hidden">
          <BotaoSimular />
        </div>
      </div>
    </section>
  );
}
