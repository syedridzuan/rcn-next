"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface SubscribePromptDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SubscribePromptDialog({
  open,
  onOpenChange,
}: SubscribePromptDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Langganan Diperlukan</DialogTitle>
          <DialogDescription>
            Untuk menggunakan ciri ini, anda perlu melanggan pelan ASAS terlebih
            dahulu.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Tutup</Button>
          </DialogClose>
          <Link href="/langganan" passHref>
            <Button>Langgan Sekarang</Button>
          </Link>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
