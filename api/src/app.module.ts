import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Faixa } from './faixas/faixa.entity.js';
import { FaixasService } from './faixas/faixas.service.js';
import { Lead } from './leads/lead.entity.js';
import { LeadsController } from './leads/leads.controller.js';
import { LeadsService } from './leads/leads.service.js';
import { SimulacaoController } from './simulacao/simulacao.controller.js';
import { SimulacaoService } from './simulacao/simulacao.service.js';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    // Rate limit em toda a API: 20 pedidos por minuto por IP.
    ThrottlerModule.forRoot([{ ttl: 60_000, limit: 20 }]),
    TypeOrmModule.forRoot({
      type: 'postgres',
      url: process.env.DATABASE_URL,
      entities: [Faixa, Lead],
      // O esquema vem de db/schema.sql; o TypeORM nunca altera tabela sozinho.
      synchronize: false,
    }),
    TypeOrmModule.forFeature([Faixa, Lead]),
  ],
  controllers: [SimulacaoController, LeadsController],
  providers: [FaixasService, SimulacaoService, LeadsService, { provide: APP_GUARD, useClass: ThrottlerGuard }],
})
export class AppModule {}
