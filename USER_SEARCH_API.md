# Admin User Search API

## Overview

This API endpoint allows administrators to search and filter users based on multiple criteria including phone number, email, username, status, and role.

## Endpoint

**GET** `/api/admin/search-users`

**Authorization**: Admin or Super Admin only

## Query Parameters

### Search Parameters

| Parameter | Type   | Required | Description                                             |
| --------- | ------ | -------- | ------------------------------------------------------- |
| `search`  | string | No       | Text to search across phone number, email, and username |
| `status`  | string | No       | Filter by user status                                   |
| `role`    | string | No       | Filter by user role                                     |
| `page`    | number | No       | Page number for pagination (default: 1)                 |
| `limit`   | number | No       | Number of results per page (default: 20, max: 100)      |

### Status Values

- `"active"` - User can access the system normally
- `"inactive"` - User account is inactive
- `"pending"` - User account is pending verification
- `"ban"` - User is banned
- `"deleted"` - User account is deleted
- `"blocked"` - User is blocked

### Role Values

- `"user"` - Regular user
- `"seller"` - Seller account
- `"admin"` - Administrator
- `"super"` - Super Administrator

## Response Format

### Success Response (200)

```json
{
  "message": "Users search completed successfully",
  "data": {
    "users": [
      {
        "_id": "64f8a1b2c3d4e5f6a7b8c9d0",
        "username": "john_doe",
        "name": "John Doe",
        "email": "john@example.com",
        "phoneNumber": "+1234567890",
        "status": "active",
        "role": "user",
        "isPhoneVerified": true,
        "isEmailVerified": true,
        "createdAt": "2023-09-05T10:30:00.000Z",
        "updatedAt": "2023-09-05T10:30:00.000Z"
      }
    ],
    "page": 1,
    "limit": 20,
    "total": 150,
    "totalPages": 8
  }
}
```

### Error Response (400)

```json
{
  "message": "Error message here"
}
```

## Usage Examples

### 1. Search by phone number

```bash
GET /api/admin/search-users?search=+1234567890
```

### 2. Search by email

```bash
GET /api/admin/search-users?search=john@example.com
```

### 3. Search by username

```bash
GET /api/admin/search-users?search=john_doe
```

### 4. Filter by status

```bash
GET /api/admin/search-users?status=active
```

### 5. Filter by role

```bash
GET /api/admin/search-users?role=seller
```

### 6. Combine search and filters

```bash
GET /api/admin/search-users?search=john&status=active&role=user
```

### 7. With pagination

```bash
GET /api/admin/search-users?page=2&limit=10
```

### 8. Search for blocked users

```bash
GET /api/admin/search-users?status=blocked
```

### 9. Search for admin users

```bash
GET /api/admin/search-users?role=admin
```

## Features

- **Text Search**: Searches across phone number, email, and username fields
- **Case Insensitive**: Search is not case-sensitive
- **Partial Matching**: Supports partial text matching
- **Multiple Filters**: Can combine status and role filters
- **Pagination**: Built-in pagination support
- **Security**: Password fields are automatically excluded
- **Sorting**: Results are sorted by creation date (newest first)

## Security Notes

- Only accessible by admin and super admin users
- All user activity is logged for audit purposes
- Input validation is applied to all parameters
- Maximum limit is capped at 100 results per page
- Sensitive user data (passwords) is never returned

## Rate Limiting

This endpoint is subject to the same rate limiting as other admin endpoints.

## Activity Logging

All search queries are logged with the "viewed" action type for audit purposes.
