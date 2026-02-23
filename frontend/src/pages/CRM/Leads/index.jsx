import { useEffect, useState } from "react";
import Sidebar from "@/components/SettingsSidebar";
import { isMobile } from "react-device-detect";
import * as Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import { UserPlus, MagnifyingGlass, FunnelSimple, ArrowLeft } from "@phosphor-icons/react";
import CRM from "@/models/crm";
import { useNavigate } from "react-router-dom";
import paths from "@/utils/paths";
import { useModal } from "@/hooks/useModal";
import ModalWrapper from "@/components/ModalWrapper";
import CTAButton from "@/components/lib/CTAButton";
import showToast from "@/utils/toast";

const EtapaPipeline = {
  NUEVO_CLIENTE: { label: "Nuevo Cliente", color: "bg-blue-500", prob: "25%" },
  COTIZACION_ENVIADA: { label: "Cotización Enviada", color: "bg-yellow-500", prob: "50%" },
  INTERES_AVANZADO: { label: "Interés Avanzado", color: "bg-purple-500", prob: "75%" },
  CERRADA: { label: "Cerrada", color: "bg-green-500", prob: "100%" },
  RECHAZADA: { label: "Rechazada", color: "bg-red-500", prob: "0%" },
};

export default function CRMLeads() {
  const { isOpen, openModal, closeModal } = useModal();
  const navigate = useNavigate();
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [etapaFilter, setEtapaFilter] = useState("");
  const [search, setSearch] = useState("");
  const [pipeline, setPipeline] = useState([]);

  useEffect(() => {
    fetchLeads();
    fetchPipeline();
  }, [etapaFilter, search]);

  async function fetchLeads() {
    setLoading(true);
    try {
      const filters = {};
      if (etapaFilter) filters.etapa = etapaFilter;
      if (search) filters.search = search;
      const _leads = await CRM.leads(filters);
      setLeads(_leads);
    } catch (error) {
      showToast(error.message, "error");
    } finally {
      setLoading(false);
    }
  }

  async function fetchPipeline() {
    try {
      const _pipeline = await CRM.pipeline();
      setPipeline(_pipeline);
    } catch (error) {
      console.error("Failed to fetch pipeline:", error);
    }
  }

  async function handleCreateLead(formData) {
    try {
      const lead = await CRM.createLead(formData);
      showToast("Lead creado exitosamente", "success");
      closeModal();
      fetchLeads();
      fetchPipeline();
      navigate(paths.crm.lead(lead.id));
    } catch (error) {
      showToast(error.message, "error");
    }
  }

  function getEtapaInfo(etapa) {
    return EtapaPipeline[etapa] || { label: etapa, color: "bg-gray-500", prob: "?" };
  }

  return (
    <div className="w-screen h-screen overflow-hidden bg-theme-bg-container flex">
      <Sidebar />
      <div
        style={{ height: isMobile ? "100%" : "calc(100% - 32px)" }}
        className="relative md:ml-[2px] md:mr-[16px] md:my-[16px] md:rounded-[16px] bg-theme-bg-secondary w-full h-full overflow-y-scroll p-4 md:p-0"
      >
        <div className="flex flex-col w-full px-1 md:pl-6 md:pr-[50px] md:py-6 py-16">
          {/* Header */}
          <div className="w-full flex flex-col gap-y-1 pb-6 border-white/10 border-b-2">
            <div className="items-center flex gap-x-4">
              <button
                onClick={() => navigate(paths.home())}
                className="p-2 rounded-lg text-theme-text-secondary hover:text-white hover:bg-theme-bg-primary transition-colors"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
              <p className="text-lg leading-6 font-bold text-theme-text-primary">
                CRM - Pipeline Comercial
              </p>
            </div>
            <p className="text-xs leading-[18px] font-base text-theme-text-secondary">
              Gestión de leads, clientes y pipeline de ventas
            </p>
          </div>

          {/* Pipeline Summary Cards */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mt-4">
            {Object.entries(EtapaPipeline).map(([key, info]) => {
              const stat = pipeline.find((p) => p.etapa === key);
              return (
                <div
                  key={key}
                  onClick={() => setEtapaFilter(etapaFilter === key ? "" : key)}
                  className={`cursor-pointer rounded-lg p-3 border transition-all ${
                    etapaFilter === key
                      ? "border-white/40 bg-theme-bg-primary"
                      : "border-white/10 bg-theme-bg-primary/50 hover:border-white/20"
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <div className={`w-2 h-2 rounded-full ${info.color}`}></div>
                    <span className="text-xs text-theme-text-secondary">{info.label}</span>
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-xl font-bold text-theme-text-primary">
                      {stat?.count || 0}
                    </span>
                    <span className="text-xs text-theme-text-secondary">{info.prob}</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Filters */}
          <div className="flex gap-4 mt-4 mb-4">
            <div className="relative flex-1">
              <MagnifyingGlass className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-theme-text-secondary" />
              <input
                type="text"
                placeholder="Buscar leads (nombre, teléfono, email, ciudad)..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-theme-bg-primary border border-theme-border rounded-lg text-theme-text-primary placeholder-theme-text-secondary text-sm"
              />
            </div>
            <select
              value={etapaFilter}
              onChange={(e) => setEtapaFilter(e.target.value)}
              className="px-4 py-2 bg-theme-bg-primary border border-theme-border rounded-lg text-theme-text-primary text-sm"
            >
              <option value="">Todas las etapas</option>
              {Object.entries(EtapaPipeline).map(([key, info]) => (
                <option key={key} value={key}>{info.label}</option>
              ))}
            </select>
          </div>

          <div className="w-full justify-end flex">
            <CTAButton onClick={openModal} className="mt-3 mr-0 mb-4 md:-mb-6 z-10">
              <UserPlus className="h-4 w-4" weight="bold" /> Nuevo Lead
            </CTAButton>
          </div>

          {/* Table */}
          {loading ? (
            <Skeleton.default
              height="60vh"
              width="100%"
              highlightColor="var(--theme-bg-primary)"
              baseColor="var(--theme-bg-secondary)"
              count={1}
              className="w-full p-4 rounded-b-2xl rounded-tr-2xl rounded-tl-sm mt-8"
              containerClassName="flex w-full"
            />
          ) : (
            <div className="overflow-x-auto mt-4">
              <table className="w-full text-sm text-left">
                <thead className="text-xs uppercase text-theme-text-secondary border-b border-white/10">
                  <tr>
                    <th className="px-4 py-3">Nombre</th>
                    <th className="px-4 py-3">Contacto</th>
                    <th className="px-4 py-3">Ciudad</th>
                    <th className="px-4 py-3">Etapa</th>
                    <th className="px-4 py-3">Probabilidad</th>
                    <th className="px-4 py-3">Interés</th>
                    <th className="px-4 py-3">Origen</th>
                    <th className="px-4 py-3">Fecha</th>
                  </tr>
                </thead>
                <tbody>
                  {leads.length === 0 ? (
                    <tr>
                      <td colSpan="8" className="px-6 py-8 text-center text-theme-text-secondary">
                        No se encontraron leads
                      </td>
                    </tr>
                  ) : (
                    leads.map((lead) => {
                      const etapaInfo = getEtapaInfo(lead.etapa);
                      return (
                        <tr
                          key={lead.id}
                          className="border-white/10 border-b hover:bg-theme-bg-primary cursor-pointer transition-colors"
                          onClick={() => navigate(paths.crm.lead(lead.id))}
                        >
                          <td className="px-4 py-3 text-theme-text-primary font-medium">
                            {lead.name}
                          </td>
                          <td className="px-4 py-3 text-theme-text-secondary">
                            <div>{lead.phone || "-"}</div>
                            <div className="text-xs opacity-70">{lead.email || "-"}</div>
                          </td>
                          <td className="px-4 py-3 text-theme-text-secondary">
                            {lead.ciudad || "-"}
                          </td>
                          <td className="px-4 py-3">
                            <span className={`px-2 py-1 rounded text-xs font-medium ${etapaInfo.color} text-white`}>
                              {etapaInfo.label}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-theme-text-primary font-semibold">
                            {lead.probabilidad_cierre}%
                          </td>
                          <td className="px-4 py-3 text-theme-text-secondary text-xs max-w-[150px] truncate">
                            {lead.interes || "-"}
                          </td>
                          <td className="px-4 py-3 text-theme-text-secondary text-xs">
                            {lead.source || "MANUAL"}
                          </td>
                          <td className="px-4 py-3 text-theme-text-secondary text-xs">
                            {new Date(lead.createdAt).toLocaleDateString()}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Create Lead Modal */}
        <ModalWrapper isOpen={isOpen}>
          <CreateLeadModal onClose={closeModal} onSubmit={handleCreateLead} />
        </ModalWrapper>
      </div>
    </div>
  );
}

function CreateLeadModal({ onClose, onSubmit }) {
  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    ciudad: "",
    interes: "",
    source: "MANUAL",
    etapa: "NUEVO_CLIENTE",
  });

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  return (
    <div className="relative w-full max-w-lg max-h-full">
      <div className="relative bg-theme-bg-secondary rounded-lg shadow">
        <div className="flex items-center justify-between p-4 border-b border-white/10">
          <h3 className="text-xl font-semibold text-theme-text-primary">
            Nuevo Lead
          </h3>
          <button
            onClick={onClose}
            className="text-theme-text-secondary hover:text-theme-text-primary"
          >
            ✕
          </button>
        </div>
        <div className="p-4 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-theme-text-secondary mb-1">
                Nombre *
              </label>
              <input
                name="name"
                value={form.name}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-theme-bg-primary border border-theme-border rounded-lg text-theme-text-primary text-sm"
                placeholder="Nombre del lead"
              />
            </div>
            <div>
              <label className="block text-sm text-theme-text-secondary mb-1">
                Teléfono
              </label>
              <input
                name="phone"
                value={form.phone}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-theme-bg-primary border border-theme-border rounded-lg text-theme-text-primary text-sm"
                placeholder="+52 55 1234 5678"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-theme-text-secondary mb-1">
                Email
              </label>
              <input
                name="email"
                value={form.email}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-theme-bg-primary border border-theme-border rounded-lg text-theme-text-primary text-sm"
                placeholder="email@ejemplo.com"
              />
            </div>
            <div>
              <label className="block text-sm text-theme-text-secondary mb-1">
                Ciudad
              </label>
              <input
                name="ciudad"
                value={form.ciudad}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-theme-bg-primary border border-theme-border rounded-lg text-theme-text-primary text-sm"
                placeholder="Ciudad del lead"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm text-theme-text-secondary mb-1">
              Interés / Producto
            </label>
            <input
              name="interes"
              value={form.interes}
              onChange={handleChange}
              className="w-full px-3 py-2 bg-theme-bg-primary border border-theme-border rounded-lg text-theme-text-primary text-sm"
              placeholder="¿En qué está interesado?"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-theme-text-secondary mb-1">
                Origen
              </label>
              <select
                name="source"
                value={form.source}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-theme-bg-primary border border-theme-border rounded-lg text-theme-text-primary text-sm"
              >
                <option value="MANUAL">Manual</option>
                <option value="WHATSAPP">WhatsApp</option>
                <option value="WEB_CHAT">Web Chat</option>
                <option value="API_EXTERNA">API Externa</option>
                <option value="REFERIDO">Referido</option>
              </select>
            </div>
            <div>
              <label className="block text-sm text-theme-text-secondary mb-1">
                Etapa Pipeline
              </label>
              <select
                name="etapa"
                value={form.etapa}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-theme-bg-primary border border-theme-border rounded-lg text-theme-text-primary text-sm"
              >
                {Object.entries(EtapaPipeline).map(([key, info]) => (
                  <option key={key} value={key}>{info.label} ({info.prob})</option>
                ))}
              </select>
            </div>
          </div>
        </div>
        <div className="flex items-center justify-end gap-4 p-4 border-t border-white/10">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm text-theme-text-secondary hover:text-theme-text-primary"
          >
            Cancelar
          </button>
          <CTAButton
            onClick={() => onSubmit(form)}
            disabled={!form.name}
          >
            Crear Lead
          </CTAButton>
        </div>
      </div>
    </div>
  );
}
