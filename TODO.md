# Enforce WhatsApp-style Global User Profile Consistency

## Backend Changes
- [ ] Update `getUsers` controller to return `name`, `about`, `avatar` for all users

## Frontend Changes
- [ ] Add `getUsers` function to API service
- [ ] Update Chat.js:
  - [ ] Remove JWT usage for profile data
  - [ ] Fetch users list using API service on initial load
  - [ ] Update both `currentUser` and `users[]` state after profile changes
  - [ ] Display `user.name` with fallback to `user.email` in UI
- [ ] Update UserProfile.js:
  - [ ] Remove JWT usage
  - [ ] Avoid direct mutation of user object
  - [ ] Use props to determine self-editing permissions
