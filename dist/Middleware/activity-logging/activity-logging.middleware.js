"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.genericActivityMiddleware = exports.userActivityMiddleware = exports.stockActivityMiddleware = exports.adActivityMiddleware = exports.authActivityMiddleware = exports.activityLoggingMiddleware = void 0;
const activity_log_service_1 = __importDefault(require("../../modules/ActivityLog/activity-log.service"));
const mongoose_1 = require("mongoose");
const activityLoggingMiddleware = (entityType = "other", customAction, customDescription) => {
    return async (req, res, next) => {
        const originalJson = res.json;
        res.json = function (body) {
            if (res.statusCode >= 200 && res.statusCode < 300 && req.user) {
                logActivity(req, res, entityType, customAction, customDescription, body)
                    .catch(error => console.error("Failed to log activity:", error));
            }
            return originalJson.call(this, body);
        };
        next();
    };
};
exports.activityLoggingMiddleware = activityLoggingMiddleware;
function getActionFromRequest(req, customAction) {
    if (customAction)
        return customAction;
    const method = req.method.toLowerCase();
    const path = req.route?.path || req.path;
    if (path.includes('/auth/login'))
        return 'login';
    if (path.includes('/auth/logout'))
        return 'logout';
    if (path.includes('/auth/register'))
        return 'register';
    if (path.includes('/auth/reset'))
        return 'password_reset';
    switch (method) {
        case 'post':
            if (path.includes('/reserve'))
                return 'reserved';
            if (path.includes('/buy'))
                return 'bought';
            return 'created';
        case 'get':
            return 'viewed';
        case 'put':
        case 'patch':
            return 'updated';
        case 'delete':
            return 'deleted';
        default:
            return method;
    }
}
function getCategoryFromAction(action, entityType) {
    if (['login', 'logout', 'register', 'password_reset', 'token_refresh'].includes(action)) {
        return 'auth';
    }
    if (['reserved', 'bought', 'sold', 'refunded', 'paid'].includes(action)) {
        return 'transaction';
    }
    if (['created', 'create'].includes(action))
        return 'create';
    if (['viewed', 'view', 'read'].includes(action))
        return 'read';
    if (['updated', 'update', 'adjusted'].includes(action))
        return 'update';
    if (['deleted', 'delete'].includes(action))
        return 'delete';
    return 'other';
}
function generateDescription(req, action, entityType, customDescription) {
    if (customDescription)
        return customDescription;
    const entityId = req.params.id || req.params.adId || req.params.userId || 'unknown';
    const userRole = req.user?.role || 'user';
    switch (action) {
        case 'login':
            return `User logged in`;
        case 'logout':
            return `User logged out`;
        case 'register':
            return `New user registered`;
        case 'created':
            return `${userRole} created ${entityType} ${entityId}`;
        case 'viewed':
            return `${userRole} viewed ${entityType} ${entityId}`;
        case 'updated':
            return `${userRole} updated ${entityType} ${entityId}`;
        case 'deleted':
            return `${userRole} deleted ${entityType} ${entityId}`;
        case 'reserved':
            return `${userRole} reserved stock for ${entityType} ${entityId}`;
        case 'bought':
            return `${userRole} purchased stock for ${entityType} ${entityId}`;
        default:
            return `${userRole} performed ${action} on ${entityType} ${entityId}`;
    }
}
function getEntityIdFromRequest(req) {
    const id = req.params.id || req.params.adId || req.params.userId || req.params.stockId;
    if (id && mongoose_1.Types.ObjectId.isValid(id)) {
        return new mongoose_1.Types.ObjectId(id);
    }
    return undefined;
}
function getSeverity(action) {
    const highSeverityActions = ['deleted', 'password_reset', 'role_changed'];
    const mediumSeverityActions = ['created', 'updated', 'refunded', 'cancelled'];
    if (highSeverityActions.includes(action))
        return 'high';
    if (mediumSeverityActions.includes(action))
        return 'medium';
    return 'low';
}
async function logActivity(req, res, entityType, customAction, customDescription, responseBody) {
    try {
        if (!req.user)
            return;
        const action = getActionFromRequest(req, customAction);
        const category = getCategoryFromAction(action, entityType);
        const description = generateDescription(req, action, entityType, customDescription);
        const entityId = getEntityIdFromRequest(req);
        const severity = getSeverity(action);
        const metadata = {
            method: req.method,
            path: req.path,
            statusCode: res.statusCode,
            userRole: req.user.role,
            userEmail: req.user.email
        };
        if (['post', 'put', 'patch'].includes(req.method.toLowerCase()) && req.body) {
            const sanitizedBody = { ...req.body };
            delete sanitizedBody.password;
            delete sanitizedBody.token;
            delete sanitizedBody.otp;
            metadata.requestBody = sanitizedBody;
        }
        if (responseBody && responseBody.success) {
            metadata.responseSuccess = true;
            if (responseBody.data && typeof responseBody.data === 'object') {
                metadata.responseDataType = Array.isArray(responseBody.data) ? 'array' : 'object';
            }
        }
        await activity_log_service_1.default.logActivity(req.user._id, action, description, metadata, req.ip, req.get('User-Agent'));
    }
    catch (error) {
        console.error("Activity logging failed:", error);
    }
}
const authActivityMiddleware = (action) => {
    return (0, exports.activityLoggingMiddleware)('auth', action, `User ${action} activity`);
};
exports.authActivityMiddleware = authActivityMiddleware;
const adActivityMiddleware = (customAction) => {
    return (0, exports.activityLoggingMiddleware)('ad', customAction);
};
exports.adActivityMiddleware = adActivityMiddleware;
const stockActivityMiddleware = (customAction) => {
    return (0, exports.activityLoggingMiddleware)('stock', customAction);
};
exports.stockActivityMiddleware = stockActivityMiddleware;
const userActivityMiddleware = (customAction) => {
    return (0, exports.activityLoggingMiddleware)('user', customAction);
};
exports.userActivityMiddleware = userActivityMiddleware;
exports.genericActivityMiddleware = exports.activityLoggingMiddleware;
