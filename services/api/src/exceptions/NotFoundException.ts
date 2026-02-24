export class NotFoundException extends Error {
    status: number;

    constructor(message: string) {
        super(message);
        this.status = 404;
        this.name = 'NotFoundException';
    }
}