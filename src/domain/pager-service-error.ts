/**
 * A "Base" Error class for the Pager Service
 */
export class PagerServiceError extends Error {
    constructor(message) {
        super(message);
    }
}
