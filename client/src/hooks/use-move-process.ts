import { useMutation, useQueryClient } from "@tanstack/react-query";
import { moveProcess } from "@/api/core";
import { toast } from "sonner";

export const useMoveProcess = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      processId,
      macroProcessId,
    }: {
      processId: number;
      macroProcessId: number | null;
    }) => {
      await moveProcess(processId, macroProcessId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["macroprocesses"] });
      queryClient.invalidateQueries({
        queryKey: ["macroprocesses", "full"],
      });
      toast.success("Processo movido com sucesso!");
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message ?? "Erro ao mover o processo");
    },
  });
};
