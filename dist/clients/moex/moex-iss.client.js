"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MoexIssClient = void 0;
function mapBlock(response, blockName) {
    const block = response[blockName];
    if (!block)
        return [];
    return block.data.map((row) => {
        const obj = {};
        block.columns.forEach((col, index) => {
            obj[col] = row[index];
        });
        return obj;
    });
}
class MoexIssClient {
    http;
    securitiesRepo;
    constructor(http, securitiesRepo) {
        this.http = http;
        this.securitiesRepo = securitiesRepo;
    }
    async getSecurities(engine, market, board) {
        const path = board
            ? `/engines/${engine}/markets/${market}/boards/${board}/securities`
            : `/engines/${engine}/markets/${market}/securities`;
        const data = await this.http.get(path, {
            lang: 'ru',
            'iss.only': 'securities',
        });
        return mapBlock(data, 'securities');
    }
    async getSecurityHistory(params) {
        const { engine, market, board, secid, from, till, start = 0 } = params;
        const data = await this.http.get(`/history/engines/${engine}/markets/${market}/boards/${board}/securities/${secid}`, {
            from,
            till,
            start,
        });
        return {
            history: mapBlock(data, 'history'),
            cursor: mapBlock(data, 'history.cursor')[0],
        };
    }
    async getAllSecurityHistory(params) {
        const result = [];
        let start = 0;
        while (true) {
            const page = await this.getSecurityHistory({ ...params, start });
            result.push(...page.history);
            if (!page.cursor)
                break;
            const index = Number(page.cursor.INDEX ?? 0);
            const total = Number(page.cursor.TOTAL ?? 0);
            const pageSize = Number(page.cursor.PAGESIZE ?? 100);
            if (index + pageSize >= total)
                break;
            start += pageSize;
        }
        return result;
    }
    async getCandles(params) {
        const { engine, market, board, secid, from, till, interval = 24, start = 0 } = params;
        const data = await this.http.get(`/history/engines/${engine}/markets/${market}/boards/${board}/securities/${secid}/candles`, {
            from,
            till,
            interval,
            start,
        });
        return {
            candles: mapBlock(data, 'candles'),
            cursor: mapBlock(data, 'history.cursor')[0] || mapBlock(data, 'candles.cursor')[0],
        };
    }
    async getMoexSecurities() {
        const url = 'https://iss.moex.com/iss/engines/stock/markets/shares/boards/TQBR/securities.json' +
            '?iss.meta=off&iss.only=securities&securities.columns=SECID,SHORTNAME,SECNAME';
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`MOEX ISS request failed: ${response.status} ${response.statusText}`);
        }
        const json = (await response.json());
        const { columns, data } = json.securities;
        return data.map((row) => {
            const obj = Object.fromEntries(columns.map((column, index) => [column, row[index]]));
            return {
                SECID: String(obj.SECID ?? ''),
                SHORTNAME: String(obj.SHORTNAME ?? ''),
                SECNAME: String(obj.SECNAME ?? ''),
            };
        });
    }
    async saveMoexSecurities() {
        const arrSecurities = await this.getMoexSecurities();
    }
    async syncSecurities() {
        const url = 'https://iss.moex.com/iss/engines/stock/markets/shares/boards/TQBR/securities.json' +
            '?iss.meta=off&iss.only=securities&securities.columns=SECID,SHORTNAME,SECNAME';
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`MOEX ISS request failed: ${response.status}`);
        }
        const json = (await response.json());
        const { columns, data } = json.securities;
        const securities = mapBlock(json, 'securities');
        await this.securitiesRepo.saveMany(securities);
        return securities.length;
    }
}
exports.MoexIssClient = MoexIssClient;
