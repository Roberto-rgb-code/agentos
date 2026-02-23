import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Sidebar from "@/components/SettingsSidebar";
import { isMobile } from "react-device-detect";
import * as Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import {
  ArrowLeft,
  PaperPlaneTilt,
  ChatDots,
  Phone,
  Envelope,
  MapPin,
  Tag,
} from "@phosphor-icons/react";
import CRM from "@/models/crm";
import paths from "@/utils/paths";
import showToast from "@/utils/toast";
import CTAButton from "@/components/lib/CTAButton";

const EtapaPipeline = {
  NUEVO_CLIENTE: { label: "Nuevo Cliente", color: "bg-blue-500", prob: 25 },
  COTIZACION_ENVIADA: { label: "Cotización Enviada", color: "bg-yellow-500", prob: 50 },
  INTERES_AVANZADO: { label: "Interés Avanzado", color: "bg-purple-500", prob: 75 },
  CERRADA: { label: "Cerrada", color: "bg-green-500", prob: 100 },
  RECHAZADA: { label: "Rechazada", color: "bg-red-500", prob: 0 },
};

export default function CRMLeadDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [lead, setLead] = useState(null);
  const [loading, setLoading] = useState(true);
  const [conversaciones, setConversaciones] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [tab, setTab] = useState("conversaciones");

  useEffect(() => {
    fetchLead();
    fetchConversaciones();
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

  async function fetchConversaciones() {
    try {
      const _conv = await CRM.getConversaciones(id);
      setConversaciones(_conv);
    } catch (error) {
      console.error("Failed to fetch conversaciones:", error);
    }
  }

  async function handleSendMessage() {
    if (!newMessage.trim()) return;
    try {
      await CRM.createConversacion(id, { mensaje: newMessage, rol: "user" });
      setNewMessage("");
      fetchConversaciones();
    } catch (error) {
      showToast(error.message, "error");
    }
  }

  async function handleChangeEtapa(newEtapa) {
    try {
      const updated = await CRM.updateLead(id, { etapa: newEtapa });
      setLead(updated);
      showToast(`Etapa actualizada a ${EtapaPipeline[newEtapa]?.label}`, "success");
    } catch (error) {
      showToast(error.message, "error");
    }
  }

  async function handleUpdateField(field, value) {
    try {
      const updated = await CRM.updateLead(id, { [field]: value });
      setLead(updated);
    } catch (error) {
      showToast(error.message, "error");
    }
  }

  if (loading || !lead) {
    return (
      <div className="w-screen h-screen overflow-hidden bg-theme-bg-container flex">
        <Sidebar />
        <div className="flex-1 flex items-center justify-center">
          <Skeleton.default height={400} width={600} />
        </div>
      </div>
    );
  }

  const etapaInfo = EtapaPipeline[lead.etapa] || { label: lead.etapa, color: "bg-gray-500", prob: 0 };

  return (
    <div className="w-screen h-screen overflow-hidden bg-theme-bg-container flex">
      <Sidebar />
      <div
        style={{ height: isMobile ? "100%" : "calc(100% - 32px)" }}
        className="relative md:ml-[2px] md:mr-[16px] md:my-[16px] md:rounded-[16px] bg-theme-bg-secondary w-full h-full overflow-y-scroll p-4 md:p-0"
      >
        <div className="flex flex-col w-full px-1 md:pl-6 md:pr-[50px] md:py-6 py-16">
          {/* Back + Header */}
          <button
            onClick={() => navigate(paths.crm.leads())}
            className="flex items-center gap-2 text-theme-text-secondary hover:text-theme-text-primary mb-4 text-sm"
          >
            <ArrowLeft className="h-4 w-4" /> Volver a leads
          </button>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column: Lead Info */}
            <div className="lg:col-span-1 space-y-4">
              {/* Lead Card */}
              <div className="bg-theme-bg-primary rounded-lg p-4 border border-white/10">
                <h2 className="text-xl font-bold text-theme-text-primary mb-3">
                  {lead.name}
                </h2>

                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-theme-text-secondary">
                    <Phone className="h-4 w-4" />
                    <span>{lead.phone || "Sin teléfono"}</span>
                  </div>
                  <div className="flex items-center gap-2 text-theme-text-secondary">
                    <Envelope className="h-4 w-4" />
                    <span>{lead.email || "Sin email"}</span>
                  </div>
                  <div className="flex items-center gap-2 text-theme-text-secondary">
                    <MapPin className="h-4 w-4" />
                    <span>{lead.ciudad || "Sin ciudad"}</span>
                  </div>
                  <div className="flex items-center gap-2 text-theme-text-secondary">
                    <Tag className="h-4 w-4" />
                    <span>{lead.interes || "Sin interés definido"}</span>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-white/10">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-theme-text-secondary">Probabilidad de cierre</span>
                    <span className="text-sm font-bold text-theme-text-primary">
                      {lead.probabilidad_cierre}%
                    </span>
                  </div>
                  <div className="w-full bg-theme-bg-secondary rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${etapaInfo.color} transition-all duration-500`}
                      style={{ width: `${lead.probabilidad_cierre}%` }}
                    ></div>
                  </div>
                </div>

                <div className="mt-3 text-xs text-theme-text-secondary">
                  <div>Origen: {lead.source}</div>
                  <div>Creado: {new Date(lead.createdAt).toLocaleString()}</div>
                  {lead.agente && <div>Agente: {lead.agente.nombre}</div>}
                </div>
              </div>

              {/* Pipeline Stage Selector */}
              <div className="bg-theme-bg-primary rounded-lg p-4 border border-white/10">
                <h3 className="text-sm font-semibold text-theme-text-primary mb-3">
                  Pipeline Comercial
                </h3>
                <div className="space-y-2">
                  {Object.entries(EtapaPipeline).map(([key, info]) => (
                    <button
                      key={key}
                      onClick={() => handleChangeEtapa(key)}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-all ${
                        lead.etapa === key
                          ? `${info.color} text-white font-medium`
                          : "bg-theme-bg-secondary text-theme-text-secondary hover:bg-theme-bg-primary/80"
                      }`}
                    >
                      <span>{info.label}</span>
                      <span className="text-xs opacity-75">{info.prob}%</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Column: Tabs (Conversaciones / Eventos / WhatsApp) */}
            <div className="lg:col-span-2 flex flex-col">
              {/* Tabs */}
              <div className="flex gap-1 mb-4 border-b border-white/10">
                {["conversaciones", "eventos", "whatsapp"].map((t) => (
                  <button
                    key={t}
                    onClick={() => setTab(t)}
                    className={`px-4 py-2 text-sm capitalize transition-colors ${
                      tab === t
                        ? "text-theme-text-primary border-b-2 border-blue-500 font-medium"
                        : "text-theme-text-secondary hover:text-theme-text-primary"
                    }`}
                  >
                    {t === "conversaciones" ? "Conversaciones" : t === "eventos" ? "Eventos" : "WhatsApp"}
                  </button>
                ))}
              </div>

              {/* Tab Content */}
              {tab === "conversaciones" && (
                <div className="flex flex-col flex-1">
                  {/* Messages */}
                  <div className="flex-1 bg-theme-bg-primary rounded-lg border border-white/10 p-4 mb-4 max-h-[500px] overflow-y-auto">
                    {conversaciones.length === 0 ? (
                      <div className="flex flex-col items-center justify-center h-full text-theme-text-secondary py-12">
                        <ChatDots className="h-12 w-12 mb-3 opacity-30" />
                        <p className="text-sm">No hay conversaciones aún</p>
                        <p className="text-xs mt-1">Envía el primer mensaje</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {conversaciones.map((conv) => (
                          <div
                            key={conv.id}
                            className={`flex ${conv.rol === "user" ? "justify-end" : "justify-start"}`}
                          >
                            <div
                              className={`max-w-[75%] px-3 py-2 rounded-lg text-sm ${
                                conv.rol === "user"
                                  ? "bg-blue-600 text-white"
                                  : conv.rol === "assistant"
                                  ? "bg-theme-bg-secondary text-theme-text-primary"
                                  : "bg-yellow-500/20 text-yellow-300 text-xs"
                              }`}
                            >
                              <p>{conv.mensaje}</p>
                              <p className="text-[10px] opacity-60 mt-1">
                                {new Date(conv.fecha).toLocaleString()}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Message Input */}
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                      placeholder="Escribe un mensaje..."
                      className="flex-1 px-4 py-2 bg-theme-bg-primary border border-theme-border rounded-lg text-theme-text-primary text-sm"
                    />
                    <CTAButton onClick={handleSendMessage} disabled={!newMessage.trim()}>
                      <PaperPlaneTilt className="h-4 w-4" />
                    </CTAButton>
                  </div>
                </div>
              )}

              {tab === "eventos" && (
                <div className="bg-theme-bg-primary rounded-lg border border-white/10 p-4 max-h-[500px] overflow-y-auto">
                  {lead.events && lead.events.length > 0 ? (
                    <div className="space-y-3">
                      {lead.events.map((event) => (
                        <div
                          key={event.id}
                          className="flex items-center gap-3 p-3 bg-theme-bg-secondary rounded-lg"
                        >
                          <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                          <div className="flex-1">
                            <span className="text-sm font-medium text-theme-text-primary">
                              {event.type}
                            </span>
                            {event.revenue && (
                              <span className="ml-2 text-green-400 text-xs">
                                ${parseFloat(event.revenue).toFixed(2)}
                              </span>
                            )}
                          </div>
                          <span className="text-xs text-theme-text-secondary">
                            {new Date(event.createdAt).toLocaleString()}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-center text-theme-text-secondary py-8 text-sm">
                      No hay eventos registrados
                    </p>
                  )}
                </div>
              )}

              {tab === "whatsapp" && (
                <div className="bg-theme-bg-primary rounded-lg border border-white/10 p-4 max-h-[500px] overflow-y-auto">
                  {lead.messages && lead.messages.length > 0 ? (
                    <div className="space-y-3">
                      {lead.messages.map((msg) => (
                        <div
                          key={msg.id}
                          className="p-3 bg-theme-bg-secondary rounded-lg"
                        >
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs text-green-400 font-medium">
                              WhatsApp
                            </span>
                            <span className="text-xs text-theme-text-secondary">
                              {msg.wa_from}
                            </span>
                          </div>
                          <p className="text-sm text-theme-text-primary">{msg.body}</p>
                          <p className="text-[10px] text-theme-text-secondary mt-1">
                            {new Date(msg.received_at).toLocaleString()}
                          </p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-center text-theme-text-secondary py-8 text-sm">
                      No hay mensajes de WhatsApp
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
