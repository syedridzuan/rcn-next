"use client";

import { useState } from "react";
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog";
// ^ Make sure you have `alert-dialog.tsx` from shadcn/ui generated
// and adjust the import path as needed

interface Subscription {
  id: string;
  status: string;
  cancelAtPeriodEnd: boolean;
  stripeSubscriptionId: string | null;
  // etc...
}

export default function SubscriptionActionsClient({
  subscription,
}: {
  subscription: Subscription;
}) {
  const [cancelOpen, setCancelOpen] = useState(false);
  const [resumeOpen, setResumeOpen] = useState(false);

  // If subscription is already canceled or set to cancelAtPeriodEnd,
  // you might hide or disable the Cancel button
  const canCancel =
    subscription.status === "ACTIVE" && !subscription.cancelAtPeriodEnd;
  const canResume = subscription.cancelAtPeriodEnd;

  return (
    <div className="mt-4 flex gap-3">
      {/* CANCEL Button + Alert Dialog */}
      {canCancel ? (
        <AlertDialog open={cancelOpen} onOpenChange={setCancelOpen}>
          <AlertDialogTrigger asChild>
            <button className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700">
              Cancel (schedule)
            </button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Jadualkan Pembatalan?</AlertDialogTitle>
              <AlertDialogDescription>
                Ini akan membatalkan langganan pada akhir kitaran bil yang
                sedang berjalan. Adakah anda pasti?
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Batal</AlertDialogCancel>
              {/* Use an <AlertDialogAction> for confirm or a <form> */}
              <AlertDialogAction asChild>
                <form
                  action={`/admin/api/subscriptions/${subscription.id}/cancel`}
                  method="POST"
                >
                  <button
                    type="submit"
                    className="px-4 py-2 bg-red-600 text-white rounded"
                  >
                    Ya, Teruskan
                  </button>
                </form>
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      ) : (
        <button
          className="px-4 py-2 bg-gray-200 text-gray-500 rounded cursor-not-allowed"
          disabled
        >
          Cancel
        </button>
      )}

      {/* RESUME Button + Alert Dialog */}
      {canResume ? (
        <AlertDialog open={resumeOpen} onOpenChange={setResumeOpen}>
          <AlertDialogTrigger asChild>
            <button className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700">
              Resume
            </button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Teruskan Langganan?</AlertDialogTitle>
              <AlertDialogDescription>
                Tindakan ini akan membatalkan pembatalan berjadual, dan
                langganan akan diteruskan seperti biasa.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Batal</AlertDialogCancel>
              <AlertDialogAction asChild>
                <form
                  action={`/admin/api/subscriptions/${subscription.id}/resume`}
                  method="POST"
                >
                  <button
                    type="submit"
                    className="px-4 py-2 bg-green-600 text-white rounded"
                  >
                    Ya, Teruskan
                  </button>
                </form>
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      ) : (
        <button
          className="px-4 py-2 bg-gray-200 text-gray-500 rounded cursor-not-allowed"
          disabled
        >
          Resume
        </button>
      )}
    </div>
  );
}
