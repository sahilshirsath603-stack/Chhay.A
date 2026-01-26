# WhatsApp Avatar Viewer Implementation

## Completed Tasks
- [x] Create AvatarViewerModal.js - Fullscreen modal with dark backdrop, centered avatar (image or initials), close button (✕), ESC/backdrop close. For self: "Change photo" button reusing existing crop flow. For others: view-only.
- [x] Modify UserProfile.js - Update avatar click to open AvatarViewerModal instead of file input.
- [x] Modify Chat.js - Add click handlers to sidebar and chat header avatars to open AvatarViewerModal.
- [x] Add AvatarViewerModal import and state management in Chat.js
- [x] Add AvatarViewerModal JSX in Chat.js

## Next Steps
- [ ] Test modal from UserProfile, sidebar, and chat header.
- [ ] Verify close methods (✕, ESC, backdrop).
- [ ] Confirm "Change photo" only for self-profile.
- [ ] Run application and test functionality
- [ ] Commit changes with: git add . && git commit -m "feat(ui): fullscreen avatar viewer with self-only change photo"
