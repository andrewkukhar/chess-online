// routes/user.js
const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const permission = require("../middleware/permission");
const {
  getAllUsers,
  getUserById,
  updateUserById,
  changeUserRole,
  deleteUserById,
} = require("../controllers/admin/userController");

// @route   GET /api/users/get-user/:userId
// @desc    Get a user by id
// @access  Private
router.get(
  "/get-user/:userId",
  auth,
  permission(["admin", "ak-admin", "player", "watcher"]),
  getUserById
);

// @route   GET /api/users/get-all-users
// @desc    Get all users
// @access  Private, for Admins only
router.get(
  "/get-all-users",
  auth,
  permission(["admin", "ak-admin"]),
  getAllUsers
);

// @route   PUT /api/users/update-user/:userId
// @desc    Update user by id
// @access  Private
router.put(
  "/update-user/:userId",
  auth,
  permission(["admin", "ak-admin", "player", "watcher"]),
  updateUserById
);

// @route   PUT /api/users/update-user-role/:userId
// @desc    Update user role by Id
// @access  Private
router.put(
  "/update-user-role/:userId",
  auth,
  permission(["admin", "ak-admin", "player", "watcher"]),
  changeUserRole
);

// @route   DELETE /api/users/delete-user/:userId
// @desc    Remove a user
// @access  Private
router.delete(
  "/delete-user/:userId",
  auth,
  permission(["admin", "ak-admin"]),
  deleteUserById
);

module.exports = router;
