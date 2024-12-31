"use client";

import React, { useState } from "react";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { SubscribePromptDialog } from "@/components/SubscribePromptDialog";

interface PrintButtonProps {
  label?: string;
}

export function PrintButton({ label = "Print" }: PrintButtonProps) {
  const { data: session } = useSession();
  const [showDialog, setShowDialog] = useState(false);

  const isSubscribed = session?.user?.subscription?.status === "ACTIVE";

  const handlePrint = () => {
    if (!isSubscribed) {
      setShowDialog(true);
      return;
    }
    window.print();
  };

  return (
    <>
      <Button variant="outline" onClick={handlePrint}>
        {label}
      </Button>
      <SubscribePromptDialog
        open={showDialog}
        onOpenChange={(open) => setShowDialog(open)}
      />
    </>
  );
}
