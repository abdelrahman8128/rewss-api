import express, { Router } from "express";
import {
  createAddressController,
  getUserAddressesController,
  getAddressByIdController,
  updateAddressController,
  deleteAddressController,
  setDefaultAddressController,
  getDefaultAddressController,
  getAddressStatsController,
} from "./address.controller";
import { authorize } from "../../Middleware/authrization/authrization.middleware";
import { userActivityMiddleware } from "../../Middleware/activity-logging/activity-logging.middleware";
import { validationMiddleware } from "../../Middleware/validation/validation.middleware";
import { CreateAddressDto, UpdateAddressDto } from "./DTO/address.dto";

const router: Router = express.Router();

// User routes (require authentication)
// Create a new address
router.post(
  "/",
  authorize(["user", "seller", "admin", "super"]),
  validationMiddleware(CreateAddressDto),
  userActivityMiddleware("created"),
  createAddressController
);

// Get all addresses for the authenticated user
router.get(
  "/",
  authorize(["user", "seller", "admin", "super"]),
  userActivityMiddleware("viewed"),
  getUserAddressesController
);

// Get default address for the authenticated user
router.get(
  "/default",
  authorize(["user", "seller", "admin", "super"]),
  userActivityMiddleware("viewed"),
  getDefaultAddressController
);

// Get a specific address by ID
router.get(
  "/:addressId",
  authorize(["user", "seller", "admin", "super"]),
  userActivityMiddleware("viewed"),
  getAddressByIdController
);

// Update an address
router.put(
  "/:addressId",
  authorize(["user", "seller", "admin", "super"]),
  validationMiddleware(UpdateAddressDto),
  userActivityMiddleware("updated"),
  updateAddressController
);

// Delete an address
router.delete(
  "/:addressId",
  authorize(["user", "seller", "admin", "super"]),
  userActivityMiddleware("deleted"),
  deleteAddressController
);

// Set an address as default
router.patch(
  "/:addressId/set-default",
  authorize(["user", "seller", "admin", "super"]),
  userActivityMiddleware("updated"),
  setDefaultAddressController
);

// Admin routes (require admin privileges)
// Get address statistics (admin only)
router.get(
  "/admin/statistics",
  authorize(["admin", "super"]),
  userActivityMiddleware("viewed"),
  getAddressStatsController
);

export default router;
