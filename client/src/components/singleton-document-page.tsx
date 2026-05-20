import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { SingletonDocumentResponse, DocumentVersionResponse, DocumentStatus } from "@/types";
import { useAuth } from "@/context/auth-context";
import { Card, CardContent, CardHeader, CardTitle, CardAction } from "@/components/ui/card";
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
import { toast } from "sonner";
import {
  approveDocumentVersion,
  deleteDocumentVersion,
  downloadDocumentVersion,
  stripUuidSuffix,
} from "@/api/core";
import {
  FileText,
  Pencil,
  Plus,
  Upload,
  CheckCircle2,
  Clock,
  XCircle,
  Download,
  Trash2,
} from "lucide-react";

function statusVariant(status: DocumentStatus) {
  switch (status) {
    case "APPROVED":
      return "default" as const;
    case "UNDER_REVIEW":
      return "secondary" as const;
    case "OBSOLETE":
      return "destructive" as const;
  }
}

function statusIcon(status: DocumentStatus) {
  switch (status) {
    case "APPROVED":
      return <CheckCircle2 className="size-4" />;
    case "UNDER_REVIEW":
      return <Clock className="size-4" />;
    case "OBSOLETE":
      return <XCircle className="size-4" />;
  }
}

function statusLabel(status: DocumentStatus) {
  switch (status) {
    case "APPROVED":
      return "Aprovado";
    case "UNDER_REVIEW":
      return "Em revisão";
    case "OBSOLETE":
      return "Obsoleto";
  }
}

function formatDate(iso: string | null) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("pt-PT", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

interface SingletonDocumentPageProps {
  title: string;
  descriptionLabel: string;
  descriptionPlaceholder: string;
  emptyDescriptionText: string;
  documentCardTitle: string;
  queryKey: string[];
  fetchFn: () => Promise<SingletonDocumentResponse>;
  updateFn: (data: { description: string }) => Promise<SingletonDocumentResponse>;
  uploadFn: (file: File, version: number, uploadedById: number, existingDocumentId?: number | null) => Promise<SingletonDocumentResponse>;
}

export function SingletonDocumentPage({
  title,
  descriptionLabel,
  descriptionPlaceholder,
  emptyDescriptionText,
  documentCardTitle,
  queryKey,
  fetchFn,
  updateFn,
  uploadFn,
}: SingletonDocumentPageProps) {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const [editOpen, setEditOpen] = useState(false);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [editDescription, setEditDescription] = useState("");
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadVersion, setUploadVersion] = useState(1);

  const { data, isLoading, isError } = useQuery({
    queryKey,
    queryFn: fetchFn,
  });

  const updateMutation = useMutation({
    mutationFn: updateFn,
    onSuccess: () => {
      toast.success("Atualizado com sucesso!");
      queryClient.invalidateQueries({ queryKey });
      setEditOpen(false);
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message ?? "Erro ao atualizar");
    },
  });

  const uploadMutation = useMutation({
    mutationFn: () => {
      if (!uploadFile) throw new Error("Nenhum ficheiro selecionado");
      const existingDocId = data?.document?.documentId ?? null;
      return uploadFn(uploadFile, uploadVersion, Number(user?.id ?? 1), existingDocId);
    },
    onSuccess: () => {
      toast.success("Documento carregado com sucesso!");
      queryClient.invalidateQueries({ queryKey });
      setUploadOpen(false);
      setUploadFile(null);
      setUploadVersion(1);
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message ?? "Erro ao carregar o documento");
    },
  });

  const approveMutation = useMutation({
    mutationFn: approveDocumentVersion,
    onSuccess: () => {
      toast.success("Versão aprovada com sucesso!");
      queryClient.invalidateQueries({ queryKey });
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message ?? "Erro ao aprovar a versão");
    },
  });

  const deleteVersionMutation = useMutation({
    mutationFn: deleteDocumentVersion,
    onSuccess: () => {
      toast.success("Versão eliminada com sucesso!");
      queryClient.invalidateQueries({ queryKey });
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message ?? "Erro ao eliminar a versão");
    },
  });

  const handleEdit = () => {
    if (!data) return;
    setEditDescription(data.description ?? "");
    setEditOpen(true);
  };

  const handleEditSubmit = () => {
    updateMutation.mutate({ description: editDescription });
  };

  const handleUploadOpen = () => {
    const nextVersion = data?.document?.versions?.length
      ? Math.max(...data.document.versions.map((v: DocumentVersionResponse) => v.version)) + 1
      : 1;
    setUploadVersion(nextVersion);
    setUploadFile(null);
    setUploadOpen(true);
  };

  const handleUploadSubmit = () => {
    if (!uploadFile) return;
    uploadMutation.mutate();
  };

  const currentApprovedVersion = data?.document?.versions?.find(
    (v: DocumentVersionResponse) => v.status === "APPROVED",
  );

  if (isLoading) {
    return (
      <div className="flex flex-col gap-4 max-w-5xl mx-auto w-full mt-8">
        <Skeleton className="h-10 w-1/3 rounded-xl" />
        <Skeleton className="h-40 w-full rounded-xl" />
        <Skeleton className="h-60 w-full rounded-xl" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col gap-4 max-w-5xl mx-auto w-full mt-8">
        <p className="text-destructive">Erro ao carregar os dados.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 max-w-5xl mx-auto w-full mt-8 mb-40">
      <div className="flex items-center justify-between border-b border-slate-200 pb-6">
        <h1 className="text-2xl font-semibold">{title}</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{descriptionLabel}</CardTitle>
          <CardAction>
            <Button variant="outline" size="sm" onClick={handleEdit}>
              <Pencil className="size-4" />
              Editar
            </Button>
          </CardAction>
        </CardHeader>
        <CardContent>
          {data?.description ? (
            <p className="text-sm leading-relaxed whitespace-pre-wrap">{data.description}</p>
          ) : (
            <p className="text-sm text-muted-foreground">{emptyDescriptionText}</p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{documentCardTitle}</CardTitle>
          <CardAction>
            <Button size="sm" onClick={handleUploadOpen}>
              <Plus className="size-4" />
              Nova Versão
            </Button>
          </CardAction>
        </CardHeader>
        <CardContent>
          {!data?.document ? (
            <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
              <FileText className="size-12 mb-3 opacity-40" />
              <p className="text-sm">Nenhum documento associado.</p>
              <p className="text-xs mt-1">Carregue uma nova versão para começar.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {currentApprovedVersion && (
                <div className="border border-green-200 dark:border-green-900 bg-green-50 dark:bg-green-950/30 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Versão Aprovada Atual</span>
                    <Badge variant={statusVariant("APPROVED")}>
                      {statusIcon("APPROVED")}
                      {statusLabel("APPROVED")}
                    </Badge>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="text-muted-foreground">Versão:</span>{" "}
                      <span className="font-medium">{currentApprovedVersion.version}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Ficheiro:</span>{" "}
                      <span className="font-medium">
                        {currentApprovedVersion.fileName ? stripUuidSuffix(currentApprovedVersion.fileName) : "—"}
                      </span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Carregado por:</span>{" "}
                      <span className="font-medium">
                        {currentApprovedVersion.uploadedBy?.firstName}{" "}
                        {currentApprovedVersion.uploadedBy?.lastName}
                      </span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Data:</span>{" "}
                      <span className="font-medium">
                        {formatDate(currentApprovedVersion.uploadedAt)}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <h3 className="text-sm font-medium text-muted-foreground">Histórico de Versões</h3>
                <div className="space-y-2">
                  {[...(data.document.versions ?? [])]
                    .sort((a: DocumentVersionResponse, b: DocumentVersionResponse) => b.version - a.version)
                    .map((v: DocumentVersionResponse) => (
                      <div
                        key={v.versionId}
                        className="flex items-center justify-between rounded-lg border p-3"
                      >
                        <div className="flex items-center gap-3">
                          <Badge variant={statusVariant(v.status)}>
                            {statusIcon(v.status)}
                            {statusLabel(v.status)}
                          </Badge>
                          <div>
                            <span className="text-sm font-medium">v{v.version}</span>
                            <span className="text-sm text-muted-foreground mx-2">—</span>
                            <span className="text-sm">
                              {v.fileName ? stripUuidSuffix(v.fileName) : "—"}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-muted-foreground">
                            {v.uploadedBy?.firstName} {v.uploadedBy?.lastName} · {formatDate(v.uploadedAt)}
                          </span>
                          {v.downloadUrl && (
                            <Button
                              variant="ghost"
                              size="icon-sm"
                              onClick={() => downloadDocumentVersion(v.versionId, v.fileName)}
                              title="Descarregar"
                            >
                              <Download className="size-4" />
                            </Button>
                          )}
                          {v.status === "UNDER_REVIEW" && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => approveMutation.mutate(v.versionId)}
                              disabled={approveMutation.isPending}
                              title="Aprovar versão"
                            >
                              <CheckCircle2 className="size-4" />
                              Aprovar
                            </Button>
                          )}
                          {v.status !== "APPROVED" && (
                            <Button
                              variant="ghost"
                              size="icon-sm"
                              onClick={() => deleteVersionMutation.mutate(v.versionId)}
                              disabled={deleteVersionMutation.isPending}
                              title="Eliminar versão"
                            >
                              <Trash2 className="size-4 text-destructive" />
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar {descriptionLabel}</DialogTitle>
            <DialogDescription>{descriptionPlaceholder}</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="description">Descrição</Label>
              <textarea
                id="description"
                className="flex min-h-[200px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] outline-none resize-y"
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                placeholder={descriptionPlaceholder}
              />
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancelar</Button>
            </DialogClose>
            <Button onClick={handleEditSubmit} disabled={updateMutation.isPending}>
              {updateMutation.isPending ? "A guardar..." : "Guardar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={uploadOpen} onOpenChange={setUploadOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nova Versão do Documento</DialogTitle>
            <DialogDescription>
              Carregue uma nova versão do documento.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="version">Versão</Label>
              <Input
                id="version"
                type="number"
                min={1}
                step={1}
                value={uploadVersion}
                onChange={(e) => setUploadVersion(Number(e.target.value))}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="file">Ficheiro</Label>
              <Input
                id="file"
                type="file"
                onChange={(e) => setUploadFile(e.target.files?.[0] ?? null)}
              />
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancelar</Button>
            </DialogClose>
            <Button
              onClick={handleUploadSubmit}
              disabled={!uploadFile || uploadMutation.isPending}
            >
              <Upload className="size-4" />
              {uploadMutation.isPending ? "A carregar..." : "Carregar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}