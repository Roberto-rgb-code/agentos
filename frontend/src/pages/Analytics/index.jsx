import { useEffect, useState } from "react";
import Sidebar from "@/components/SettingsSidebar";
import { isMobile } from "react-device-detect";
import * as Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import { ChartLine, Users, CheckCircle, CurrencyDollar, Lock } from "@phosphor-icons/react";
import Analytics from "@/models/analytics";
import showToast from "@/utils/toast";
import useUser from "@/hooks/useUser";

export default function AnalyticsPage() {
  const { user } = useUser();
  const [loading, setLoading] = useState(true);
  const [kpis, setKpis] = useState(null);
  const [fromDate, setFromDate] = useState(
    new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]
  );
  const [toDate, setToDate] = useState(new Date().toISOString().split("T")[0]);

  const isPremium = user?.plan === "premium";

  useEffect(() => {
    if (isPremium) {
      fetchKPIs();
    }
  }, [fromDate, toDate, isPremium]);

  async function fetchKPIs() {
    setLoading(true);
    try {
      const data = await Analytics.getKPIs({ from: fromDate, to: toDate });
      setKpis(data.kpis);
    } catch (error) {
      if (error.message.includes("premium")) {
        // Already handled by UI
      } else {
        showToast(error.message, "error");
      }
    } finally {
      setLoading(false);
    }
  }

  if (!isPremium) {
    return (
      <div className="w-screen h-screen overflow-hidden bg-theme-bg-container flex">
        <Sidebar />
        <div
          style={{ height: isMobile ? "100%" : "calc(100% - 32px)" }}
          className="relative md:ml-[2px] md:mr-[16px] md:my-[16px] md:rounded-[16px] bg-theme-bg-secondary w-full h-full overflow-y-scroll p-4 md:p-0"
        >
          <div className="flex flex-col items-center justify-center h-full">
            <Lock className="h-16 w-16 text-theme-text-secondary mb-4" />
            <h2 className="text-2xl font-bold text-theme-text-primary mb-2">
              Premium Feature
            </h2>
            <p className="text-theme-text-secondary text-center max-w-md">
              Analytics and advanced reporting are available with a Premium plan.
              Upgrade to unlock this feature.
            </p>
          </div>
        </div>
      </div>
    );
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
              <ChartLine className="h-6 w-6 text-theme-text-primary" />
              <p className="text-lg leading-6 font-bold text-theme-text-primary">
                Analytics & KPIs
              </p>
            </div>
            <p className="text-xs leading-[18px] font-base text-theme-text-secondary">
              Track your sales performance and key metrics.
            </p>
          </div>

          {/* Date Range Selector */}
          <div className="flex gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-theme-text-secondary mb-1">
                From
              </label>
              <input
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                className="px-3 py-2 bg-theme-bg-primary border border-theme-border rounded-lg text-theme-text-primary"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-theme-text-secondary mb-1">
                To
              </label>
              <input
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                className="px-3 py-2 bg-theme-bg-primary border border-theme-border rounded-lg text-theme-text-primary"
              />
            </div>
          </div>

          {loading ? (
            <Skeleton.default
              height="400px"
              width="100%"
              highlightColor="var(--theme-bg-primary)"
              baseColor="var(--theme-bg-secondary)"
              count={1}
            />
          ) : kpis ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <KPICard
                title="Leads Contactados"
                value={kpis.leadsContactados}
                icon={<Users className="h-6 w-6" />}
                color="bg-blue-500"
              />
              <KPICard
                title="Leads Calificados"
                value={kpis.leadsCalificados}
                icon={<CheckCircle className="h-6 w-6" />}
                color="bg-purple-500"
              />
              <KPICard
                title="Tasa de Conversión"
                value={`${kpis.tasaConversion}%`}
                icon={<ChartLine className="h-6 w-6" />}
                color="bg-green-500"
              />
              <KPICard
                title="RPR (Revenue/Recipient)"
                value={`$${kpis.rpr.toFixed(2)}`}
                icon={<CurrencyDollar className="h-6 w-6" />}
                color="bg-yellow-500"
              />
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-theme-text-secondary">
                No data available for the selected date range.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function KPICard({ title, value, icon, color }) {
  return (
    <div className="bg-theme-bg-primary p-6 rounded-lg border border-theme-border">
      <div className="flex items-center justify-between mb-2">
        <p className="text-sm font-medium text-theme-text-secondary">{title}</p>
        <div className={`${color} p-2 rounded text-white`}>{icon}</div>
      </div>
      <p className="text-2xl font-bold text-theme-text-primary">{value}</p>
    </div>
  );
}

