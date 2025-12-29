import http from 'node:http'
import { METRICS_PORT } from './config.js'

export function startMetricsServer({ metrics, logger }) {
    const server = http.createServer(async (req, res) => {
        if (req.url === '/metrics') {
            const metricsData = await metrics.metrics()
            res.writeHead(200, { 'Content-Type': 'text/plain' })
            res.end(metricsData)
        } else {
            res.writeHead(404, { 'Content-Type': 'text/plain' })
            res.end('Not Found')

            logger.warn(`404 Not Found: ${req.url}`)
        }
    })

    server.listen(METRICS_PORT, () => {
        logger.info(`Metrics server listening on: http://localhost:${METRICS_PORT}/metrics`)
    })
}
