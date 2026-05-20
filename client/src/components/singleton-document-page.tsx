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
  uploadFn: (
    file: File,
    version: number,
    uploadedById: number,
    existingDocumentId?: number | null
  ) => Promise<SingletonDocumentResponse>;
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
    (v: DocumentVersionResponse) => v.status === "APPROVED"
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
                        {currentApprovedVersion.fileName
                          ? stripUuidSuffix(currentApprovedVersion.fileName)
                          : "—"}
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
                    .sort(
                      (a: DocumentVersionResponse, b: DocumentVersionResponse) =>
                        b.version - a.version
                    )
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
                            {v.uploadedBy?.firstName} {v.uploadedBy?.lastName} ·{" "}
                            {formatDate(v.uploadedAt)}
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
                onChange={e => setEditDescription(e.target.value)}
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
            <DialogDescription>Carregue uma nova versão do documento.</DialogDescription>
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
                onChange={e => setUploadVersion(Number(e.target.value))}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="file">Ficheiro</Label>
              <Input
                id="file"
                type="file"
                onChange={e => setUploadFile(e.target.files?.[0] ?? null)}
              />
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancelar</Button>
            </DialogClose>
            <Button onClick={handleUploadSubmit} disabled={!uploadFile || uploadMutation.isPending}>
              <Upload className="size-4" />
              {uploadMutation.isPending ? "A carregar..." : "Carregar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

/*

import React, { useState } from 'react';
import { 
  FileSearch, 
  History, 
  CheckCircle2, 
  Clock, 
  FileText, 
  Upload, 
  Save, 
  Plus, 
  ShieldCheck,
  AlertCircle,
  ExternalLink
} from 'lucide-react';
import { AppState, QMSScope, QMSScopeVersion } from './types';
import { Action } from './App';

interface QMSScopePageProps {
  state: AppState;
  dispatch: React.Dispatch<Action>;
  currentUser: string;
}

export const QMSScopePage: React.FC<QMSScopePageProps> = ({ state, dispatch, currentUser }) => {
  const { qmsScope } = state;
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(qmsScope.currentContent);
  const [showVersionHistory, setShowVersionHistory] = useState(false);
  const [newVersionLabel, setNewVersionLabel] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isVersionDialogOpen, setIsVersionDialogOpen] = useState(false);

  const handleSave = () => {
    dispatch({ type: 'UPDATE_QMS_SCOPE', content: editContent, user: currentUser });
    setIsEditing(false);
  };

  const handleCreateVersion = () => {
    if (!newVersionLabel) return;
    dispatch({ 
      type: 'CREATE_QMS_SCOPE_VERSION', 
      version: newVersionLabel, 
      content: qmsScope.currentContent,
      documentName: selectedFile?.name,
      user: currentUser 
    });
    setIsVersionDialogOpen(false);
    setNewVersionLabel('');
    setSelectedFile(null);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const approvedVersion = qmsScope.versions.find(v => v.status === 'Approved');

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-primary/10 text-primary rounded-xl flex items-center justify-center shadow-sm">
            <FileSearch size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">QMS Scope</h1>
            <p className="text-muted-foreground text-sm mt-1">Define and maintain the scope of the Quality Management System.</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setShowVersionHistory(!showVersionHistory)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold text-sm transition-all border ${
              showVersionHistory ? 'bg-foreground text-background border-foreground' : 'bg-card text-foreground border-border hover:bg-muted'
            }`}
          >
            <History size={18} />
            {showVersionHistory ? 'View Content' : 'Version History'}
          </button>
          {!showVersionHistory && (
            <button 
              onClick={() => setIsVersionDialogOpen(true)}
              className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg font-bold text-sm hover:bg-primary/90 transition-all shadow-sm"
            >
              <Plus size={18} />
              Create Version
            </button>
          )}
        </div>
      </div>

      {showVersionHistory ? (
        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-300">
          <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-4">Controlled Document Versions</h3>
          {qmsScope.versions.map((v) => (
            <div key={v.id} className="bg-card border border-border rounded-xl p-5 shadow-sm hover:shadow-md transition-all">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                  <div className={`p-2 rounded-lg ${v.status === 'Approved' ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-400'}`}>
                    <FileText size={20} />
                  </div>
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <h4 className="font-bold text-slate-900 text-lg">Version {v.version}</h4>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        v.status === 'Approved' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-slate-100 text-slate-600 border border-slate-200'
                      }`}>
                        {v.status}
                      </span>
                    </div>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500">
                      <div className="flex items-center gap-1">
                        <Clock size={12} />
                        Created: {new Date(v.createdAt).toLocaleDateString()} by {v.createdBy}
                      </div>
                      {v.status === 'Approved' && (
                        <div className="flex items-center gap-1 text-emerald-600 font-medium">
                          <ShieldCheck size={12} />
                          Approved: {new Date(v.approvedAt!).toLocaleDateString()} by {v.approvedBy}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {v.documentName && (
                    <button className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 text-slate-600 rounded-lg text-xs font-bold hover:bg-slate-100 transition-colors border border-slate-200">
                      <ExternalLink size={14} />
                      {v.documentName}
                    </button>
                  )}
                  {v.status === 'Draft' && (
                    <button 
                      onClick={() => dispatch({ type: 'APPROVE_QMS_SCOPE_VERSION', versionId: v.id, user: currentUser })}
                      className="flex items-center gap-2 px-3 py-1.5 bg-emerald-600 text-white rounded-lg text-xs font-bold hover:bg-emerald-700 transition-colors shadow-sm"
                    >
                      <CheckCircle2 size={14} />
                      Approve
                    </button>
                  )}
                </div>
              </div>
              <div className="mt-4 p-4 bg-slate-50 rounded-lg border border-slate-100 text-sm text-slate-600 italic">
                {v.content}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-300">
          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText size={18} className="text-slate-400" />
                <h3 className="font-bold text-slate-800">Scope Definition</h3>
              </div>
              {!isEditing ? (
                <button 
                  onClick={() => setIsEditing(true)}
                  className="text-xs font-bold text-blue-600 hover:text-blue-700 uppercase tracking-wider"
                >
                  Edit Content
                </button>
              ) : (
                <div className="flex items-center gap-3">
                  <button 
                    onClick={() => {
                      setIsEditing(false);
                      setEditContent(qmsScope.currentContent);
                    }}
                    className="text-xs font-bold text-slate-400 hover:text-slate-500 uppercase tracking-wider"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={handleSave}
                    className="flex items-center gap-1.5 bg-blue-600 text-white px-3 py-1 rounded-md text-xs font-bold hover:bg-blue-700 transition-all"
                  >
                    <Save size={14} />
                    Save
                  </button>
                </div>
              )}
            </div>
            <div className="p-8">
              {isEditing ? (
                <textarea 
                  className="w-full h-64 p-4 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all leading-relaxed"
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                />
              ) : (
                <div className="prose prose-slate max-w-none">
                  <p className="text-slate-700 leading-relaxed text-lg whitespace-pre-wrap">
                    {qmsScope.currentContent}
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                <Upload size={14} />
                Controlled Documents
              </h3>
              {approvedVersion?.documentName ? (
                <div className="p-6 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between group">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center text-slate-400 group-hover:text-blue-500 transition-colors shadow-sm border border-slate-100">
                      <FileText size={24} />
                    </div>
                    <div>
                      <p className="text-base font-bold text-slate-800">{approvedVersion.documentName}</p>
                      <p className="text-xs text-slate-400">Formal Scope Document • PDF</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <button className="flex items-center gap-2 px-4 py-2 bg-white text-slate-600 rounded-lg text-sm font-bold hover:bg-slate-100 transition-all border border-slate-200 shadow-sm">
                      <ExternalLink size={16} />
                      Download
                    </button>
                    <button 
                      onClick={() => setIsVersionDialogOpen(true)}
                      className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-bold hover:bg-blue-700 transition-all shadow-md"
                    >
                      <Upload size={16} />
                      Update Document
                    </button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12 border-2 border-dashed border-slate-100 rounded-xl">
                  <Upload className="mx-auto text-slate-200 mb-3" size={32} />
                  <p className="text-sm text-slate-500 font-medium">No controlled document attached to this version</p>
                  <p className="text-xs text-slate-400 mt-1 mb-6">Upload a formal document to create a new controlled version</p>
                  <button 
                    onClick={() => setIsVersionDialogOpen(true)}
                    className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-2.5 rounded-xl font-bold text-sm hover:bg-blue-700 transition-all shadow-lg shadow-blue-100"
                  >
                    <Upload size={18} />
                    Upload Scope File
                  </button>
                </div>
              )}
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                <ShieldCheck size={14} />
                Current Status
              </h3>
              {approvedVersion ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-3 p-3 bg-emerald-50 text-emerald-700 rounded-xl border border-emerald-100">
                    <CheckCircle2 size={20} />
                    <div>
                      <p className="text-sm font-bold">Approved Version {approvedVersion.version}</p>
                      <p className="text-[10px] uppercase tracking-wider opacity-80">Controlled Document</p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-400">Approved by:</span>
                      <span className="text-slate-700 font-medium">{approvedVersion.approvedBy}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-400">Date:</span>
                      <span className="text-slate-700 font-medium">{new Date(approvedVersion.approvedAt!).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-3 p-3 bg-amber-50 text-amber-700 rounded-xl border border-amber-100">
                  <AlertCircle size={20} />
                  <div>
                    <p className="text-sm font-bold">No Approved Version</p>
                    <p className="text-[10px] uppercase tracking-wider opacity-80">Draft Mode</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {isVersionDialogOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8 animate-in zoom-in-95 duration-200">
            <h2 className="text-xl font-bold text-slate-900 mb-2">Create Controlled Version</h2>
            <p className="text-slate-500 text-sm mb-6">This will create a draft version of the current scope for formal approval.</p>
            
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Version Label</label>
                <input 
                  type="text" 
                  placeholder="e.g. 1.1, 2.0..." 
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all"
                  value={newVersionLabel}
                  onChange={(e) => setNewVersionLabel(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Attach Document (Optional)</label>
                <div className="relative">
                  <input 
                    type="file" 
                    id="scope-file-upload"
                    className="hidden"
                    onChange={handleFileChange}
                  />
                  <label 
                    htmlFor="scope-file-upload"
                    className="flex items-center justify-between w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm cursor-pointer hover:bg-slate-100 transition-all"
                  >
                    <span className={selectedFile ? 'text-slate-900 font-medium' : 'text-slate-400'}>
                      {selectedFile ? selectedFile.name : 'Select PDF or Word file...'}
                    </span>
                    <Upload size={16} className="text-slate-400" />
                  </label>
                </div>
              </div>

              <div className="pt-4 flex gap-3">
                <button 
                  onClick={() => {
                    setIsVersionDialogOpen(false);
                    setSelectedFile(null);
                    setNewVersionLabel('');
                  }}
                  className="flex-1 px-4 py-3 bg-white border border-slate-200 text-slate-600 font-bold rounded-xl hover:bg-slate-50 transition-all text-sm"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleCreateVersion}
                  disabled={!newVersionLabel}
                  className="flex-1 px-4 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-all text-sm disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-200"
                >
                  Create Draft
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

*/
