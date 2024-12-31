"use client";

import { useState } from "react";
import { Bookmark } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AddNoteModal } from "./AddNoteModal";
import { useToast } from "@/components/ui/use-toast";
import { ToastAction } from "@/components/ui/toast";
import { useSession } from "next-auth/react";
import { SubscribePromptDialog } from "@/components/SubscribePromptDialog";
import { saveRecipe, unsaveRecipe } from "./actions";

interface SaveRecipeButtonProps {
  recipeId: string;
  savedRecipeId?: string | null;
  className?: string;
  existingNote?: string | null;
  isSubscribed: boolean;
}

export function SaveRecipeButton({
  recipeId,
  savedRecipeId,
  className,
  existingNote,
  isSubscribed,
}: SaveRecipeButtonProps) {
  const { data: session } = useSession();
  const [isPending, setIsPending] = useState(false);
  const [isSaved, setIsSaved] = useState(Boolean(savedRecipeId));
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [currentSavedId, setCurrentSavedId] = useState(savedRecipeId);

  // Dialog akan muncul jika pengguna belum melanggan
  const [showSubscribeDialog, setShowSubscribeDialog] = useState(false);

  // shadcn/ui toast
  const { toast } = useToast();

  async function handleToggleSave() {
    try {
      // 1. Semak sama ada pengguna mempunyai langganan
      if (!isSubscribed) {
        setShowSubscribeDialog(true);
        return;
      }

      // 2. Jika pengguna sudah melanggan, teruskan simpanan
      setIsPending(true);

      if (isSaved && currentSavedId) {
        await unsaveRecipe(currentSavedId);
        toast({
          title: "Resipi Dikeluarkan",
          description: "Resipi telah dikeluarkan daripada koleksi anda",
        });
        setIsSaved(false);
        setCurrentSavedId(null);
      } else {
        const result = await saveRecipe(recipeId);
        if (result.success && result.savedRecipeId) {
          setCurrentSavedId(result.savedRecipeId);
          setIsSaved(true);

          // Gunakan <ToastAction> untuk butang “Tambah Nota”
          toast({
            title: "Resipi Disimpan",
            description: "Ingin menambah nota?",
            action: (
              <ToastAction
                altText="Tambah nota"
                onClick={() => setShowNoteModal(true)}
              >
                Tambah Nota
              </ToastAction>
            ),
          });
        }
      }
    } catch (error) {
      toast({
        title: "Ralat",
        description: "Terdapat masalah semasa memproses permintaan anda.",
        variant: "destructive",
      });
    } finally {
      setIsPending(false);
    }
  }

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        disabled={isPending}
        onClick={handleToggleSave}
        className={className}
      >
        <Bookmark className={`h-4 w-4 mr-2 ${isSaved ? "fill-current" : ""}`} />
        {isSaved ? "Telah Disimpan" : "Simpan Resipi"}
      </Button>

      {currentSavedId && (
        <AddNoteModal
          savedRecipeId={currentSavedId}
          open={showNoteModal}
          onOpenChange={setShowNoteModal}
          existingNote={existingNote}
        />
      )}

      {/* Paparkan dialog langganan jika belum melanggan */}
      <SubscribePromptDialog
        open={showSubscribeDialog}
        onOpenChange={setShowSubscribeDialog}
      />
    </>
  );
}
