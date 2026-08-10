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

    async getSecurities(engine: string, market: string, board?: string) {
        const path = board
        ? `/engines/${engine}/markets/${market}/boards/${board}/securities`
        : `/engines/${engine}/markets/${market}/securities`;

        const data = await this.http.get<MoexResponse>(path, {
        lang: 'ru',
        'iss.only': 'securities',
        });

        return mapBlock(data, 'securities');
    }

    async getSecurityHistory(params: {
        engine: string;
        market: string;
        board: string;
        secid: string;
        from: string;
        till: string;
        start?: number;
    }) {
        const { engine, market, board, secid, from, till, start = 0 } = params;

        const data = await this.http.get<MoexResponse>(
        `/history/engines/${engine}/markets/${market}/boards/${board}/securities/${secid}`,
        {
            from,
            till,
            start,
        },
        );

        return {
        history: mapBlock(data, 'history'),
        cursor: mapBlock(data, 'history.cursor')[0] as
            | { INDEX: number; TOTAL: number; PAGESIZE: number }
            | undefined,
        };
    }

    async getAllSecurityHistory(params: {
        engine: string;
        market: string;
        board: string;
        secid: string;
        from: string;
        till: string;
    }) {
        const result: Record<string, unknown>[] = [];
        let start = 0;

        while (true) {
        const page = await this.getSecurityHistory({ ...params, start });
        result.push(...page.history);

        if (!page.cursor) break;

        const index = Number(page.cursor.INDEX ?? 0);
        const total = Number(page.cursor.TOTAL ?? 0);
        const pageSize = Number(page.cursor.PAGESIZE ?? 100);

        if (index + pageSize >= total) break;
        start += pageSize;
        }

        return result;
    }

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

        const data = await this.http.get<MoexResponse>(
        `/history/engines/${engine}/markets/${market}/boards/${board}/securities/${secid}/candles`,
        {
            from,
            till,
            interval,
            start,
        },
        );

        return {
        candles: mapBlock(data, 'candles'),
        cursor: mapBlock(data, 'history.cursor')[0] || mapBlock(data, 'candles.cursor')[0],
        };
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

    async saveMoexSecurities(){
        const arrSecurities = await this.getMoexSecurities() 
    }

    

    async syncSecurities() {
        const url =
        'https://iss.moex.com/iss/engines/stock/markets/shares/boards/TQBR/securities.json' +
        '?iss.meta=off&iss.only=securities&securities.columns=SECID,SHORTNAME,SECNAME,LISTLEVEL,SECTYPE';

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
        }>(json, 'securities');

        await this.securitiesRepo.saveMany(securities);

        return securities.length;
    }
}