import { API_BASE } from "@/utils/constants";
import { baseHeaders } from "@/utils/request";

const CRM = {
  // ============================================
  // LEADS
  // ============================================
  async leads(filters = {}) {
    const params = new URLSearchParams();
    if (filters.status) params.append("status", filters.status);
    if (filters.etapa) params.append("etapa", filters.etapa);
    if (filters.search) params.append("search", filters.search);
    if (filters.ciudad) params.append("ciudad", filters.ciudad);
    if (filters.limit) params.append("limit", filters.limit);
    if (filters.skip) params.append("skip", filters.skip);

    const response = await fetch(
      `${API_BASE}/crm/leads${params.toString() ? `?${params}` : ""}`,
      {
        method: "GET",
        headers: { "Content-Type": "application/json", ...baseHeaders() },
      }
    );

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: "Unknown error" }));
      throw new Error(error.error || "Failed to fetch leads");
    }

    const data = await response.json();
    return data.leads || [];
  },

  async getLead(id) {
    const response = await fetch(`${API_BASE}/crm/leads/${id}`, {
      method: "GET",
      headers: { "Content-Type": "application/json", ...baseHeaders() },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: "Unknown error" }));
      throw new Error(error.error || "Failed to fetch lead");
    }

    const data = await response.json();
    return data.lead;
  },

  async createLead({ name, phone, email, source, status, ciudad, interes, etapa, agente_id }) {
    const response = await fetch(`${API_BASE}/crm/leads`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...baseHeaders() },
      body: JSON.stringify({ name, phone, email, source, status, ciudad, interes, etapa, agente_id }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: "Unknown error" }));
      throw new Error(error.error || "Failed to create lead");
    }

    const data = await response.json();
    return data.lead;
  },

  async updateLead(id, updates) {
    const response = await fetch(`${API_BASE}/crm/leads/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", ...baseHeaders() },
      body: JSON.stringify(updates),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: "Unknown error" }));
      throw new Error(error.error || "Failed to update lead");
    }

    const data = await response.json();
    return data.lead;
  },

  // ============================================
  // LEAD EVENTS
  // ============================================
  async createLeadEvent(leadId, { type, revenue, meta }) {
    const response = await fetch(`${API_BASE}/crm/leads/${leadId}/events`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...baseHeaders() },
      body: JSON.stringify({ type, revenue, meta }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: "Unknown error" }));
      throw new Error(error.error || "Failed to create event");
    }

    const data = await response.json();
    return { event: data.event };
  },

  async getLeadEvents(leadId) {
    const response = await fetch(`${API_BASE}/crm/leads/${leadId}/events`, {
      method: "GET",
      headers: { "Content-Type": "application/json", ...baseHeaders() },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: "Unknown error" }));
      throw new Error(error.error || "Failed to fetch events");
    }

    const data = await response.json();
    return data.events || [];
  },

  // ============================================
  // PIPELINE
  // ============================================
  async pipeline() {
    const response = await fetch(`${API_BASE}/crm/pipeline`, {
      method: "GET",
      headers: { "Content-Type": "application/json", ...baseHeaders() },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: "Unknown error" }));
      throw new Error(error.error || "Failed to fetch pipeline");
    }

    const data = await response.json();
    return data.pipeline || [];
  },

  // ============================================
  // CONVERSACIONES
  // ============================================
  async getConversaciones(leadId) {
    const response = await fetch(`${API_BASE}/crm/leads/${leadId}/conversaciones`, {
      method: "GET",
      headers: { "Content-Type": "application/json", ...baseHeaders() },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: "Unknown error" }));
      throw new Error(error.error || "Failed to fetch conversaciones");
    }

    const data = await response.json();
    return data.conversaciones || [];
  },

  async createConversacion(leadId, { mensaje, rol }) {
    const response = await fetch(`${API_BASE}/crm/leads/${leadId}/conversaciones`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...baseHeaders() },
      body: JSON.stringify({ mensaje, rol }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: "Unknown error" }));
      throw new Error(error.error || "Failed to create conversacion");
    }

    const data = await response.json();
    return data.conversacion;
  },

  // ============================================
  // AGENTES
  // ============================================
  async agentes() {
    const response = await fetch(`${API_BASE}/crm/agentes`, {
      method: "GET",
      headers: { "Content-Type": "application/json", ...baseHeaders() },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: "Unknown error" }));
      throw new Error(error.error || "Failed to fetch agentes");
    }

    const data = await response.json();
    return data.agentes || [];
  },

  async createAgente({ nombre, motor, version, prompt_base }) {
    const response = await fetch(`${API_BASE}/crm/agentes`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...baseHeaders() },
      body: JSON.stringify({ nombre, motor, version, prompt_base }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: "Unknown error" }));
      throw new Error(error.error || "Failed to create agente");
    }

    const data = await response.json();
    return data.agente;
  },

  // ============================================
  // PRODUCTOS
  // ============================================
  async productos(filters = {}) {
    const params = new URLSearchParams();
    if (filters.search) params.append("search", filters.search);
    if (filters.categoria) params.append("categoria", filters.categoria);

    const response = await fetch(
      `${API_BASE}/crm/productos${params.toString() ? `?${params}` : ""}`,
      {
        method: "GET",
        headers: { "Content-Type": "application/json", ...baseHeaders() },
      }
    );

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: "Unknown error" }));
      throw new Error(error.error || "Failed to fetch productos");
    }

    const data = await response.json();
    return data.productos || [];
  },

  async createProducto({ nombre, descripcion, precio, categoria }) {
    const response = await fetch(`${API_BASE}/crm/productos`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...baseHeaders() },
      body: JSON.stringify({ nombre, descripcion, precio, categoria }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: "Unknown error" }));
      throw new Error(error.error || "Failed to create producto");
    }

    const data = await response.json();
    return data.producto;
  },

  async updateProducto(id, updates) {
    const response = await fetch(`${API_BASE}/crm/productos/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", ...baseHeaders() },
      body: JSON.stringify(updates),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: "Unknown error" }));
      throw new Error(error.error || "Failed to update producto");
    }

    const data = await response.json();
    return data.producto;
  },

  // ============================================
  // WEBHOOKS LOG
  // ============================================
  async webhooks(filters = {}) {
    const params = new URLSearchParams();
    if (filters.origen) params.append("origen", filters.origen);

    const response = await fetch(
      `${API_BASE}/crm/webhooks${params.toString() ? `?${params}` : ""}`,
      {
        method: "GET",
        headers: { "Content-Type": "application/json", ...baseHeaders() },
      }
    );

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: "Unknown error" }));
      throw new Error(error.error || "Failed to fetch webhooks");
    }

    const data = await response.json();
    return data.webhooks || [];
  },
};

export default CRM;
