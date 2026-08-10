"use strict";
// import { pool } from '../pool';
Object.defineProperty(exports, "__esModule", { value: true });
exports.CandlesRepository = void 0;
class CandlesRepository {
    async saveMany(rows) {
        // const client = await pool.connect();
        try {
            //   await client.query('BEGIN');
            for (const row of rows) {
                // await client.query(
                //   `
                //   INSERT INTO moex_candles (
                //     secid,
                //     boardid,
                //     tradedate,
                //     open,
                //     low,
                //     high,
                //     close,
                //     value,
                //     volume
                //   )
                //   VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
                //   ON CONFLICT (secid, boardid, tradedate)
                //   DO UPDATE SET
                //     open = EXCLUDED.open,
                //     low = EXCLUDED.low,
                //     high = EXCLUDED.high,
                //     close = EXCLUDED.close,
                //     value = EXCLUDED.value,
                //     volume = EXCLUDED.volume
                //   `,
                //   [
                //     row.secid ?? row.SECID,
                //     row.boardid ?? row.BOARDID,
                //     row.tradedate ?? row.TRADEDATE ?? row.begin,
                //     row.open ?? row.OPEN,
                //     row.low ?? row.LOW,
                //     row.high ?? row.HIGH,
                //     row.close ?? row.CLOSE,
                //     row.value ?? row.VALUE,
                //     row.volume ?? row.VOLUME,
                //   ],
                // );
            }
            //   await client.query('COMMIT');
        }
        catch (error) {
            //   await client.query('ROLLBACK');
            throw error;
        }
        finally {
            //   client.release();
        }
    }
}
exports.CandlesRepository = CandlesRepository;
