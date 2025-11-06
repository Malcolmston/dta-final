# Team Management System

## Overview

A complete team management system allowing users to create teams, invite members, assign roles, and manage team permissions. Available to all user types: **Basic Users**, **Developers**, and **Admins**.

## Features Implemented

### 1. ✅ Team Creation

Users can create teams with:
- Team name (required)
- Description (optional)
- Maximum members (5-10,000)
- Automatic owner assignment

### 2. ✅ Role-Based Access Control

Four distinct roles with different permissions:

| Role | Permissions | Can Be Changed |
|------|-------------|----------------|
| **OWNER** | Full control, cannot be removed | ❌ No |
| **ADMIN** | Add/remove members, change roles | ✅ Yes |
| **DEVELOPER** | Team access, development features | ✅ Yes |
| **BASIC** | Team access, basic features | ✅ Yes |

### 3. ✅ Team Member Management

- **Add Members**: By email address
- **Update Roles**: Change member roles (except owner)
- **Remove Members**: Remove non-owner members
- **Member Limits**: Enforce team capacity (5-10,000)
- **Duplicate Prevention**: Block adding existing members

### 4. ✅ Smart UI

- **Team List Sidebar**: Quick team switching
- **Member Cards**: User avatars and role badges
- **Role Selector**: Dropdown for role changes
- **Modals**: Clean forms for creating teams and adding members
- **Empty States**: Helpful guidance when no teams exist

## Database Schema

### Teams Table

```sql
CREATE TABLE teams (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    ownerId INT NOT NULL,
    maxMembers INT DEFAULT 5,
    isActive BOOLEAN DEFAULT TRUE,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (ownerId) REFERENCES users(id)
);
```

### Team Members Table

```sql
CREATE TABLE team_members (
    id INT PRIMARY KEY AUTO_INCREMENT,
    teamId INT NOT NULL,
    userId INT NOT NULL,
    role ENUM('OWNER', 'ADMIN', 'DEVELOPER', 'BASIC') DEFAULT 'BASIC',
    isActive BOOLEAN DEFAULT TRUE,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (teamId) REFERENCES teams(id) ON DELETE CASCADE,
    FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_team_user (teamId, userId)
);
```

## Entities

### Team Entity

**File:** `/src/entities/Team.ts`

```typescript
@Entity("teams")
export class Team {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: "varchar", length: 255 })
    name: string;

    @Column({ type: "text", nullable: true })
    description: string | null;

    @Column({ type: "int" })
    ownerId: number;

    @ManyToOne(() => User)
    @JoinColumn({ name: "ownerId" })
    owner: User;

    @Column({ type: "int", default: 5 })
    maxMembers: number;

    @Column({ type: "boolean", default: true })
    isActive: boolean;

    @OneToMany(() => TeamMember, member => member.team)
    members: TeamMember[];

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
```

### TeamMember Entity

**File:** `/src/entities/TeamMember.ts`

```typescript
export enum TeamRole {
    OWNER = "OWNER",
    ADMIN = "ADMIN",
    DEVELOPER = "DEVELOPER",
    BASIC = "BASIC"
}

@Entity("team_members")
export class TeamMember {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: "int" })
    teamId: number;

    @ManyToOne(() => Team, team => team.members)
    @JoinColumn({ name: "teamId" })
    team: Team;

    @Column({ type: "int" })
    userId: number;

    @ManyToOne(() => User)
    @JoinColumn({ name: "userId" })
    user: User;

    @Column({
        type: "enum",
        enum: TeamRole,
        default: TeamRole.BASIC
    })
    role: TeamRole;

    @Column({ type: "boolean", default: true })
    isActive: boolean;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
```

## API Endpoints

### Get All Teams

**Endpoint:** `GET /api/dashboard/teams`

**Description:** Fetch all teams where the user is owner or member

**Response:**
```json
{
  "teams": [
    {
      "id": 1,
      "name": "Engineering Team",
      "description": "Core engineering team",
      "ownerId": 5,
      "maxMembers": 50,
      "isActive": true,
      "members": [
        {
          "id": 1,
          "userId": 5,
          "userName": "John Doe",
          "userEmail": "john@example.com",
          "role": "OWNER",
          "isActive": true,
          "createdAt": "2025-01-15T10:00:00Z"
        }
      ]
    }
  ]
}
```

### Create Team

**Endpoint:** `POST /api/dashboard/teams`

**Request Body:**
```json
{
  "name": "Engineering Team",
  "description": "Core engineering team",
  "maxMembers": 50
}
```

**Response:**
```json
{
  "team": {
    "id": 1,
    "name": "Engineering Team",
    "description": "Core engineering team",
    "ownerId": 5,
    "maxMembers": 50,
    "isActive": true,
    "members": [...]
  }
}
```

**Validation:**
- Name is required
- Max members must be 5-10,000
- User must be authenticated

### Add Team Member

**Endpoint:** `POST /api/dashboard/teams/[teamId]/members`

**Request Body:**
```json
{
  "email": "member@example.com",
  "role": "DEVELOPER"
}
```

**Response:**
```json
{
  "member": {
    "id": 2,
    "userId": 10,
    "userName": "Jane Smith",
    "userEmail": "member@example.com",
    "role": "DEVELOPER",
    "isActive": true,
    "createdAt": "2025-01-15T11:00:00Z"
  }
}
```

**Authorization:**
- Only team owner or admin can add members

**Validation:**
- Email is required
- User must exist with that email
- User cannot already be a member
- Team cannot be full

### Update Member Role

**Endpoint:** `PATCH /api/dashboard/teams/[teamId]/members/[memberId]`

**Request Body:**
```json
{
  "role": "ADMIN"
}
```

**Response:**
```json
{
  "member": {
    "id": 2,
    "userId": 10,
    "userName": "Jane Smith",
    "userEmail": "member@example.com",
    "role": "ADMIN",
    "isActive": true,
    "createdAt": "2025-01-15T11:00:00Z"
  }
}
```

**Authorization:**
- Only team owner or admin can update roles

**Validation:**
- Cannot change owner role
- Role must be BASIC, DEVELOPER, or ADMIN

### Remove Team Member

**Endpoint:** `DELETE /api/dashboard/teams/[teamId]/members/[memberId]`

**Response:**
```json
{
  "success": true
}
```

**Authorization:**
- Only team owner or admin can remove members

**Validation:**
- Cannot remove team owner
- Member must exist

## UI Components

### Teams Page

**File:** `/src/app/dashboard/teams/page.tsx`

**Features:**
- Team list sidebar with member counts
- Team details panel
- Create team modal
- Add member modal
- Member management with role selectors
- Empty state for no teams

**Layout:**
```
┌─────────────────────────────────────────────────┐
│  Team Management                    [+ Create]  │
├──────────┬──────────────────────────────────────┤
│ Teams    │  Engineering Team                    │
│          │  Core engineering team               │
│ ✓ Eng    │  50/50 members  ● Active  [+ Add]    │
│   Design │                                       │
│   QA     │  👥 Team Members                      │
│          │  ┌────────────────────────────────┐  │
│          │  │ JS  John Smith  [OWNER]        │  │
│          │  │     john@example.com           │  │
│          │  ├────────────────────────────────┤  │
│          │  │ JD  Jane Doe    [Admin ▼] ✕    │  │
│          │  │     jane@example.com           │  │
│          │  └────────────────────────────────┘  │
└──────────┴──────────────────────────────────────┘
```

### Role Badge Colors

- **OWNER**: Purple (bg-purple-100 text-purple-800)
- **ADMIN**: Blue (bg-blue-100 text-blue-800)
- **DEVELOPER**: Green (bg-green-100 text-green-800)
- **BASIC**: Gray (bg-gray-100 text-gray-800)

## Integration with Dashboard

The Teams tab is automatically added to the dashboard for all user types:

**File:** `/src/app/dashboard/tabs.tsx`

```typescript
// For developers
{
    label: "Teams",
    value: "teams",
    content: <TeamsPage/>
}

// For basic users
{
    label: "Teams",
    value: "teams",
    content: <TeamsPage/>
}

// For admins
{
    label: "Teams",
    value: "teams",
    content: <TeamsPage/>
}
```

## User Flows

### Scenario 1: Create New Team

```
1. User visits /dashboard (any role)
2. Clicks "Teams" tab
3. Sees empty state if no teams
4. Clicks "+ Create Team"
5. Modal opens
6. Fills in:
   - Name: "Engineering Team"
   - Description: "Core engineering"
   - Max Members: 50
7. Clicks "Create Team"
8. Team is created
9. User is automatically added as OWNER
10. Team appears in sidebar
```

### Scenario 2: Add Team Member

```
1. User selects team from sidebar
2. Clicks "+ Add Member"
3. Modal opens
4. Enters:
   - Email: "member@example.com"
   - Role: "Developer"
5. Clicks "Add Member"
6. System finds user by email
7. Checks if user already a member (validation)
8. Checks if team is full (validation)
9. Adds user to team
10. Member appears in team member list
```

### Scenario 3: Change Member Role

```
1. User selects team
2. Views member list
3. Sees dropdown next to member (ADMIN selected)
4. Changes to "DEVELOPER"
5. Role updates immediately
6. Database updated
7. UI reflects new role badge color
```

### Scenario 4: Remove Member

```
1. User selects team
2. Views member list
3. Clicks "Remove" next to member
4. Confirmation dialog appears
5. User confirms
6. Member is removed from team
7. UI updates to remove member card
```

## Permissions Matrix

| Action | OWNER | ADMIN | DEVELOPER | BASIC |
|--------|-------|-------|-----------|-------|
| View team | ✅ | ✅ | ✅ | ✅ |
| Add members | ✅ | ✅ | ❌ | ❌ |
| Remove members | ✅ | ✅ | ❌ | ❌ |
| Change roles | ✅ | ✅ | ❌ | ❌ |
| Edit team settings | ✅ | ❌ | ❌ | ❌ |
| Delete team | ✅ | ❌ | ❌ | ❌ |
| Leave team | ❌ | ✅ | ✅ | ✅ |

**Note:** Owner cannot be removed or leave team (must transfer ownership first)

## Testing

### Test Creating a Team

```bash
# 1. Login to dashboard as any user type
# 2. Click Teams tab
# 3. Click "+ Create Team"
# 4. Fill form:
#    - Name: "Test Team"
#    - Description: "Testing team creation"
#    - Max Members: 10
# 5. Submit form
# 6. Verify team appears in sidebar
# 7. Verify you're listed as OWNER
```

### Test Adding a Member

```bash
# Prerequisites:
# - Create second test user with email
# - Create a team

# 1. Select team from sidebar
# 2. Click "+ Add Member"
# 3. Enter email of second user
# 4. Select role: "Developer"
# 5. Submit form
# 6. Verify member appears in list
# 7. Verify correct role badge

# Test Validations:
# - Try adding same user again (should fail)
# - Try adding non-existent email (should fail)
# - Try adding when team is full (should fail)
```

### Test Role Changes

```bash
# Prerequisites: Team with at least one non-owner member

# 1. Select team
# 2. Find member (not owner)
# 3. Change role dropdown from "Developer" to "Admin"
# 4. Verify role updates immediately
# 5. Verify badge color changes

# Test Restrictions:
# - Try changing OWNER role (should be disabled)
# - Login as basic member, try changing roles (should fail)
```

### Test Removing Members

```bash
# Prerequisites: Team with at least two members

# 1. Select team
# 2. Click "Remove" on non-owner member
# 3. Confirm removal
# 4. Verify member disappears from list
# 5. Verify member count updates

# Test Restrictions:
# - Try removing OWNER (button should not appear)
# - Login as basic member, try removing (should fail)
```

### Test Database Queries

```sql
-- View all teams
SELECT * FROM teams;

-- View team with members
SELECT
    t.id,
    t.name,
    t.description,
    COUNT(tm.id) as member_count,
    t.maxMembers
FROM teams t
LEFT JOIN team_members tm ON t.id = tm.teamId
GROUP BY t.id;

-- View team member roles
SELECT
    t.name as team_name,
    u.name as member_name,
    u.email,
    tm.role,
    tm.isActive
FROM team_members tm
JOIN teams t ON tm.teamId = t.id
JOIN users u ON tm.userId = u.id
WHERE t.id = 1;

-- Check for owner
SELECT * FROM team_members
WHERE teamId = 1 AND role = 'OWNER';
```

## Error Handling

### Common Errors

| Error | Status | Reason | Solution |
|-------|--------|--------|----------|
| Unauthorized | 401 | User not logged in | Login required |
| Team not found | 404 | Invalid team ID | Verify team exists |
| Member not found | 404 | Invalid member ID | Verify member exists |
| User not found | 404 | Email doesn't exist | User must register first |
| Team is full | 400 | Reached max members | Increase maxMembers or remove members |
| Already a member | 400 | Duplicate member | User already in team |
| Cannot remove owner | 400 | Trying to remove owner | Transfer ownership first |
| Forbidden | 403 | Insufficient permissions | Must be owner or admin |

### Error Messages

**Frontend:**
- Clear alert dialogs with specific error messages
- Form validation feedback
- Disabled buttons when actions not allowed

**Backend:**
- Descriptive JSON error responses
- Console logging for debugging
- Proper HTTP status codes

## Best Practices

### Security

1. **Always verify permissions** before allowing actions
2. **Validate all inputs** on both client and server
3. **Check team capacity** before adding members
4. **Prevent duplicate memberships** with unique constraints
5. **Protect owner role** from changes/removal

### Performance

1. **Use database relations** to efficiently load team data
2. **Fetch teams on mount** and cache in state
3. **Optimistic updates** for better UX
4. **Limit query results** when teams grow large

### UX

1. **Empty states** guide users to create first team
2. **Confirmation dialogs** for destructive actions
3. **Disabled states** show why actions unavailable
4. **Visual feedback** with role badge colors
5. **Real-time updates** after all operations

## Future Enhancements

Potential features to add:

- [ ] Team ownership transfer
- [ ] Bulk member import via CSV
- [ ] Team invitations with email
- [ ] Team activity logs
- [ ] Team-specific permissions for resources
- [ ] Team analytics and usage reports
- [ ] Team avatars and branding
- [ ] Public/private team visibility
- [ ] Team member search/filter
- [ ] Pagination for large teams

## Summary

The team management system provides:
- ✅ **Complete CRUD operations** for teams and members
- ✅ **Role-based access control** with 4 permission levels
- ✅ **Clean, intuitive UI** with modals and sidebars
- ✅ **Secure API endpoints** with permission checks
- ✅ **Database relations** for efficient queries
- ✅ **Available to all user types** (Basic, Developer, Admin)
- ✅ **Scalable** from 5 to 10,000 team members
- ✅ **Well-documented** with examples and testing guides

Users can now organize into teams, assign roles, and collaborate effectively within the file conversion platform!
