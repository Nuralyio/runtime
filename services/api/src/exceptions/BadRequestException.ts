export class BadRequestException extends Error {
    status: number;

    constructor(message: string) {
        super(message);
        this.status = 400;
        this.name = 'BadRequestException';
    }
}