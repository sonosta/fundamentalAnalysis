import express, { Request, Response } from 'express';
// import { pool } from './db/pool';
import { MoexHttpClient } from './clients/moex/moex-http.client';
import { MoexIssClient } from './clients/moex/moex-iss.client';
import { CandlesRepository } from './db/repositories/candles.repository';
import { SyncService } from './services/sync.service';

const app = express();
const PORT = 3000;
const moexHttpClient = new MoexHttpClient();
const moexIssClient = new MoexIssClient(moexHttpClient);


async function bootstrap() {
    const candlesRepository = new CandlesRepository();
    const syncService = new SyncService(moexIssClient, candlesRepository);

    const inserted = await syncService.syncDailyCandles(
        'SBER',
        '2024-01-01',
        '2024-12-31',
    );

    console.log(`Saved rows: ${inserted}`);
}

bootstrap()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

app.get('/moex/securities', async (_req, res) => {
    try {
        const data = await moexIssClient.getMoexSecurities();
        res.json(data);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to fetch MOEX securities' });
    }
});

app.listen(PORT, () => {
    console.log(`Server started on http://localhost:${PORT}`);
});