import { useState } from "react";
import { ChevronRight, Calculator, Link2, User, Unlink } from "lucide-react";
import { MeasurementList } from "@/components/measurement-list";
import type { IndicatorWithProcesses, Measurement } from "@/types";

interface IndicatorItemProps {
  indicator: IndicatorWithProcesses;
}

const frequencyColors: Record<string, string> = {
  ANNUAL: "bg-orange-50 text-orange-700 border-orange-200",
  SEMESTER: "bg-blue-50 text-blue-700 border-blue-200",
  TRIMESTER: "bg-purple-50 text-purple-700 border-purple-200",
  MONTHLY: "bg-green-50 text-green-700 border-green-200",
};

const frequencyLabels: Record<string, string> = {
  ANNUAL: "Anual",
  SEMESTER: "Semestral",
  TRIMESTER: "Trimestral",
  MONTHLY: "Mensal",
};

export const IndicatorItem: React.FC<IndicatorItemProps> = ({ indicator }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="border border-slate-200 rounded-md shadow-sm overflow-hidden">
      <div
        className={`
          flex items-center gap-3 px-4 py-3 cursor-pointer transition-colors select-none
          ${isExpanded ? "bg-slate-50 border-b border-slate-200" : "hover:bg-slate-50"}
        `}
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div
          className={`text-slate-400 transition-transform duration-200 ${
            isExpanded ? "rotate-90" : ""
          }`}
        >
          <ChevronRight size={20} />
        </div>

        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-lg">{indicator.name}</h3>
          </div>
        </div>

        <div className="text-sm text-slate-500 mr-4 flex items-center gap-2">
          <User size={14} />
          {indicator.owner}
        </div>

        <div className="text-xs mr-4">
          <span
            className={`px-2 py-0.5 rounded-full font-semibold border ${
              frequencyColors[indicator.frequency] || "bg-slate-100 text-slate-600 border-slate-200"
            }`}
          >
            {frequencyLabels[indicator.frequency] || indicator.frequency}
          </span>
        </div>

        <div className="flex items-center gap-1 text-xs text-slate-400 mr-2" title="Medições">
          <Calculator size={14} />
          {indicator.measurements.length}
        </div>
        <div
          className="flex items-center gap-1 text-xs text-slate-400"
          title="Processos Associados"
        >
          <Link2 size={14} />
          {indicator.processes.length}
        </div>
      </div>

      {isExpanded && (
        <div className="p-6 bg-slate-50/50 animate-in slide-in-from-top-2 duration-200">
          <div className="mb-8 space-y-6">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-blue-700 font-semibold text-sm mb-1">
                <Calculator size={16} />
                Fórmula/Métrica
              </div>
              <div className="bg-slate-50 p-3 rounded border border-slate-100 text-slate-700 text-sm leading-relaxed font-mono">
                {indicator.formula}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-slate-600 font-semibold text-sm mb-1">
                  <User size={16} />
                  Responsável
                </div>
                <div className="bg-white p-3 rounded border border-slate-200 shadow-sm text-sm">
                  {indicator.owner}
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-2 text-slate-600 font-semibold text-sm mb-1">
                  Frequência
                </div>
                <div className="bg-white p-3 rounded border border-slate-200 shadow-sm text-sm">
                  <span
                    className={`px-2 py-0.5 rounded-full font-semibold border text-xs ${
                      frequencyColors[indicator.frequency] ||
                      "bg-slate-100 text-slate-600 border-slate-200"
                    }`}
                  >
                    {frequencyLabels[indicator.frequency] || indicator.frequency}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-2 mb-4">
              <h4 className="text-sm font-bold text-slate-700 uppercase tracking-wide">
                Processos Associados
              </h4>
              <button className="flex items-center gap-1 text-sm bg-white border border-slate-300 hover:border-slate-400 hover:text-slate-800 text-slate-600 px-3 py-1.5 rounded-md shadow-sm transition-all">
                <Link2 size={14} />
                Associar Processo
              </button>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              {indicator.processes.length === 0 ? (
                <div className="col-span-full py-8 text-center border-2 border-dashed border-slate-200 rounded-lg text-slate-400">
                  Nenhum processo associado.
                </div>
              ) : (
                indicator.processes.map(proc => (
                  <div
                    key={proc.id}
                    className="flex items-center justify-between text-sm bg-white border border-slate-200 px-3 py-2 rounded shadow-sm"
                  >
                    <div className="flex flex-col">
                      <span className="font-semibold text-slate-800">{proc.processName}</span>
                      {proc.macroProcessName && (
                        <span className="text-xs text-slate-400 uppercase">
                          {proc.macroProcessName}
                        </span>
                      )}
                    </div>
                    <button
                      className="text-slate-300 hover:text-red-500 transition-colors p-1"
                      title="Desassociar"
                    >
                      <Unlink size={14} />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          <MeasurementList
            measurements={indicator.measurements as Measurement[]}
            onAdd={() => {}}
          />
        </div>
      )}
    </div>
  );
};
