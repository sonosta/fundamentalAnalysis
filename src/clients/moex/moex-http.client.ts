import axios, { AxiosInstance } from 'axios';
import { env } from '../../config/env';

export class MoexHttpClient {
    private readonly http: AxiosInstance;

    constructor() {
        this.http = axios.create({
        baseURL: env.MOEX_BASE_URL,
        timeout: 15000,
        headers: {
            Accept: 'application/json',
        },
        });
    }

    async get<T>(path: string, params?: Record<string, unknown>): Promise<T> {
        const response = await this.http.get<T>(`${path}.json`, {
        params: {
            'iss.meta': 'off',
            ...params,
        },
        });

        return response.data;
    }
}