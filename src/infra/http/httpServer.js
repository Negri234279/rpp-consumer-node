import { createServer } from 'node:http'

import { METRICS_PORT } from '../config/config.js'
import { HttpRouter } from './HttpRouter.js'
import { HealthCheckController } from './controllers/HealthCheckController.js'
import { MetricsController } from './controllers/MetricsController.js'

export class HttpServer {
    /**
     * @param {Object} config
     * @param {import('../../application/ports/output/IMetricsRecorder.js').IMetricsRecorder} config.metricsRecorder
     * @param {import('../../application/ports/output/ILogger.js').ILogger} config.logger
     * @param {number} [config.port] - Puerto del servidor (opcional)
     */
    constructor({ metricsRecorder, logger, port = METRICS_PORT }) {
        this.metricsRecorder = metricsRecorder
        this.logger = logger
        this.port = port
        this.server = null
        this.router = null
        this.isRunning = false
    }

    async start() {
        if (this.isRunning) {
            this.logger.warn('HTTP Server already running')
            return
        }

        try {
            this.router = new HttpRouter()

            const metricsController = new MetricsController({
                metricsRecorder: this.metricsRecorder,
                logger: this.logger,
            })

            const healthCheckController = new HealthCheckController({
                logger: this.logger,
            })

            this.router.registerController(metricsController)
            this.router.registerController(healthCheckController)

            this.server = createServer(async (req, res) => {
                const handled = await this.router.handle(req, res)

                if (!handled) {
                    res.writeHead(404, { 'Content-Type': 'application/json' })
                    res.end(
                        JSON.stringify(
                            {
                                error: 'Not Found',
                                path: req.url,
                                availableRoutes: this.router.getRegisteredRoutes(),
                            },
                            null,
                            2,
                        ),
                    )

                    this.logger.warn(`404 Not Found: ${req.method} ${req.url}`)
                }
            })

            this.server.on('error', (error) => {
                this.logger.error('HTTP Server error:', error)
                this.isRunning = false
            })

            await new Promise((resolve, reject) => {
                this.server.listen(this.port, () => {
                    this.isRunning = true
                    this.logger.success(`✅ HTTP Server listening on: http://localhost:${this.port}`)
                    this.logger.info('Available routes:')

                    for (const route of this.router.getRegisteredRoutes()) {
                        this.logger.info(`- ${route}`)
                    }

                    resolve()
                })

                this.server.on('error', reject)
            })
        } catch (error) {
            this.logger.error('Error starting HTTP Server:', error)
            throw error
        }
    }

    async stop() {
        if (!this.isRunning) {
            this.logger.warn('HTTP Server is not running')
            return
        }

        try {
            this.logger.info('Stopping HTTP Server...')

            if (this.server) {
                await new Promise((resolve, reject) => {
                    this.server.close((err) => {
                        if (err) {
                            reject(err)
                        } else {
                            resolve()
                        }
                    })
                })
            }

            this.isRunning = false
            this.server = null
            this.router = null

            this.logger.success('HTTP Server stopped successfully')
        } catch (error) {
            this.logger.error('Error stopping HTTP Server:', error)
            throw error
        }
    }

    /**
     * Verifica si el servidor está corriendo
     * @returns {boolean}
     */
    isServerRunning() {
        return this.isRunning
    }
}
