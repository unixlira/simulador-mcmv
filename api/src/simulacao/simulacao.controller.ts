import { Body, Controller, HttpCode, Post } from '@nestjs/common';
import { Type } from 'class-transformer';
import { IsBoolean, IsNumber, Max, Min } from 'class-validator';
import { SimulacaoService } from './simulacao.service.js';

export class SimularDto {
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @Max(1_000_000)
  renda: number;

  @IsBoolean()
  tem_dependente: boolean;
}

@Controller('simular')
export class SimulacaoController {
  constructor(private readonly simulacao: SimulacaoService) {}

  @Post()
  @HttpCode(200)
  simular(@Body() dto: SimularDto) {
    return this.simulacao.simular(dto.renda, dto.tem_dependente);
  }
}
