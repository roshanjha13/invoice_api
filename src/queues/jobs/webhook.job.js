const { webhookQueue } = require('../../config/queue');

const addWebhookJob = async (event, data, webhookUrl) => {
    await webhookQueue.add(
        'trigger-webhook',
        { event, data, webhookUrl },
        {
            attempts: 5,
            backoff: {
                type: 'exponential',
                delay: 2000
            },
            removeOnComplete: true,
            removeOnFail: false,
        }
    )
}

module.exports = { addWebhookJob };