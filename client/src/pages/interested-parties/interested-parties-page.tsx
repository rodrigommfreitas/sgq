import { useState, useMemo, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type {
  InterestedPartyResponse,
  InterestedPartyType,
  CreateInterestedPartyRequest,
  UpdateInterestedPartyRequest,
  ProcessOptionResponse,
  YearResponse,
  DocumentWithVersionsResponse,
} from "@/types";
import {
  getInterestedPartiesByYear,
  createInterestedParty,
  updateInterestedParty,
  deleteInterestedParty,
  getProcessOptionsByYear,
  getYears,
  associateInterestedPartyYears,
  associateInterestedPartyYearsFull,
  disassociateInterestedPartyYears,
  associateInterestedPartyProcesses,
  disassociateInterestedPartyProcesses,
  uploadInterestedPartyEvidence,
  downloadDocumentVersion,
  deleteDocument,
} from "@/api/core";
import { useAuth } from "@/context/auth-context";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import {
  Plus,
  Users,
  Search,
  Globe,
  Pencil,
  Trash2,
  Link as LinkIcon,
  Phone,
  Calendar,
  Check,
  X,
  ChevronRight,
  Paperclip,
  Upload,
} from "lucide-react";

type SortKey = "name" | "type" | "category";

const typeLabels: Record<InterestedPartyType, string> = {
  INTERNAL: "Interna",
  EXTERNAL: "Externa",
};

interface FormData {
  name: string;
  type: InterestedPartyType;
  category: string;
  contactInfo: string;
  needs: string;
  communicationAndMonitoringPlan: string;
  processYearIds: number[];
}

const emptyForm: FormData = {
  name: "",
  type: "INTERNAL",
  category: "",
  contactInfo: "",
  needs: "",
  communicationAndMonitoringPlan: "",
  processYearIds: [],
};

export default function InterestedPartiesPage() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [yearId, setYearId] = useState<number | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [form, setForm] = useState<FormData>(emptyForm);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<InterestedPartyType | "ALL">("ALL");
  const [sortKey, setSortKey] = useState<SortKey>("name");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [yearsOpen, setYearsOpen] = useState(false);
  const [yearsParty, setYearsParty] = useState<InterestedPartyResponse | null>(null);
  const [processOpen, setProcessOpen] = useState(false);

  const { data: years, isLoading: yearsLoading } = useQuery({
    queryKey: ["years"],
    queryFn: getYears,
  });

  const sortedYearsAll = years ? [...years].sort((a, b) => b.year - a.year) : [];
  const currentYear = new Date().getFullYear();
  const selectedYearId = yearId ?? (sortedYearsAll.length > 0 ? (sortedYearsAll.find(y => y.year === currentYear)?.id ?? sortedYearsAll[0].id) : null);

  const {
    data: parties,
    isLoading: partiesLoading,
    isError,
  } = useQuery({
    queryKey: ["interested-parties", selectedYearId],
    queryFn: () => getInterestedPartiesByYear(selectedYearId!),
    enabled: !!selectedYearId,
  });

  const { data: processOptions } = useQuery({
    queryKey: ["process-options", selectedYearId],
    queryFn: () => getProcessOptionsByYear(selectedYearId!),
    enabled: !!selectedYearId,
  });

  const createMutation = useMutation({
    mutationFn: (data: CreateInterestedPartyRequest) => createInterestedParty(data),
    onSuccess: () => {
      toast.success("Parte interessada criada com sucesso!");
      queryClient.invalidateQueries({ queryKey: ["interested-parties", selectedYearId] });
      setCreateOpen(false);
      setForm(emptyForm);
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message ?? "Erro ao criar parte interessada");
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateInterestedPartyRequest }) =>
      updateInterestedParty(id, data),
    onSuccess: () => {
      toast.success("Parte interessada atualizada com sucesso!");
      queryClient.invalidateQueries({ queryKey: ["interested-parties", selectedYearId] });
      setEditOpen(false);
      setEditId(null);
      setForm(emptyForm);
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message ?? "Erro ao atualizar parte interessada");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteInterestedParty,
    onSuccess: () => {
      toast.success("Parte interessada eliminada com sucesso!");
      queryClient.invalidateQueries({ queryKey: ["interested-parties", selectedYearId] });
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message ?? "Erro ao eliminar parte interessada");
    },
  });

  const uploadEvidenceMutation = useMutation({
    mutationFn: ({ interestedPartyYearId, file }: { interestedPartyYearId: number; file: File }) =>
      uploadInterestedPartyEvidence(interestedPartyYearId, file, user!.id),
    onSuccess: () => {
      toast.success("Evidência carregada com sucesso!");
      queryClient.invalidateQueries({ queryKey: ["interested-parties", selectedYearId] });
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message ?? "Erro ao carregar evidência");
    },
  });

  const deleteEvidenceMutation = useMutation({
    mutationFn: deleteDocument,
    onSuccess: () => {
      toast.success("Evidência eliminada com sucesso!");
      queryClient.invalidateQueries({ queryKey: ["interested-parties", selectedYearId] });
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message ?? "Erro ao eliminar evidência");
    },
  });

  const handleEdit = (p: InterestedPartyResponse) => {
    setEditId(p.interestedPartyYearId);
    setForm({
      name: p.name ?? "",
      type: p.type,
      category: p.category ?? "",
      contactInfo: p.contactInfo ?? "",
      needs: p.needs ?? "",
      communicationAndMonitoringPlan: p.communicationAndMonitoringPlan ?? "",
      processYearIds: p.processes?.map((proc) => proc.processYearId) ?? [],
    });
    setEditOpen(true);
  };

  const editParty = parties?.find((p) => p.interestedPartyYearId === editId) ?? null;

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  };

  const filtered = useMemo(() => {
    let list = parties ?? [];
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.category?.toLowerCase().includes(q) ||
          p.contactInfo?.toLowerCase().includes(q) ||
          p.needs?.toLowerCase().includes(q),
      );
    }
    if (typeFilter !== "ALL") {
      list = list.filter((p) => p.type === typeFilter);
    }
    list = [...list].sort((a, b) => {
      let aVal: string;
      let bVal: string;
      switch (sortKey) {
        case "name":
          aVal = a.name ?? "";
          bVal = b.name ?? "";
          break;
        case "type":
          aVal = a.type;
          bVal = b.type;
          break;
        case "category":
          aVal = a.category ?? "";
          bVal = b.category ?? "";
          break;
      }
      const cmp = aVal.localeCompare(bVal);
      return sortDir === "asc" ? cmp : -cmp;
    });
    return list;
  }, [parties, search, typeFilter, sortKey, sortDir]);

  if (yearsLoading) {
    return (
      <div className="flex flex-col gap-4 max-w-5xl mx-auto w-full mt-8">
        <Skeleton className="h-10 w-1/3 rounded-xl" />
        <Skeleton className="h-64 w-full rounded-xl" />
      </div>
    );
  }

  if (!years || years.length === 0) {
    return (
      <div className="max-w-5xl mx-auto w-full mt-8">
        <h1 className="text-2xl font-semibold mb-6">4.2. Partes Interessadas</h1>
        <p className="text-muted-foreground">Nenhum ano disponível. Crie anos primeiro.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 max-w-5xl mx-auto w-full mt-8 mb-40">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary shrink-0 shadow-sm">
            <Users size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Partes Interessadas</h1>
            <p className="text-muted-foreground text-sm">Gerir partes interessadas, necessidades e expetativas.</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Select
            value={selectedYearId?.toString() ?? ""}
            onValueChange={(v) => setYearId(Number(v))}
          >
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Selecionar ano" />
            </SelectTrigger>
            <SelectContent>
              {sortedYearsAll.map((y) => (
                <SelectItem key={y.id} value={y.id.toString()}>
                  {y.year}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            size="sm"
            onClick={() => {
              setForm(emptyForm);
              setCreateOpen(true);
            }}
            disabled={!selectedYearId}
          >
            <Plus className="size-4" />
            Nova Parte
          </Button>
        </div>
      </div>

      {/* Search & filter bar */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground size-4" />
          <Input
            placeholder="Pesquisar por nome ou categoria..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select
          value={typeFilter}
          onValueChange={(v) => setTypeFilter(v as InterestedPartyType | "ALL")}
        >
          <SelectTrigger className="w-[170px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">Todos os tipos</SelectItem>
            <SelectItem value="INTERNAL">Interna</SelectItem>
            <SelectItem value="EXTERNAL">Externa</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Cards list */}
      {partiesLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-32 w-full rounded-xl" />
          <Skeleton className="h-32 w-full rounded-xl" />
        </div>
      ) : isError ? (
        <p className="text-destructive">Erro ao carregar as partes interessadas.</p>
      ) : filtered.length > 0 ? (
        <div className="space-y-4">
          {filtered.map((p) => (
            <PartyCard
              key={p.id}
              party={p}
              onClick={() => handleEdit(p)}
              onDelete={() => deleteMutation.mutate(p.interestedPartyYearId)}
              onManageYears={() => {
                setYearsParty(p);
                setYearsOpen(true);
              }}
            />
          ))}
        </div>
      ) : (
        <div className="border-2 border-dashed border-slate-200 rounded-xl p-12 text-center">
          <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Users className="text-slate-400" size={32} />
          </div>
          <h3 className="text-lg font-bold text-slate-800">Nenhuma parte interessada encontrada</h3>
          <p className="text-slate-500 text-sm max-w-xs mx-auto mt-2">
            {parties && parties.length > 0
              ? "Tente ajustar os filtros de pesquisa."
              : "Clique em \"Nova Parte\" para começar."}
          </p>
        </div>
      )}

      {/* Create Dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Nova Parte Interessada</DialogTitle>
            <DialogDescription>Registe uma nova parte interessada.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <PartyFormFields form={form} setForm={setForm} processOptions={processOptions ?? []} showAssociations={false} />
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancelar</Button>
            </DialogClose>
            <Button
              onClick={() =>
                createMutation.mutate({
                  name: form.name,
                  type: form.type,
                  category: form.category || null,
                  contactInfo: form.contactInfo || null,
                  yearId: selectedYearId!,
                  needs: form.needs || null,
                  communicationAndMonitoringPlan: form.communicationAndMonitoringPlan || null,
                  processYearIds: form.processYearIds.length ? form.processYearIds : null,
                })
              }
              disabled={createMutation.isPending || !form.name.trim() || !form.type}
            >
              {createMutation.isPending ? "A criar..." : "Criar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Editar Parte Interessada</DialogTitle>
            <DialogDescription>Altere os dados da parte interessada.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <PartyFormFields form={form} setForm={setForm} processOptions={processOptions ?? []} onOpenProcessDialog={() => {
              if (editParty) {
                setProcessOpen(true);
              }
            }}
            evidences={editParty?.evidences}
            onUploadEvidence={(file) => {
              if (editParty) {
                uploadEvidenceMutation.mutate({ interestedPartyYearId: editParty.interestedPartyYearId, file });
              }
            }}
            onDeleteEvidence={(documentId) => deleteEvidenceMutation.mutate(documentId)}
            uploadPending={uploadEvidenceMutation.isPending}
            deletePending={deleteEvidenceMutation.isPending}
            />
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancelar</Button>
            </DialogClose>
            <Button
              onClick={() =>
                updateMutation.mutate({
                  id: editId!,
                  data: {
                    name: form.name || null,
                    type: form.type,
                    category: form.category || null,
                    contactInfo: form.contactInfo || null,
                    needs: form.needs || null,
                    communicationAndMonitoringPlan: form.communicationAndMonitoringPlan || null,
                  },
                })
              }
              disabled={updateMutation.isPending || !form.name.trim() || !form.type}
            >
              {updateMutation.isPending ? "A guardar..." : "Guardar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Year Association Dialog */}
      {yearsParty && (
        <YearAssociationDialog
          isOpen={yearsOpen}
          onClose={() => {
            setYearsOpen(false);
            setYearsParty(null);
          }}
          party={yearsParty}
          allYears={sortedYearsAll}
          currentYearId={selectedYearId!}
          onSuccess={() => {
            queryClient.invalidateQueries({ queryKey: ["interested-parties"] });
          }}
        />
      )}

      {/* Process Association Dialog */}
      {editParty && processOpen && (
        <ProcessAssociationDialog
          isOpen={processOpen}
          onClose={() => {
            setProcessOpen(false);
          }}
          party={editParty}
          allProcesses={processOptions ?? []}
          onSuccess={() => {
            queryClient.invalidateQueries({ queryKey: ["interested-parties", selectedYearId] });
          }}
        />
      )}
    </div>
  );
}

function PartyCard({
  party,
  onClick,
  onDelete,
  onManageYears,
}: {
  party: InterestedPartyResponse;
  onClick: () => void;
  onDelete: () => void;
  onManageYears: () => void;
}) {
  const isInternal = party.type === "INTERNAL";
  const hasDetails = party.processes && party.processes.length > 0;

  return (
    <div className="border border-slate-200 rounded-md shadow-sm overflow-hidden">
      <div
        className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-slate-50 transition-colors select-none"
        onClick={onClick}
      >
        <div
          className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${
            isInternal ? "bg-indigo-100 text-indigo-600" : "bg-amber-100 text-amber-600"
          }`}
        >
          <Users size={20} />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-slate-900 truncate">{party.name}</h3>
            <span
              className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                isInternal ? "bg-indigo-50 text-indigo-700" : "bg-amber-50 text-amber-700"
              }`}
            >
              {typeLabels[party.type]}
            </span>
          </div>
          <div className="flex items-center gap-4 text-xs text-slate-500 mt-0.5">
            {party.category && (
              <span className="flex items-center gap-1">
                <Globe size={12} className="text-slate-400" />
                {party.category}
              </span>
            )}
            {party.contactInfo && (
              <span className="flex items-center gap-1">
                <Phone size={12} className="text-slate-400" />
                {party.contactInfo}
              </span>
            )}
            {party.processes && party.processes.length > 0 && (
              <span className="flex items-center gap-1">
                <LinkIcon size={12} className="text-slate-400" />
                {party.processes.length} processo{party.processes.length !== 1 ? "s" : ""}
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
          <button
            onClick={onManageYears}
            className="flex items-center gap-1.5 px-2 py-1 bg-slate-100 hover:bg-slate-200 rounded text-[10px] font-bold text-slate-500 transition-colors"
            title="Gerir anos"
          >
            <Calendar size={12} />
            {party.year}
          </button>
          <button
            onClick={onDelete}
            className="p-2 hover:bg-red-50 rounded-lg text-slate-400 hover:text-destructive transition-colors"
            title="Eliminar"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      {hasDetails && (
        <div className="px-4 pb-3 pt-1 border-t border-slate-100 text-xs text-slate-500 flex flex-wrap gap-x-4 gap-y-1">
          {party.processes && party.processes.length > 0 && (
            <span className="truncate">
              Processos: {party.processes.map((p) => p.processName).join(", ")}
            </span>
          )}
        </div>
      )}
    </div>
  );
}

function YearAssociationDialog({
  isOpen,
  onClose,
  party,
  allYears,
  currentYearId,
  onSuccess,
}: {
  isOpen: boolean;
  onClose: () => void;
  party: InterestedPartyResponse;
  allYears: YearResponse[];
  currentYearId: number;
  onSuccess: () => void;
}) {
  const queryClient = useQueryClient();

  const { data: allParties } = useQuery({
    queryKey: ["interested-parties-all-for-party", party.id],
    queryFn: async () => {
      const results = await Promise.all(
        allYears.map((y) =>
          getInterestedPartiesByYear(y.id).then((parties) =>
            parties.filter((p) => p.id === party.id)
          )
        )
      );
      return results.flat();
    },
    enabled: isOpen,
  });

  const associatedYearIds = new Set(allParties?.map((p) => p.yearId) ?? []);

  const [pendingYear, setPendingYear] = useState<number | null>(null);

const associateMutation = useMutation({
    mutationFn: ({ yearId, full }: { yearId: number; full: boolean }) => {
      if (full) {
        return associateInterestedPartyYearsFull(party.id, [yearId]);
      }
      return associateInterestedPartyYears(party.id, [yearId]);
    },
    onSuccess: () => {
      toast.success("Ano associado com sucesso!");
      queryClient.invalidateQueries({ queryKey: ["interested-parties"] });
      queryClient.invalidateQueries({ queryKey: ["interested-parties-all-for-party"] });
      setPendingYear(null);
      onSuccess();
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message ?? "Erro ao associar ano");
    },
  });

  const disassociateMutation = useMutation({
    mutationFn: (yearId: number) =>
      disassociateInterestedPartyYears(party.id, [yearId]),
    onSuccess: () => {
      toast.success("Ano desassociado com sucesso!");
      queryClient.invalidateQueries({ queryKey: ["interested-parties"] });
      queryClient.invalidateQueries({ queryKey: ["interested-parties-all-for-party"] });
      onSuccess();
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message ?? "Erro ao desassociar ano");
    },
  });

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="text-primary" size={20} />
            Gerir Anos
          </DialogTitle>
          <DialogDescription>
            Selecione os anos em que <strong>{party.name}</strong> está ativa.
          </DialogDescription>
        </DialogHeader>

        {pendingYear !== null ? (
          <div className="py-4 space-y-3">
            <h3 className="text-sm font-bold text-slate-800">Associar ano {allYears.find((y) => y.id === pendingYear)?.year}</h3>
            <p className="text-xs text-slate-500">
              Como deseja associar este ano?
            </p>
            <button
              onClick={() => associateMutation.mutate({ yearId: pendingYear, full: false })}
              disabled={associateMutation.isPending}
              className="w-full text-left p-4 rounded-lg border border-slate-200 hover:border-blue-300 hover:bg-blue-50 transition-all group cursor-pointer"
            >
              <div className="font-bold text-slate-800 group-hover:text-blue-700 text-sm">Apenas esta parte interessada</div>
              <div className="text-xs text-slate-500">A parte interessada será associada ao novo ano sem copiar processos.</div>
            </button>
            <button
              onClick={() => associateMutation.mutate({ yearId: pendingYear, full: true })}
              disabled={associateMutation.isPending}
              className="w-full text-left p-4 rounded-lg border border-slate-200 hover:border-blue-300 hover:bg-blue-50 transition-all group cursor-pointer"
            >
              <div className="font-bold text-slate-800 group-hover:text-blue-700 text-sm">Copiar dados do ano atual</div>
              <div className="text-xs text-slate-500">Inclui processos e indicadores atualmente associados.</div>
            </button>
            <button
              onClick={() => setPendingYear(null)}
              className="w-full py-2 text-sm text-slate-500 hover:text-slate-700 font-medium cursor-pointer"
            >
              Cancelar
            </button>
          </div>
        ) : (
          <>
            <div className="py-4 space-y-4 max-h-[400px] overflow-y-auto">
              {(() => {
                const associated = allYears.filter((y) => associatedYearIds.has(y.id));
                const other = allYears.filter((y) => !associatedYearIds.has(y.id));
                return (
                  <>
                    {associated.length > 0 && (
                      <div>
                        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Anos Associados</h4>
                        <div className="space-y-2">
                          {associated.map((y) => {
                            const isCurrentYear = y.id === currentYearId;
                            return (
                              <div
                                key={y.id}
                                className="w-full flex items-center justify-between px-4 py-3 rounded-lg border bg-blue-50 border-blue-200 text-blue-700"
                              >
                                <span className="font-bold text-sm">{y.year}</span>
                                <div className="flex items-center gap-2">
                                  {isCurrentYear && (
                                    <span className="text-[10px] font-bold text-blue-500 uppercase tracking-wider">atual</span>
                                  )}
                                  <button
                                    onClick={() => {
                                      if (associated.length <= 1) {
                                        toast.error("Uma parte interessada deve ter pelo menos um ano associado.");
                                        return;
                                      }
                                      disassociateMutation.mutate(y.id);
                                    }}
                                    className="p-1.5 rounded-lg text-blue-600 hover:bg-blue-100 transition-colors cursor-pointer"
                                    title="Remover ano"
                                  >
                                    <X size={16} />
                                  </button>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                    {other.length > 0 && (
                      <div>
                        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Outros Anos</h4>
                        <div className="space-y-2">
                          {other.map((y) => (
                            <button
                              key={y.id}
                              onClick={() => setPendingYear(y.id)}
                              className="w-full flex items-center justify-between px-4 py-3 rounded-lg border bg-white border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50 transition-all cursor-pointer"
                            >
                              <span className="font-bold text-sm">{y.year}</span>
                              <Plus size={16} className="text-slate-400" />
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                );
              })()}
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline">Fechar</Button>
              </DialogClose>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

function ProcessAssociationDialog({
  isOpen,
  onClose,
  party,
  allProcesses,
  onSuccess,
}: {
  isOpen: boolean;
  onClose: () => void;
  party: InterestedPartyResponse;
  allProcesses: ProcessOptionResponse[];
  onSuccess: () => void;
}) {
  const [search, setSearch] = useState("");
  const currentProcessIds = new Set(party.processes?.map((p) => p.processYearId) ?? []);

  const filteredProcesses = search.trim()
    ? allProcesses.filter(
        (p) =>
          p.processName.toLowerCase().includes(search.toLowerCase()) ||
          (p.macroProcessName?.toLowerCase() ?? "").includes(search.toLowerCase()),
      )
    : allProcesses;

  const associateMutation = useMutation({
    mutationFn: (processYearIds: number[]) =>
      associateInterestedPartyProcesses(party.interestedPartyYearId, processYearIds),
    onSuccess: () => {
      toast.success("Processo associado com sucesso!");
      onSuccess();
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message ?? "Erro ao associar processo");
    },
  });

  const disassociateMutation = useMutation({
    mutationFn: (processYearIds: number[]) =>
      disassociateInterestedPartyProcesses(party.interestedPartyYearId, processYearIds),
    onSuccess: () => {
      toast.success("Processo desassociado com sucesso!");
      onSuccess();
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message ?? "Erro ao desassociar processo");
    },
  });

  const handleToggle = (processYearId: number) => {
    if (currentProcessIds.has(processYearId)) {
      disassociateMutation.mutate([processYearId]);
    } else {
      associateMutation.mutate([processYearId]);
    }
  };

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent className="sm:max-w-lg max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Associar Processos</DialogTitle>
          <DialogDescription>
            Associe ou desassocie processos a <strong>{party.name}</strong>.
          </DialogDescription>
        </DialogHeader>

        <div className="px-6 py-3 border-b bg-slate-50/50">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground size-4" />
            <Input
              placeholder="Pesquisar processos..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-1">
          {filteredProcesses.length === 0 ? (
            <div className="py-8 text-center text-muted-foreground text-sm">
              Nenhum processo encontrado.
            </div>
          ) : (
            filteredProcesses.map((proc) => {
              const isAssociated = currentProcessIds.has(proc.processYearId);
              return (
                <button
                  key={proc.processYearId}
                  onClick={() => handleToggle(proc.processYearId)}
                  disabled={associateMutation.isPending || disassociateMutation.isPending}
                  className={`w-full flex items-center justify-between p-3 rounded-lg border transition-all text-left group ${
                    isAssociated
                      ? "bg-blue-50 border-blue-200 hover:bg-blue-100"
                      : "border-transparent hover:bg-slate-50 hover:border-slate-200"
                  }`}
                >
                  <div>
                    <div className="font-medium text-sm text-slate-800">{proc.processName}</div>
                    {proc.macroProcessName && (
                      <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 border border-slate-200 px-1 rounded bg-slate-50 mt-1 inline-block">
                        {proc.macroProcessName}
                      </span>
                    )}
                  </div>
                  {isAssociated && <Check size={16} className="text-blue-600 shrink-0" />}
                </button>
              );
            })
          )}
        </div>

        <DialogFooter className="border-t pt-4">
          <DialogClose asChild>
            <Button variant="outline">Fechar</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function PartyFormFields({
  form,
  setForm,
  processOptions,
  onOpenProcessDialog,
  evidences,
  onUploadEvidence,
  onDeleteEvidence,
  uploadPending,
  deletePending,
  showAssociations = true,
}: {
  form: FormData;
  setForm: React.Dispatch<React.SetStateAction<FormData>>;
  processOptions: ProcessOptionResponse[];
  onOpenProcessDialog?: () => void;
  evidences?: DocumentWithVersionsResponse[];
  onUploadEvidence?: (file: File) => void;
  onDeleteEvidence?: (documentId: number) => void;
  uploadPending?: boolean;
  deletePending?: boolean;
  showAssociations?: boolean;
}) {
  const associatedProcesses = processOptions.filter((p) =>
    form.processYearIds.includes(p.processYearId)
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2 grid gap-1.5">
            <Label htmlFor="name">Nome *</Label>
            <Input
              id="name"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              placeholder="Nome da parte interessada"
            />
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="type">Tipo *</Label>
            <Select
              value={form.type}
              onValueChange={(v) => setForm((f) => ({ ...f, type: v as InterestedPartyType }))}
            >
              <SelectTrigger id="type">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="INTERNAL">Interna</SelectItem>
                <SelectItem value="EXTERNAL">Externa</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="category">Categoria</Label>
            <Input
              id="category"
              value={form.category}
              onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
              placeholder="Ex: Funcionário, Cliente"
            />
          </div>
        </div>
        <div className="grid gap-1.5">
          <Label htmlFor="contactInfo">Contacto</Label>
          <div className="relative">
            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
            <Input
              id="contactInfo"
              value={form.contactInfo}
              onChange={(e) => setForm((f) => ({ ...f, contactInfo: e.target.value }))}
              placeholder="Email ou telefone"
              className="pl-9"
            />
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div className="grid gap-1.5">
          <Label htmlFor="needs">Necessidades e Expetativas</Label>
          <textarea
            id="needs"
            className="flex min-h-[100px] w-full rounded-md border border-input bg-slate-50 px-3 py-2 text-sm shadow-xs placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] outline-none resize-none"
            value={form.needs}
            onChange={(e) => setForm((f) => ({ ...f, needs: e.target.value }))}
            placeholder="Que necessidades e expetativas tem esta parte interessada?"
          />
        </div>
        <div className="grid gap-1.5">
          <Label htmlFor="communicationAndMonitoringPlan">Plano de Comunicação e Monitorização</Label>
          <textarea
            id="communicationAndMonitoringPlan"
            className="flex min-h-[100px] w-full rounded-md border border-input bg-slate-50 px-3 py-2 text-sm shadow-xs placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] outline-none resize-none"
            value={form.communicationAndMonitoringPlan}
            onChange={(e) => setForm((f) => ({ ...f, communicationAndMonitoringPlan: e.target.value }))}
            placeholder="Como comunicar e monitorizar esta parte interessada?"
          />
        </div>
      </div>

      {/* Process Association Section */}
      {showAssociations && (
        <>
      <div className="col-span-1 lg:col-span-2 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-200 pb-2">
          <h4 className="text-sm font-bold text-slate-700 uppercase tracking-wide">
            Processos Associados
          </h4>
          {onOpenProcessDialog && (
            <button
              onClick={onOpenProcessDialog}
              className="flex items-center gap-1 text-sm bg-blue-50 border border-blue-200 hover:border-blue-400 hover:text-blue-700 text-blue-600 px-3 py-1.5 rounded-md shadow-sm transition-all cursor-pointer"
            >
              <LinkIcon size={14} />
              Associar Processos
            </button>
          )}
        </div>
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-3">
          {associatedProcesses.length > 0 ? (
            associatedProcesses.map((proc) => (
              <div
                key={proc.processYearId}
                className="flex items-center justify-between text-sm bg-white border border-slate-200 px-3 py-2 rounded shadow-sm"
              >
                <div className="flex flex-col">
                  <span className="font-semibold text-slate-800">{proc.processName}</span>
                  {proc.macroProcessName && (
                    <span className="text-xs text-slate-400 uppercase">{proc.macroProcessName}</span>
                  )}
                </div>
                <button
                  onClick={() =>
                    setForm((f) => ({
                      ...f,
                      processYearIds: f.processYearIds.filter((id) => id !== proc.processYearId),
                    }))
                  }
                  className="text-slate-300 hover:text-red-500 transition-colors p-1"
                  title="Desassociar"
                >
                  <X size={14} />
                </button>
              </div>
            ))
          ) : (
            <div className="col-span-full py-8 text-center border-2 border-dashed border-slate-200 rounded-lg text-slate-400">
              Nenhum processo associado.
            </div>
          )}
        </div>
      </div>

      {/* Evidence Documents Section */}
      <div className="col-span-1 lg:col-span-2 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-200 pb-2">
          <h4 className="text-sm font-bold text-slate-700 uppercase tracking-wide">
            Evidências
          </h4>
          {onUploadEvidence && (
            <button
              onClick={() => document.getElementById("evidence-upload")?.click()}
              disabled={uploadPending}
              className="flex items-center gap-1 text-sm bg-emerald-50 border border-emerald-200 hover:border-emerald-400 hover:text-emerald-700 text-emerald-600 px-3 py-1.5 rounded-md shadow-sm transition-all disabled:opacity-50 cursor-pointer"
            >
              <Upload size={14} />
              {uploadPending ? "A carregar..." : "Carregar Evidência"}
            </button>
          )}
          <input
            id="evidence-upload"
            type="file"
            className="hidden"
            accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.png,.jpg,.jpeg"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file && onUploadEvidence) {
                onUploadEvidence(file);
                e.target.value = "";
              }
            }}
          />
        </div>
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-3">
          {evidences && evidences.length > 0 ? (
            evidences.map((doc) => {
              const latestVersion = doc.versions?.[doc.versions.length - 1];
              return (
                <div
                  key={doc.documentId}
                  className="flex items-center justify-between text-sm bg-white border border-slate-200 px-3 py-2 rounded shadow-sm"
                >
                  <button
                    className="flex items-center gap-2 text-left hover:text-blue-600 transition-colors min-w-0 cursor-pointer"
                    onClick={() => {
                      if (latestVersion) {
                        downloadDocumentVersion(latestVersion.versionId, latestVersion.fileName);
                      }
                    }}
                    title={latestVersion?.fileName ?? "Documento"}
                  >
                    <Paperclip size={14} className="shrink-0" />
                    <span className="truncate">
                      {latestVersion?.fileName
                        ? latestVersion.fileName.replace(/_[0-9a-f-]{36}\./, ".")
                        : "Documento"}
                    </span>
                  </button>
                  {onDeleteEvidence && (
                    <button
                      onClick={() => onDeleteEvidence(doc.documentId)}
                      disabled={deletePending}
                      className="text-slate-300 hover:text-red-500 transition-colors p-1 disabled:opacity-50"
                      title="Eliminar evidência"
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
              );
            })
          ) : (
            <div className="col-span-full py-8 text-center border-2 border-dashed border-slate-200 rounded-lg text-slate-400">
              Nenhuma evidência carregada.
            </div>
)}
        </div>
      </div>
        </>
      )}
    </div>
  );
}