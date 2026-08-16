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
    async getCandles(params) {
        const { engine, market, board, secid, from, till, interval = 24, start = 0 } = params;
        const url = 'https://iss.moex.com/iss';
        const response = await fetch(url + `/history/engines/${engine}/markets/${market}/boards/${board}/securities/${secid}/candles.json?from=${from}&till=${till}&interval=${interval}&start=${start}`);
        if (!response.ok) {
            throw new Error(`MOEX ISS request failed: ${response.status} ${response.statusText}`);
        }
        const json = (await response.json());
        const { columns, data } = json.history;
        return data.map((row) => {
            const obj = Object.fromEntries(columns.map((column, index) => [column, row[index]]));
            return {
                SECID: String(obj.SECID ?? ''),
                SHORTNAME: String(obj.SHORTNAME ?? ''),
                TRADEDATE: String(obj.TRADEDATE ?? ''),
                VALUE: String(obj.VALUE ?? ''),
                VOLUME: String(obj.VOLUME ?? ''),
                CLOSE: String(obj.CLOSE ?? ''),
                OPEN: String(obj.OPEN ?? ''),
                HIGH: String(obj.HIGH ?? ''),
                LOW: String(obj.LOW ?? ''),
                WAPRICE: String(obj.WAPRICE ?? ''),
            };
        });
    }
    async getMoexSecurities() {
        const url = 'https://iss.moex.com/iss/engines/stock/markets/shares/boards/TQBR/securities.json' +
            '?iss.meta=off&iss.only=securities&securities.columns=SECID,SHORTNAME,SECNAME,SECTYPE,LISTLEVEL';
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
                LISTLEVEL: String(obj.LISTLEVEL ?? ''),
                SECTYPE: String(obj.SECTYPE ?? ''),
            };
        });
    }
    async syncSecurities() {
        const url = 'https://iss.moex.com/iss/engines/stock/markets/shares/boards/TQBR/securities.json' +
            '?iss.meta=off&iss.only=securities&securities.columns=SECID,SHORTNAME,SECNAME,LISTLEVEL,SECTYPE,BOARDID,BOARDNAME';
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
