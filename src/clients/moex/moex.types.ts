export type MoexBlock = {
  metadata?: Record<string, unknown>;
  columns: string[];
  data: unknown[][];
};

export type MoexSecuritiesRow = {
  SECID: string;
  SHORTNAME: string;
};

export type MoexResponse = Record<string, MoexBlock>;