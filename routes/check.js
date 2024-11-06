// routes/check.js
const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const permission = require("../middleware/permission");
const {
  checkAAdminRole,
} = require("../controllers/admin/roleValidationController");

router.get(
  "/check-aadmin-role",
  auth,
  permission(["admin", "ak-admin"]),
  checkAAdminRole
);

module.exports = router;
