import { useState } from "react";
import { Plus, Search } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { getIndicatorsByYear, getYears } from "@/api/core";
import { IndicatorItem } from "./indicator-item";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function IndicatorsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [yearId, setYearId] = useState<number | null>(null);

  const { data: years, isLoading: yearsLoading } = useQuery({
    queryKey: ["years"],
    queryFn: getYears,
  });

  const sortedYears = years ? [...years].sort((a, b) => b.year - a.year) : [];
  const selectedYearId = yearId ?? (sortedYears.length > 0 ? sortedYears[0].id : null);

  const { data, isLoading } = useQuery({
    queryKey: ["indicators", selectedYearId],
    queryFn: () => getIndicatorsByYear(selectedYearId!),
    enabled: !!selectedYearId,
  });

  const filteredIndicators = data?.filter((indicator) =>
    indicator.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  if (yearsLoading) {
    return (
      <div className="flex flex-col gap-4 max-w-5xl mx-auto w-full mt-8">
        <Skeleton className="h-10 w-1/3 rounded-xl" />
        <Skeleton className="h-64 w-full rounded-xl" />
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col gap-4 max-w-5xl mx-auto w-full mb-40 mt-8">
      <div className="flex items-center justify-between mb-4 border-b border-slate-200 pb-6">
        <h1 className="text-2xl font-semibold">Indicadores de Desempenho</h1>
        <div className="flex items-center gap-3">
          <Select
            value={selectedYearId?.toString() ?? ""}
            onValueChange={(v) => setYearId(Number(v))}
          >
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Selecionar ano" />
            </SelectTrigger>
            <SelectContent>
              {sortedYears.map((y) => (
                <SelectItem key={y.id} value={y.id.toString()}>
                  {y.year}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button>
            <Plus />
            Criar Indicador
          </Button>
        </div>
      </div>

      <div className="flex items-center gap-2 mb-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input
            type="text"
            placeholder="Pesquisar indicadores..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {isLoading && (
        <div className="space-y-4">
          <Skeleton className="h-24 w-full rounded-xl bg-black/10 dark:bg-white/10" />
          <Skeleton className="h-24 w-full rounded-xl bg-black/10 dark:bg-white/10" />
          <Skeleton className="h-24 w-full rounded-xl bg-black/10 dark:bg-white/10" />
        </div>
      )}

      {!isLoading && filteredIndicators && filteredIndicators.length === 0 && (
        <div className="text-center py-12 border-2 border-dashed border-slate-200 rounded-lg">
          <p className="text-slate-400">
            {searchQuery
              ? "Nenhum indicador encontrado para a pesquisa."
              : "Ainda não existem indicadores criados para este ano."}
          </p>
        </div>
      )}

      {!isLoading &&
        filteredIndicators &&
        filteredIndicators.map((indicator) => (
          <IndicatorItem key={indicator.id} indicator={indicator} />
        ))}
    </div>
  );
}