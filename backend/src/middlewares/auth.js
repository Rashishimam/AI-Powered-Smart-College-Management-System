const { verifyToken } = require('../utils/jwt');
const { query } = require('../config/db');

// Authenticate JWT Token
const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. No authentication token provided.'
      });
    }

    const token = authHeader.split(' ')[1];
    const decoded = verifyToken(token);

    // Fetch user from DB to ensure account is active and still exists
    const userRes = await query('SELECT id, name, email, role, college_id, department, phone, avatar, status FROM users WHERE id = $1', [decoded.id]);
    
    if (userRes.rows.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'User belonging to this token no longer exists.'
      });
    }

    const user = userRes.rows[0];
    if (user.status !== 'active') {
      return res.status(403).json({
        success: false,
        message: 'Account has been suspended or deactivated.'
      });
    }

    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired authentication token.',
      error: err.message
    });
  }
};

// Require Specific Roles (RBAC)
const requireRole = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized. Please login.'
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Forbidden. You do not have permission for this resource. Required: [${allowedRoles.join(', ')}], Found: [${req.user.role}]`
      });
    }

    next();
  };
};

module.exports = {
  authenticateToken,
  requireRole
};
