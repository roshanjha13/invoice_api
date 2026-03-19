const jwt = require('jsonwebtoken');

exports.generateAccessToken = (id) => { 
    return jwt.sign({ id },
        process.env.JWT_SECRET,
        {
            expiresIn: process.env.JWT_EXPIRES_IN || '30m'
        }
    )
}

exports.generateRefreshToken = (id) => { 
    return jwt.sign({ id },
        process.env.JWT_REFRESH_SECRET,
        {
            expiresIn: process.env.JWT_REFRESH_EXPIRES_IN  || '7d'
        }
    )
}

exports.verifyAccessToken = (token) => {
    return jwt.verify(token, process.env.JWT_SECRET)
}

exports.verifyRefreshToken = (token) => {
    return jwt.verify(token, process.env.JWT_REFRESH_SECRET)
}
