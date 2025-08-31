# Block User Toggle Feature

## Overview

The block user functionality has been enhanced to provide a toggle mechanism that switches users between "blocked" and "active" states, rather than just blocking users.

## New Endpoints

### 1. Toggle User Block Status

**POST** `/api/ban/toggle-user-block/:userId`

This endpoint toggles a user's block status:

- If user is currently **active** → sets status to **"blocked"**
- If user is currently **blocked** → sets status to **"active"**

**Response:**

```json
{
  "message": "User blocked successfully" | "User unblocked successfully",
  "data": {
    // User object with updated status
  },
  "action": "blocked" | "unblocked"
}
```

## Existing Endpoints (Preserved)

### 3. Ban User (Original Functionality)

**POST** `/api/ban/ban-user`

The original ban functionality is preserved for cases where you need to ban a user with specific parameters (ban duration, reason, etc.).

### 4. Unban User

**POST** `/api/ban/unban-user`

Unbans a user from the ban system.

## Implementation Details

### Service Methods

- `toggleUserBlock(userId: string)` - Toggles between blocked/active states
- `banUser(userId, bannedBy, banDays, reason)` - Original ban functionality
- `unbanUser(userId, unbannedBy)` - Unban functionality

### User Status Values

The user status field supports these values:

- `"active"` - User can access the system normally
- `"blocked"` - User is blocked from accessing the system
- `"ban"` - User is banned (different from blocked)
- `"inactive"`, `"pending"`, `"deleted"` - Other statuses

## Usage Examples

### Toggle a user's block status:

```bash
POST /api/ban/toggle-user-block/64f8a1b2c3d4e5f6a7b8c9d0
```

## Security

- All endpoints require admin or super admin authorization
- User activity is logged for audit purposes
- Input validation is applied where appropriate

## Migration Notes

- Existing ban functionality remains unchanged
- New toggle functionality provides a simpler way to block/unblock users
- The toggle endpoint is more suitable for quick user management actions
- The original ban endpoint is better for formal disciplinary actions with documentation
