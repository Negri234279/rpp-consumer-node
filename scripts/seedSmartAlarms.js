import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { RABBITMQ_URL } from '../src/infra/config/config.js'
import { RabbitMQBroker } from '../src/infra/messaging/RabbitMQBroker.js'
import { ConsoleLogger } from '../src/infra/monitoring/ConsoleLogger.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const SEED_LOG_PATH = path.resolve(__dirname, '../logs/rpp-consumer-node-seed.log')

const logger = new ConsoleLogger({ path: SEED_LOG_PATH })

const broker = new RabbitMQBroker({
    url: RABBITMQ_URL,
    queue: 'rustplus_alarms',
    logger,
})

const SERVERS = [
    'Rustopia.gg - EU Mondays',
    'Rusty Moose |EU Low|',
    'Rustopia.gg - EU Medium',
    'Rustafied.com - EU Medium II',
    'Rustoria.co - EU East Long',
    'Rustoria.co - EU Long',
]

const generateRandomLocation = () => {
    const letter = String.fromCharCode(65 + Math.floor(Math.random() * 26))
    const number = Math.floor(Math.random() * 100)

    return `${letter}${number}`
}

const generateSmartAlarmEvent = () => {
    const server = SERVERS[Math.floor(Math.random() * SERVERS.length)]
    const location = generateRandomLocation()

    return {
        active: false,
        reachable: true,
        everyone: false,
        name: 'Smart Alarm',
        message: 'Your base is under attack!',
        lastTrigger: null,
        command: '371757554',
        id: '371757554',
        image: 'smart_alarm.png',
        location,
        server,
        messageId: `${Date.now()}${Math.floor(Math.random() * 1000)}`,
    }
}

const seedSmartAlarms = async (count = 1) => {
    try {
        await broker.connect()
        logger.success(`Connected to RabbitMQ. Sending ${count} event(s)...`)

        for (let i = 0; i < count; i++) {
            const event = generateSmartAlarmEvent()
            await broker.send(event)

            logger.info(`[${i + 1}/${count}] Event sent to server: ${event.server}`)

            if (count > 1 && i < count - 1) {
                await new Promise((resolve) => setTimeout(resolve, 100))
            }
        }

        logger.success(`✅ ${count} event(s) sent successfully`)

        await broker.stop()

        process.exit(0)
    } catch (err) {
        logger.error('❌ Error sending events:', err)

        await broker.stop().catch(() => {})

        process.exit(1)
    }
}

const args = process.argv.slice(2)
const count = args[0] ? parseInt(args[0], 10) : 1

if (isNaN(count) || count < 1) {
    logger.error('❌ Error: Provide a valid number of events to seed.')
    logger.warn('Usage: node scripts/seedSmartAlarms.js [count/quantity (default: 1)]')
    logger.warn('Example: node scripts/seedSmartAlarms.js 5')

    process.exit(1)
}

seedSmartAlarms(count)
