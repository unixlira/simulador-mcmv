import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { numerico } from '../banco/numerico.js';

export const STATUS_LEAD = ['novo', 'contatado', 'em_negociacao', 'fechado', 'perdido'] as const;
export type StatusLead = (typeof STATUS_LEAD)[number];

@Entity('leads')
export class Lead {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('text')
  nome: string;

  // Só dígitos, com DDD (ex.: 11987654321).
  @Column('text')
  celular: string;

  @Column({ type: 'numeric', precision: 10, scale: 2, transformer: numerico })
  renda: number;

  @Column({ name: 'tem_dependente' })
  temDependente: boolean;

  @Column({ type: 'text', nullable: true })
  bairro: string | null;

  // Campos de snapshot ficam nulos quando a renda está fora da tabela.
  @Column({ type: 'int', nullable: true })
  faixa: number | null;

  @Column({ name: 'valor_financiado', type: 'numeric', precision: 12, scale: 2, nullable: true, transformer: numerico })
  valorFinanciado: number | null;

  @Column({ type: 'numeric', precision: 10, scale: 2, nullable: true, transformer: numerico })
  subsidio: number | null;

  @Column({ name: 'valor_imovel', type: 'numeric', precision: 12, scale: 2, nullable: true, transformer: numerico })
  valorImovel: number | null;

  @Column({ name: 'primeira_parcela', type: 'numeric', precision: 10, scale: 2, nullable: true, transformer: numerico })
  primeiraParcela: number | null;

  @Column({ type: 'text', default: 'novo' })
  status: StatusLead;

  @Column({ name: 'consentimento_lgpd' })
  consentimentoLgpd: boolean;

  @Column({ type: 'text', nullable: true })
  origem: string | null;

  @CreateDateColumn({ name: 'criado_em', type: 'timestamptz' })
  criadoEm: Date;
}
