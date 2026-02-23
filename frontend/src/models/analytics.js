import { API_BASE } from "@/utils/constants";
import { baseHeaders } from "@/utils/request";

const Analytics = {
  async getKPIs({ from, to } = {}) {
    const params = new URLSearchParams();
    if (from) params.append("from", from);
    if (to) params.append("to", to);

    const response = await fetch(
      `${API_BASE}/api/analytics/kpis${params.toString() ? `?${params}` : ""}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          ...baseHeaders(),
        },
      }
    );

    if (!response.ok) {
      if (response.status === 403) {
        throw new Error("This feature requires a premium plan");
      }
      const error = await response.json().catch(() => ({ error: "Unknown error" }));
      throw new Error(error.error || "Failed to fetch KPIs");
    }

    const data = await response.json();
    return data;
  },
};

export default Analytics;

