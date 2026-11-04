import { Injectable, NotFoundException } from '@nestjs/common';
import { FaixasService } from '../faixas/faixas.service.js';
import { foraDaFaixa, montarResultado, rendaDaTabela, type RespostaSimulacao } from './calculo.js';

@Injectable()
export class SimulacaoService {
  constructor(private readonly faixas: FaixasService) {}

  async simular(renda: number, temDependente: boolean): Promise<RespostaSimulacao> {
    if (foraDaFaixa(renda)) return { foraDaFaixa: true, rendaInformada: renda };

    const linha = await this.faixas.buscarPorRenda(rendaDaTabela(renda));
    // Renda dentro de 1.000 a 13.000 sem linha = tabela incompleta, não é culpa do cliente.
    if (!linha) throw new NotFoundException('Tabela sem a linha desta renda');

    return montarResultado(renda, linha, temDependente);
  }
}
