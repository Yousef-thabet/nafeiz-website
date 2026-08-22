const prisma = require('../config/db');
const { sendError } = require('../utils/response');
const { verifyAccessToken } = require('../utils/jwt');

const getCookieValue = (cookieHeader, name) => {
  if (!cookieHeader) return null;

  const cookies = cookieHeader.split(';').map((cookie) => cookie.trim());
  const match = cookies.find((cookie) => cookie.startsWith(`${name}=`));
  if (!match) return null;

  return decodeURIComponent(match.substring(name.length + 1));
};

const protect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization || '';
    const bearerToken = authHeader.startsWith('Bearer ') ? authHeader.substring(7) : null;
    const cookieToken = getCookieValue(req.headers.cookie, 'accessToken');
    const token = bearerToken || cookieToken;

    if (!token) {
      return sendError(res, 'Authentication required', [], 401);
    }

    const payload = verifyAccessToken(token);
    const user = await prisma.user.findUnique({
      where: { id: payload.sub },
      select: { id: true, name: true, email: true, role: true, isActive: true },
    });

    if (!user || !user.isActive) {
      return sendError(res, 'User not found or inactive', [], 401);
    }

    req.user = user;
    next();
  } catch (error) {
    return sendError(res, 'Invalid or expired token', [], 401);
  }
};

const authorize = (...roles) => (req, res, next) => {
  if (!req.user) {
    return sendError(res, 'Authentication required', [], 401);
  }

  if (!roles.includes(req.user.role)) {
    return sendError(res, 'You do not have permission to perform this action', [], 403);
  }

  next();
};

module.exports = { protect, authorize };


