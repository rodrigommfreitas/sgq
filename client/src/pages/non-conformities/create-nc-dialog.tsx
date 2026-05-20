import { useState } from "react"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

interface Props {
    open: boolean
    onOpenChange: (open: boolean) => void
    onCreate: (data: any) => void
}

export function CreateNonConformityDialog({
                                              open,
                                              onOpenChange,
                                              onCreate,
                                          }: Props) {
    const [form, setForm] = useState({
        name: "",
        origin: "",
        evaluation: "",
        comment: "",
        status: "Open",
    })

    function submit(e: React.FormEvent) {
        e.preventDefault()
        onCreate(form)
        onOpenChange(false)
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle>Nova Não Conformidade</DialogTitle>
                    <DialogDescription>
                        Preencha os detalhes e guarde o registo.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={submit} className="grid gap-4">
                    <Input
                        placeholder="Nome"
                        value={form.name}
                        onChange={e => setForm({ ...form, name: e.target.value })}
                    />

                    <Input
                        placeholder="Origem"
                        value={form.origin}
                        onChange={e => setForm({ ...form, origin: e.target.value })}
                    />

                    <Input
                        placeholder="Avaliação"
                        value={form.evaluation}
                        onChange={e => setForm({ ...form, evaluation: e.target.value })}
                    />

                    <textarea
                        className="min-h-[100px] rounded-md border p-2 text-sm"
                        placeholder="Comentário"
                        value={form.comment}
                        onChange={e => setForm({ ...form, comment: e.target.value })}
                    />

                    <div className="flex justify-end gap-2">
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                            Cancelar
                        </Button>
                        <Button type="submit">Registar</Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    )
}