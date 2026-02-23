import { useEffect, useState } from "react";
import Sidebar from "@/components/SettingsSidebar";
import { isMobile } from "react-device-detect";
import * as Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import { UserPlus, MagnifyingGlass } from "@phosphor-icons/react";
import CRM from "@/models/crm";
import { useNavigate } from "react-router-dom";
import paths from "@/utils/paths";
import { useModal } from "@/hooks/useModal";
import ModalWrapper from "@/components/ModalWrapper";
import CTAButton from "@/components/lib/CTAButton";
import showToast from "@/utils/toast";

const LeadStatus = {
  NEW: "NEW",
  CONTACTED: "CONTACTED",
  QUALIFIED: "QUALIFIED",
  CONVERTED: "CONVERTED",
};

export default function CRMLeads() {
  const { isOpen, openModal, closeModal } = useModal();
  const navigate = useNavigate();
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("");
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchLeads();
  }, [statusFilter, search]);

  async function fetchLeads() {
    setLoading(true);
    try {
      const filters = {};
      if (statusFilter) filters.status = statusFilter;
      if (search) filters.search = search;
      const _leads = await CRM.leads(filters);
      setLeads(_leads);
    } catch (error) {
      showToast(error.message, "error");
    } finally {
      setLoading(false);
    }
  }

  async function handleCreateLead({ name, phone, email, source }) {
    try {
      const lead = await CRM.createLead({ name, phone, email, source });
      showToast("Lead created successfully", "success");
      closeModal();
      fetchLeads();
      navigate(paths.crm.lead(lead.id));
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

  return (
    <div className="w-screen h-screen overflow-hidden bg-theme-bg-container flex">
      <Sidebar />
      <div
        style={{ height: isMobile ? "100%" : "calc(100% - 32px)" }}
        className="relative md:ml-[2px] md:mr-[16px] md:my-[16px] md:rounded-[16px] bg-theme-bg-secondary w-full h-full overflow-y-scroll p-4 md:p-0"
      >
        <div className="flex flex-col w-full px-1 md:pl-6 md:pr-[50px] md:py-6 py-16">
          <div className="w-full flex flex-col gap-y-1 pb-6 border-white/10 border-b-2">
            <div className="items-center flex gap-x-4">
              <p className="text-lg leading-6 font-bold text-theme-text-primary">
                CRM - Leads
              </p>
            </div>
            <p className="text-xs leading-[18px] font-base text-theme-text-secondary">
              Manage your sales leads and track their progress through the pipeline.
            </p>
          </div>

          {/* Filters */}
          <div className="flex gap-4 mb-4">
            <div className="flex-1 relative">
              <MagnifyingGlass className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-theme-text-secondary" />
              <input
                type="text"
                placeholder="Search leads..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-theme-bg-primary border border-theme-border rounded-lg text-theme-text-primary placeholder-theme-text-secondary"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 bg-theme-bg-primary border border-theme-border rounded-lg text-theme-text-primary"
            >
              <option value="">All Status</option>
              {Object.values(LeadStatus).map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </div>

          <div className="w-full justify-end flex">
            <CTAButton
              onClick={openModal}
              className="mt-3 mr-0 mb-4 md:-mb-6 z-10"
            >
              <UserPlus className="h-4 w-4" weight="bold" /> Add Lead
            </CTAButton>
          </div>

          {loading ? (
            <Skeleton.default
              height="80vh"
              width="100%"
              highlightColor="var(--theme-bg-primary)"
              baseColor="var(--theme-bg-secondary)"
              count={1}
              className="w-full p-4 rounded-b-2xl rounded-tr-2xl rounded-tl-sm mt-8"
              containerClassName="flex w-full"
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left rounded-lg min-w-[640px] border-spacing-0">
                <thead className="text-theme-text-secondary text-xs leading-[18px] font-bold uppercase border-white/10 border-b">
                  <tr>
                    <th scope="col" className="px-6 py-3 rounded-tl-lg">
                      Name
                    </th>
                    <th scope="col" className="px-6 py-3">
                      Contact
                    </th>
                    <th scope="col" className="px-6 py-3">
                      Status
                    </th>
                    <th scope="col" className="px-6 py-3">
                      Source
                    </th>
                    <th scope="col" className="px-6 py-3">
                      Created
                    </th>
                    <th scope="col" className="px-6 py-3 rounded-tr-lg">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {leads.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="px-6 py-8 text-center text-theme-text-secondary">
                        No leads found
                      </td>
                    </tr>
                  ) : (
                    leads.map((lead) => (
                      <tr
                        key={lead.id}
                        className="border-white/10 border-b hover:bg-theme-bg-primary cursor-pointer"
                        onClick={() => navigate(paths.crm.lead(lead.id))}
                      >
                        <td className="px-6 py-4 text-theme-text-primary font-medium">
                          {lead.name}
                        </td>
                        <td className="px-6 py-4 text-theme-text-secondary">
                          <div>{lead.phone || "-"}</div>
                          <div className="text-xs">{lead.email || "-"}</div>
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(
                              lead.status
                            )} text-white`}
                          >
                            {lead.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-theme-text-secondary">
                          {lead.source || "MANUAL"}
                        </td>
                        <td className="px-6 py-4 text-theme-text-secondary">
                          {new Date(lead.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(paths.crm.lead(lead.id));
                            }}
                            className="text-blue-500 hover:text-blue-400"
                          >
                            View
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
        <ModalWrapper isOpen={isOpen}>
          <NewLeadModal closeModal={closeModal} onCreate={handleCreateLead} />
        </ModalWrapper>
      </div>
    </div>
  );
}

function NewLeadModal({ closeModal, onCreate }) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [source, setSource] = useState("MANUAL");

  function handleSubmit(e) {
    e.preventDefault();
    if (!name.trim()) {
      showToast("Name is required", "error");
      return;
    }
    onCreate({ name, phone, email, source });
  }

  return (
    <div className="bg-theme-bg-primary rounded-lg p-6 max-w-md w-full">
      <h2 className="text-xl font-bold text-theme-text-primary mb-4">
        Create New Lead
      </h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-theme-text-secondary mb-1">
            Name *
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-3 py-2 bg-theme-bg-secondary border border-theme-border rounded-lg text-theme-text-primary"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-theme-text-secondary mb-1">
            Phone
          </label>
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="w-full px-3 py-2 bg-theme-bg-secondary border border-theme-border rounded-lg text-theme-text-primary"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-theme-text-secondary mb-1">
            Email
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-3 py-2 bg-theme-bg-secondary border border-theme-border rounded-lg text-theme-text-primary"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-theme-text-secondary mb-1">
            Source
          </label>
          <select
            value={source}
            onChange={(e) => setSource(e.target.value)}
            className="w-full px-3 py-2 bg-theme-bg-secondary border border-theme-border rounded-lg text-theme-text-primary"
          >
            <option value="MANUAL">Manual</option>
            <option value="WHATSAPP">WhatsApp</option>
            <option value="WEBSITE">Website</option>
            <option value="REFERRAL">Referral</option>
          </select>
        </div>
        <div className="flex gap-2 justify-end">
          <button
            type="button"
            onClick={closeModal}
            className="px-4 py-2 text-theme-text-secondary hover:text-theme-text-primary"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
            Create
          </button>
        </div>
      </form>
    </div>
  );
}

