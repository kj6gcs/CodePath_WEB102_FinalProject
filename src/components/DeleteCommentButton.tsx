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

  const [canDelete, setCanDelete] = useState(false);

  useEffect(() => {
    async function checkPermission() {
      const { data: userData } = await supabase.auth.getUser();

      if (!userData.user) return;

      if (userData.user.id === commentUserId) {
        setCanDelete(true);
        return;
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", userData.user.id)
        .single();

      if (profile?.role === "admin") {
        setCanDelete(true);
      }
    }

    checkPermission();
  }, [commentUserId]);

  async function handleDelete() {
    const confirmed = window.confirm("Delete this comment?");

    if (!confirmed) return;

    const { error } = await supabase
      .from("comments")
      .delete()
      .eq("id", commentId);

    if (!error) {
      router.refresh();
    }
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
