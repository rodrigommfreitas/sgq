import { getIndicatorsSimple } from "@/api/core";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { DialogClose } from "@radix-ui/react-dialog";
import { useQuery } from "@tanstack/react-query";
import { LinkIcon, Search } from "lucide-react";
import { useState } from "react";

interface AssociateIndicatorDialogProps {
  alreadyAssociatedIds?: number[];
}

export const AssociateIndicatorDialog = ({
  alreadyAssociatedIds,
}: AssociateIndicatorDialogProps) => {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const { data, isLoading, isError } = useQuery({
    queryKey: ["indicators", "simple"],
    queryFn: getIndicatorsSimple,
  });

  const associatedIds = alreadyAssociatedIds ?? [];

  // Indicators that can still be associated
  const availableIndicators = data?.filter(ind => !associatedIds.includes(ind.id));

  // Apply search on available indicators only
  const filteredIndicators = availableIndicators?.filter(ind =>
    ind.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const showSearch = (availableIndicators?.length ?? 0) > 0;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          className="flex items-center gap-1 text-sm bg-white border border-slate-300 hover:border-slate-400 hover:text-slate-800 text-slate-600 px-3 py-1.5 rounded-md shadow-sm transition-all"
        >
          <LinkIcon size={14} />
          Associar Existente
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Associar Indicador Existente</DialogTitle>
          <DialogDescription />
        </DialogHeader>

        {/* Empty state */}
        {!isLoading && (!availableIndicators || availableIndicators.length === 0) && (
          <div className="text-center py-8 border-2 border-dashed border-slate-200 rounded-lg">
            <p className="text-slate-400">Não há indicadores disponíveis para associação.</p>
          </div>
        )}

        {/* Search bar */}
        {!isLoading && showSearch && (
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input
              type="text"
              placeholder="Pesquisar indicadores..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        )}

        {!isLoading && filteredIndicators?.length === 0 && showSearch && (
          <div className="text-center py-4 text-sm text-slate-400">
            Nenhum indicador encontrado para a pesquisa.
          </div>
        )}

        {!isLoading &&
          filteredIndicators?.map(ind => (
            <div
              key={ind.id}
              // onClick={() => onAssociate(ind.id)}
              className="group flex items-center justify-between p-3 rounded-md hover:bg-blue-50 cursor-pointer border border-blue-50 hover:border-blue-100 transition-all"
            >
              <div>
                <div className="font-medium text-slate-800 text-sm group-hover:text-blue-800">
                  {ind.name}
                </div>
                <div className="text-xs text-slate-500 flex items-center gap-2 mt-1">
                  <span>{ind.frequency}</span>
                  <span>•</span>
                  <span>{ind.owner}</span>
                </div>
              </div>
              <div className="text-slate-300 group-hover:text-blue-500">
                <LinkIcon size={16} />
              </div>
            </div>
          ))}

        <DialogFooter className="mt-4">
          <DialogClose asChild>
            <Button variant="outline">Cancelar</Button>
          </DialogClose>
          <Button type="submit">Criar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
