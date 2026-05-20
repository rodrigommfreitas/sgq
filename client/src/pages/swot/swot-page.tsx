import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getSwotAnalysis,
  updateSwotAnalysis,
  getSwotYearDetail,
  createSwotItem,
  updateSwotItem,
  deleteSwotItem,
  uploadSwotDocument,
  deleteSwotDocument,
  downloadDocumentVersion,
} from "@/api/core";
import type { SwotItemType, SwotItemResponse, SwotYearDetail } from "@/types";
import { YearSelector } from "@/components/year-selector";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useAuth } from "@/context/auth-context";
import {
  Target,
  TrendingUp,
  AlertCircle,
  Plus as PlusIcon,
  ShieldAlert,
  X,
  Trash2,
  FileText,
  Upload,
  Download,
  Save,
} from "lucide-react";

const QUADRANT_CONFIG: {
  type: SwotItemType;
  label: string;
  category: string;
  color: string;
  icon: typeof Target;
}[] = [
  {
    type: "STRENGTH",
    label: "Forças",
    category: "Interno",
    color: "emerald",
    icon: TrendingUp,
  },
  {
    type: "WEAKNESS",
    label: "Fraquezas",
    category: "Interno",
    color: "rose",
    icon: AlertCircle,
  },
  {
    type: "OPPORTUNITY",
    label: "Oportunidades",
    category: "Externo",
    color: "blue",
    icon: PlusIcon,
  },
  {
    type: "THREAT",
    label: "Ameaças",
    category: "Externo",
    color: "amber",
    icon: ShieldAlert,
  },
];

const colorMap: Record<string, { border: string; text: string; bg: string; bgLight: string; dot: string }> = {
  emerald: {
    border: "border-emerald-200",
    text: "text-emerald-600",
    bg: "bg-emerald-100",
    bgLight: "bg-emerald-50",
    dot: "bg-emerald-400",
  },
  rose: {
    border: "border-rose-200",
    text: "text-rose-600",
    bg: "bg-rose-100",
    bgLight: "bg-rose-50",
    dot: "bg-rose-400",
  },
  blue: {
    border: "border-blue-200",
    text: "text-blue-600",
    bg: "bg-blue-100",
    bgLight: "bg-blue-50",
    dot: "bg-blue-400",
  },
  amber: {
    border: "border-amber-200",
    text: "text-amber-600",
    bg: "bg-amber-100",
    bgLight: "bg-amber-50",
    dot: "bg-amber-400",
  },
};

function getItems(yearDetail: SwotYearDetail | undefined, type: SwotItemType): SwotItemResponse[] {
  if (!yearDetail) return [];
  switch (type) {
    case "STRENGTH": return yearDetail.strengths;
    case "WEAKNESS": return yearDetail.weaknesses;
    case "OPPORTUNITY": return yearDetail.opportunities;
    case "THREAT": return yearDetail.threats;
  }
}

export default function SwotAnalysisPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const [activeTab, setActiveTab] = useState<"matrix" | "documents">("matrix");
  const [selectedYearId, setSelectedYearId] = useState<number | null>(null);
  const [expandedQuadrant, setExpandedQuadrant] = useState<SwotItemType | null>(null);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [addText, setAddText] = useState("");
  const [addType, setAddType] = useState<SwotItemType>("STRENGTH");
  const [editItemId, setEditItemId] = useState<number | null>(null);
  const [editText, setEditText] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editingDescription, setEditingDescription] = useState(false);

  const { data: swotAnalysis } = useQuery({
    queryKey: ["swot-analysis"],
    queryFn: getSwotAnalysis,
  });

  const latestSwotYear = swotAnalysis?.years?.length
    ? [...swotAnalysis.years].sort((a, b) => b.year - a.year)[0]
    : null;

  const effectiveYearId = selectedYearId ?? latestSwotYear?.yearId ?? null;

  const { data: yearDetail } = useQuery({
    queryKey: ["swot-year-detail", effectiveYearId],
    queryFn: () => getSwotYearDetail(effectiveYearId!),
    enabled: !!effectiveYearId,
  });

  const updateDescriptionMutation = useMutation({
    mutationFn: (description: string) => updateSwotAnalysis(description),
    onSuccess: () => {
      toast.success("Descrição atualizada com sucesso!");
      queryClient.invalidateQueries({ queryKey: ["swot-analysis"] });
      setEditingDescription(false);
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message ?? "Erro ao atualizar descrição");
    },
  });

  const createItemMutation = useMutation({
    mutationFn: (data: { text: string; type: SwotItemType; yearIds: number[] }) =>
      createSwotItem(data),
    onSuccess: () => {
      toast.success("Fator adicionado com sucesso!");
      queryClient.invalidateQueries({ queryKey: ["swot-year-detail", effectiveYearId] });
      setAddDialogOpen(false);
      setAddText("");
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message ?? "Erro ao adicionar fator");
    },
  });

  const updateItemMutation = useMutation({
    mutationFn: ({ itemId, text }: { itemId: number; text: string }) =>
      updateSwotItem(itemId, text),
    onSuccess: () => {
      toast.success("Fator atualizado com sucesso!");
      queryClient.invalidateQueries({ queryKey: ["swot-year-detail", effectiveYearId] });
      setEditItemId(null);
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message ?? "Erro ao atualizar fator");
    },
  });

  const deleteItemMutation = useMutation({
    mutationFn: deleteSwotItem,
    onSuccess: () => {
      toast.success("Fator eliminado com sucesso!");
      queryClient.invalidateQueries({ queryKey: ["swot-year-detail", effectiveYearId] });
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message ?? "Erro ao eliminar fator");
    },
  });

  const uploadDocMutation = useMutation({
    mutationFn: (file: File) => uploadSwotDocument(file, user!.id),
    onSuccess: () => {
      toast.success("Documento carregado com sucesso!");
      queryClient.invalidateQueries({ queryKey: ["swot-analysis"] });
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message ?? "Erro ao carregar documento");
    },
  });

  const deleteDocMutation = useMutation({
    mutationFn: deleteSwotDocument,
    onSuccess: () => {
      toast.success("Documento eliminado com sucesso!");
      queryClient.invalidateQueries({ queryKey: ["swot-analysis"] });
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message ?? "Erro ao eliminar documento");
    },
  });

  const handleStartEdit = (item: SwotItemResponse) => {
    setEditItemId(item.id);
    setEditText(item.text);
  };

  const handleSaveEdit = () => {
    if (!editItemId || !editText.trim()) return;
    updateItemMutation.mutate({ itemId: editItemId, text: editText.trim() });
  };

  const handleAddItem = () => {
    if (!addText.trim() || !effectiveYearId) return;
    createItemMutation.mutate({
      text: addText.trim(),
      type: addType,
      yearIds: [effectiveYearId],
    });
  };

  const handleOpenAdd = (type: SwotItemType) => {
    setAddType(type);
    setAddText("");
    setAddDialogOpen(true);
  };

  const handleDownload = (versionId: number, fileName: string) => {
    downloadDocumentVersion(versionId, fileName);
  };

  const documents = swotAnalysis?.documents ?? [];

  const strengths = getItems(yearDetail, "STRENGTH");
  const weaknesses = getItems(yearDetail, "WEAKNESS");
  const opportunities = getItems(yearDetail, "OPPORTUNITY");
  const threats = getItems(yearDetail, "THREAT");

  return (
    <div className="p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-xl flex items-center justify-center shadow-sm">
            <Target size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Análise SWOT</h1>
            <p className="text-slate-500 text-sm mt-1">
              Ferramenta de planeamento estratégico para análise do ambiente interno e externo.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <YearSelector
            selectedYearId={effectiveYearId}
            onYearChange={setSelectedYearId}
          />
          <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200">
            <button
              onClick={() => setActiveTab("matrix")}
              className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === "matrix" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
            >
              Matriz
            </button>
            <button
              onClick={() => setActiveTab("documents")}
              className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === "documents" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
            >
              Documentos
            </button>
          </div>
        </div>
      </div>

      {activeTab === "matrix" && (
        <div className="space-y-8">
          {/* Matrix Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {QUADRANT_CONFIG.map((config) => {
              const items = getItems(yearDetail, config.type);
              const colors = colorMap[config.color];
              const Icon = config.icon;
              return (
                <div
                  key={config.type}
                  onClick={() => setExpandedQuadrant(config.type)}
                  className={`group flex flex-col h-full rounded-2xl border-2 border-dashed ${colors.border} p-6 bg-white/50 cursor-pointer hover:bg-white hover:border-solid transition-all relative overflow-hidden`}
                >
                  <div className="flex items-center justify-between mb-4 relative z-10">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-sm bg-white ${colors.text}`}>
                        <Icon size={20} />
                      </div>
                      <div>
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mb-0.5">
                          {config.category}
                        </p>
                        <h3 className="font-bold text-slate-800 uppercase tracking-wider leading-none">
                          {config.label}
                        </h3>
                      </div>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenAdd(config.type);
                      }}
                      className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-400 hover:text-slate-900 hover:border-slate-900 transition-all shadow-sm"
                    >
                      <PlusIcon size={18} />
                    </button>
                  </div>

                  <div className="flex-1 flex flex-col justify-center items-center py-4 relative z-10">
                    <div className="text-4xl font-black text-slate-900 mb-2">{items.length}</div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                      Fatores Identificados
                    </p>
                  </div>

                  <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between relative z-10">
                    <div className="flex -space-x-2 overflow-hidden">
                      {items.slice(0, 3).map((item, i) => (
                        <div
                          key={item.id}
                          className="w-6 h-6 rounded-full border-2 border-white flex items-center justify-center text-[8px] font-bold text-white shadow-sm"
                          style={{
                            backgroundColor: i === 0 ? "#10b981" : i === 1 ? "#ef4444" : "#3b82f6",
                            zIndex: 10 - i,
                          }}
                        >
                          {item.text.charAt(0).toUpperCase()}
                        </div>
                      ))}
                      {items.length > 3 && (
                        <div className="w-6 h-6 rounded-full border-2 border-white bg-slate-200 flex items-center justify-center text-[8px] font-bold text-slate-600 shadow-sm">
                          +{items.length - 3}
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-1 text-[10px] font-bold text-slate-400 uppercase group-hover:text-slate-900 transition-colors">
                      Ver Detalhes
                    </div>
                  </div>

                  <div className="absolute -right-4 -bottom-4 opacity-[0.03] group-hover:opacity-[0.06] transition-opacity">
                    <Icon size={120} />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Description */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider">Descrição</h3>
              {!editingDescription && (
                <button
                  onClick={() => {
                    setEditDescription(swotAnalysis?.description ?? "");
                    setEditingDescription(true);
                  }}
                  className="text-xs font-bold text-indigo-600 hover:text-indigo-800 transition-colors"
                >
                  Editar
                </button>
              )}
            </div>
            {editingDescription ? (
              <div className="space-y-3">
                <textarea
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-100 transition-all resize-none"
                  rows={3}
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  placeholder="Descreva o contexto da análise SWOT..."
                />
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={() => updateDescriptionMutation.mutate(editDescription)}
                    disabled={updateDescriptionMutation.isPending}
                  >
                    <Save size={14} className="mr-1" />
                    Guardar
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setEditingDescription(false)}
                  >
                    Cancelar
                  </Button>
                </div>
              </div>
            ) : (
              <p className="text-sm text-slate-600 leading-relaxed">
                {swotAnalysis?.description || "Sem descrição definida."}
              </p>
            )}
          </div>

          {/* Summary Bar */}
          <div className="bg-slate-900 rounded-2xl p-8 text-white flex flex-wrap items-center justify-between gap-8">
            <div className="flex items-center gap-6">
              <div className="flex flex-col">
                <span className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-1">
                  Análise Interna
                </span>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-emerald-400" />
                    <span className="text-sm font-bold">{strengths.length} Forças</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-rose-400" />
                    <span className="text-sm font-bold">{weaknesses.length} Fraquezas</span>
                  </div>
                </div>
              </div>
              <div className="w-px h-10 bg-slate-800" />
              <div className="flex flex-col">
                <span className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-1">
                  Análise Externa
                </span>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-blue-400" />
                    <span className="text-sm font-bold">{opportunities.length} Oportunidades</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-amber-400" />
                    <span className="text-sm font-bold">{threats.length} Ameaças</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-xs text-slate-400">Total de Fatores</p>
                <p className="text-sm font-bold">
                  {strengths.length + weaknesses.length + opportunities.length + threats.length}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === "documents" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider">
              Documentos da Análise SWOT
            </h3>
            <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-all text-sm shadow-lg shadow-indigo-200">
              <Upload size={16} />
              Carregar Documento
              <input
                type="file"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) uploadDocMutation.mutate(file);
                  e.target.value = "";
                }}
              />
            </label>
          </div>

          {documents.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center shadow-sm">
              <FileText size={48} className="mx-auto text-slate-200 mb-4" />
              <h3 className="text-lg font-bold text-slate-400">Nenhum documento</h3>
              <p className="text-slate-400 text-sm mt-1">
                Carregue documentos relacionados com a análise SWOT.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {documents.map((doc) => {
                const latest = doc.versions?.[doc.versions.length - 1];
                return (
                  <div
                    key={doc.documentId}
                    className="bg-white border border-slate-200 rounded-xl p-4 flex items-center justify-between shadow-sm"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500">
                        <FileText size={20} />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-800">
                          {latest?.fileName
                            ? latest.fileName.replace(/_[0-9a-f-]{36}\./, ".")
                            : "Documento"}
                        </p>
                        {latest && (
                          <p className="text-xs text-slate-400">
                            v{latest.version} · {new Date(latest.uploadedAt).toLocaleDateString("pt-PT")}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {latest && (
                        <button
                          onClick={() => handleDownload(latest.versionId, latest.fileName)}
                          className="p-2 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                          title="Descarregar"
                        >
                          <Download size={18} />
                        </button>
                      )}
                      <button
                        onClick={() => {
                          if (confirm("Tem a certeza que deseja eliminar este documento?")) {
                            deleteDocMutation.mutate(doc.documentId);
                          }
                        }}
                        className="p-2 hover:bg-red-50 rounded-lg text-slate-400 hover:text-red-600 transition-colors cursor-pointer"
                        title="Eliminar"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Expanded Quadrant Modal */}
      {expandedQuadrant && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 md:p-8 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-slate-50 rounded-3xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
            <div className="px-8 py-6 border-b border-slate-200 flex items-center justify-between bg-white shrink-0">
              <div className="flex items-center gap-4">
                <div
                  className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-sm ${
                    colorMap[
                      QUADRANT_CONFIG.find((c) => c.type === expandedQuadrant)?.color ?? "emerald"
                    ].bg
                  } ${
                    colorMap[
                      QUADRANT_CONFIG.find((c) => c.type === expandedQuadrant)?.color ?? "emerald"
                    ].text
                  }`}
                >
                  {(() => {
                    const Icon = QUADRANT_CONFIG.find((c) => c.type === expandedQuadrant)?.icon ?? Target;
                    return <Icon size={24} />;
                  })()}
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-900">
                    {QUADRANT_CONFIG.find((c) => c.type === expandedQuadrant)?.label}
                  </h2>
                  <p className="text-sm text-slate-500 font-medium">
                    Reveja e gerencie todos os fatores identificados neste grupo.
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => handleOpenAdd(expandedQuadrant)}
                  className="flex items-center gap-2 bg-slate-900 text-white px-4 py-2 rounded-xl font-bold text-sm hover:bg-slate-800 transition-all shadow-lg cursor-pointer"
                >
                  <PlusIcon size={18} />
                  Adicionar Fator
                </button>
                <button
                  onClick={() => setExpandedQuadrant(null)}
                  className="p-2.5 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-600 transition-colors bg-slate-50 cursor-pointer"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-8 bg-slate-50">
              <div className="flex flex-col gap-4 max-w-3xl mx-auto">
                {getItems(yearDetail, expandedQuadrant).map((item) => (
                  <div
                    key={item.id}
                    className="group bg-white border border-slate-200 rounded-xl p-4 shadow-sm hover:shadow-md transition-all"
                  >
                    {editItemId === item.id ? (
                      <div className="space-y-3">
                        <textarea
                          className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-100 transition-all resize-none"
                          rows={2}
                          value={editText}
                          onChange={(e) => setEditText(e.target.value)}
                        />
                        <div className="flex gap-2">
                          <button
                            onClick={handleSaveEdit}
                            className="px-3 py-1.5 bg-indigo-600 text-white font-bold rounded-lg text-xs hover:bg-indigo-700 transition-all cursor-pointer"
                          >
                            Guardar
                          </button>
                          <button
                            onClick={() => setEditItemId(null)}
                            className="px-3 py-1.5 bg-slate-100 text-slate-600 font-bold rounded-lg text-xs hover:bg-slate-200 transition-all cursor-pointer"
                          >
                            Cancelar
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-start justify-between">
                        <p className="text-sm text-slate-800 leading-relaxed flex-1">{item.text}</p>
                        <div className="flex items-center gap-1 ml-3 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                          <button
                            onClick={() => handleStartEdit(item)}
                            className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                            title="Editar"
                          >
                            <TrendingUp size={14} className="rotate-45" />
                          </button>
                          <button
                            onClick={() => {
                              if (confirm("Tem a certeza que deseja eliminar este fator?")) {
                                deleteItemMutation.mutate(item.id);
                              }
                            }}
                            className="p-1.5 hover:bg-red-50 rounded-lg text-slate-400 hover:text-red-600 transition-colors cursor-pointer"
                            title="Eliminar"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
                {getItems(yearDetail, expandedQuadrant).length === 0 && (
                  <div className="col-span-full py-20 text-center">
                    <PlusIcon size={48} className="mx-auto text-slate-200 mb-4" />
                    <h3 className="text-lg font-bold text-slate-400 tracking-tight">
                      Nenhum fator identificado
                    </h3>
                    <p className="text-slate-400 text-sm mt-1">
                      Comece por adicionar um novo fator a este grupo.
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div className="px-8 py-4 border-t border-slate-200 bg-white flex items-center justify-between shrink-0">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                Total: {getItems(yearDetail, expandedQuadrant).length} Fatores
              </span>
              <button
                onClick={() => setExpandedQuadrant(null)}
                className="px-6 py-2 bg-slate-100 text-slate-600 font-bold rounded-xl hover:bg-slate-200 transition-all text-sm cursor-pointer"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Item Dialog */}
      {addDialogOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-8">
            <h2 className="text-xl font-bold text-slate-900 mb-2">
              Adicionar {QUADRANT_CONFIG.find((c) => c.type === addType)?.label}
            </h2>
            <p className="text-slate-500 text-sm mb-6">
              Identifique um novo fator para a análise estratégica.
            </p>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                  Texto do Fator
                </label>
                <textarea
                  placeholder="Descreva o fator identificado..."
                  className="w-full h-24 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-100 transition-all resize-none"
                  value={addText}
                  onChange={(e) => setAddText(e.target.value)}
                />
              </div>
              <div className="pt-4 flex gap-3">
                <button
                  onClick={() => setAddDialogOpen(false)}
                  className="flex-1 px-4 py-3 bg-white border border-slate-200 text-slate-600 font-bold rounded-xl hover:bg-slate-50 transition-all text-sm cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleAddItem}
                  disabled={!addText.trim()}
                  className="flex-1 px-4 py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-all text-sm disabled:opacity-50 shadow-lg shadow-indigo-200 cursor-pointer"
                >
                  Adicionar Fator
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
