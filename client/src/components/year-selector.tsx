import { useQuery } from "@tanstack/react-query";
import { getYears } from "@/api/core";
import type { YearResponse } from "@/types";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface YearSelectorProps {
  selectedYearId: number | null;
  onYearChange: (yearId: number) => void;
}

export function YearSelector({ selectedYearId, onYearChange }: YearSelectorProps) {
  const { data: years, isLoading } = useQuery({
    queryKey: ["years"],
    queryFn: getYears,
  });

  const sortedYears = [...(years ?? [])].sort((a: YearResponse, b: YearResponse) => b.year - a.year);

  return (
    <Select
      value={selectedYearId?.toString() ?? ""}
      onValueChange={(val) => onYearChange(Number(val))}
    >
      <SelectTrigger className="w-[140px]">
        <SelectValue placeholder={isLoading ? "A carregar..." : "Selecionar ano"} />
      </SelectTrigger>
      <SelectContent>
        {sortedYears.map((y: YearResponse) => (
          <SelectItem key={y.id} value={y.id.toString()}>
            {y.year}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}