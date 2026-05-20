import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { YearSelector } from "@/components/year-selector";
import { YearDocumentsSection } from "@/components/year-documents-section";
import { Card, CardContent, CardHeader, CardTitle, CardAction } from "@/components/ui/card";
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
import { toast } from "sonner";
import { Pencil } from "lucide-react";
import type { DocumentWithVersionsResponse } from "@/types";

interface YearDetail {
  yearId: number;
  year: number;
  documents: DocumentWithVersionsResponse[];
}

interface SingletonWithYearsData {
  id: number;
  description: string | null;
  years: YearDetail[];
}

interface SingletonWithYearsPageProps {
  title: string;
  descriptionLabel: string;
  descriptionPlaceholder: string;
  emptyDescriptionText: string;
  queryKey: string[];
  fetchFn: () => Promise<SingletonWithYearsData>;
  updateFn: (data: { description: string }) => Promise<SingletonWithYearsData>;
  uploadFn: (yearId: number, file: File, version: number, uploadedById: number, existingDocumentId?: number | null) => Promise<unknown>;
  yearDetailQueryKey: (yearId: number) => string[];
  yearDetailFetchFn: (yearId: number) => Promise<YearDetail>;
  versioned?: boolean;
}

export function SingletonWithYearsPage({
  title,
  descriptionLabel,
  descriptionPlaceholder,
  emptyDescriptionText,
  queryKey,
  fetchFn,
  updateFn,
  uploadFn,
  yearDetailQueryKey,
  yearDetailFetchFn,
  versioned = true,
}: SingletonWithYearsPageProps) {
  const queryClient = useQueryClient();
  const [selectedYearId, setSelectedYearId] = useState<number | null>(null);
  const [editOpen, setEditOpen] = useState(false);
  const [editDescription, setEditDescription] = useState("");

  const { data, isLoading, isError } = useQuery({
    queryKey,
    queryFn: fetchFn,
  });

  const { data: yearDetail } = useQuery({
    queryKey: selectedYearId ? yearDetailQueryKey(selectedYearId) : ["disabled"],
    queryFn: () => yearDetailFetchFn(selectedYearId!),
    enabled: selectedYearId !== null,
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

  const handleEdit = () => {
    if (!data) return;
    setEditDescription(data.description ?? "");
    setEditOpen(true);
  };

  const handleYearChange = (yearId: number) => {
    setSelectedYearId(yearId);
  };

  const documents = yearDetail?.documents ?? [];

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
          <CardTitle>Evidência Documental</CardTitle>
          <CardAction>
            <YearSelector selectedYearId={selectedYearId} onYearChange={handleYearChange} />
          </CardAction>
        </CardHeader>
        <CardContent>
          {selectedYearId === null ? (
            <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
              <p className="text-sm">Selecione um ano para ver os documentos.</p>
            </div>
          ) : (
            <YearDocumentsSection
              documents={documents}
              queryKey={yearDetailQueryKey(selectedYearId)}
              uploadFn={(file, version, uploadedById, existingDocumentId) =>
                uploadFn(selectedYearId, file, version, uploadedById, existingDocumentId)
              }
              versioned={versioned}
            />
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
            <Button onClick={() => updateMutation.mutate({ description: editDescription })} disabled={updateMutation.isPending}>
              {updateMutation.isPending ? "A guardar..." : "Guardar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}