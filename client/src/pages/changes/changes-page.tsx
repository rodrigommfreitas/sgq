import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { ChangeResponse, ChangeStatus, ChangeRequest } from "@/types";
import { getChanges, createChange, patchChange, deleteChange } from "@/api/core";
import { useAuth } from "@/context/auth-context";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, ArrowUpDown, ArrowUp, ArrowDown, Search } from "lucide-react";

type SortKey = "description" | "status" | "startDate" | "expectedEndDate";
type SortDir = "asc" | "desc";

function statusVariant(status: ChangeStatus) {
  switch (status) {
    case "INITIATED":
      return "secondary" as const;
    case "IN_PROGRESS":
      return "default" as const;
    case "FINISHED":
      return "outline" as const;
    case "CANCELLED":
      return "destructive" as const;
  }
}

function statusLabel(status: ChangeStatus) {
  switch (status) {
    case "INITIATED":
      return "Iniciada";
    case "IN_PROGRESS":
      return "Em Curso";
    case "FINISHED":
      return "Concluída";
    case "CANCELLED":
      return "Cancelada";
  }
}

function formatDate(date: string | null) {
  if (!date) return "—";
  return new Date(date).toLocaleDateString("pt-PT", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

interface ChangeFormData {
  description: string;
  origin: string;
  whatWillBeDone: string;
  why: string;
  startDate: string;
  timeLimitInDays: string;
  expectedEndDate: string;
  realEndDate: string;
  where: string;
  how: string;
  howMuch: string;
  status: ChangeStatus;
  notes: string;
}

const emptyForm: ChangeFormData = {
  description: "",
  origin: "",
  whatWillBeDone: "",
  why: "",
  startDate: "",
  timeLimitInDays: "",
  expectedEndDate: "",
  realEndDate: "",
  where: "",
  how: "",
  howMuch: "",
  status: "INITIATED",
  notes: "",
};

function formToRequest(f: ChangeFormData, userId: number): ChangeRequest {
  return {
    description: f.description || null,
    origin: f.origin || null,
    whatWillBeDone: f.whatWillBeDone || null,
    why: f.why || null,
    createdById: userId,
    startDate: f.startDate || null,
    timeLimitInDays: f.timeLimitInDays ? Number(f.timeLimitInDays) : null,
    expectedEndDate: f.expectedEndDate || null,
    realEndDate: f.realEndDate || null,
    where: f.where || null,
    how: f.how || null,
    howMuch: f.howMuch || null,
    status: f.status,
    notes: f.notes || null,
  };
}

export default function ChangesPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [statusOpen, setStatusOpen] = useState(false);
  const [statusId, setStatusId] = useState<number | null>(null);
  const [statusValue, setStatusValue] = useState<ChangeStatus>("INITIATED");
  const [editId, setEditId] = useState<number | null>(null);
  const [form, setForm] = useState<ChangeFormData>(emptyForm);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<ChangeStatus | "ALL">("ALL");
  const [sortKey, setSortKey] = useState<SortKey>("startDate");
  const [sortDir, setSortDir] = useState<SortDir>("desc");

  const {
    data: changes,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["changes"],
    queryFn: getChanges,
  });

  const createMutation = useMutation({
    mutationFn: (data: ChangeRequest) => createChange(data),
    onSuccess: () => {
      toast.success("Alteração criada com sucesso!");
      queryClient.invalidateQueries({ queryKey: ["changes"] });
      setCreateOpen(false);
      setForm(emptyForm);
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message ?? "Erro ao criar alteração");
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: ChangeRequest }) => patchChange(id, data),
    onSuccess: () => {
      toast.success("Alteração atualizada com sucesso!");
      queryClient.invalidateQueries({ queryKey: ["changes"] });
      setEditOpen(false);
      setEditId(null);
      setForm(emptyForm);
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message ?? "Erro ao atualizar alteração");
    },
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: number; status: ChangeStatus }) =>
      patchChange(id, { status }),
    onSuccess: () => {
      toast.success("Estado atualizado com sucesso!");
      queryClient.invalidateQueries({ queryKey: ["changes"] });
      setStatusOpen(false);
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message ?? "Erro ao atualizar estado");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteChange,
    onSuccess: () => {
      toast.success("Alteração eliminada com sucesso!");
      queryClient.invalidateQueries({ queryKey: ["changes"] });
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message ?? "Erro ao eliminar alteração");
    },
  });

  const handleEdit = (c: ChangeResponse) => {
    setEditId(c.id);
    setForm({
      description: c.description ?? "",
      origin: c.origin ?? "",
      whatWillBeDone: c.whatWillBeDone ?? "",
      why: c.why ?? "",
      startDate: c.startDate ?? "",
      timeLimitInDays: c.timeLimitInDays?.toString() ?? "",
      expectedEndDate: c.expectedEndDate ?? "",
      realEndDate: c.realEndDate ?? "",
      where: c.where ?? "",
      how: c.how ?? "",
      howMuch: c.howMuch ?? "",
      status: c.status,
      notes: c.notes ?? "",
    });
    setEditOpen(true);
  };

  const handleStatusClick = (c: ChangeResponse) => {
    setStatusId(c.id);
    setStatusValue(c.status);
    setStatusOpen(true);
  };

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  };

  const filtered = useMemo(() => {
    let list = changes ?? [];
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (c) =>
          (c.description ?? "").toLowerCase().includes(q) ||
          (c.origin ?? "").toLowerCase().includes(q) ||
          (c.createdBy ? `${c.createdBy.firstName} ${c.createdBy.lastName}`.toLowerCase().includes(q) : false),
      );
    }
    if (statusFilter !== "ALL") {
      list = list.filter((c) => c.status === statusFilter);
    }
    list = [...list].sort((a, b) => {
      let aVal: string | number | null;
      let bVal: string | number | null;
      switch (sortKey) {
        case "description":
          aVal = a.description ?? "";
          bVal = b.description ?? "";
          break;
        case "status":
          aVal = a.status;
          bVal = b.status;
          break;
        case "startDate":
          aVal = a.startDate ? new Date(a.startDate).getTime() : 0;
          bVal = b.startDate ? new Date(b.startDate).getTime() : 0;
          break;
        case "expectedEndDate":
          aVal = a.expectedEndDate ? new Date(a.expectedEndDate).getTime() : 0;
          bVal = b.expectedEndDate ? new Date(b.expectedEndDate).getTime() : 0;
          break;
      }
      if (aVal! < bVal!) return sortDir === "asc" ? -1 : 1;
      if (aVal! > bVal!) return sortDir === "asc" ? 1 : -1;
      return 0;
    });
    return list;
  }, [changes, search, statusFilter, sortKey, sortDir]);

  if (isLoading) {
    return (
      <div className="flex flex-col gap-4 max-w-5xl mx-auto w-full mt-8">
        <Skeleton className="h-10 w-1/3 rounded-xl" />
        <Skeleton className="h-24 w-full rounded-xl" />
        <Skeleton className="h-24 w-full rounded-xl" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="max-w-5xl mx-auto w-full mt-8">
        <p className="text-destructive">Erro ao carregar as alterações.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 max-w-5xl mx-auto w-full mt-8 mb-40">
      <div className="flex items-center justify-between border-b border-slate-200 pb-6">
        <h1 className="text-2xl font-semibold">6.3. Alterações</h1>
        <Button
          size="sm"
          onClick={() => {
            setForm(emptyForm);
            setCreateOpen(true);
          }}
        >
          <Plus className="size-4" />
          Nova Alteração
        </Button>
      </div>

      {(!changes || changes.length === 0) && (
        <div className="text-center py-12 text-muted-foreground">
          <p>Nenhuma alteração registada.</p>
          <p className="text-sm mt-1">Clique em "Nova Alteração" para começar.</p>
        </div>
      )}

      {changes && changes.length > 0 && (
        <>
          <div className="flex items-center gap-3">
            <div className="relative flex-1 max-w-xs">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <Input
                placeholder="Pesquisar..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-8"
              />
            </div>
            <select
              className="flex h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] outline-none"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as ChangeStatus | "ALL")}
            >
              <option value="ALL">Todos os estados</option>
              <option value="INITIATED">Iniciada</option>
              <option value="IN_PROGRESS">Em Curso</option>
              <option value="FINISHED">Concluída</option>
              <option value="CANCELLED">Cancelada</option>
            </select>
          </div>
          <Table className="border">
            <TableHeader>
              <TableRow>
                <TableHead>
                  <button className="inline-flex items-center gap-1 hover:text-foreground" onClick={() => handleSort("description")}>
                    Descrição
                    {sortKey === "description" ? (sortDir === "asc" ? <ArrowUp className="size-3" /> : <ArrowDown className="size-3" />) : <ArrowUpDown className="size-3" />}
                  </button>
                </TableHead>
                <TableHead className="w-28 text-center">
                  <button className="inline-flex items-center gap-1 hover:text-foreground" onClick={() => handleSort("status")}>
                    Estado
                    {sortKey === "status" ? (sortDir === "asc" ? <ArrowUp className="size-3" /> : <ArrowDown className="size-3" />) : <ArrowUpDown className="size-3" />}
                  </button>
                </TableHead>
                <TableHead className="w-36">Origem</TableHead>
                <TableHead className="w-28">
                  <button className="inline-flex items-center gap-1 hover:text-foreground" onClick={() => handleSort("startDate")}>
                    Início
                    {sortKey === "startDate" ? (sortDir === "asc" ? <ArrowUp className="size-3" /> : <ArrowDown className="size-3" />) : <ArrowUpDown className="size-3" />}
                  </button>
                </TableHead>
                <TableHead className="w-28">
                  <button className="inline-flex items-center gap-1 hover:text-foreground" onClick={() => handleSort("expectedEndDate")}>
                    Fim Previsto
                    {sortKey === "expectedEndDate" ? (sortDir === "asc" ? <ArrowUp className="size-3" /> : <ArrowDown className="size-3" />) : <ArrowUpDown className="size-3" />}
                  </button>
                </TableHead>
                <TableHead className="w-20">Responsável</TableHead>
                <TableHead className="w-10" />
                <TableHead className="w-10" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center text-muted-foreground py-8">
                    Nenhum resultado corresponde aos filtros.
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((c: ChangeResponse) => (
                  <TableRow
                    key={c.id}
                    className="cursor-pointer"
                    onClick={() => handleEdit(c)}
                  >
                    <TableCell className="font-medium max-w-[200px] truncate">
                      {c.description || "Sem descrição"}
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge
                        variant={statusVariant(c.status)}
                        className="cursor-pointer"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleStatusClick(c);
                        }}
                      >
                        {statusLabel(c.status)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {c.origin || "—"}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {formatDate(c.startDate)}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {formatDate(c.expectedEndDate)}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {c.createdBy ? `${c.createdBy.firstName} ${c.createdBy.lastName}` : "—"}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-8"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEdit(c);
                        }}
                      >
                        <Pencil className="size-4" />
                      </Button>
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-8"
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteMutation.mutate(c.id);
                        }}
                      >
                        <Trash2 className="size-4 text-destructive" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </>
      )}

      {/* Create Dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Nova Alteração</DialogTitle>
            <DialogDescription>Registe uma nova alteração planeada.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <ChangeFormFields form={form} setForm={setForm} />
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancelar</Button>
            </DialogClose>
            <Button
              onClick={() => createMutation.mutate(formToRequest(form, Number(user?.id ?? 1)))}
              disabled={createMutation.isPending}
            >
              {createMutation.isPending ? "A criar..." : "Criar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Editar Alteração</DialogTitle>
            <DialogDescription>Altere os dados da alteração.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <ChangeFormFields form={form} setForm={setForm} />
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancelar</Button>
            </DialogClose>
            <Button
              onClick={() =>
                updateMutation.mutate({
                  id: editId!,
                  data: formToRequest(form, Number(user?.id ?? 1)),
                })
              }
              disabled={updateMutation.isPending}
            >
              {updateMutation.isPending ? "A guardar..." : "Guardar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Status Change Dialog */}
      <Dialog open={statusOpen} onOpenChange={setStatusOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Alterar Estado</DialogTitle>
            <DialogDescription>Altere o estado desta alteração.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="status">Novo estado</Label>
              <select
                id="status"
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] outline-none"
                value={statusValue}
                onChange={e => setStatusValue(e.target.value as ChangeStatus)}
              >
                <option value="INITIATED">Iniciada</option>
                <option value="IN_PROGRESS">Em Curso</option>
                <option value="FINISHED">Concluída</option>
                <option value="CANCELLED">Cancelada</option>
              </select>
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancelar</Button>
            </DialogClose>
            <Button
              onClick={() => statusMutation.mutate({ id: statusId!, status: statusValue })}
              disabled={statusMutation.isPending}
            >
              {statusMutation.isPending ? "A guardar..." : "Guardar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function ChangeFormFields({
  form,
  setForm,
}: {
  form: ChangeFormData;
  setForm: React.Dispatch<React.SetStateAction<ChangeFormData>>;
}) {
  return (
    <div className="grid grid-cols-2 gap-4">
      <div className="col-span-2 grid gap-2">
        <Label htmlFor="description">Descrição *</Label>
        <Input
          id="description"
          value={form.description}
          onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
          placeholder="Descrição da alteração"
        />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="origin">Origem</Label>
        <Input
          id="origin"
          value={form.origin}
          onChange={e => setForm(f => ({ ...f, origin: e.target.value }))}
          placeholder="Ex: Auditoria interna"
        />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="status">Estado</Label>
        <select
          id="status"
          className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] outline-none"
          value={form.status}
          onChange={e => setForm(f => ({ ...f, status: e.target.value as ChangeStatus }))}
        >
          <option value="INITIATED">Iniciada</option>
          <option value="IN_PROGRESS">Em Curso</option>
          <option value="FINISHED">Concluída</option>
          <option value="CANCELLED">Cancelada</option>
        </select>
      </div>
      <div className="col-span-2 grid gap-2">
        <Label htmlFor="whatWillBeDone">O quê será feito</Label>
        <Input
          id="whatWillBeDone"
          value={form.whatWillBeDone}
          onChange={e => setForm(f => ({ ...f, whatWillBeDone: e.target.value }))}
          placeholder="Descreva o que será feito"
        />
      </div>
      <div className="col-span-2 grid gap-2">
        <Label htmlFor="why">Porquê</Label>
        <Input
          id="why"
          value={form.why}
          onChange={e => setForm(f => ({ ...f, why: e.target.value }))}
          placeholder="Razão da alteração"
        />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="startDate">Data de início</Label>
        <Input
          id="startDate"
          type="date"
          value={form.startDate}
          onChange={e => setForm(f => ({ ...f, startDate: e.target.value }))}
        />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="expectedEndDate">Data prevista de fim</Label>
        <Input
          id="expectedEndDate"
          type="date"
          value={form.expectedEndDate}
          onChange={e => setForm(f => ({ ...f, expectedEndDate: e.target.value }))}
        />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="timeLimitInDays">Prazo (dias)</Label>
        <Input
          id="timeLimitInDays"
          type="number"
          min={1}
          value={form.timeLimitInDays}
          onChange={e => setForm(f => ({ ...f, timeLimitInDays: e.target.value }))}
          placeholder="Ex: 30"
        />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="where">Onde</Label>
        <Input
          id="where"
          value={form.where}
          onChange={e => setForm(f => ({ ...f, where: e.target.value }))}
          placeholder="Local ou departamento"
        />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="how">Como</Label>
        <Input
          id="how"
          value={form.how}
          onChange={e => setForm(f => ({ ...f, how: e.target.value }))}
          placeholder="Método de implementação"
        />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="howMuch">Quanto</Label>
        <Input
          id="howMuch"
          value={form.howMuch}
          onChange={e => setForm(f => ({ ...f, howMuch: e.target.value }))}
          placeholder="Recursos necessários"
        />
      </div>
      <div className="col-span-2 grid gap-2">
        <Label htmlFor="notes">Notas</Label>
        <textarea
          id="notes"
          className="flex min-h-[80px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] outline-none resize-y"
          value={form.notes}
          onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
          placeholder="Notas adicionais..."
        />
      </div>
    </div>
  );
}
