"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SyncService = void 0;
class SyncService {
    moexClient;
    candlesRepository;
    constructor(moexClient, candlesRepository) {
        this.moexClient = moexClient;
        this.candlesRepository = candlesRepository;
    }
    async syncDailyCandles(secid, from, till) {
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
exports.SyncService = SyncService;
