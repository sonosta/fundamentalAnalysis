"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const pool_1 = require("./db/pool");
const moex_http_client_1 = require("./clients/moex/moex-http.client");
const moex_iss_client_1 = require("./clients/moex/moex-iss.client");
const candles_repository_1 = require("./db/repositories/candles.repository");
const sync_service_1 = require("./services/sync.service");
const security_repository_1 = require("./db/repositories/security.repository");
const app = (0, express_1.default)();
const PORT = 3000;
const moexHttpClient = new moex_http_client_1.MoexHttpClient();
const securitiesRepository = new security_repository_1.SecuritiesRepository();
const moexIssClient = new moex_iss_client_1.MoexIssClient(moexHttpClient, securitiesRepository);
async function bootstrap() {
    const candlesRepository = new candles_repository_1.CandlesRepository();
    const syncService = new sync_service_1.SyncService(moexIssClient, candlesRepository);
    const inserted = await syncService.syncDailyCandles('SBER', '2024-01-01', '2024-12-31');
    console.log(`Saved rows: ${inserted}`);
}
bootstrap()
    .catch((error) => {
    console.error(error);
    process.exit(1);
});
app.get('/db/test', async (_req, res) => {
    try {
        const result = await pool_1.pool.query('SELECT NOW() as now');
        res.json(result.rows);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Database error' });
    }
});
app.get('/moex/securities', async (_req, res) => {
    try {
        const data = await moexIssClient.getMoexSecurities();
        res.json(data);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to fetch MOEX securities' });
    }
});
app.get('/moex/saveSecurities', async (_req, res) => {
    try {
        const data = await moexIssClient.syncSecurities();
        res.json(data);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to fetch MOEX securities' });
    }
});
app.listen(PORT, () => {
    console.log(`Server started on http://localhost:${PORT}`);
});
