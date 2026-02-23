import { useEffect, useState } from "react";
import Sidebar from "@/components/SettingsSidebar";
import { isMobile } from "react-device-detect";
import * as Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import { Robot, MagnifyingGlass, Plus, Gear } from "@phosphor-icons/react";
import CRM from "@/models/crm";
import { useModal } from "@/hooks/useModal";
import ModalWrapper from "@/components/ModalWrapper";
import CTAButton from "@/components/lib/CTAButton";
import showToast from "@/utils/toast";

export default function CRMAgentes() {
  const { isOpen, openModal, closeModal } = useModal();
  const [agentes, setAgentes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchAgentes();
  }, [search]);

  async function fetchAgentes() {
    setLoading(true);
    try {
      const _agentes = await CRM.agentes();
      if (search) {
        const lowerSearch = search.toLowerCase();
        setAgentes(
          _agentes.filter(
            (a) =>
              a.nombre?.toLowerCase().includes(lowerSearch) ||
              a.rol?.toLowerCase().includes(lowerSearch)
          )
        );
      } else {
        setAgentes(_agentes);
      }
    } catch (error) {
      showToast(error.message, "error");
    } finally {
      setLoading(false);
    }
  }

  async function handleCreateAgente(formData) {
    try {
      await CRM.createAgente(formData);
      showToast("Agente creado exitosamente", "success");
      closeModal();
      fetchAgentes();
    } catch (error) {
      showToast(error.message, "error");
    }
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
                Agentes IA
              </p>
            </div>
            <p className="text-xs leading-[18px] font-base text-theme-text-secondary">
              Configura y gestiona tus agentes de inteligencia artificial
            </p>
          </div>

          <div className="flex gap-4 mt-4 mb-4">
            <div className="relative flex-1">
              <MagnifyingGlass className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-theme-text-secondary" />
              <input
                type="text"
                placeholder="Buscar agentes..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-theme-bg-primary border border-theme-border rounded-lg text-theme-text-primary placeholder-theme-text-secondary text-sm"
              />
            </div>
          </div>

          <div className="w-full justify-end flex">
            <CTAButton onClick={openModal} className="mt-3 mr-0 mb-4 md:-mb-6 z-10">
              <Plus className="h-4 w-4" weight="bold" /> Nuevo Agente
            </CTAButton>
          </div>

          {loading ? (
            <Skeleton.default
              height="40vh"
              width="100%"
              highlightColor="var(--theme-bg-primary)"
              baseColor="var(--theme-bg-secondary)"
              count={1}
              className="w-full p-4 rounded-b-2xl rounded-tr-2xl rounded-tl-sm mt-8"
              containerClassName="flex w-full"
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
              {agentes.length === 0 ? (
                <div className="col-span-full text-center py-12 text-theme-text-secondary">
                  <Robot className="h-12 w-12 mx-auto mb-3 opacity-30" />
                  <p>No hay agentes configurados</p>
                  <p className="text-xs mt-1 opacity-60">
                    Crea un agente para automatizar respuestas y tareas
                  </p>
                </div>
              ) : (
                agentes.map((agente) => (
                  <div
                    key={agente.id}
                    className="bg-theme-bg-primary rounded-lg p-4 border border-white/10 hover:border-white/20 transition-all"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Robot className="h-5 w-5 text-blue-400" />
                        <h3 className="text-sm font-semibold text-theme-text-primary">
                          {agente.nombre}
                        </h3>
                      </div>
                      <button className="text-theme-text-secondary hover:text-theme-text-primary">
                        <Gear className="h-4 w-4" />
                      </button>
                    </div>
                    {agente.rol && (
                      <span className="inline-block px-2 py-0.5 rounded text-[10px] bg-purple-500/20 text-purple-400 mb-2">
                        {agente.rol}
                      </span>
                    )}
                    {agente.configuracion?.prompt_base && (
                      <p className="text-xs text-theme-text-secondary line-clamp-2 mt-1">
                        {agente.configuracion.prompt_base}
                      </p>
                    )}
                    <div className="flex items-center justify-between mt-3 pt-2 border-t border-white/10">
                      <span className="text-[10px] text-theme-text-secondary">
                        {agente.configuracion?.motor || "ollama"} • {agente.configuracion?.version || "default"}
                      </span>
                      <span className="text-[10px] text-theme-text-secondary">
                        {new Date(agente.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        <ModalWrapper isOpen={isOpen}>
          <CreateAgenteModal onClose={closeModal} onSubmit={handleCreateAgente} />
        </ModalWrapper>
      </div>
    </div>
  );
}

function CreateAgenteModal({ onClose, onSubmit }) {
  const [form, setForm] = useState({
    nombre: "",
    motor: "ollama",
    version: "llama3.1:8b",
    prompt_base: "",
  });

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  return (
    <div className="relative w-full max-w-md max-h-full">
      <div className="relative bg-theme-bg-secondary rounded-lg shadow">
        <div className="flex items-center justify-between p-4 border-b border-white/10">
          <h3 className="text-xl font-semibold text-theme-text-primary">
            Nuevo Agente IA
          </h3>
          <button onClick={onClose} className="text-theme-text-secondary hover:text-theme-text-primary">✕</button>
        </div>
        <div className="p-4 space-y-4">
          <div>
            <label className="block text-sm text-theme-text-secondary mb-1">Nombre *</label>
            <input
              name="nombre"
              value={form.nombre}
              onChange={handleChange}
              className="w-full px-3 py-2 bg-theme-bg-primary border border-theme-border rounded-lg text-theme-text-primary text-sm"
              placeholder="Ej: Agente Ventas WhatsApp"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-theme-text-secondary mb-1">Motor</label>
              <select
                name="motor"
                value={form.motor}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-theme-bg-primary border border-theme-border rounded-lg text-theme-text-primary text-sm"
              >
                <option value="ollama">Ollama</option>
                <option value="openai">OpenAI</option>
                <option value="custom">Custom</option>
              </select>
            </div>
            <div>
              <label className="block text-sm text-theme-text-secondary mb-1">Modelo/Versión</label>
              <input
                name="version"
                value={form.version}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-theme-bg-primary border border-theme-border rounded-lg text-theme-text-primary text-sm"
                placeholder="llama3.1:8b"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm text-theme-text-secondary mb-1">Prompt Base</label>
            <textarea
              name="prompt_base"
              value={form.prompt_base}
              onChange={handleChange}
              rows={4}
              className="w-full px-3 py-2 bg-theme-bg-primary border border-theme-border rounded-lg text-theme-text-primary text-sm resize-none"
              placeholder="Instrucciones base para el agente..."
            />
          </div>
        </div>
        <div className="flex items-center justify-end gap-4 p-4 border-t border-white/10">
          <button onClick={onClose} className="px-4 py-2 text-sm text-theme-text-secondary hover:text-theme-text-primary">
            Cancelar
          </button>
          <CTAButton onClick={() => onSubmit(form)} disabled={!form.nombre}>
            Crear Agente
          </CTAButton>
        </div>
      </div>
    </div>
  );
}

