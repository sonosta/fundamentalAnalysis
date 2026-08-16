import { pool } from '../pool';
import { DailyQuote } from '../../clients/moex/moex.types'


export class CandelsRepository {
    async saveCandels(rows: DailyQuote[]) {
        const client = await pool.connect();
        try {
            await client.query('BEGIN');
            for (const row of rows) {
                await client.query(
                `
                INSERT INTO security_daily (security_id, trade_date, open, high, low, close, value, volume, waprice)
                SELECT s.id, $2, $3, $4, $5, $6, $7, $8, $9
                FROM securities AS s
                WHERE s.secId = $1
                ON CONFLICT ON CONSTRAINT uq_security_daily_secid_tradedate
                DO UPDATE SET
                    open = EXCLUDED.open,
                    high = EXCLUDED.high,
                    low = EXCLUDED.low,
                    close = EXCLUDED.close,
                    value = EXCLUDED.value,
                    volume = EXCLUDED.volume,
                    waprice = EXCLUDED.waprice
                `,
                [row.SECID, row.TRADEDATE, row.OPEN, row.HIGH, row.LOW, row.CLOSE, row.VALUE, row.VOLUME, row.WAPRICE],
                );
            }
            await client.query('COMMIT');
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    }
}