import { IHttpController } from '../../../application/ports/input/IHttpController.js'
import { METRICS_ENABLED } from '../../config/config.js'

export class MetricsController extends IHttpController {
    /**
     * @param {Object} dependencies
     * @param {import('../../../application/ports/output/IMetricsRecorder.js').IMetricsRecorder} dependencies.metricsRecorder
     * @param {import('../../../application/ports/output/ILogger.js').ILogger} dependencies.logger
     */
    constructor({ metricsRecorder, logger }) {
        super()
        
        this.metricsRecorder = metricsRecorder
        this.logger = logger
    }

    static get routes() {
        /**
         * @type {{ method: string, path: string, handler: string }[]>}
         */
        const routes = []

        if (METRICS_ENABLED) {
            routes.push({
                method: 'GET',
                path: '/metrics',
                handler: 'getMetrics',
            })
        }

        return routes
    }

    /**
     * GET /metrics - Endpoint to retrieve prometheus metrics
     * @param {import('http').IncomingMessage} req
     * @param {import('http').ServerResponse} res
     */
    async getMetrics(req, res) {
        try {
            const metricsData = await this.metricsRecorder.metrics()

            if (!metricsData) {
                res.writeHead(503, { 'Content-Type': 'text/plain' })
                res.end('Metrics collection is disabled')
                this.logger.warn('Metrics collection is disabled, /metrics endpoint accessed')
                return
            }

            res.writeHead(200, {
                'Content-Type': 'text/plain; version=0.0.4; charset=utf-8',
            })
            res.end(metricsData)

            this.logger.info('Metrics requested successfully')
        } catch (error) {
            this.logger.error('Error fetching metrics:', error)

            res.writeHead(500, { 'Content-Type': 'text/plain' })
            res.end('Internal Server Error')
        }
    }
}
