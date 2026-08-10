export type MoexBlock = {
    metadata?: Record<string, unknown>;
    columns: string[];
    data: unknown[][];
};

export type MoexSecuritiesRow = {
    SECID: string;
    SHORTNAME: string;
    SECNAME: string;
    LISTLEVEL: string;
    SECTYPE: string;
};

export type DailyQuote = {
    TRADEDATE: string;
    OPEN: number;
    HIGH: number;
    LOW: number;
    CLOSE: number;
    VOLUME: number;
};

export type MoexResponse = Record<string, MoexBlock>;