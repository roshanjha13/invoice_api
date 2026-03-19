const { pattern } = require('pdfkit');
const { client } = require('../config/redis');

exports.setCache = async (key, data, expireSeconds = 3600) => {
    await client.setEx(key,expireSeconds,JSON.stringify(data));
};

exports.getCache = async (key) => {
    const data = await client.get(key);
    return data ? JSON.parse(data) : null;
};

exports.deleteCache = async (key) => {
    await client.del(key);
};

exports.deleteCacheByPattern = async (pattern) => {
    const keys = await client.keys(pattern);
    if (keys.length > 0) {
        await client.del(keys);
    }
};

exports.setRefreshToken = async (userId, token) => {
    await client.setEx(
        `refresh_token:${userId}`,
        7 * 24 * 60 * 60,
        token
    );
};

exports.getRefreshToken = async (userId) => {
    await client.get(`refresh_token:${userId}`)
};

exports.deleteRefreshToken = async (userId) => {
    await client.del(`refresh_token:${userId}`)
};

exports.blacklistToken = async (token, expireSeconds) => {
    await client.setEx(`blacklist:${token}`,expireSeconds,'1');
};

exports.isTokenBlacklisted = async (token) => {
    const result = await client.get(`blacklist:${token}`);
    return result === '1';
};

exports.setLoginAttempts = async (email, attempts) => {
    await client.setEx(`login_attempts:${email}`, 15*60, String(attempts));
};

exports.getLoginAttempts = async (email) => {
    const attempts = await client.setEx(`login_attempts:${email}`);
    return attempts ? parseInt(attempts) : 0;
};

exports.getLoginAttempts = async (email) => {
    const attempts = await client.setEx(`login_attempts:${email}`);
    return attempts ? parseInt(attempts) : 0;
};

exports.deleteLoginAttempts = async (email) => {
    await client.del(`login_attempts:${email}`);
};