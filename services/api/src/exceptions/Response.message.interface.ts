export interface IResponseMessage {
    statusCode: number;
    message?: string | string[];
    error?: string;
    data?: any;
    countData?: number;
}