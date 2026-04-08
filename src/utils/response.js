const msg = require('../config/constant')

exports.success = (res,data,statusCode = msg.OK) => {
    return res.status(statusCode).json({
        success: true,
        ...data
    })
}

exports.error = (res,message,statusCode = msg.BAD_REQUEST) => {
    return res.status(statusCode).json({
        success: false,
        message
    })
}