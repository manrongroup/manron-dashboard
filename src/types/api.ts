export interface PaginatedResponse<T> {
    status: number;
    message: string;
    data: T[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        pages: number;
    };
}

export interface ApiResponse<T> {
    status: number;
    message: string;
    data: T;
}

export interface ApiError {
    status: number;
    message: string;
    errors?: Record<string, string[]>;
}
