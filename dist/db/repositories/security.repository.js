"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SecuritiesRepository = void 0;
const pool_1 = require("../pool");
class SecuritiesRepository {
    async saveMany(rows) {
        const client = await pool_1.pool.connect();
        try {
            await client.query('BEGIN');
            for (const row of rows) {
                await client.query(`
                INSERT INTO securities (secid, short_name, full_name, list_level, instrument_type, board_id, board_name)
                VALUES ($1, $2, $3, $4, $5, $6, $7)
                ON CONFLICT (secid)
                DO UPDATE SET
                    short_name = EXCLUDED.short_name,
                    full_name = EXCLUDED.full_name,
                    list_level = EXCLUDED.list_level,
                    instrument_type = EXCLUDED.instrument_type,
                    board_id = EXCLUDED.board_id,
                    board_name = EXCLUDED.board_name
                `, [row.SECID, row.SHORTNAME, row.SECNAME, row.LISTLEVEL, row.SECTYPE, row.BOARDID, row.BOARDNAME]);
            }
            await client.query('COMMIT');
        }
        catch (error) {
            await client.query('ROLLBACK');
            throw error;
        }
        finally {
            client.release();
        }
    }
}
exports.SecuritiesRepository = SecuritiesRepository;
