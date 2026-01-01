import { createServer } from 'node:http'

import { METRICS_PORT } from '../config/config.js'
import { HttpRouter } from './HttpRouter.js'
import { HealthCheckController } from './controllers/HealthCheckController.js'
import { MetricsController } from './controllers/MetricsController.js'

/**
 * Initializes the HTTP server with registered controllers
 * @param {Object} config
 * @param {import('../../application/ports/output/IMetricsRecorder.js').IMetricsRecorder} config.metrics
 * @param {import('../../application/ports/output/ILogger.js').ILogger} config.logger
 */
export function startHttpServer({ metrics, logger }) {
    const router = new HttpRouter()

    const metricsController = new MetricsController({
        metricsRecorder: metrics,
        logger,
    })

    const healthCheckController = new HealthCheckController({ logger })

    router.registerController(metricsController)
    router.registerController(healthCheckController)

    const server = createServer(async (req, res) => {
        const handled = await router.handle(req, res)

        if (!handled) {
            res.writeHead(404, { 'Content-Type': 'application/json' })
            res.end(
                JSON.stringify(
                    {
                        error: 'Not Found',
                        path: req.url,
                        availableRoutes: router.getRegisteredRoutes(),
                    },
                    null,
                    2,
                ),
            )

            logger.warn(`404 Not Found: ${req.method} ${req.url}`)
        }
    })

    server.on('error', (error) => {
        logger.error('HTTP Server error:', error)
    })

    server.listen(METRICS_PORT, () => {
        logger.success(`✅ HTTP Server listening on: http://localhost:${METRICS_PORT}`)

        logger.info(`Available routes:`)
        for (const route of router.getRegisteredRoutes()) {
            logger.info(`- ${route}`)
        }
    })

    return server
}
