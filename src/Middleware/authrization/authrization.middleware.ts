import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import User from "../../Schema/User/user.schema"; // Assuming you have a User schema

interface DecodedToken {
  userId: string;
  role: string;
  iat: number;
  exp: number;
}

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
    ) as unknown as DecodedToken;

    const user = await User.findById(decoded.userId);

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
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ message: "User not authenticated" });
    }

    if (!roles.includes(req.user.role)) {
      return res
        .status(403)
        .json({ message: "Access forbidden: Insufficient permissions" });
    }

    next();
    return;
  };
};

// Extend Express Request interface to include user property
declare global {
  namespace Express {
    interface Request {
      user?: {
        role: string;
      };
    }
  }
}
