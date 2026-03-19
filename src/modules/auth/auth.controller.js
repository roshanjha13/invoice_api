const { v4: uuidv4 } = require('uuid');
const { success,error } = require('../../utils/response');
const msg = require('../../config/constant');
const { generateAccessToken, 
    generateRefreshToken, 
    verifyRefreshToken} = require('../../utils/generateToken');
const asyncHandler = require('../../utils/asyncHandler');
const repo = require('./auth.repository');
const { setRefreshToken, getLoginAttempts, setLoginAttempts, deleteLoginAttempts, getRefreshToken, blacklistToken, deleteRefreshToken } = require('../../utils/redisHelper');

const MAX_LOGIN_ATTEMPTS = 5;

exports.register = asyncHandler(async (req, res) => {
    const { name, email, password } = req.body;

    const existing = await repo.findByEmail(email);
    if (existing) return next(error(res, msg.EMAIL_ALREADY_EXISTS, msg.CONFLICT));

    const user = await repo.createUser({
        name,
        email,
        password
    })

    const accessToken = generateAccessToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    await setRefreshToken(user._id, refreshToken);

    return success(
        res, {
            accessToken,
            refreshToken,
            apiKey: user.apiKey
        },
        msg.CREATED
    )
});

exports.login = asyncHandler(async (req, res) => {
    const { email, password} = req.body;

    const attempts = await getLoginAttempts(email);
    if (attempts >= MAX_LOGIN_ATTEMPTS) {
        return next(error(res, msg.ACCOUNT_LOCKED, msg.FORBIDDEN));
    }
        
    const user = await repo.findByEmailWithPassword(email);

    if (!user || !(await user.comparePassword(password))) {
        await setLoginAttempts(email, attempts + 1);
        const remaining = MAX_LOGIN_ATTEMPTS - (attempts + 1);
        return next(error(
            res,
            remaining > 0
                ? `${msg.INVALID_CREDENTIALS} — ${remaining} attempts left`
                : msg.ACCOUNT_LOCKED,
            msg.UNAUTHORIZED_CODE
        ));
    }

    await deleteLoginAttempts(email);

    const accessToken = generateAccessToken(user._id);
    const refreshToken = generateRefreshToken(user._id);
    return success(
        res,
        {
            accessToken,
            refreshToken,
            apikey: user.apiKey,
            plan: user.plan
        }
    );
});

exports.refreshToken = asyncHandler(async (req, res) => {
    const { refreshToken } = req.body;
    if(!refreshToken) return next(error(res, msg.REFRESH_TOKEN_REQUIRED, msg.UNAUTHORIZED_CODE));

    const decoded = verifyRefreshToken(refreshToken);
    const storedToken = await getRefreshToken(decoded._id);

    if(!storedToken || storedToken !== refreshToken) {
        return next(error(res, msg.REFRESH_TOKEN_INVALID, msg.UNAUTHORIZED_CODE));
    }
    
    const accessToken = generateAccessToken(decoded.id);

    return success(res, { accessToken } );
});

exports.logout = asyncHandler(async (req, res) => {
    await blacklistToken(req.token, 15*60);

    await deleteRefreshToken(req.user._id);

    return success(res, { message: msg.LOGOUT_SUCCESS });
});

exports.getApiKey = asyncHandler(async (req, res) => {
    
    const user = await repo.findById(req.user._id);
    return success(
        res,
        {
            apiKey: user.apiKey,
            plan: user.plan
        }
    )
});

exports.regenerateApiKey = asyncHandler(async (req,res) => {
    const user = await repo.updateApiKey(
        req.user._id,
        `inv_${uuidv4().replace(/-/g, '')}`
    );

    return success(res, {apiKey: user.apiKey})
});