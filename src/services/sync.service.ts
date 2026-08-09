import { MoexIssClient } from '../clients/moex/moex-iss.client';
import { CandlesRepository } from '../db/repositories/candles.repository';

export class SyncService {
  constructor(
    private readonly moexClient: MoexIssClient,
    private readonly candlesRepository: CandlesRepository,
  ) {}

  async syncDailyCandles(secid: string, from: string, till: string) {
    const candlesResponse = await this.moexClient.getCandles({
      engine: 'stock',
      market: 'shares',
      board: 'TQBR',
      secid,
      from,
      till,
      interval: 24,
    });

    await this.candlesRepository.saveMany(candlesResponse.candles);
    return candlesResponse.candles.length;
  }
}