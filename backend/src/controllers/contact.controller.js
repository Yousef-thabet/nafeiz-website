const prisma = require('../config/db');
const { sendSuccess, sendError, formatValidationErrors } = require('../utils/response');
const { contactSchema, noteSchema, statusSchema, assignSchema } = require('../validators/contact.validator');
const { sendLeadToHubSpot } = require('../services/crm.service');

const createContact = async (req, res, next) => {
  try {
    const parsed = contactSchema.safeParse(req.body);
    if (!parsed.success) {
      return sendError(res, 'Invalid contact payload', formatValidationErrors(parsed.error.issues), 400);
    }

    const normalizedPhone = parsed.data.phone || [parsed.data.dialCode, parsed.data.phoneNumber].filter(Boolean).join(' ').trim();

    const data = await prisma.contact.create({
      data: {
        name: parsed.data.name,
        companyName: parsed.data.companyName || null,
        email: parsed.data.email || null,
        phone: normalizedPhone || null,
        country: parsed.data.country || null,
        countryCode: parsed.data.countryCode || null,
        dialCode: parsed.data.dialCode || null,
        phoneNumber: parsed.data.phoneNumber || null,
        visitedChina: parsed.data.visitedChina,
        interests: parsed.data.interests || [],
        estimatedOrderQuantity: parsed.data.estimatedOrderQuantity || null,
        startTimeline: parsed.data.startTimeline || null,
        productReadiness: parsed.data.productReadiness || null,
        message: parsed.data.message,
      },
    });

    const crmResult = await sendLeadToHubSpot(data);
    if (!crmResult.ok) {
      console.error('HubSpot sync failed', crmResult.error || crmResult.reason);
    }

    return sendSuccess(res, 'Contact submitted successfully', { contact: data }, 201);
  } catch (error) {
    next(error);
  }
};

const listContacts = async (req, res, next) => {
  try {
    const page = Math.max(Number(req.query.page) || 1, 1);
    const rawLimit = Number(req.query.limit) || 10;
    const limit = Math.min(Math.max(rawLimit, 1), 50);
    const search = String(req.query.search || '').trim().slice(0, 100);
    const status = String(req.query.status || '').trim();

    const where = {
      ...(req.user.role === 'employee' ? { assignedEmployeeId: req.user.id } : {}),
      ...(search ? { OR: [{ name: { contains: search, mode: 'insensitive' } }, { email: { contains: search, mode: 'insensitive' } }, { message: { contains: search, mode: 'insensitive' } }] } : {}),
      ...(status ? { status } : {}),
    };

    const total = await prisma.contact.count({ where });
    const contacts = await prisma.contact.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
      include: { assignedEmployee: true, notes: { include: { employee: true }, orderBy: { createdAt: 'desc' } } },
    });

    return sendSuccess(res, 'Messages fetched', { contacts, pagination: { page, limit, total, pages: Math.max(Math.ceil(total / limit), 1) } });
  } catch (error) {
    next(error);
  }
};

const getContact = async (req, res, next) => {
  try {
    const contact = await prisma.contact.findFirst({
      where: { id: req.params.id, ...(req.user.role === 'employee' ? { assignedEmployeeId: req.user.id } : {}) },
      include: { assignedEmployee: true, notes: { include: { employee: true }, orderBy: { createdAt: 'desc' } } },
    });
    if (!contact) return sendError(res, 'Message not found', [], 404);
    return sendSuccess(res, 'Message fetched', { contact });
  } catch (error) {
    next(error);
  }
};

const addNote = async (req, res, next) => {
  try {
    const parsed = noteSchema.safeParse(req.body);
    if (!parsed.success) {
      return sendError(res, 'Invalid note payload', formatValidationErrors(parsed.error.issues), 400);
    }

    const contact = await prisma.contact.findFirst({
      where: { id: req.params.id, ...(req.user.role === 'employee' ? { assignedEmployeeId: req.user.id } : {}) },
      select: { id: true },
    });
    if (!contact) return sendError(res, 'Message not found', [], 404);

    const note = await prisma.contactNote.create({ data: { contactId: contact.id, employeeId: req.user.id, note: parsed.data.note.trim() } });
    return sendSuccess(res, 'Note added', { note });
  } catch (error) {
    next(error);
  }
};

const updateStatus = async (req, res, next) => {
  try {
    const parsed = statusSchema.safeParse(req.body);
    if (!parsed.success) {
      return sendError(res, 'Invalid status payload', formatValidationErrors(parsed.error.issues), 400);
    }

    const existing = await prisma.contact.findFirst({
      where: { id: req.params.id, ...(req.user.role === 'employee' ? { assignedEmployeeId: req.user.id } : {}) },
      select: { id: true },
    });
    if (!existing) return sendError(res, 'Message not found', [], 404);

    const contact = await prisma.contact.update({ where: { id: existing.id }, data: { status: parsed.data.status } });
    return sendSuccess(res, 'Status updated', { contact });
  } catch (error) {
    next(error);
  }
};

const assignContact = async (req, res, next) => {
  try {
    const parsed = assignSchema.safeParse(req.body);
    if (!parsed.success) {
      return sendError(res, 'Invalid assignment payload', formatValidationErrors(parsed.error.issues), 400);
    }

    const existing = await prisma.contact.findUnique({ where: { id: req.params.id }, select: { id: true } });
    if (!existing) return sendError(res, 'Message not found', [], 404);

    const employee = await prisma.user.findFirst({ where: { id: parsed.data.employeeId, role: { in: ['admin', 'employee'] }, isActive: true }, select: { id: true } });
    if (!employee) return sendError(res, 'Active employee not found', [], 404);

    const contact = await prisma.contact.update({ where: { id: existing.id }, data: { assignedEmployeeId: employee.id } });
    return sendSuccess(res, 'Contact assigned', { contact });
  } catch (error) {
    next(error);
  }
};

module.exports = { createContact, listContacts, getContact, addNote, updateStatus, assignContact };
