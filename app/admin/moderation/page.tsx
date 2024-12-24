"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2 } from "lucide-react";

import { ModerationActions } from "./moderation-actions";

interface CommentItem {
  id: string;
  content: string;
  status: string;
  user: {
    name: string | null;
  };
  createdAt: string;
}

export default function ModerationPage() {
  const router = useRouter();
  const { toast } = useToast();

  const [comments, setComments] = useState<CommentItem[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Track selected comment IDs for bulk actions
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  async function fetchComments(filter: string) {
    try {
      setIsLoading(true);
      const url = `/api/moderation/comments?status=${encodeURIComponent(
        filter
      )}`;
      const res = await fetch(url, { method: "GET" });
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      const data = await res.json();
      setComments(data.data || []);
    } catch (err) {
      console.error("Fetch error:", err);
      setError(err instanceof Error ? err.message : "Unknown error");
      toast({
        title: "Error fetching comments",
        description: err instanceof Error ? err.message : "Unknown error",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    fetchComments("ALL");
  }, []);

  const handleFilterChange = (value: string) => {
    setStatusFilter(value);
    setSelectedIds([]); // Clear selection whenever filter changes
    fetchComments(value);
  };

  function onActionSuccess() {
    // Reload with the same filter
    fetchComments(statusFilter);
    // Also reset selection
    setSelectedIds([]);
  }

  // For toggling an ID in the selected array
  function toggleSelection(id: string) {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((cid) => cid !== id) : [...prev, id]
    );
  }

  // Bulk action
  async function handleBulkAction(action: "approve" | "reject" | "delete") {
    if (selectedIds.length === 0) {
      toast({
        title: "No comments selected",
        description: "Please select one or more comments first.",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsLoading(true);
      const res = await fetch("/api/moderation/comments/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          commentIds: selectedIds,
          action,
        }),
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error ?? "Unknown error performing bulk action");
      }

      // Show toast for each action
      switch (action) {
        case "approve":
          toast({ title: "Selected comments approved", variant: "default" });
          break;
        case "reject":
          toast({
            title: "Selected comments rejected",
            variant: "destructive",
          });
          break;
        case "delete":
          toast({ title: "Selected comments deleted", variant: "destructive" });
          break;
      }
      onActionSuccess();
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error
            ? error.message
            : "Unknown error performing bulk action",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
        <Card className="max-w-md w-full border shadow-sm">
          <CardHeader>
            <CardTitle className="text-red-600 text-xl">Error</CardTitle>
          </CardHeader>
          <CardContent>
            <p>{error}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="container mx-auto space-y-6">
        <Card className="border shadow-sm">
          <CardHeader>
            <CardTitle className="text-3xl font-bold">
              Comment Moderation
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <Select value={statusFilter} onValueChange={handleFilterChange}>
                <SelectTrigger className="w-full sm:w-[200px]">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Comments</SelectItem>
                  <SelectItem value="PENDING">Pending</SelectItem>
                  <SelectItem value="APPROVED">Approved</SelectItem>
                  <SelectItem value="REJECTED">Rejected</SelectItem>
                  <SelectItem value="SPAM">Spam</SelectItem>
                </SelectContent>
              </Select>
              {isLoading && (
                <div className="flex items-center text-sm text-muted-foreground">
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Loading...
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="border shadow-sm">
          <CardContent className="p-0">
            <div className="p-4 flex gap-2">
              <Button
                variant="outline"
                disabled={isLoading}
                onClick={() => handleBulkAction("approve")}
              >
                Approve Selected
              </Button>
              <Button
                variant="destructive"
                disabled={isLoading}
                onClick={() => handleBulkAction("reject")}
              >
                Reject Selected
              </Button>
              <Button
                variant="ghost"
                disabled={isLoading}
                onClick={() => handleBulkAction("delete")}
              >
                Delete Selected
              </Button>
            </div>

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-10" />
                  <TableHead className="w-[40%]">Content</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {comments.map((comment) => {
                  const isSelected = selectedIds.includes(comment.id);
                  return (
                    <TableRow key={comment.id}>
                      <TableCell>
                        <input
                          type="checkbox"
                          className="h-4 w-4"
                          checked={isSelected}
                          onChange={() => toggleSelection(comment.id)}
                        />
                      </TableCell>
                      <TableCell className="font-medium">
                        {comment.content}
                      </TableCell>
                      <TableCell>{comment.user?.name || "Anonymous"}</TableCell>
                      <TableCell>
                        <Badge variant={getBadgeVariant(comment.status)}>
                          {comment.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <ModerationActions
                          commentId={comment.id}
                          onSuccess={onActionSuccess}
                        />
                      </TableCell>
                    </TableRow>
                  );
                })}

                {comments.length === 0 && !isLoading && (
                  <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center">
                      No comments found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function getBadgeVariant(
  status: string
): "default" | "secondary" | "destructive" | "outline" {
  switch (status) {
    case "APPROVED":
      return "default";
    case "PENDING":
      return "secondary";
    case "REJECTED":
    case "SPAM":
      return "destructive";
    default:
      return "outline";
  }
}
