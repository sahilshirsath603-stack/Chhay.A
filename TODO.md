# TODO: Implement WhatsApp-style Avatar Upload and Global Propagation

## Backend Changes
- [x] Add `uploadAvatar` function in `authController.js`: Handle multipart/form-data upload, save file to uploads/, update user.avatar with URL, return updated user.
- [x] Add route `POST /api/users/avatar` in `authRoutes.js` with authMiddleware and multer.

## Frontend Changes
- [x] Update `UserProfile.js`: Make avatar clickable for self-profile, open file picker on click, upload via POST /api/users/avatar, update local state and call onProfileUpdate on success.
- [x] Update `Chat.js`: After profile update, refresh currentUser and users list. Replace initials with avatar images where avatar exists, else show initials. Ensure read-only for others.

## Testing
- [ ] Test avatar upload and propagation.
- [ ] Ensure persistence after refresh.
- [ ] Verify no breaking changes to existing uploads.
