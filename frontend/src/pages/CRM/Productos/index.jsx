import { useEffect, useState } from "react";
import Sidebar from "@/components/SettingsSidebar";
import { isMobile } from "react-device-detect";
import * as Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import { Package, MagnifyingGlass, Plus, ArrowLeft } from "@phosphor-icons/react";
import { useNavigate } from "react-router-dom";
import paths from "@/utils/paths";
import CRM from "@/models/crm";
import { useModal } from "@/hooks/useModal";
import ModalWrapper from "@/components/ModalWrapper";
import CTAButton from "@/components/lib/CTAButton";
import showToast from "@/utils/toast";

export default function CRMProductos() {
  const navigate = useNavigate();
  const { isOpen, openModal, closeModal } = useModal();
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchProductos();
  }, [search]);

  async function fetchProductos() {
    setLoading(true);
    try {
      const _productos = await CRM.productos({ search });
      setProductos(_productos);
    } catch (error) {
      showToast(error.message, "error");
    } finally {
      setLoading(false);
    }
  }

  async function handleCreateProducto(formData) {
    try {
      await CRM.createProducto(formData);
      showToast("Producto creado exitosamente", "success");
      closeModal();
      fetchProductos();
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
              <button
                onClick={() => navigate(paths.home())}
                className="p-2 rounded-lg text-theme-text-secondary hover:text-white hover:bg-theme-bg-primary transition-colors"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
              <p className="text-lg leading-6 font-bold text-theme-text-primary">
                Catálogo de Productos
              </p>
            </div>
            <p className="text-xs leading-[18px] font-base text-theme-text-secondary">
              Gestiona tu catálogo de productos y servicios
            </p>
          </div>

          <div className="flex gap-4 mt-4 mb-4">
            <div className="relative flex-1">
              <MagnifyingGlass className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-theme-text-secondary" />
              <input
                type="text"
                placeholder="Buscar productos..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-theme-bg-primary border border-theme-border rounded-lg text-theme-text-primary placeholder-theme-text-secondary text-sm"
              />
            </div>
          </div>

          <div className="w-full justify-end flex">
            <CTAButton onClick={openModal} className="mt-3 mr-0 mb-4 md:-mb-6 z-10">
              <Plus className="h-4 w-4" weight="bold" /> Nuevo Producto
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
              {productos.length === 0 ? (
                <div className="col-span-full text-center py-12 text-theme-text-secondary">
                  <Package className="h-12 w-12 mx-auto mb-3 opacity-30" />
                  <p>No hay productos registrados</p>
                </div>
              ) : (
                productos.map((producto) => (
                  <div
                    key={producto.id}
                    className="bg-theme-bg-primary rounded-lg p-4 border border-white/10 hover:border-white/20 transition-all"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="text-sm font-semibold text-theme-text-primary">
                        {producto.nombre}
                      </h3>
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] ${
                          producto.activo
                            ? "bg-green-500/20 text-green-400"
                            : "bg-red-500/20 text-red-400"
                        }`}
                      >
                        {producto.activo ? "Activo" : "Inactivo"}
                      </span>
                    </div>
                    {producto.descripcion && (
                      <p className="text-xs text-theme-text-secondary mb-2 line-clamp-2">
                        {producto.descripcion}
                      </p>
                    )}
                    <div className="flex items-center justify-between mt-3 pt-2 border-t border-white/10">
                      {producto.precio ? (
                        <span className="text-sm font-bold text-green-400">
                          ${parseFloat(producto.precio).toFixed(2)}
                        </span>
                      ) : (
                        <span className="text-xs text-theme-text-secondary">Sin precio</span>
                      )}
                      {producto.categoria && (
                        <span className="text-[10px] px-2 py-0.5 rounded bg-blue-500/20 text-blue-400">
                          {producto.categoria}
                        </span>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        <ModalWrapper isOpen={isOpen}>
          <CreateProductoModal onClose={closeModal} onSubmit={handleCreateProducto} />
        </ModalWrapper>
      </div>
    </div>
  );
}

function CreateProductoModal({ onClose, onSubmit }) {
  const [form, setForm] = useState({
    nombre: "",
    descripcion: "",
    precio: "",
    categoria: "",
  });

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  return (
    <div className="relative w-full max-w-md max-h-full">
      <div className="relative bg-theme-bg-secondary rounded-lg shadow">
        <div className="flex items-center justify-between p-4 border-b border-white/10">
          <h3 className="text-xl font-semibold text-theme-text-primary">
            Nuevo Producto
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
              placeholder="Nombre del producto"
            />
          </div>
          <div>
            <label className="block text-sm text-theme-text-secondary mb-1">Descripción</label>
            <textarea
              name="descripcion"
              value={form.descripcion}
              onChange={handleChange}
              rows={3}
              className="w-full px-3 py-2 bg-theme-bg-primary border border-theme-border rounded-lg text-theme-text-primary text-sm resize-none"
              placeholder="Descripción del producto"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-theme-text-secondary mb-1">Precio</label>
              <input
                name="precio"
                type="number"
                step="0.01"
                value={form.precio}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-theme-bg-primary border border-theme-border rounded-lg text-theme-text-primary text-sm"
                placeholder="0.00"
              />
            </div>
            <div>
              <label className="block text-sm text-theme-text-secondary mb-1">Categoría</label>
              <input
                name="categoria"
                value={form.categoria}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-theme-bg-primary border border-theme-border rounded-lg text-theme-text-primary text-sm"
                placeholder="Categoría"
              />
            </div>
          </div>
        </div>
        <div className="flex items-center justify-end gap-4 p-4 border-t border-white/10">
          <button onClick={onClose} className="px-4 py-2 text-sm text-theme-text-secondary hover:text-theme-text-primary">
            Cancelar
          </button>
          <CTAButton onClick={() => onSubmit(form)} disabled={!form.nombre}>
            Crear Producto
          </CTAButton>
        </div>
      </div>
    </div>
  );
}

