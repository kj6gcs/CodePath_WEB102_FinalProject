"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

type DeleteCommentButtonProps = {
  commentId: string;
  commentUserId: string | null;
};

export default function DeleteCommentButton({
  commentId,
  commentUserId,
}: DeleteCommentButtonProps) {
  const router = useRouter();

  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [currentUserRole, setCurrentUserRole] = useState<string | null>(null);
  const [canDelete, setCanDelete] = useState(false);

  useEffect(() => {
    async function checkPermission() {
      const { data: userData } = await supabase.auth.getUser();

      if (!userData.user) return;

      setCurrentUserId(userData.user.id);

      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", userData.user.id)
        .single();

      const role = profile?.role ?? "user";
      setCurrentUserRole(role);

      if (
        userData.user.id === commentUserId ||
        role === "admin" ||
        role === "moderator"
      ) {
        setCanDelete(true);
      }
    }

    checkPermission();
  }, [commentUserId]);

  async function handleDelete() {
    const isOwner = currentUserId === commentUserId;
    const isModeratorAction =
      currentUserRole === "admin" || currentUserRole === "moderator";

    const confirmed = window.confirm(
      isOwner
        ? "Delete this comment? This cannot be undone."
        : "Remove this comment as a moderator/admin?",
    );

    if (!confirmed) return;

    if (isOwner && !isModeratorAction) {
      const { error } = await supabase
        .from("comments")
        .delete()
        .eq("id", commentId);

      if (error) {
        alert(error.message);
        return;
      }

      router.refresh();
      return;
    }

    const { error } = await supabase
      .from("comments")
      .update({
        content: "[POST REMOVED BY ADMIN/MODERATOR]",
        is_removed: true,
        removed_by: currentUserId,
        removed_at: new Date().toISOString(),
      })
      .eq("id", commentId);

    if (error) {
      alert(error.message);
      return;
    }

    router.refresh();
  }

  if (!canDelete) return null;

  return (
    <button
      onClick={handleDelete}
      className="rounded-lg border border-red-900 px-3 py-1 text-xs font-semibold text-red-300 transition hover:bg-red-950/40"
    >
      Delete
    </button>
  );
}
