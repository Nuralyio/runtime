import {NotFoundException} from "./NotFoundException";

export class ApplicationNotFound extends NotFoundException {
    status: number;

    constructor(message: string) {
        super(message);
        this.status = 404;
        this.name = 'NotFoundException';
    }
}