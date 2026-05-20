import {useState} from "react"
import {type ColumnDef} from "@tanstack/react-table"
import {DataTable} from "@/components/data-table/data-table"
import {CreateNonConformityDialog} from "./create-nc-dialog"
import {Button} from "@/components/ui/button"
import {type NonConformity} from "@/types"
import {NCDetailsDialog} from "@/pages/non-conformities/nc-details-dialog.tsx";
import {NonConformityTable} from "@/pages/non-conformities/non-conformities-table.tsx";
import {Badge} from "@/components/ui/badge.tsx";

const INITIAL_DATA: NonConformity[] = [
    {
        name: "YO",
        origin: "Madeira",
        evaluation: "",
        comment: "sem comentários",
        actions: "botão",
        status: "OPEN",
        reportedAt: ""
    },
    {}
]

export default function NonConformitiesPage() {
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
    const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
    const [detailedNC, setDetailedNC] = useState<NonConformity | null>(null);
    const [data, setData] = useState<NonConformity[]>(INITIAL_DATA);

    const handleCreate = (formData: any) => {
        const newNC: NonConformity = {
            name: formData.title,
            origin: "form dialog",
            evaluation: "damn son",
            comment: formData.comment,
            actions: "",
            status: 'OPEN',
            reportedAt: new Date().toISOString()
        };
        setData([newNC, ...data]);
    };
/*
    const columns: ColumnDef<NonConformity>[] = [
        {accessorKey: "name", header: "Name"},
        {accessorKey: "origin", header: "Origin"},
        {
            accessorKey: "status",
            header: "Status",
            cell: ({row}) => <Badge status={row.getValue("status")}/>,
        },
        {accessorKey: "reportedDate", header: "Reported"},
        {
            accessorKey: "comment",
            header: "Comment",
            cell: ({row}) => (
                <span className="truncate max-w-[200px] block text-muted-foreground cursor-pointer">
          {row.getValue("comment")}
        </span>
            ),
        },
    ]*/

    return (
        <div className="flex h-full flex-col gap-4">
            <div className="flex items-center justify-between">
                <h1 className="text-xl font-semibold">Não Conformidades</h1>
                {/*<Button onClick={() => setIsCreateDialogOpen(true)}>Criar</Button>*/}
            </div>

            {/* <DataTable columns={columns} data={data}/>*/}
            <NonConformityTable data={data} onCreateNew={setIsCreateDialogOpen}/>

            <CreateNonConformityDialog
                open={isCreateDialogOpen}
                onOpenChange={setIsCreateDialogOpen}
                onCreate={() => {
                }}
            />
            <NCDetailsDialog
                nc={detailedNC}
                open={isCreateDialogOpen}
                onOpenChange={setIsDetailsDialogOpen}
            />
        </div>
    )
}