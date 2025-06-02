"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const app_module_1 = require("./app.module");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    app.enableCors({
        origin: [
            'http://localhost:4200',
            'http://localhost:3000',
            'https://fazenda-lol-stats.vercel.app',
        ],
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
        credentials: true,
    });
    await app.listen(process.env.PORT ?? 3000);
}
bootstrap().catch(console.error);
//# sourceMappingURL=main.js.map