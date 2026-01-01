export class HttpRouter {
    /**
     * @type {Map<string, (req: import('http').IncomingMessage, res: import('http').ServerResponse) => Promise<void>>}
     */
    routes

    constructor() {
        this.routes = new Map()
    }

    /**
     * Registers a controller with its routes
     * @param {Object} controller - Controller instance
     */
    registerController(controller) {
        const controllerClass = controller.constructor

        /**
         * @type {{ method: string, path: string, handler: string }[]>}
         */
        const routes = controllerClass.routes || []

        routes.forEach(({ method, path, handler }) => {
            const key = `${method.toUpperCase()}:${path}`

            /** * @type {(req: import('http').IncomingMessage, res: import('http').ServerResponse) => Promise<void>}*/
            const handlerFn = controller[handler].bind(controller)

            this.routes.set(key, handlerFn)
        })
    }

    /**
     * Searches and executes the handler for the request
     * @param {import('http').IncomingMessage} req - HTTP Request
     * @param {import('http').ServerResponse} res - HTTP Response
     * @returns {Promise<boolean>} true if the route was found, false otherwise
     */
    async handle(req, res) {
        const key = `${req.method}:${req.url}`
        const handler = this.routes.get(key)

        if (handler) {
            await handler(req, res)
            return true
        }

        return false
    }

    /**
     * Gets all registered routes
     * @returns {string[]}
     */
    getRegisteredRoutes() {
        return Array.from(this.routes.keys())
    }
}
