export class SessionNotFoundError extends Error {
    constructor(message) {
        super(message);
        this.name = 'SessionNotFoundError';
    }
}
