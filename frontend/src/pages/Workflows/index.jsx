import React, { useEffect, useState } from "react";
import { Warning, CheckCircle, ArrowLeft } from "@phosphor-icons/react";
import Sidebar from "@/components/Sidebar";
import { isMobile } from "react-device-detect";
import { useNavigate } from "react-router-dom";
import paths from "@/utils/paths";

export default function Workflows() {
  const navigate = useNavigate();
  const [n8nStatus, setN8nStatus] = useState("checking");

  useEffect(() => {
    const checkN8n = async () => {
      try {
        await fetch("http://localhost:5678", {
          method: "HEAD",
          mode: "no-cors",
        });
        setN8nStatus("online");
      } catch (error) {
        fetch("http://localhost:5678")
          .then(() => setN8nStatus("online"))
          .catch(() => setN8nStatus("offline"));
      }
    };

    checkN8n();
    const interval = setInterval(checkN8n, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-screen h-screen overflow-hidden bg-theme-bg-container flex">
      {!isMobile && <Sidebar />}
      <div
        style={{ height: isMobile ? "100%" : "calc(100% - 32px)" }}
        className="relative md:ml-[2px] md:mr-[16px] md:my-[16px] md:rounded-[16px] bg-theme-bg-secondary w-full h-full overflow-hidden flex flex-col"
      >
        <div className="flex items-center justify-between p-4 border-b border-theme-border">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(paths.home())}
              className="p-2 rounded-lg text-theme-text-secondary hover:text-theme-text-primary hover:bg-theme-bg-primary transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div>
              <h1 className="text-2xl font-semibold text-theme-text-primary">
                Workflows (n8n)
              </h1>
              <p className="text-sm text-theme-text-secondary mt-1">
                Automatiza procesos y conecta servicios con n8n
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {n8nStatus === "online" && (
              <div className="flex items-center gap-2 text-green-500">
                <CheckCircle className="h-5 w-5" />
                <span className="text-sm">n8n Online</span>
              </div>
            )}
            {n8nStatus === "offline" && (
              <div className="flex items-center gap-2 text-yellow-500">
                <Warning className="h-5 w-5" />
                <span className="text-sm">n8n Offline</span>
              </div>
            )}
          </div>
        </div>

        {n8nStatus === "offline" && (
          <div className="p-4 bg-yellow-500/10 border-b border-yellow-500/20">
            <div className="flex items-center gap-2 text-yellow-500">
              <Warning className="h-5 w-5" />
              <div className="flex-1">
                <p className="font-semibold">n8n no está disponible</p>
                <p className="text-xs text-theme-text-secondary mt-2">
                  Verifica que n8n esté corriendo:{" "}
                  <code className="bg-theme-bg-secondary px-2 py-1 rounded">
                    docker compose -f docker-compose.dev.yml up -d n8n
                  </code>
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="flex-1 relative">
          <iframe
            src="http://localhost:5678"
            className="w-full h-full border-0"
            title="n8n Workflows"
            style={{ minHeight: "calc(100vh - 120px)" }}
            allow="fullscreen"
            sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-modals"
            onLoad={() => {
              console.log("n8n iframe loaded");
              setN8nStatus("online");
            }}
            onError={() => setN8nStatus("offline")}
          />
          {n8nStatus === "checking" && (
            <div className="absolute inset-0 flex items-center justify-center bg-theme-bg-secondary">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-theme-text-primary mx-auto mb-4"></div>
                <p className="text-theme-text-secondary">Cargando n8n...</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
