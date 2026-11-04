import { Body, Controller, Post } from '@nestjs/common';
import { Transform, Type } from 'class-transformer';
import { Equals, IsBoolean, IsNumber, IsOptional, IsString, Matches, Max, MaxLength, Min, MinLength } from 'class-validator';
import { LeadsService } from './leads.service.js';

const soDigitos = ({ value }: { value: unknown }) => (typeof value === 'string' ? value.replace(/\D/g, '') : value);
const aparar = ({ value }: { value: unknown }) => (typeof value === 'string' ? value.trim() : value);

export class CriarLeadDto {
  @Transform(aparar)
  @IsString()
  @MinLength(2)
  @MaxLength(120)
  nome: string;

  // DDD + celular com 9 na frente (11 dígitos).
  @Transform(soDigitos)
  @Matches(/^[1-9]{2}9\d{8}$/, { message: 'celular inválido' })
  celular: string;

  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @Max(1_000_000)
  renda: number;

  @IsBoolean()
  tem_dependente: boolean;

  @IsOptional()
  @Transform(aparar)
  @IsString()
  @MaxLength(80)
  bairro?: string;

  @Equals(true, { message: 'é preciso aceitar a política de privacidade' })
  consentimento_lgpd: boolean;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  origem?: string;
}

@Controller('leads')
export class LeadsController {
  constructor(private readonly leads: LeadsService) {}

  // O lead é gravado no envio do formulário, antes de a pessoa ver o resultado.
  @Post()
  criar(@Body() dto: CriarLeadDto) {
    return this.leads.criar(dto);
  }
}
