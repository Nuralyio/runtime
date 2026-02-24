export class UnauthorizedException extends Error {
    status: number;

    constructor(message: string) {
        super(message);
        this.status = 401;
        this.name = 'UnauthorizedException';
    }
}