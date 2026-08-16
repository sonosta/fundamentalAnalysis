import express, { Request, Response } from 'express';
import { pool } from './db/pool';
import { MoexHttpClient } from './clients/moex/moex-http.client';
import { MoexIssClient } from './clients/moex/moex-iss.client';
import { SecuritiesRepository } from './db/repositories/security.repository';
import { CandelsRepository } from './db/repositories/candels.repository';

const app = express();
const PORT = 3000;
const moexHttpClient = new MoexHttpClient();
const securitiesRepository = new SecuritiesRepository();
const candelsRepository = new CandelsRepository();
const moexIssClient = new MoexIssClient(moexHttpClient, securitiesRepository, candelsRepository);


app.get('/db/test', async (_req, res) => {
    try {
        const result = await pool.query('SELECT NOW() as now');
        res.json(result.rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Database error' });
    }
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

app.get('/moex/updateSecurities', async (_req, res) => {
    try {
        const data = await moexIssClient.syncSecurities()
        res.json(data);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to fetch MOEX securities' });
    }
});

app.get('/moex/candles', async (_req, res) => {
    try {
        const { secid, from, till, interval } = _req.query;

        const secidStr = String(secid ?? '');
        const fromStr = String(from ?? '');
        const tillStr = String(till ?? '');
        const intervalNumber = Number(interval ?? 24);

        const params = {
            engine:'stock',
            market: 'shares',
            board: 'TQBR',
            secid: secidStr,
            from: fromStr,
            till: tillStr,
            interval: intervalNumber,
         }
        const data = await moexIssClient.getCandles(params)
        res.json(data);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to fetch MOEX candels' });
    }
});

app.get('/moex/updateCandles', async (_req, res) => {
    try {
        const { secid, from, till, interval } = _req.query;

        const secidStr = String(secid ?? '');
        const fromStr = String(from ?? '');
        const tillStr = String(till ?? '');
        const intervalNumber = Number(interval ?? 24);

        const params = {
            engine:'stock',
            market: 'shares',
            board: 'TQBR',
            secid: secidStr,
            from: fromStr,
            till: tillStr,
            interval: intervalNumber,
         }
        const data = await moexIssClient.syncCandels(params)
        res.json(data);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to fetch MOEX candels' });
    }
});

app.listen(PORT, () => {
    console.log(`Server started on http://localhost:${PORT}`);
});