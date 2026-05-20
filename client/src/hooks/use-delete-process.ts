import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteProcess } from "@/api/core";
import { toast } from "sonner";

export const useDeleteProcess = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      await deleteProcess(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["macroprocesses"] });
      queryClient.invalidateQueries({
        queryKey: ["macroprocesses", "full"],
      });
      toast.success("Processo apagado com sucesso!");
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message ?? "Erro ao criar o macro processo");
    },
  });
};
