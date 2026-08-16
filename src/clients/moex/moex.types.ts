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
    BOARDID: string;
    BOARDNAME: string;
};

export type DailyQuote = {
    SECID: string;
    SHORTNAME: string;
    TRADEDATE: string;
    OPEN: number;
    HIGH: number;
    LOW: number;
    CLOSE: number;
    VALUE: number;
    VOLUME: number;
    WAPRICE: number;
};

export type MoexResponse = Record<string, MoexBlock>;