const { cleanEnv, str, port, url } = require('envalid');

const validateEnv = () => {
    cleanEnv(process.env, { 
        PORT:            port({ default:3000 }),
        NODE_ENV:        str({ choices: ['development', 'production', 'test'] }),

        MONGO_URI:       url(),

        JWT_SECRET:      str(),
        JWT_EXPIRES_IN:  str({ default: '7d'}),

        ALLOWED_ORIGINS: str({ default: 'http://localhost:3000' }),
    })
}

module.exports = validateEnv;