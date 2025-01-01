// app/admin/subscriptions/subscriptions-table.tsx
"use client";

import Link from "next/link";
import { Subscription } from "@prisma/client";
import { useState } from "react";
import { CancelSubButton } from "./CancelSubButton";

interface SubscriptionsTableProps {
  subscriptions: (Subscription & {
    user: { email: string | null } | null;
  })[];
}

export function SubscriptionsTable({ subscriptions }: SubscriptionsTableProps) {
  const [subs, setSubs] = useState(subscriptions);

  // For a quick local update after cancel
  function onCancelSuccess(subId: string) {
    setSubs((prev) => prev.filter((s) => s.id !== subId));
  }

  return (
    <div className="overflow-auto">
      <table className="w-full text-sm border-collapse">
        <thead>
          <tr className="bg-gray-200">
            <th className="py-2 px-3 border-b text-left">ID</th>
            <th className="py-2 px-3 border-b text-left">User Email</th>
            <th className="py-2 px-3 border-b text-left">Plan</th>
            <th className="py-2 px-3 border-b text-left">Status</th>
            <th className="py-2 px-3 border-b text-left">Actions</th>
          </tr>
        </thead>
        <tbody>
          {subs.map((sub) => (
            <tr key={sub.id}>
              {/* 1) Make ID into a link to the detail page */}
              <td className="py-1 px-3 border-b">
                <Link
                  href={`/admin/subscriptions/${sub.id}`}
                  className="text-blue-600 underline"
                >
                  {sub.id}
                </Link>
              </td>

              <td className="py-1 px-3 border-b">
                {sub.user?.email ?? "(No email)"}
              </td>
              <td className="py-1 px-3 border-b">{sub.plan}</td>
              <td className="py-1 px-3 border-b">{sub.status}</td>

              <td className="py-1 px-3 border-b">
                {sub.status === "ACTIVE" ? (
                  <CancelSubButton subId={sub.id} onSuccess={onCancelSuccess} />
                ) : (
                  <span className="text-gray-400">No actions</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
