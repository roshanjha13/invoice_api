const { emailQueue } = require('../../config/queue');

const addEmailJob = async (invoice) => {
    await emailQueue.add(
        'send-invoice-email',
        { invoice },
        {
            attempts: 3,
            backoff: {
                type: 'exponential',
                delay: 1000
            },
            removeOnComplete: true,
            removeOnFail: false,
        }
    )
}

module.exports = { addEmailJob };