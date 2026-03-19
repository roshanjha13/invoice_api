const HTTP = require('../config/constant')

exports.success = (res,data,statusCode = HTTP.OK) => {
    return res.status(statusCode).json({
        success: true,
        ...data
    })
}

exports.error = (res,message,statusCode = HTTP.BAD_REQUEST) => {
    return res.status(statusCode).json({
        success: false,
        message
    })
}