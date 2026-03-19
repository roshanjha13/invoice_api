const swaggerJsDoc = require('swagger-jsdoc');

const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'InvoiceAPI',
            version: '1.0.0',
            description: 'Invoice Generation & Tracking API'
        },
        servers: [
            {
                url: 'http://localhost:3000/api/v1',
                description: 'Development server',
            }
        ],
        components: {
            securitySchemes: {
                BearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT',
                },
                ApiKeyAuth: {
                    type: 'apiKey',
                    in: 'header',
                    name: 'x-api-key',
                },
            },
        },
    },
    apis: [
    './src/modules/**/*.routes.js',
    './src/docs/*.docs.js'
    ],


}

module.exports = swaggerJsDoc(options);