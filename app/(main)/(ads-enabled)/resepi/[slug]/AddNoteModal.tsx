"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { updateSavedRecipeNotes } from "./actions";
import { useToast } from "@/components/ui/use-toast";

interface AddNoteModalProps {
  savedRecipeId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  existingNote?: string | null;
}

export function AddNoteModal({
  savedRecipeId,
  open,
  onOpenChange,
  existingNote,
}: AddNoteModalProps) {
  const [note, setNote] = useState(existingNote || "");
  const [isPending, setIsPending] = useState(false);

  const { toast } = useToast();

  const handleSave = async () => {
    try {
      setIsPending(true);
      await updateSavedRecipeNotes(savedRecipeId, note);

      // Paparkan toast kejayaan
      toast({
        title: "Berjaya",
        description: "Nota anda telah disimpan.",
        variant: "default",
      });

      onOpenChange(false);
    } catch (error) {
      // Paparkan toast ralat
      toast({
        title: "Ralat",
        description: "Gagal menyimpan nota.",
        variant: "destructive",
      });
    } finally {
      setIsPending(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Tambah Nota Pada Resipi</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <Textarea
            placeholder="Masukkan nota memasak, ubahsuaian, atau peringatan anda..."
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className="min-h-[150px]"
          />
        </div>
        <div className="flex justify-end gap-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isPending}
          >
            Batal
          </Button>
          <Button onClick={handleSave} disabled={isPending}>
            Simpan Nota
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
