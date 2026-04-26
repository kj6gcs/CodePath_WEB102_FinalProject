"use client";

import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

type DeletePostButtonProps = {
  postId: string;
};

export default function DeletePostButton({ postId }: DeletePostButtonProps) {
  const router = useRouter();

  async function handleDelete() {
    const confirmed = window.confirm(
      "Delete this post? This cannot be undone.",
    );

    if (!confirmed) return;

    const { error } = await supabase.from("posts").delete().eq("id", postId);

    if (error) {
      alert(error.message);
      return;
    }

    router.push("/");
    router.refresh();
  }

  return (
    <button
      onClick={handleDelete}
      className="rounded-xl border border-red-900 bg-red-950/40 px-4 py-2 text-sm font-semibold text-red-300 transition hover:bg-red-900/60"
    >
      Delete Post
    </button>
  );
}
