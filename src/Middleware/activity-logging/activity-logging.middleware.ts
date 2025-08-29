import { Request, Response, NextFunction } from "express";
import ActivityLogService from "../../modules/ActivityLog/activity-log.service";
import { Types } from "mongoose";

interface LoggingRequest extends Request {
  user?: {
    _id: Types.ObjectId;
    role: string;
    email: string;
  };
  sessionID?: string;
}

/**
 * Middleware to automatically log user activities based on HTTP methods and routes
 */
export const activityLoggingMiddleware = (
  entityType:
    | "ad"
    | "stock"
    | "user"
    | "order"
    | "payment"
    | "auth"
    | "system"
    | "other" = "other",
  customAction?: string,
  customDescription?: string
) => {
  return async (req: LoggingRequest, res: Response, next: NextFunction) => {
    // Store original res.json to intercept response
    const originalJson = res.json;

    res.json = function (body: any) {
      // Only log if request was successful (2xx status codes)
      if (res.statusCode >= 200 && res.statusCode < 300 && req.user) {
        // Don't await this to avoid blocking the response
        logActivity(
          req,
          res,
          entityType,
          customAction,
          customDescription,
          body
        ).catch((error) => console.error("Failed to log activity:", error));
      }

      return originalJson.call(this, body);
    };

    next();
  };
};

/**
 * Helper function to determine action based on HTTP method and route
 */
function getActionFromRequest(
  req: LoggingRequest,
  customAction?: string
): string {
  if (customAction) return customAction;

  const method = req.method.toLowerCase();
  const path = req.route?.path || req.path;

  // Authentication actions
  if (path.includes("/auth/login")) return "login";
  if (path.includes("/auth/logout")) return "logout";
  if (path.includes("/auth/register")) return "register";
  if (path.includes("/auth/reset")) return "password_reset";

  // Generic CRUD actions
  switch (method) {
    case "post":
      if (path.includes("/reserve")) return "reserved";
      if (path.includes("/buy")) return "bought";
      return "created";
    case "get":
      return "viewed";
    case "put":
    case "patch":
      return "updated";
    case "delete":
      return "deleted";
    default:
      return method;
  }
}

/**
 * Helper function to determine category based on action and entity type
 */
function getCategoryFromAction(
  action: string,
  entityType: string
):
  | "create"
  | "read"
  | "update"
  | "delete"
  | "auth"
  | "transaction"
  | "system"
  | "other" {
  // Authentication actions
  if (
    ["login", "logout", "register", "password_reset", "token_refresh"].includes(
      action
    )
  ) {
    return "auth";
  }

  // Transaction actions
  if (["reserved", "bought", "sold", "refunded", "paid"].includes(action)) {
    return "transaction";
  }

  // CRUD actions
  if (["created", "create"].includes(action)) return "create";
  if (["viewed", "view", "read"].includes(action)) return "read";
  if (["updated", "update", "adjusted"].includes(action)) return "update";
  if (["deleted", "delete"].includes(action)) return "delete";

  return "other";
}

/**
 * Helper function to generate description based on request
 */
function generateDescription(
  req: LoggingRequest,
  action: string,
  entityType: string,
  customDescription?: string
): string {
  if (customDescription) return customDescription;

  const entityId =
    req.params.id || req.params.adId || req.params.userId || "unknown";
  const userRole = req.user?.role || "user";

  switch (action) {
    case "login":
      return `User logged in`;
    case "logout":
      return `User logged out`;
    case "register":
      return `New user registered`;
    case "created":
      return `${userRole} created ${entityType} ${entityId}`;
    case "viewed":
      return `${userRole} viewed ${entityType} ${entityId}`;
    case "updated":
      return `${userRole} updated ${entityType} ${entityId}`;
    case "deleted":
      return `${userRole} deleted ${entityType} ${entityId}`;
    case "reserved":
      return `${userRole} reserved stock for ${entityType} ${entityId}`;
    case "bought":
      return `${userRole} purchased stock for ${entityType} ${entityId}`;
    default:
      return `${userRole} performed ${action} on ${entityType} ${entityId}`;
  }
}

/**
 * Helper function to extract entity ID from request
 */
function getEntityIdFromRequest(
  req: LoggingRequest
): Types.ObjectId | undefined {
  const id =
    req.params.id || req.params.adId || req.params.userId || req.params.stockId;
  if (id && Types.ObjectId.isValid(id)) {
    return new Types.ObjectId(String(id));
  }
  return undefined;
}

/**
 * Helper function to get severity based on action
 */
function getSeverity(action: string): "low" | "medium" | "high" | "critical" {
  const highSeverityActions = ["deleted", "password_reset", "role_changed"];
  const mediumSeverityActions = ["created", "updated", "refunded", "cancelled"];

  if (highSeverityActions.includes(action)) return "high";
  if (mediumSeverityActions.includes(action)) return "medium";
  return "low";
}

/**
 * Main logging function
 */
async function logActivity(
  req: LoggingRequest,
  res: Response,
  entityType: string,
  customAction?: string,
  customDescription?: string,
  responseBody?: any
) {
  try {
    if (!req.user) return;

    const action = getActionFromRequest(req, customAction);
    const category = getCategoryFromAction(action, entityType);
    const description = generateDescription(
      req,
      action,
      entityType,
      customDescription
    );
    const entityId = getEntityIdFromRequest(req);
    const severity = getSeverity(action);

    // Extract metadata from request and response
    const metadata: any = {
      method: req.method,
      path: req.path,
      statusCode: res.statusCode,
      userRole: req.user.role,
      userEmail: req.user.email,
    };

    // Add request body for create/update operations (excluding sensitive data)
    if (
      ["post", "put", "patch"].includes(req.method.toLowerCase()) &&
      req.body
    ) {
      const sanitizedBody = { ...req.body };
      // Remove sensitive fields
      delete sanitizedBody.password;
      delete sanitizedBody.token;
      delete sanitizedBody.otp;
      metadata.requestBody = sanitizedBody;
    }

    // Add response data for successful operations
    if (responseBody && responseBody.success) {
      metadata.responseSuccess = true;
      if (responseBody.data && typeof responseBody.data === "object") {
        metadata.responseDataType = Array.isArray(responseBody.data)
          ? "array"
          : "object";
      }
    }

    await ActivityLogService.logActivity(
      req.user._id,
      action,
      description,
      metadata,
      req.ip,
      req.get("User-Agent")
    );
  } catch (error) {
    console.error("Activity logging failed:", error);
    // Don't throw error to avoid breaking the main request flow
  }
}

/**
 * Middleware specifically for authentication activities
 */
export const authActivityMiddleware = (
  action: "login" | "logout" | "register" | "password_reset"
) => {
  return activityLoggingMiddleware("auth", action, `User ${action} activity`);
};

/**
 * Middleware specifically for ad activities
 */
export const adActivityMiddleware = (customAction?: string) => {
  return activityLoggingMiddleware("ad", customAction);
};

/**
 * Middleware specifically for stock activities
 */
export const stockActivityMiddleware = (customAction?: string) => {
  return activityLoggingMiddleware("stock", customAction);
};

/**
 * Middleware specifically for user profile activities
 */
export const userActivityMiddleware = (customAction?: string) => {
  return activityLoggingMiddleware("user", customAction);
};

/**
 * Generic middleware that can be applied to any route
 */
export const genericActivityMiddleware = activityLoggingMiddleware;
