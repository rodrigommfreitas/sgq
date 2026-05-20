import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { type NonConformity } from "@/types.ts"

export function NCDetailsDialog({
                                    nc,
                                    open,
                                    onOpenChange,
                                }: {
    nc: NonConformity | null
    open: boolean
    onOpenChange: (open: boolean) => void
}) {
    if (!nc) return null

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle className="flex items-center justify-between">
                        {nc.name}
                        {/*<StatusBadge status={nc.status} />*/}
                    </DialogTitle>
                </DialogHeader>

                <div className="grid gap-4 text-sm">
                    <Field label="Origin" value={nc.origin} />
                    <Field label="Evaluation" value={nc.evaluation} />
                    <Field label="Comment" value={nc.comment} />
                    <Field label="Actions" value={nc.actions} />
                </div>
            </DialogContent>
        </Dialog>
    )
}

function Field({ label, value }: { label: string; value: string }) {
    return (
        <div className="space-y-1">
            <p className="text-muted-foreground">{label}</p>
            <p className="rounded-md bg-muted p-3">{value}</p>
        </div>
    )
}