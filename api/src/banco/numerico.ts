import type { ValueTransformer } from 'typeorm';

// O driver do Postgres devolve numeric como texto; aqui vira number.
export const numerico: ValueTransformer = {
  to: (v: number | null | undefined) => v,
  from: (v: string | null) => (v === null ? null : Number(v)),
};
