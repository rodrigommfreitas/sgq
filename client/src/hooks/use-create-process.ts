import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createProcess } from "@/api/core";
import { toast } from "sonner";

export const useCreateProcess = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createProcess,

    onSuccess: () => {
      toast.success("Processo criado com sucesso!");
      queryClient.invalidateQueries({
        queryKey: ["macroprocesses"],
      });

      queryClient.invalidateQueries({
        queryKey: ["macroprocesses", "full"],
      });
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message ?? "Erro ao criar o macro processo");
    },
  });
};
