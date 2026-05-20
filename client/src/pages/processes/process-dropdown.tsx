import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ArrowRightLeft, MoreVertical, Trash2 } from "lucide-react";
import { useState } from "react";
import { DeleteProcessDialog } from "./delete-process-dialog";
import { MoveProcessDialog } from "./move-process-dialog";

export const ProcessDropdown = ({
  processId,
  macroProcessId,
}: {
  processId: number;
  macroProcessId: number;
}) => {
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [moveOpen, setMoveOpen] = useState(false);

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant={"ghost"}>
            <MoreVertical size={20} />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuGroup>
            <DropdownMenuItem
              onSelect={e => {
                e.preventDefault();
                setMoveOpen(true);
              }}
            >
              <ArrowRightLeft size={16} />
              Mover Processo
            </DropdownMenuItem>
            <DropdownMenuItem
              onSelect={e => {
                e.preventDefault();
                setDeleteOpen(true);
              }}
              variant="destructive"
            >
              <Trash2 size={16} />
              Apagar Processo
            </DropdownMenuItem>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
      <DeleteProcessDialog open={deleteOpen} onOpenChange={setDeleteOpen} processId={processId} />
      <MoveProcessDialog
        open={moveOpen}
        onOpenChange={setMoveOpen}
        processId={processId}
        macroProcessId={macroProcessId}
      />
    </>
  );
};
