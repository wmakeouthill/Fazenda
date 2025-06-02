import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { WebhookModule } from './webhook.module';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm'; // Importar TypeOrmModule

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, // Torna o ConfigModule disponível globalmente
    }),
    TypeOrmModule.forRoot({
      type: 'sqlite',
      database: 'fazenda_lol_stats.db', // Nome do arquivo do banco de dados
      entities: [__dirname + '/webhook/*.entity{.ts,.js}'], // Caminho para as entidades
      synchronize: true, // Em desenvolvimento, pode ser true para criar tabelas automaticamente
      // logging: true, // Descomente para ver os logs SQL
    }),
    WebhookModule, // Importa o WebhookModule que deve prover o Controller e Service
  ],
  controllers: [AppController], // AppController permanece, WebhookController virá do WebhookModule
  providers: [AppService], // AppService permanece, WebhookService virá do WebhookModule
})
export class AppModule {}
