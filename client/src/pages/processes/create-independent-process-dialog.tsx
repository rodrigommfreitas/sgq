import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Field, FieldGroup } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCreateProcess } from "@/hooks/use-create-process";
import { DialogDescription } from "@radix-ui/react-dialog";
import { Plus } from "lucide-react";
import { useState } from "react";

export const CreateIndependentProcessDialog = () => {
  const [open, setOpen] = useState(false);

  const createProcessMutation = useCreateProcess();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    console.log("submitting");
    e.preventDefault();

    const formData = new FormData(e.currentTarget);
    const name = formData.get("nome") as string;
    const obj = formData.get("objetivo") as string;

    if (!name?.trim()) return;

    createProcessMutation.mutate(
      {
        name: name.trim(),
        objective: obj?.trim() || "",
        owner: "",
      },
      {
        onSuccess: () => {
          setOpen(false);
          e.currentTarget.reset();
        },
        onError: error => {
          setOpen(false);
          e.currentTarget.reset();
        },
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant={"ghost"}>
          <Plus />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-sm">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Criar Processo Independente</DialogTitle>
            <DialogDescription></DialogDescription>
          </DialogHeader>
          <FieldGroup className="mt-8">
            <Field>
              <Label htmlFor="nome">Nome</Label>
              <Input required id="nome" name="nome" placeholder="Nome" />
            </Field>
            <Field>
              <Label htmlFor="objetivo">Objetivo</Label>
              <Input required id="objetivo" name="objetivo" placeholder="Objetivo" />
            </Field>
          </FieldGroup>
          <DialogFooter className="mt-4">
            <DialogClose asChild>
              <Button variant="outline">Cancelar</Button>
            </DialogClose>
            <Button type="submit"> Criar</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
