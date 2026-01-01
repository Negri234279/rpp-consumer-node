import { IHttpController } from '../../../application/ports/input/IHttpController.js'
import { LOCALE, TZ } from '../../config/config.js'

export class HealthCheckController extends IHttpController {
    /**
     * @param {Object} dependencies
     * @param {import('../../../application/ports/output/ILogger.js').ILogger} dependencies.logger
     */
    constructor({ logger }) {
        super()
        
        this.logger = logger
    }

    static get routes() {
        return [
            {
                method: 'GET',
                path: '/health',
                handler: 'getHealth',
            },
        ]
    }

    /**
     * GET /health - Health check endpoint
     * @param {import('http').IncomingMessage} _req
     * @param {import('http').ServerResponse} res
     */
    async getHealth(_req, res) {
        try {
            const health = {
                status: 'healthy',
                timestamp: this.#getFormattedTimestamp(),
                uptime: process.uptime(),
                service: 'rpp-consumer-node',
            }

            res.writeHead(200, { 'Content-Type': 'application/json' })
            res.end(JSON.stringify(health, null, 2))
        } catch (error) {
            this.logger.error('Error in health check:', error)

            res.writeHead(500, { 'Content-Type': 'application/json' })
            res.end(
                JSON.stringify({
                    status: 'unhealthy',
                }),
            )
        }
    }

    #getFormattedTimestamp() {
        return new Date()
            .toLocaleString(LOCALE, {
                timeZone: TZ,
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
                hour12: false,
            })
            .replace(',', '')
    }
}
