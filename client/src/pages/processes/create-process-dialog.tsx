import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Field, FieldGroup } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCreateProcess } from "@/hooks/use-create-process";
import { DialogDescription } from "@radix-ui/react-dialog";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  macroProcessYearId?: number | null;
  yearId: number | null;
}

export const CreateProcessDialog = ({ open, onOpenChange, macroProcessYearId, yearId }: Props) => {
  const createProcessMutation = useCreateProcess();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const formData = new FormData(e.currentTarget);
    const name = formData.get("nome") as string;
    const obj = formData.get("objetivo") as string;

    if (!name?.trim() || !yearId) return;

    createProcessMutation.mutate(
      {
        name: name.trim(),
        objective: obj?.trim() || undefined,
        yearId,
        macroProcessYearId: macroProcessYearId ?? undefined,
      },
      {
        onSuccess: () => {
          onOpenChange(false);
          e.currentTarget.reset();
        },
        onError: () => {
          onOpenChange(false);
          e.currentTarget.reset();
        },
      },
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Criar Processo</DialogTitle>
            <DialogDescription></DialogDescription>
          </DialogHeader>
          <FieldGroup className="mt-8">
            <Field>
              <Label htmlFor="nome">Nome</Label>
              <Input required id="nome" name="nome" placeholder="Nome" />
            </Field>
            <Field>
              <Label htmlFor="objetivo">Objetivo</Label>
              <Input id="objetivo" name="objetivo" placeholder="Objetivo" />
            </Field>
          </FieldGroup>
          <DialogFooter className="mt-4">
            <DialogClose asChild>
              <Button onClick={() => onOpenChange(false)} variant="outline">
                Cancelar
              </Button>
            </DialogClose>
            <Button type="submit" disabled={createProcessMutation.isPending}>
              {createProcessMutation.isPending ? "Criando..." : "Criar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};