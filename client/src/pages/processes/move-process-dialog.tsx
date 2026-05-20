import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useQuery } from "@tanstack/react-query";
import { getMacroProcesses } from "@/api/core";
import { useMoveProcess } from "@/hooks/use-move-process";
import { Skeleton } from "@/components/ui/skeleton";
import { XCircle } from "lucide-react";

interface MoveProcessDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  processId: number;
  macroProcessId: number;
}

export const MoveProcessDialog = ({
  open,
  onOpenChange,
  processId,
  macroProcessId,
}: MoveProcessDialogProps) => {
  const { data: macroProcesses, isLoading } = useQuery({
    queryKey: ["macroprocesses"],
    queryFn: getMacroProcesses,
  });

  const moveProcessMutation = useMoveProcess();

  const handleMove = (macroProcessId: number | null) => {
    moveProcessMutation.mutate(
      { processId, macroProcessId },
      {
        onSuccess: () => {
          onOpenChange(false);
        },
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Mover Processo</DialogTitle>
          <DialogDescription>
            Selecione o macroprocesso para o qual deseja mover este processo.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-2 mt-4 max-h-[300px] overflow-y-auto pr-2">
          {isLoading ? (
            <div className="space-y-2">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          ) : (
            <>
              {macroProcessId !== 0 && (
                <Button
                  variant="outline"
                  className="justify-start gap-2 border-dashed"
                  onClick={() => handleMove(null)}
                  disabled={moveProcessMutation.isPending}
                >
                  <XCircle size={18} className="text-muted-foreground" />
                  Sem Macro Processo (Desassociar)
                </Button>
              )}

              {macroProcesses?.length === 0 && (
                <div className="text-center py-8 border-2 border-dashed border-slate-200 rounded-lg">
                  <p className="text-slate-400">Ainda não existem macro processos criados.</p>
                </div>
              )}

              {macroProcesses
                ?.filter(mp => mp.id !== macroProcessId)
                .map(mp => (
                  <Button
                    key={mp.id}
                    variant="outline"
                    className="justify-start"
                    onClick={() => handleMove(mp.id)}
                    disabled={moveProcessMutation.isPending}
                  >
                    {mp.name}
                  </Button>
                ))}
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
