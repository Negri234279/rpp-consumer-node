export class IHttpController {
    /**
     * Define the routes handled by this controller
     * Must return an array of objects with { method, path, handler }
     * @returns {{method: string, path: string, handler: string}[]}
     */
    static get routes() {
        throw new Error('IHttpController.routes must be implemented')
    }
}
