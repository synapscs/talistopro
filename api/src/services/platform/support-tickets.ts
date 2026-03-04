import { prisma } from '../../lib/db';
import { HTTPException } from 'hono/http-exception';

export const SupportTicketService = {
  async createTicket(data: {
    organizationId: string;
    subject: string;
    description: string;
    category?: string;
    priority?: string;
  }) {
    const organization = await prisma.organization.findUnique({
      where: { id: data.organizationId }
    });

    if (!organization) {
      throw new HTTPException(404, { message: 'Organización no encontrada' });
    }

    const ticket = await prisma.supportTicket.create({
      data: {
        organizationId: data.organizationId,
        subject: data.subject,
        description: data.description,
        category: data.category || 'other',
        priority: data.priority || 'normal',
        status: 'open'
      },
      include: {
        organization: {
          select: {
            id: true,
            name: true,
            slug: true
          }
        }
      }
    });

    return ticket;
  },

  async getAllTickets(filters?: {
    status?: string;
    organizationId?: string;
    category?: string;
    priority?: string;
    assignedToId?: string;
    page?: number;
    limit?: number;
  }) {
    const where: any = {};
    
    if (filters?.status) {
      where.status = filters.status;
    }
    
    if (filters?.organizationId) {
      where.organizationId = filters.organizationId;
    }

    if (filters?.category) {
      where.category = filters.category;
    }

    if (filters?.priority) {
      where.priority = filters.priority;
    }

    if (filters?.assignedToId) {
      where.assignedToId = filters.assignedToId;
    }

    const skip = filters?.page && filters?.limit ? (filters.page - 1) * filters.limit : 0;
    const take = filters?.limit || 50;

    const [tickets, total] = await Promise.all([
      prisma.supportTicket.findMany({
        where,
        orderBy: [
          { priority: 'desc' },
          { createdAt: 'desc' }
        ],
        skip,
        take,
        include: {
          organization: {
            select: {
              id: true,
              name: true,
              slug: true,
              plan: {
                select: {
                  name: true
                }
              }
            }
          },
          assignedTo: {
            include: {
              user: {
                select: {
                  name: true,
                  email: true
                }
              }
            }
          }
        }
      }),
      prisma.supportTicket.count({ where })
    ]);

    return {
      data: tickets,
      total,
      page: filters?.page || 1,
      limit: filters?.limit || 50
    };
  },

  async getTicketById(id: string) {
    const ticket = await prisma.supportTicket.findUnique({
      where: { id },
      include: {
        organization: {
          include: {
            plan: true,
            settings: true
          }
        },
        assignedTo: {
          include: {
            user: {
              select: {
                name: true,
                email: true
              }
            }
          }
        }
      }
    });

    if (!ticket) {
      throw new HTTPException(404, { message: 'Ticket no encontrado' });
    }

    return ticket;
  },

  async updateTicket(
    id: string, 
    data: {
      subject?: string;
      description?: string;
      category?: string;
      priority?: string;
      status?: string;
    }
  ) {
    const ticket = await prisma.supportTicket.findUnique({
      where: { id }
    });

    if (!ticket) {
      throw new HTTPException(404, { message: 'Ticket no encontrado' });
    }

    const updateData: any = { ...data };

    if (data.status === 'resolved' && !ticket.resolvedAt) {
      updateData.resolvedAt = new Date();
    }

    if (data.status === 'closed' && !ticket.closedAt) {
      updateData.closedAt = new Date();
    }

    const updated = await prisma.supportTicket.update({
      where: { id },
      data: updateData,
      include: {
        organization: {
          select: {
            id: true,
            name: true,
            slug: true
          }
        },
        assignedTo: {
          include: {
            user: {
              select: {
                name: true,
                email: true
              }
            }
          }
        }
      }
    });

    return updated;
  },

  async assignTicket(ticketId: string, adminId: string) {
    const ticket = await prisma.supportTicket.findUnique({
      where: { id: ticketId }
    });

    if (!ticket) {
      throw new HTTPException(404, { message: 'Ticket no encontrado' });
    }

    const admin = await prisma.platformAdmin.findUnique({
      where: { id: adminId }
    });

    if (!admin) {
      throw new HTTPException(404, { message: 'Administrador no encontrado' });
    }

    const updated = await prisma.supportTicket.update({
      where: { id: ticketId },
      data: {
        assignedToId: adminId,
        assignedAt: new Date(),
        status: 'in_progress'
      },
      include: {
        organization: {
          select: {
            id: true,
            name: true
          }
        },
        assignedTo: {
          include: {
            user: {
              select: {
                name: true,
                email: true
              }
            }
          }
        }
      }
    });

    return updated;
  },

  async resolveTicket(ticketId: string, resolution: string) {
    const ticket = await prisma.supportTicket.findUnique({
      where: { id: ticketId }
    });

    if (!ticket) {
      throw new HTTPException(404, { message: 'Ticket no encontrado' });
    }

    const updated = await prisma.supportTicket.update({
      where: { id: ticketId },
      data: {
        status: 'resolved',
        resolution,
        resolvedAt: new Date()
      },
      include: {
        organization: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });

    return updated;
  },

  async closeTicket(ticketId: string) {
    const ticket = await prisma.supportTicket.findUnique({
      where: { id: ticketId }
    });

    if (!ticket) {
      throw new HTTPException(404, { message: 'Ticket no encontrado' });
    }

    const updated = await prisma.supportTicket.update({
      where: { id: ticketId },
      data: {
        status: 'closed',
        closedAt: new Date()
      }
    });

    return updated;
  },

  async getStats() {
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    const [
      total,
      open,
      inProgress,
      resolved,
      closed,
      monthlyTickets
    ] = await Promise.all([
      prisma.supportTicket.count(),
      prisma.supportTicket.count({ where: { status: 'open' } }),
      prisma.supportTicket.count({ where: { status: 'in_progress' } }),
      prisma.supportTicket.count({ where: { status: 'resolved' } }),
      prisma.supportTicket.count({ where: { status: 'closed' } }),
      prisma.supportTicket.count({
        where: {
          createdAt: {
            gte: monthStart
          }
        }
      })
    ]);

    return {
      total,
      open,
      inProgress,
      resolved,
      closed,
      monthlyTickets
    };
  }
};
