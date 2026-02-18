export interface ApiResponse<T> {
    data: T;
    error?: never;
}
export interface ApiError {
    data?: never;
    error: {
        message: string;
        code?: string;
    };
}
export type ApiResult<T> = ApiResponse<T> | ApiError;
export interface HealthCheck {
    status: 'ok' | 'error';
    db: boolean;
    content: boolean;
    timestamp: string;
}
//# sourceMappingURL=api.d.ts.map