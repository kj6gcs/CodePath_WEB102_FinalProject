"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import DeletePostButton from "@/components/DeletePostButton";
import { supabase } from "@/lib/supabaseClient";

type PostActionsProps = {
  postId: string;
  postUserId: string | null;
};

export default function PostActions({ postId, postUserId }: PostActionsProps) {
  const [canManage, setCanManage] = useState(false);

  useEffect(() => {
    async function checkPermissions() {
      const { data: userData } = await supabase.auth.getUser();

      if (!userData.user) {
        setCanManage(false);
        return;
      }

      if (userData.user.id === postUserId) {
        setCanManage(true);
        return;
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", userData.user.id)
        .single();

      if (profile?.role === "admin") {
        setCanManage(true);
      }
    }

    checkPermissions();
  }, [postUserId]);

  if (!canManage) {
    return null;
  }

  return (
    <div className="flex flex-wrap gap-3">
      <Link
        href={`/posts/${postId}/edit`}
        className="rounded-xl border border-stone-700 px-4 py-2 text-sm font-semibold text-stone-300 transition hover:border-amber-600 hover:text-amber-400"
      >
        Edit Post
      </Link>

      <DeletePostButton postId={postId} />
    </div>
  );
}