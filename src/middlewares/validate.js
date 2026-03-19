const HTTP = require('../config/constant')


const validate = (schema) => {
    return (req,res,next) => {
        const { error } = schema.validate(req.body,{abortEarly : false});

        if (error) {
            const errors = error.details.map((err)=>err.message);
            return res.status(HTTP.BAD_REQUEST).json({
                success: false,
                errors
            });
        }

        next()
    }
}


module.exports  = validate;