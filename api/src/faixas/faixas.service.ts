import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import type { LinhaTabela } from '../simulacao/calculo.js';
import { lerCsv } from './csv.js';
import { Faixa } from './faixa.entity.js';

@Injectable()
export class FaixasService {
  constructor(
    @InjectRepository(Faixa) private readonly faixas: Repository<Faixa>,
    private readonly dataSource: DataSource,
  ) {}

  buscarPorRenda(renda: number): Promise<LinhaTabela | null> {
    return this.faixas.findOne({ where: { renda, ativo: true } });
  }

  // Troca a tabela inteira numa transação: ou entra o CSV todo, ou nada muda.
  // As linhas antigas ficam desativadas, não apagadas.
  async importar(conteudo: string): Promise<{ importadas: number }> {
    const linhas = lerCsv(conteudo);
    await this.dataSource.transaction(async (tx) => {
      await tx.update(Faixa, { ativo: true }, { ativo: false });
      await tx.insert(
        Faixa,
        linhas.map((l) => ({ ...l, ativo: true })),
      );
    });
    return { importadas: linhas.length };
  }
}
