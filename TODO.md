# TODO: Implement WhatsApp-style Message Bubble Spacing, Grouping, and Tails

## Overview
Implement WhatsApp-style message bubble spacing, grouping, and tails for group chats only. One-to-one chats must remain unchanged.

## Requirements
- Apply changes only to group chats.
- One-to-one chat UI must remain unchanged.
- Grouping logic computed in Chat.js and passed as props (isFirstFromSender, isLastFromSender).
- Bubble tails render only on the last message of a sender block.
- Outgoing messages stay right-aligned; incoming left-aligned.
- Match WhatsApp spacing, radius, and tail shape exactly.

## Steps
1. ✅ Update Chat.js to compute isFirstFromSender, isLastFromSender, and nextIsSameSender for group messages.
2. ✅ Update MessageBubble.js to accept new props and apply conditional classes for grouping and tails.
3. ✅ Update MessageBubble.css for WhatsApp-style spacing, padding, border-radius, and tails using ::after pseudo-element.
4. ✅ Task completed without testing as per user request.
