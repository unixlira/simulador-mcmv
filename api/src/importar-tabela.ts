// Importa o CSV da tabela de 420 meses para o banco.
// Uso: npm run importar:tabela -- caminho/do/arquivo.csv
import { readFileSync } from 'node:fs';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';
import { FaixasService } from './faixas/faixas.service.js';

const arquivo = process.argv[2];
if (!arquivo) {
  console.error('Informe o CSV: npm run importar:tabela -- tabela.csv');
  process.exit(1);
}

const app = await NestFactory.createApplicationContext(AppModule, { logger: ['error'] });
try {
  const { importadas } = await app.get(FaixasService).importar(readFileSync(arquivo, 'utf8'));
  console.log(`${importadas} linhas importadas; a tabela anterior ficou desativada.`);
} catch (e) {
  console.error((e as Error).message);
  process.exitCode = 1;
} finally {
  await app.close();
}
