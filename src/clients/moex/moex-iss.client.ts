import { MoexHttpClient } from './moex-http.client';
import { MoexResponse } from './moex.types';
import { SecuritiesRepository } from '../../db/repositories/security.repository';

function mapBlock<T = Record<string, unknown>>(response: MoexResponse, blockName: string): T[] {
  const block = response[blockName];
  if (!block) return [];

  return block.data.map((row) => {
    const obj: Record<string, unknown> = {};
    block.columns.forEach((col, index) => {
      obj[col] = row[index];
    });
    return obj as T;
  });
}


export class MoexIssClient {
    constructor(private readonly http: MoexHttpClient, private readonly securitiesRepo: SecuritiesRepository) {}

    async getCandles(params: {
        engine: string;
        market: string;
        board: string;
        secid: string;
        from: string;
        till: string;
        interval?: number;
        start?: number;
    }) {
        const { engine, market, board, secid, from, till, interval = 24, start = 0 } = params;
        const url = 'https://iss.moex.com/iss';
        const response = await fetch(url + `/history/engines/${engine}/markets/${market}/boards/${board}/securities/${secid}/candles.json?from=${from}&till=${till}&interval=${interval}&start=${start}`);

        if (!response.ok) {
            throw new Error(`MOEX ISS request failed: ${response.status} ${response.statusText}`);
        }

        const json = (await response.json()) as MoexResponse;

        const { columns, data } = json.history;

        return data.map((row) => {
            const obj = Object.fromEntries(
            columns.map((column, index) => [column, row[index]])
            ) as Record<string, unknown>;

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
            WAPRICE : String(obj.WAPRICE  ?? ''),
            };
        });
    }

    async getMoexSecurities() {
        const url =
            'https://iss.moex.com/iss/engines/stock/markets/shares/boards/TQBR/securities.json' +
            '?iss.meta=off&iss.only=securities&securities.columns=SECID,SHORTNAME,SECNAME,SECTYPE,LISTLEVEL';

        const response = await fetch(url);

        if (!response.ok) {
            throw new Error(`MOEX ISS request failed: ${response.status} ${response.statusText}`);
        }

        const json = (await response.json()) as MoexResponse;

        const { columns, data } = json.securities;

        return data.map((row) => {
            const obj = Object.fromEntries(
            columns.map((column, index) => [column, row[index]])
            ) as Record<string, unknown>;

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
        const url =
        'https://iss.moex.com/iss/engines/stock/markets/shares/boards/TQBR/securities.json' +
        '?iss.meta=off&iss.only=securities&securities.columns=SECID,SHORTNAME,SECNAME,LISTLEVEL,SECTYPE,BOARDID,BOARDNAME';

        const response = await fetch(url);

        if (!response.ok) {
            throw new Error(`MOEX ISS request failed: ${response.status}`);
        }

        const json = (await response.json()) as MoexResponse;
        const { columns, data } = json.securities;

        const securities = mapBlock<{
            SECID: string;
            SHORTNAME: string;
            SECNAME: string;
            LISTLEVEL: string;
            SECTYPE: string;
            BOARDID: string;
            BOARDNAME: string;
        }>(json, 'securities');

        await this.securitiesRepo.saveMany(securities);

        return securities.length;
    }
}