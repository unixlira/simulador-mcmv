// Peças visuais do fluxo da imagem de 04/11: foto da família e o arco laranja do fundo azul.

export function Familia({ className = "" }: { className?: string }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src="/familia-v2.webp" alt="Família sorrindo abraçada" width={800} height={1200} className={className} />
  );
}

export function ArcosFundo() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 400 700"
      preserveAspectRatio="none"
      className="pointer-events-none absolute inset-0 h-full w-full"
    >
      <path className="lg:hidden" d="M-20 470 C 80 380, 200 360, 330 400" stroke="#f7941d" strokeWidth="10" fill="none" strokeLinecap="round" opacity="0.95" />
      <path className="lg:hidden" d="M40 560 C 120 470, 220 440, 300 450" stroke="#f7b25a" strokeWidth="4" fill="none" strokeLinecap="round" opacity="0.8" />
      <path d="M-20 640 C 120 690, 280 700, 420 640" stroke="#f7941d" strokeWidth="8" fill="none" opacity="0.9" />
      <path d="M-20 600 C 140 660, 300 650, 420 560" stroke="#ffffff" strokeWidth="1.5" fill="none" opacity="0.25" />
      <path d="M-20 540 C 140 610, 300 600, 420 500" stroke="#ffffff" strokeWidth="1.5" fill="none" opacity="0.18" />
      <path className="lg:hidden" d="M60 300 C 110 280, 170 280, 210 295" stroke="#ffffff" strokeWidth="3" strokeDasharray="1 7" strokeLinecap="round" fill="none" opacity="0.7" />
    </svg>
  );
}
