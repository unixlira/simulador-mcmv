import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SimulacaoService } from '../simulacao/simulacao.service.js';
import type { CriarLeadDto } from './leads.controller.js';
import { Lead } from './lead.entity.js';

@Injectable()
export class LeadsService {
  private readonly logger = new Logger(LeadsService.name);

  constructor(
    @InjectRepository(Lead) private readonly leads: Repository<Lead>,
    private readonly simulacao: SimulacaoService,
  ) {}

  // O snapshot é calculado aqui, nunca aceito do navegador.
  async criar(dto: CriarLeadDto) {
    const sim = await this.simulacao.simular(dto.renda, dto.tem_dependente).catch((e: unknown) => {
      // Falta a linha na tabela: o lead não se perde, vai direto ao especialista.
      if (!(e instanceof NotFoundException)) throw e;
      this.logger.warn(`Tabela sem a linha da renda ${dto.renda}`);
      return { foraDaFaixa: true as const, rendaInformada: dto.renda };
    });
    const dentro = sim.foraDaFaixa ? null : sim;

    const lead = await this.leads.save(
      this.leads.create({
        nome: dto.nome,
        celular: dto.celular,
        renda: dto.renda,
        temDependente: dto.tem_dependente,
        bairro: dto.bairro || null,
        faixa: dentro?.faixa ?? null,
        valorFinanciado: dentro?.valorFinanciado ?? null,
        subsidio: dentro?.subsidio ?? null,
        valorImovel: dentro?.valorImovel ?? null,
        primeiraParcela: dentro?.primeiraParcela ?? null,
        consentimentoLgpd: dto.consentimento_lgpd,
        origem: dto.origem || null,
      }),
    );

    this.notificar(lead);
    return { lead_id: lead.id, simulacao: sim };
  }

  // Pendência do Junior: canal da notificação (e-mail, WhatsApp, planilha).
  // Até lá fica só no log do servidor.
  private notificar(lead: Lead) {
    this.logger.log(`Lead novo ${lead.id} faixa=${lead.faixa ?? 'fora'} renda=${lead.renda}`);
  }
}
