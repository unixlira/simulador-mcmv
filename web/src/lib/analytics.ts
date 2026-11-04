type Evento = "inicio_simulacao" | "simulacao_concluida" | "clique_whatsapp";

declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void;
    gtag?: (...args: unknown[]) => void;
  }
}

// Só dispara quando o Pixel e o GA4 estiverem carregados (IDs no .env).
export function evento(nome: Evento, dados: Record<string, unknown> = {}) {
  window.fbq?.("trackCustom", nome, dados);
  window.gtag?.("event", nome, dados);
}

// utm_source e utm_campaign da URL viram a origem do lead.
export function origemDaVisita(): string | undefined {
  const p = new URLSearchParams(window.location.search);
  const partes = [p.get("utm_source"), p.get("utm_campaign")].filter(Boolean);
  return partes.length ? partes.join(" / ") : undefined;
}
