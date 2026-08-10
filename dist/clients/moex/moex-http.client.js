"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MoexHttpClient = void 0;
const axios_1 = __importDefault(require("axios"));
const env_1 = require("../../config/env");
class MoexHttpClient {
    http;
    constructor() {
        this.http = axios_1.default.create({
            baseURL: env_1.env.MOEX_BASE_URL,
            timeout: 15000,
            headers: {
                Accept: 'application/json',
            },
        });
    }
    async get(path, params) {
        const response = await this.http.get(`${path}.json`, {
            params: {
                'iss.meta': 'off',
                ...params,
            },
        });
        return response.data;
    }
}
exports.MoexHttpClient = MoexHttpClient;
