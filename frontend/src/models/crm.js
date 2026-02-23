import { API_BASE } from "@/utils/constants";
import { baseHeaders } from "@/utils/request";

const CRM = {
  async leads(filters = {}) {
    const params = new URLSearchParams();
    if (filters.status) params.append("status", filters.status);
    if (filters.search) params.append("search", filters.search);
    if (filters.limit) params.append("limit", filters.limit);
    if (filters.skip) params.append("skip", filters.skip);

    const response = await fetch(
      `${API_BASE}/api/crm/leads${params.toString() ? `?${params}` : ""}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          ...baseHeaders(),
        },
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
    const response = await fetch(`${API_BASE}/api/crm/leads/${id}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        ...baseHeaders(),
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: "Unknown error" }));
      throw new Error(error.error || "Failed to fetch lead");
    }

    const data = await response.json();
    return data.lead;
  },

  async createLead({ name, phone, email, source, status }) {
    const response = await fetch(`${API_BASE}/api/crm/leads`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...baseHeaders(),
      },
      body: JSON.stringify({ name, phone, email, source, status }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: "Unknown error" }));
      throw new Error(error.error || "Failed to create lead");
    }

    const data = await response.json();
    return data.lead;
  },

  async updateLead(id, updates) {
    const response = await fetch(`${API_BASE}/api/crm/leads/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        ...baseHeaders(),
      },
      body: JSON.stringify(updates),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: "Unknown error" }));
      throw new Error(error.error || "Failed to update lead");
    }

    const data = await response.json();
    return data.lead;
  },

  async createLeadEvent(leadId, { type, revenue, meta }) {
    const response = await fetch(`${API_BASE}/api/crm/leads/${leadId}/events`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...baseHeaders(),
      },
      body: JSON.stringify({ type, revenue, meta }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: "Unknown error" }));
      throw new Error(error.error || "Failed to create event");
    }

    const data = await response.json();
    return { event: data.event, lead: data.lead };
  },

  async getLeadEvents(leadId) {
    const response = await fetch(`${API_BASE}/api/crm/leads/${leadId}/events`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        ...baseHeaders(),
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: "Unknown error" }));
      throw new Error(error.error || "Failed to fetch events");
    }

    const data = await response.json();
    return data.events || [];
  },
};

export default CRM;

