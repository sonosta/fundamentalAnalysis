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
}
exports.SyncService = SyncService;
