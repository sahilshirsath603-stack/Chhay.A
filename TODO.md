# TODO: Fix Group Create 500 Error

- [x] Update createGroup function in backend/controllers/groupController.js:
  - Convert all member IDs to valid ObjectIds using members.map(id => new mongoose.Types.ObjectId(id))
  - Set adminId as new mongoose.Types.ObjectId(req.user._id)
  - Ensure adminId is included in members once: if (!members.some(id => id.equals(adminId))) { members.push(adminId); }
  - Create group with ObjectIds: const group = await Group.create({ name, members, admins: [adminId], createdBy: adminId });
