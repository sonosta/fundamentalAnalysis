import { pool } from '../pool';
import { MoexSecuritiesRow } from '../../clients/moex/moex.types'

export class SecuritiesRepository {
    async saveMany(rows: MoexSecuritiesRow[]) {
        const client = await pool.connect();
        try {
            await client.query('BEGIN');
            for (const row of rows) {
                await client.query(
                `
                INSERT INTO securities (secid, short_name, full_name, list_level, instrument_type)
                VALUES ($1, $2, $3, $4, $5)
                ON CONFLICT (secid)
                DO UPDATE SET
                    short_name = EXCLUDED.short_name,
                    full_name = EXCLUDED.full_name,
                    list_level = EXCLUDED.list_level,
                    instrument_type = EXCLUDED.instrument_type
                `,
                [row.SECID, row.SHORTNAME, row.SECNAME, row.LISTLEVEL, row.SECTYPE],
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