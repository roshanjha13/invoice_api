const { pdfQueue } = require('../../config/queue');

const addPdfJob = async (invoice) => {
    await pdfQueue.add(
        'generate-pdf',
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

module.exports = { addPdfJob };