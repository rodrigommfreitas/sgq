import { ChevronRight, FolderGit2, Plus, Target, User } from "lucide-react";
import { useState } from "react";
import { ProcessDropdown } from "./process-dropdown";
import { AssociateIndicatorDialog } from "./associate-indicator-dialog";
import type { ProcessHierarchyItem } from "@/types";

interface ProcessItemProps {
  process: ProcessHierarchyItem;
  macroProcessId: number;
}

export const ProcessItem: React.FC<ProcessItemProps> = ({ process, macroProcessId }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="border border-slate-200 rounded-md mb-4 shadow-sm overflow-hidden">
      <div
        className={`flex items-center gap-3 px-4 py-3 cursor-pointer transition-colors select-none ${
          isExpanded ? "bg-slate-50 border-b border-slate-200" : "hover:bg-slate-50"
        }`}
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className={`text-slate-400 transition-transform duration-200 ${isExpanded ? "rotate-90" : ""}`}>
          <ChevronRight size={20} />
        </div>

        <div className="flex-1">
          <div className="flex items-center gap-2">
            <FolderGit2 size={16} className="text-slate-400" />
            <h3 className="font-semibold text-lg">{process.name}</h3>
          </div>
        </div>

        <div className="text-sm text-slate-500 mr-4 flex items-center gap-2">
          <User size={14} />
          {process.owner ? `${process.owner.firstName} ${process.owner.lastName}` : "—"}
        </div>

        <div className="px-2 py-1 bg-slate-100 text-slate-600 rounded text-xs font-medium">
          {process.indicators.length}
          {process.indicators.length === 1 ? " Indicador" : " Indicadores"}
        </div>
        <div onClick={(e) => e.stopPropagation()}>
          <ProcessDropdown processId={process.processId} macroProcessId={macroProcessId} />
        </div>
      </div>

      {isExpanded && (
        <div className="p-6 bg-slate-50/50 animate-in slide-in-from-top-2 duration-200">
          <div className="mb-8 grid grid-cols-1 md:grid-cols-[2fr_1fr] gap-6">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-blue-700 font-semibold text-sm mb-1">
                <Target size={16} />
                Objetivo
              </div>
              <div className="bg-white p-3 rounded border border-blue-100 shadow-sm text-slate-700 text-sm leading-relaxed">
                {process.objective || "—"}
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2 text-slate-600 font-semibold text-sm mb-1">
                <User size={16} />
                Responsável
              </div>
              <div className="bg-white p-3 rounded border border-slate-200 shadow-sm text-sm">
                {process.owner ? `${process.owner.firstName} ${process.owner.lastName}` : "—"}
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-2 mb-4">
              <h4 className="text-sm font-bold text-slate-700 uppercase tracking-wide">
                Indicadores de Desempenho
              </h4>
              <div className="flex gap-2">
                <AssociateIndicatorDialog
                  alreadyAssociatedIds={process.indicators.map((i) => i.indicatorId)}
                />
                <button className="flex items-center gap-1 text-sm bg-blue-50 border border-blue-200 hover:border-blue-400 hover:text-blue-700 text-blue-600 px-3 py-1.5 rounded-md shadow-sm transition-all">
                  <Plus size={16} />
                  Criar Indicador
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              {process.indicators.length === 0 ? (
                <div className="col-span-full py-8 text-center border-2 border-dashed border-slate-200 rounded-lg text-slate-400">
                  Sem indicadores associados.
                </div>
              ) : (
                process.indicators.map((indicator) => (
                  <div
                    key={indicator.indicatorId}
                    className="border border-slate-200 rounded-md shadow-sm overflow-hidden"
                  >
                    <div className="px-4 py-3 bg-white">
                      <div className="flex items-center justify-between">
                        <h4 className="font-semibold text-sm">{indicator.name}</h4>
                        <span className="text-xs text-slate-500">{indicator.formula}</span>
                      </div>
                      {indicator.goal !== null && indicator.goal !== undefined && (
                        <p className="text-xs text-muted-foreground mt-1">Objetivo: {indicator.goal}</p>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};