import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { numerico } from '../banco/numerico.js';

@Entity('faixas_financiamento')
export class Faixa {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'numeric', precision: 10, scale: 2, transformer: numerico })
  renda: number;

  @Column({ name: 'subsidio_com_dependente', type: 'numeric', precision: 10, scale: 2, transformer: numerico })
  subsidioComDependente: number;

  @Column({ type: 'numeric', precision: 12, scale: 2, transformer: numerico })
  financiamento: number;

  @Column({
    name: 'subsidio_sem_dependente',
    type: 'numeric',
    precision: 10,
    scale: 2,
    nullable: true,
    transformer: numerico,
  })
  subsidioSemDependente: number | null;

  @Column({ name: 'primeira_prestacao', type: 'numeric', precision: 10, scale: 2, transformer: numerico })
  primeiraPrestacao: number;

  @Column({ name: 'valor_avaliacao', type: 'numeric', precision: 12, scale: 2, transformer: numerico })
  valorAvaliacao: number;

  @Column({ name: 'juros_nominal', type: 'numeric', precision: 5, scale: 2, transformer: numerico })
  jurosNominal: number;

  @Column({ name: 'juros_efetivo', type: 'numeric', precision: 5, scale: 2, transformer: numerico })
  jurosEfetivo: number;

  @Column({ type: 'int' })
  faixa: number;

  @Column({ default: true })
  ativo: boolean;
}
