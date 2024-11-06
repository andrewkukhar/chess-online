// middleware/permission.js

module.exports = (requiredRoles) => {
  return (req, res, next) => {
    // console.log("middleware/permission.js: req.user", req.user);
    const { role } = req.user;

    if (!requiredRoles.includes(role)) {
      return res.status(403).json({
        message:
          "Access denied. You do not have permission to perform this action.",
      });
    }

    next();
  };
};
