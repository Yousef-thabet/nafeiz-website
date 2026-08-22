const bcrypt = require('bcrypt');
const prisma = require('../config/db');
const { createAccessToken, createRefreshToken, verifyRefreshToken } = require('../utils/jwt');
const { sendSuccess, sendError, formatValidationErrors } = require('../utils/response');
const { loginSchema, registerSchema, updateEmployeeSchema } = require('../validators/auth.validator');

const getRefreshTokenFromRequest = (req) => {
  const bodyToken = typeof req.body?.refreshToken === 'string' ? req.body.refreshToken : null;
  const cookieToken = req.headers.cookie ? req.headers.cookie.split(';').map((cookie) => cookie.trim()).find((cookie) => cookie.startsWith('refreshToken=')) : null;
  const tokenFromCookie = cookieToken ? decodeURIComponent(cookieToken.substring('refreshToken='.length)) : null;
  return bodyToken || tokenFromCookie;
};

const setAuthCookies = (res, accessToken, refreshToken) => {
  const isProduction = process.env.NODE_ENV === 'production';
  const cookieOptions = {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'none' : 'lax',
    path: '/',
  };

  res.cookie('accessToken', accessToken, { ...cookieOptions, maxAge: 15 * 60 * 1000 });
  res.cookie('refreshToken', refreshToken, { ...cookieOptions, maxAge: 7 * 24 * 60 * 60 * 1000 });
};

const login = async (req, res, next) => {
  try {
    const body = req.body && typeof req.body === 'object' && !Array.isArray(req.body) ? req.body : {};
    const parsed = loginSchema.safeParse(body);
    if (!parsed.success) {
      const hasMissingField = !body.email || !body.password;
      return sendError(res, hasMissingField ? 'Email and password are required' : 'Invalid email or password', [], 400);
    }

    const email = parsed.data.email.toLowerCase();
    const { password } = parsed.data;
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !user.isActive) {
      return sendError(res, 'Invalid credentials', [], 401);
    }

    const passwordMatches = await bcrypt.compare(password, user.password);
    if (!passwordMatches) {
      return sendError(res, 'Invalid credentials', [], 401);
    }

    const accessToken = createAccessToken({ sub: user.id, role: user.role });
    const refreshToken = createRefreshToken({ sub: user.id, role: user.role });
    await prisma.refreshToken.create({ data: { token: refreshToken, userId: user.id, expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) } });
    setAuthCookies(res, accessToken, refreshToken);

    return sendSuccess(res, 'Login successful', { user: { id: user.id, name: user.name, email: user.email, role: user.role } });
  } catch (error) {
    next(error);
  }
};

const refresh = async (req, res, next) => {
  try {
    const refreshToken = getRefreshTokenFromRequest(req);
    if (!refreshToken) return sendError(res, 'Refresh token required', [], 400);

    const payload = verifyRefreshToken(refreshToken);
    const tokenRecord = await prisma.refreshToken.findUnique({ where: { token: refreshToken } });
    if (!tokenRecord || tokenRecord.expiresAt < new Date()) {
      return sendError(res, 'Refresh token expired', [], 401);
    }

    const user = await prisma.user.findUnique({
      where: { id: payload.sub },
      select: { id: true, name: true, email: true, role: true, isActive: true },
    });
    if (!user || !user.isActive || tokenRecord.userId !== user.id) {
      return sendError(res, 'Refresh token is no longer valid', [], 401);
    }

    const accessToken = createAccessToken({ sub: user.id, role: user.role });
    const rotatedRefreshToken = createRefreshToken({ sub: user.id, role: user.role });
    await prisma.$transaction([
      prisma.refreshToken.delete({ where: { token: refreshToken } }),
      prisma.refreshToken.create({ data: { token: rotatedRefreshToken, userId: user.id, expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) } }),
    ]);
    setAuthCookies(res, accessToken, rotatedRefreshToken);
    return sendSuccess(res, 'Token refreshed', { user: { id: user.id, name: user.name, email: user.email, role: user.role } });
  } catch (error) {
    next(error);
  }
};

const logout = async (req, res, next) => {
  try {
    const refreshToken = getRefreshTokenFromRequest(req);
    if (refreshToken) {
      await prisma.refreshToken.deleteMany({ where: { token: refreshToken } }).catch(() => {});
    }
    res.clearCookie('accessToken', { path: '/', httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax' });
    res.clearCookie('refreshToken', { path: '/', httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax' });
    return sendSuccess(res, 'Logout successful');
  } catch (error) {
    next(error);
  }
};

const createEmployee = async (req, res, next) => {
  try {
    if (req.user.role !== 'admin') {
      return sendError(res, 'Only admins can create employees', [], 403);
    }

    const parsed = registerSchema.safeParse(req.body);
    if (!parsed.success) {
      return sendError(res, 'Invalid employee payload', formatValidationErrors(parsed.error.issues), 400);
    }

    const passwordHash = await bcrypt.hash(parsed.data.password, 10);
    const user = await prisma.user.create({
      data: {
        name: parsed.data.name,
        email: parsed.data.email,
        password: passwordHash,
        role: parsed.data.role || 'employee',
      },
    });

    return sendSuccess(res, 'Employee created', { user: { id: user.id, name: user.name, email: user.email, role: user.role, isActive: user.isActive } });
  } catch (error) {
    next(error);
  }
};

const listEmployees = async (req, res, next) => {
  try {
    const employees = await prisma.user.findMany({
      where: { role: { in: ['admin', 'employee'] } },
      select: { id: true, name: true, email: true, role: true, isActive: true, createdAt: true, updatedAt: true },
      orderBy: { createdAt: 'desc' },
    });
    return sendSuccess(res, 'Employees fetched', { employees });
  } catch (error) {
    next(error);
  }
};

const updateEmployee = async (req, res, next) => {
  try {
    const { id } = req.params;
    const parsed = updateEmployeeSchema.safeParse(req.body);
    if (!parsed.success) {
      return sendError(res, 'Invalid employee payload', formatValidationErrors(parsed.error.issues), 400);
    }

    const payload = parsed.data;
    const existing = await prisma.user.findUnique({ where: { id } });
    if (!existing) return sendError(res, 'Employee not found', [], 404);

    if (existing.role === 'admin' && req.user.role !== 'admin') {
      return sendError(res, 'Only admins can manage admin accounts', [], 403);
    }

    if (req.user.id === id && (payload.isActive === false || payload.role === 'employee')) {
      return sendError(res, 'You cannot deactivate or demote your own account', [], 400);
    }

    if (req.user.role !== 'admin' && req.user.id !== id) {
      return sendError(res, 'You can only update your own profile', [], 403);
    }

    const data = {};
    if (typeof payload.name === 'string' && payload.name.trim().length >= 2) data.name = payload.name.trim();
    if (typeof payload.isActive === 'boolean') {
      if (req.user.role !== 'admin') {
        return sendError(res, 'Only admins can change active status', [], 403);
      }
      data.isActive = payload.isActive;
    }
    if (typeof payload.password === 'string' && payload.password.length >= 6) {
      data.password = await bcrypt.hash(payload.password, 10);
    }

    if (payload.email || payload.role) {
      if (req.user.role !== 'admin') {
        return sendError(res, 'Only admins can change email or role', [], 403);
      }
      if (payload.email) {
        const email = String(payload.email).trim().toLowerCase();
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
          return sendError(res, 'Invalid email format', [], 400);
        }
        data.email = email;
      }
      if (payload.role) {
        if (!['admin', 'employee'].includes(payload.role)) {
          return sendError(res, 'Invalid role', [], 400);
        }
        data.role = payload.role;
      }
    }

    if (existing.role === 'admin' && (data.role === 'employee' || data.isActive === false)) {
      const adminCount = await prisma.user.count({ where: { role: 'admin', isActive: true } });
      if (adminCount <= 1) {
        return sendError(res, 'At least one active admin must remain', [], 400);
      }
    }

    const user = await prisma.user.update({ where: { id }, data });
    return sendSuccess(res, 'Employee updated', { user: { id: user.id, name: user.name, email: user.email, role: user.role, isActive: user.isActive } });
  } catch (error) {
    next(error);
  }
};

const deleteEmployee = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (req.user.id === id) {
      return sendError(res, 'You cannot delete your own account', [], 400);
    }

    const employee = await prisma.user.findUnique({ where: { id } });
    if (!employee) return sendError(res, 'Employee not found', [], 404);

    const adminCount = await prisma.user.count({ where: { role: 'admin' } });
    if (employee.role === 'admin' && adminCount <= 1) {
      return sendError(res, 'At least one admin must remain', [], 400);
    }

    await prisma.user.delete({ where: { id } });
    return sendSuccess(res, 'Employee deleted');
  } catch (error) {
    next(error);
  }
};

module.exports = { login, refresh, logout, createEmployee, listEmployees, updateEmployee, deleteEmployee };
