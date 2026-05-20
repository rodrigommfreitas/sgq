import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { getMacroProcessHierarchy } from "@/api/core";
import { getYears } from "@/api/core";
import { useQuery } from "@tanstack/react-query";
import { ProcessItem } from "./process-item";
import { Skeleton } from "@/components/ui/skeleton";
import { CreateMacroProcessDialog } from "./create-macro-process-dialog";
import { MacroProcessDropdown } from "./macro-process-dropdown";
import { CreateIndependentProcessDialog } from "./create-independent-process-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function ProcessesPage() {
  const [collapsedSections, setCollapsedSections] = useState<Record<string, boolean>>({});
  const [yearId, setYearId] = useState<number | null>(null);

  const { data: years, isLoading: yearsLoading } = useQuery({
    queryKey: ["years"],
    queryFn: getYears,
  });

  const sortedYears = years ? [...years].sort((a, b) => b.year - a.year) : [];
  const selectedYearId = yearId ?? (sortedYears.length > 0 ? sortedYears[0].id : null);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["macroprocess-hierarchy", selectedYearId],
    queryFn: () => getMacroProcessHierarchy(selectedYearId!),
    enabled: !!selectedYearId,
  });

  const toggleSection = (id: string) => {
    setCollapsedSections((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  if (yearsLoading) {
    return (
      <div className="flex h-full flex-col gap-4 max-w-5xl mx-auto w-full mb-40 mt-8">
        <Skeleton className="h-10 w-1/3 rounded-xl" />
        <Skeleton className="h-64 w-full rounded-xl" />
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col gap-4 max-w-5xl mx-auto w-full mb-40 mt-8">
      <div className="flex items-center justify-between mb-4 border-b border-slate-200 pb-6">
        <h1 className="text-2xl font-semibold">Processos</h1>
        <div className="flex items-center gap-3">
          <Select
            value={selectedYearId?.toString() ?? ""}
            onValueChange={(v) => setYearId(Number(v))}
          >
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Selecionar ano" />
            </SelectTrigger>
            <SelectContent>
              {sortedYears.map((y) => (
                <SelectItem key={y.id} value={y.id.toString()}>
                  {y.year}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <CreateMacroProcessDialog yearId={selectedYearId} />
        </div>
      </div>

      {isLoading && (
        <div className="space-y-8">
          <Skeleton className="h-10 w-1/4 rounded-xl bg-black/10 dark:bg-white/10" />
          <Skeleton className="h-12 w-full rounded-xl bg-black/10 dark:bg-white/10" />
          <Skeleton className="h-12 w-full rounded-xl bg-black/10 dark:bg-white/10" />
        </div>
      )}

      {isError && (
        <p className="text-destructive">Erro ao carregar os processos.</p>
      )}

      {!isLoading && data?.standaloneProcesses && data.standaloneProcesses.length > 0 && (
        <div>
          <div className="flex items-center gap-4 mb-4">
            <button
              onClick={() => toggleSection("general")}
              className="flex items-center gap-2 group"
            >
              <div
                className={`text-slate-400 transition-transform duration-200 ${
                  collapsedSections["general"] ? "-rotate-90" : ""
                }`}
              >
                <ChevronDown size={20} />
              </div>
              <h2 className="text-xl font-bold tracking-wide whitespace-nowrap opacity-70">
                Sem Macro Processo
              </h2>
            </button>
            <div className="h-px bg-slate-200 w-full mt-1"></div>
            <CreateIndependentProcessDialog />
          </div>
          <div
            className={`overflow-hidden transition-all duration-200 ease-in-out ${
              collapsedSections["general"] ? "max-h-0 opacity-0" : "max-h-[1000px] opacity-100"
            }`}
          >
            <div className="space-y-4 py-2">
              {data.standaloneProcesses.map((process) => (
                <ProcessItem process={process} key={process.id} macroProcessId={0} />
              ))}
            </div>
          </div>
        </div>
      )}

      {!isLoading && data?.macroProcesses.map((macro) => (
        <div key={macro.id}>
          <div className="flex items-center gap-4 mb-4">
            <button
              onClick={() => toggleSection(macro.name)}
              className="flex items-center gap-2 group"
            >
              <div
                className={`text-slate-400 transition-transform duration-200 ${
                  collapsedSections[macro.name] ? "-rotate-90" : ""
                }`}
              >
                <ChevronDown size={20} />
              </div>
              <h2 className="text-xl font-bold tracking-wide whitespace-nowrap">{macro.name}</h2>
            </button>
            <div className="h-px bg-slate-200 w-full mt-1"></div>
            <MacroProcessDropdown macroProcessId={macro.macroProcessId} macroProcessYearId={macro.macroProcessYearId} yearId={selectedYearId} />
          </div>
          {macro.processes.length > 0 && (
            <div
              className={`overflow-hidden transition-all duration-200 ease-in-out ${
                collapsedSections[macro.name] ? "max-h-0 opacity-0" : "max-h-[1000px] opacity-100"
              }`}
            >
              <div className="space-y-4 py-2">
                {macro.processes.map((process) => (
                  <ProcessItem process={process} key={process.id} macroProcessId={macro.id} />
                ))}
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}