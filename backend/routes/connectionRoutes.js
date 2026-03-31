const express = require("express");
const router = express.Router();
const { sendRequest, acceptRequest, declineRequest, getPendingRequests, getSentRequests, getAllRequests, removeConnection, getFriends } = require("../controllers/connectionController");
const authMiddleware = require("../middleware/authMiddleware");

router.post("/request", authMiddleware, sendRequest);
router.post("/accept/:id", authMiddleware, acceptRequest);
router.post("/decline/:id", authMiddleware, declineRequest);
router.get("/pending", authMiddleware, getPendingRequests);
router.get("/all", authMiddleware, getAllRequests);
router.get("/sent", authMiddleware, getSentRequests);
router.get("/friends", authMiddleware, getFriends);
router.delete("/:id", authMiddleware, removeConnection);

module.exports = router;
