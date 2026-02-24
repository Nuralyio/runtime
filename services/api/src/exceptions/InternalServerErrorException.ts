export class InternalServerErrorException extends Error {
    status: number;

    constructor(message: string) {
        super(message);
        this.status = 500;
        this.name = 'InternalServerErrorException';
    }
}