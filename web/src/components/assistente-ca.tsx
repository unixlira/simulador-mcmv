import Link from "next/link";
import { linkWhatsappContato } from "@/lib/whatsapp";

// Assistente virtual da Caixa ("Ca") no rodapé, no modelo da imagem enviada pelo Lira em 04/11.
// Com o número do WhatsApp configurado abre a conversa; sem ele leva à simulação.
export function AssistenteCa() {
  const whatsapp = linkWhatsappContato();
  const conteudo = (
    <>
      <span className="relative rounded-2xl rounded-br-sm bg-[#005ca9] px-4 py-2.5 text-sm leading-snug font-semibold text-white shadow-lg ring-1 ring-white/15 sm:text-[0.95rem]">
        Oi, eu sou a Ca!
        <br />
        Posso ajudar?
      </span>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/assistente-ca.webp"
        alt="Ca, assistente virtual da CAIXA"
        width={176}
        height={176}
        className="size-14 shrink-0 rounded-full bg-white shadow-lg ring-3 ring-destaque sm:size-16"
      />
    </>
  );
  const classe = "flex w-fit items-center gap-2 no-underline transition hover:-translate-y-0.5";

  return whatsapp ? (
    <a href={whatsapp} target="_blank" rel="noopener noreferrer" className={classe}>
      {conteudo}
    </a>
  ) : (
    <Link href="/simular/" className={classe}>
      {conteudo}
    </Link>
  );
}
