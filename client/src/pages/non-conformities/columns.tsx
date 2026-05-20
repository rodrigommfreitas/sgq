import {type ColumnDef} from "@tanstack/react-table"
import {Button} from "@/components/ui/button"
import {ArrowUpDown} from "lucide-react"
import {type NonConformity} from "../../types"

export const columns: ColumnDef<NonConformity>[] = [
    {
        accessorKey: "title",
        header: "Title",
    },
    {
        accessorKey: "status",
        header: ({column}) => (
            <Button
                variant="ghost"
                onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
                Status
                <ArrowUpDown className="ml-2 h-4 w-4"/>
            </Button>
        ),
    },
    {
        accessorKey: "severity",
        header:
            "Severity",
    },
    {
        accessorKey: "createdAt",
        header:
            "Created",
        cell:
            ({row}) =>
                new Date(row.getValue("createdAt")).toLocaleDateString(),
    },
]