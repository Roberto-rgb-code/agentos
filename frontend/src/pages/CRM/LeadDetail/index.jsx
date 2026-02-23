import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Sidebar from "@/components/SettingsSidebar";
import { isMobile } from "react-device-detect";
import * as Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import { ArrowLeft, CheckCircle, XCircle, CurrencyDollar } from "@phosphor-icons/react";
import CRM from "@/models/crm";
import paths from "@/utils/paths";
import showToast from "@/utils/toast";

const LeadEventType = {
  CONTACTED: "CONTACTED",
  QUALIFIED: "QUALIFIED",
  CONVERTED: "CONVERTED",
  PURCHASE: "PURCHASE",
  REGISTRATION: "REGISTRATION",
  RESERVATION: "RESERVATION",
};

export default function CRMLeadDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [lead, setLead] = useState(null);
  const [loading, setLoading] = useState(true);
  const [events, setEvents] = useState([]);

  useEffect(() => {
    fetchLead();
    fetchEvents();
  }, [id]);

  async function fetchLead() {
    setLoading(true);
    try {
      const _lead = await CRM.getLead(id);
      setLead(_lead);
    } catch (error) {
      showToast(error.message, "error");
      navigate(paths.crm.leads());
    } finally {
      setLoading(false);
    }
  }

  async function fetchEvents() {
    try {
      const _events = await CRM.getLeadEvents(id);
      setEvents(_events);
    } catch (error) {
      console.error("Failed to fetch events:", error);
    }
  }

  async function handleQuickAction(type) {
    try {
      await CRM.createLeadEvent(id, { type });
      showToast("Event created successfully", "success");
      fetchLead();
      fetchEvents();
    } catch (error) {
      showToast(error.message, "error");
    }
  }

  function getStatusColor(status) {
    const colors = {
      NEW: "bg-blue-500",
      CONTACTED: "bg-yellow-500",
      QUALIFIED: "bg-purple-500",
      CONVERTED: "bg-green-500",
    };
    return colors[status] || "bg-gray-500";
  }

  if (loading) {
    return (
      <div className="w-screen h-screen overflow-hidden bg-theme-bg-container flex">
        <Sidebar />
        <div className="relative md:ml-[2px] md:mr-[16px] md:my-[16px] md:rounded-[16px] bg-theme-bg-secondary w-full h-full overflow-y-scroll p-4 md:p-0">
          <Skeleton.default height="80vh" width="100%" />
        </div>
      </div>
    );
  }

  if (!lead) return null;

  return (
    <div className="w-screen h-screen overflow-hidden bg-theme-bg-container flex">
      <Sidebar />
      <div
        style={{ height: isMobile ? "100%" : "calc(100% - 32px)" }}
        className="relative md:ml-[2px] md:mr-[16px] md:my-[16px] md:rounded-[16px] bg-theme-bg-secondary w-full h-full overflow-y-scroll p-4 md:p-0"
      >
        <div className="flex flex-col w-full px-1 md:pl-6 md:pr-[50px] md:py-6 py-16">
          <button
            onClick={() => navigate(paths.crm.leads())}
            className="flex items-center gap-2 text-theme-text-secondary hover:text-theme-text-primary mb-4"
          >
            <ArrowLeft className="h-5 w-5" />
            Back to Leads
          </button>

          <div className="w-full flex flex-col gap-y-1 pb-6 border-white/10 border-b-2">
            <div className="items-center flex gap-x-4">
              <p className="text-lg leading-6 font-bold text-theme-text-primary">
                {lead.name}
              </p>
              <span
                className={`px-3 py-1 rounded text-xs font-medium ${getStatusColor(
                  lead.status
                )} text-white`}
              >
                {lead.status}
              </span>
            </div>
          </div>

          {/* Lead Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="bg-theme-bg-primary p-4 rounded-lg">
              <h3 className="text-sm font-medium text-theme-text-secondary mb-2">
                Contact Information
              </h3>
              <div className="space-y-1">
                <div className="text-theme-text-primary">
                  <span className="text-theme-text-secondary">Phone: </span>
                  {lead.phone || "-"}
                </div>
                <div className="text-theme-text-primary">
                  <span className="text-theme-text-secondary">Email: </span>
                  {lead.email || "-"}
                </div>
                <div className="text-theme-text-primary">
                  <span className="text-theme-text-secondary">Source: </span>
                  {lead.source || "MANUAL"}
                </div>
              </div>
            </div>

            <div className="bg-theme-bg-primary p-4 rounded-lg">
              <h3 className="text-sm font-medium text-theme-text-secondary mb-2">
                Quick Actions
              </h3>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => handleQuickAction(LeadEventType.CONTACTED)}
                  className="px-3 py-1 bg-yellow-500 text-white rounded text-xs hover:bg-yellow-600"
                >
                  Mark Contacted
                </button>
                <button
                  onClick={() => handleQuickAction(LeadEventType.QUALIFIED)}
                  className="px-3 py-1 bg-purple-500 text-white rounded text-xs hover:bg-purple-600"
                >
                  Mark Qualified
                </button>
                <button
                  onClick={() => handleQuickAction(LeadEventType.CONVERTED)}
                  className="px-3 py-1 bg-green-500 text-white rounded text-xs hover:bg-green-600"
                >
                  Mark Converted
                </button>
              </div>
            </div>
          </div>

          {/* Events Timeline */}
          <div className="bg-theme-bg-primary p-4 rounded-lg">
            <h3 className="text-sm font-medium text-theme-text-secondary mb-4">
              Event Timeline
            </h3>
            {events.length === 0 ? (
              <p className="text-theme-text-secondary text-sm">No events yet</p>
            ) : (
              <div className="space-y-4">
                {events.map((event) => (
                  <div
                    key={event.id}
                    className="flex items-start gap-4 pb-4 border-b border-white/10 last:border-0"
                  >
                    <div className="flex-shrink-0">
                      {event.type === LeadEventType.CONVERTED ||
                      event.type === LeadEventType.PURCHASE ? (
                        <CheckCircle className="h-5 w-5 text-green-500" />
                      ) : (
                        <XCircle className="h-5 w-5 text-blue-500" />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-theme-text-primary">
                          {event.type}
                        </span>
                        {event.revenue && (
                          <span className="flex items-center gap-1 text-green-500 text-sm">
                            <CurrencyDollar className="h-4 w-4" />
                            {parseFloat(event.revenue).toFixed(2)}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-theme-text-secondary mt-1">
                        {new Date(event.createdAt).toLocaleString()}
                      </p>
                      {event.meta && (
                        <p className="text-sm text-theme-text-secondary mt-1">
                          {typeof event.meta === "string"
                            ? event.meta
                            : JSON.stringify(event.meta)}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

