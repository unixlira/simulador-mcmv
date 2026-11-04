import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import type { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import request from 'supertest';
import type { App } from 'supertest/types.js';
import { configurar } from '../src/configurar.js';
import { lerCsv } from '../src/faixas/csv.js';
import { FaixasService } from '../src/faixas/faixas.service.js';
import { Lead } from '../src/leads/lead.entity.js';
import { LeadsController } from '../src/leads/leads.controller.js';
import { LeadsService } from '../src/leads/leads.service.js';
import { SimulacaoController } from '../src/simulacao/simulacao.controller.js';
import { SimulacaoService } from '../src/simulacao/simulacao.service.js';

// Sem Postgres: a tabela vem do CSV de exemplo e os leads ficam num array.
const tabela = lerCsv(readFileSync(join(import.meta.dirname, '../dados/tabela-exemplo.csv'), 'utf8'));
const faixasFalsas = { buscarPorRenda: async (renda: number) => tabela.find((l) => l.renda === renda) ?? null };
const salvos: Partial<Lead>[] = [];
const repoFalso = {
  create: (d: Partial<Lead>) => d,
  save: async (d: Partial<Lead>) => {
    const lead = { ...d, id: `lead-${salvos.length + 1}` };
    salvos.push(lead);
    return lead;
  },
};

describe('API (e2e)', () => {
  let app: INestApplication<App>;

  beforeAll(async () => {
    const modulo = await Test.createTestingModule({
      controllers: [SimulacaoController, LeadsController],
      providers: [
        SimulacaoService,
        LeadsService,
        { provide: FaixasService, useValue: faixasFalsas },
        { provide: getRepositoryToken(Lead), useValue: repoFalso },
      ],
    }).compile();
    app = configurar(modulo.createNestApplication());
    await app.init();
  });

  afterAll(() => app.close());

  it('POST /api/simular dentro da tabela', async () => {
    const r = await request(app.getHttpServer()).post('/api/simular').send({ renda: 3250, tem_dependente: true }).expect(200);
    expect(r.body).toMatchObject({ foraDaFaixa: false, rendaTabela: 3200, faixa: 1, valorFinanciado: 172228.77, subsidio: 6011 });
  });

  it.each([800, 14000])('POST /api/simular fora da faixa (%s)', async (renda) => {
    const r = await request(app.getHttpServer()).post('/api/simular').send({ renda, tem_dependente: false }).expect(200);
    expect(r.body).toEqual({ foraDaFaixa: true, rendaInformada: renda });
  });

  it('POST /api/simular recusa corpo inválido', () =>
    request(app.getHttpServer()).post('/api/simular').send({ renda: 'abc' }).expect(400));

  it('POST /api/leads grava com snapshot calculado no servidor', async () => {
    const r = await request(app.getHttpServer())
      .post('/api/leads')
      .send({
        nome: ' Maria Teste ',
        celular: '(11) 98765-4321',
        renda: 5100,
        tem_dependente: false,
        consentimento_lgpd: true,
        origem: 'teste',
      })
      .expect(201);
    expect(r.body.simulacao).toMatchObject({ faixa: 3, valorFinanciado: 198034.42 });
    expect(salvos.at(-1)).toMatchObject({
      nome: 'Maria Teste',
      celular: '11987654321',
      faixa: 3,
      valorImovel: 400000,
      primeiraParcela: 1530,
      consentimentoLgpd: true,
    });
  });

  it('POST /api/leads fora da faixa grava sem snapshot', async () => {
    await request(app.getHttpServer())
      .post('/api/leads')
      .send({ nome: 'João', celular: '11987654321', renda: 14000, tem_dependente: true, consentimento_lgpd: true })
      .expect(201);
    expect(salvos.at(-1)).toMatchObject({ faixa: null, valorFinanciado: null });
  });

  it('POST /api/leads com renda sem linha na tabela grava e manda ao especialista', async () => {
    const r = await request(app.getHttpServer())
      .post('/api/leads')
      .send({ nome: 'Ana', celular: '11987654321', renda: 2870, tem_dependente: true, consentimento_lgpd: true })
      .expect(201);
    expect(r.body.simulacao).toEqual({ foraDaFaixa: true, rendaInformada: 2870 });
    expect(salvos.at(-1)).toMatchObject({ nome: 'Ana', faixa: null });
  });

  it('POST /api/leads sem consentimento é recusado', () =>
    request(app.getHttpServer())
      .post('/api/leads')
      .send({ nome: 'João', celular: '11987654321', renda: 2000, tem_dependente: true, consentimento_lgpd: false })
      .expect(400));

  it('POST /api/leads com celular inválido é recusado', () =>
    request(app.getHttpServer())
      .post('/api/leads')
      .send({ nome: 'João', celular: '1133334444', renda: 2000, tem_dependente: true, consentimento_lgpd: true })
      .expect(400));
});
