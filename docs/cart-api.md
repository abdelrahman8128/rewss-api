# Cart API Documentation

## Overview

The Cart API allows users to manage multiple shopping carts, with one cart per seller. Users can have multiple carts for different sellers but only one cart per specific seller.

## Authentication

All endpoints require authentication via Bearer token in the Authorization header:

```
Authorization: Bearer <jwt_token>
```

## Endpoints

### 1. List All Carts

**GET** `/cart/`

Returns all carts for the authenticated user.

**Headers:**

```
Authorization: Bearer <jwt_token>
```

**Response Body:**

```json
{
  "carts": [
    {
      "_id": "cart_id_1",
      "userId": "user_id",
      "sellerId": {
        "_id": "seller_id_1",
        "name": "Seller Name",
        "email": "seller@example.com"
      },
      "items": [
        {
          "productId": {
            "_id": "product_id",
            "title": "Product Title",
            "price": 100,
            "thumbnail": "image_url",
            "status": "active",
            "stockStatus": "in_stock"
          },
          "quantity": 2
        }
      ],
      "totalCost": 200,
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

**Status Codes:**

- `200` - Success
- `401` - Unauthorized
- `400` - Bad Request

---

### 2. Get Latest Cart (Legacy)

**GET** `/cart/latest`

Returns the most recently updated cart for the authenticated user.

**Headers:**

```
Authorization: Bearer <jwt_token>
```

**Response Body:**

```json
{
  "_id": "cart_id",
  "userId": "user_id",
  "sellerId": {
    "_id": "seller_id",
    "name": "Seller Name",
    "email": "seller@example.com"
  },
  "items": [
    {
      "productId": {
        "_id": "product_id",
        "title": "Product Title",
        "price": 100,
        "thumbnail": "image_url",
        "status": "active",
        "stockStatus": "in_stock"
      },
      "quantity": 2
    }
  ],
  "totalCost": 200,
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

**Status Codes:**

- `200` - Success
- `401` - Unauthorized
- `500` - Internal Server Error

---

### 3. Get Cart by Seller

**GET** `/cart/by-seller?sellerId=<seller_id>`

Returns the cart for a specific seller.

**Headers:**

```
Authorization: Bearer <jwt_token>
```

**Query Parameters:**

- `sellerId` (required) - The ID of the seller

**Response Body:**

```json
{
  "cart": {
    "_id": "cart_id",
    "userId": "user_id",
    "sellerId": {
      "_id": "seller_id",
      "name": "Seller Name",
      "email": "seller@example.com"
    },
    "items": [
      {
        "productId": {
          "_id": "product_id",
          "title": "Product Title",
          "price": 100,
          "thumbnail": "image_url",
          "status": "active",
          "stockStatus": "in_stock"
        },
        "quantity": 2
      }
    ],
    "totalCost": 200,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

**Status Codes:**

- `200` - Success
- `400` - Bad Request (missing sellerId)
- `401` - Unauthorized

---

### 4. Add Item to Cart

**POST** `/cart/item`

Adds an item to the cart. If no cart exists for the seller, creates a new one.

**Headers:**

```
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

**Request Body:**

```json
{
  "adId": "product_id",
  "quantity": 2
}
```

**Request Body Fields:**

- `adId` (required) - The ID of the product/ad to add
- `quantity` (optional) - Number of items to add (default: 1, minimum: 1)

**Response Body:**

```json
{
  "_id": "cart_id",
  "userId": "user_id",
  "sellerId": {
    "_id": "seller_id",
    "name": "Seller Name",
    "email": "seller@example.com"
  },
  "items": [
    {
      "productId": {
        "_id": "product_id",
        "title": "Product Title",
        "price": 100,
        "thumbnail": "image_url",
        "status": "active",
        "stockStatus": "in_stock"
      },
      "quantity": 2
    }
  ],
  "totalCost": 200,
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

**Status Codes:**

- `200` - Success
- `400` - Bad Request (invalid quantity, missing adId)
- `401` - Unauthorized
- `404` - Product not found or not active

**Error Response:**

```json
{
  "message": "Product not found"
}
```

---

### 5. Update Item Quantity

**PATCH** `/cart/item`

Updates the quantity of an existing item in the cart.

**Headers:**

```
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

**Request Body:**

```json
{
  "adId": "product_id",
  "quantity": 3
}
```

**Request Body Fields:**

- `adId` (required) - The ID of the product/ad to update
- `quantity` (required) - New quantity (minimum: 1)

**Response Body:**

```json
{
  "_id": "cart_id",
  "userId": "user_id",
  "sellerId": {
    "_id": "seller_id",
    "name": "Seller Name",
    "email": "seller@example.com"
  },
  "items": [
    {
      "productId": {
        "_id": "product_id",
        "title": "Product Title",
        "price": 100,
        "thumbnail": "image_url",
        "status": "active",
        "stockStatus": "in_stock"
      },
      "quantity": 3
    }
  ],
  "totalCost": 300,
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

**Status Codes:**

- `200` - Success
- `400` - Bad Request (invalid quantity, missing adId)
- `401` - Unauthorized
- `404` - Cart item not found

**Error Response:**

```json
{
  "message": "Cart item not found"
}
```

---

### 6. Remove Item from Cart

**DELETE** `/cart/item`

Removes an item from the cart.

**Headers:**

```
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

**Request Body:**

```json
{
  "adId": "product_id"
}
```

**Request Body Fields:**

- `adId` (required) - The ID of the product/ad to remove

**Response Body:**

```json
{
  "_id": "cart_id",
  "userId": "user_id",
  "sellerId": {
    "_id": "seller_id",
    "name": "Seller Name",
    "email": "seller@example.com"
  },
  "items": [],
  "totalCost": 0,
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

**Status Codes:**

- `200` - Success
- `400` - Bad Request (missing adId)
- `401` - Unauthorized
- `404` - Cart not found

**Error Response:**

```json
{
  "message": "Cart not found"
}
```

---

### 7. Delete Cart by Seller

**DELETE** `/cart/by-seller?sellerId=<seller_id>`

Deletes the entire cart for a specific seller.

**Headers:**

```
Authorization: Bearer <jwt_token>
```

**Query Parameters:**

- `sellerId` (required) - The ID of the seller

**Response Body:**

```json
{
  "message": "Cart deleted"
}
```

**Status Codes:**

- `200` - Success
- `400` - Bad Request (missing sellerId)
- `401` - Unauthorized

**Error Response:**

```json
{
  "message": "Cart not found"
}
```

---

## Business Rules

1. **One Cart Per Seller**: Each user can have only one cart per seller, but multiple carts for different sellers.

2. **Automatic Cart Creation**: When adding an item, if no cart exists for that seller, a new cart is automatically created.

3. **Stock Validation**: All operations validate product availability and stock status.

4. **Minimum Order Quantity**: Products with stock records must meet minimum order quantity requirements.

5. **Active Products Only**: Only active products can be added to carts.

## Error Handling

All endpoints return consistent error responses with appropriate HTTP status codes:

- `400` - Bad Request (validation errors, missing required fields)
- `401` - Unauthorized (invalid or missing authentication token)
- `404` - Not Found (product, cart, or user not found)
- `500` - Internal Server Error (server-side errors)

Error response format:

```json
{
  "message": "Error description"
}
```
