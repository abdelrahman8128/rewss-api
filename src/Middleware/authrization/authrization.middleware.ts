import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import User from "../../Schema/User/user.schema"; // Assuming you have a User schema


export const authMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // Get the authorization header
    const token = req.headers.token;

    // Check if the header exists
    if (!token) {
      return res
        .status(401)
        .json({ message: "Authorization token is required" });
    }

    // Ensure token is a string
    const tokenString = Array.isArray(token) ? token[0] : token;

    // Verify the token
    const decoded = jwt.verify(
      tokenString,
      process.env.JWT_SECRET || "default_secret"
    ) as any;

    const user = await User.findById(decoded.id );

    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    // Attach the full user data to the request
    req.user = {
      // userId: user._id.toString(),
      ...user.toObject(), // Convert mongoose document to plain object
    };

    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      return res.status(401).json({ message: "Invalid token" });
    }
    if (error instanceof jwt.TokenExpiredError) {
      return res.status(401).json({ message: "Token expired" });
    }
    return res.status(500).json({ message: "Internal server error" });
  }
  return;
};

// Optional: Role-based authorization middleware
export const authorize = (roles: string[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Apply authentication middleware first
      // Apply authentication middleware first
      if (!req.user) {
        await new Promise<void>((resolve, reject) => {
          authMiddleware(req, res, (err?: any) => {
        if (err) reject(err);
        else resolve();
          });
        });
        
        // If authMiddleware sets res.headersSent, it means it sent an error response
        if (res.headersSent) {
          return;
        }
      }

      // Now check for role authorization
      if (!roles.includes(req.user.role)) {
        return res
          .status(403)
          .json({ message: "Access forbidden: Insufficient permissions" });
      }

      next();
    } catch (error) {
      if (error instanceof jwt.JsonWebTokenError) {
        return res.status(401).json({ message: "Invalid token" });
      }
      if (error instanceof jwt.TokenExpiredError) {
        return res.status(401).json({ message: "Token expired" });
      }
      return res.status(500).json({ message: "Internal server error" });
    }
    return;
  };
};

// Extend Express Request interface to include user property
declare global {
  namespace Express {
    interface Request {
      user?: any;
    }
  }
}
