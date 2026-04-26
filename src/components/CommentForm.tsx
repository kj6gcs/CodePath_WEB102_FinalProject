"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

type CommentFormProps = {
  postId: string;
};

export default function CommentForm({ postId }: CommentFormProps) {
  const router = useRouter();
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErrorMessage("");

    if (!content.trim()) {
      setErrorMessage("Comment cannot be empty.");
      return;
    }

    setIsSubmitting(true);

    const { data: userData } = await supabase.auth.getUser();

    if (!userData.user) {
      setIsSubmitting(false);
      setErrorMessage("You must be logged in to comment.");
      return;
    }

    const { error } = await supabase.from("comments").insert({
      post_id: postId,
      content: content.trim(),
      user_id: userData.user.id,
    });

    setIsSubmitting(false);

    if (error) {
      setErrorMessage(error.message);
      return;
    }

    setContent("");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="mt-8 space-y-4">
      <label
        htmlFor="comment"
        className="block text-sm font-semibold text-stone-200"
      >
        Stamp a Comment
      </label>

      <textarea
        id="comment"
        value={content}
        onChange={(e) => setContent(e.target.value)}
        rows={4}
        placeholder="Add your thoughts, advice, or feedback..."
        className="w-full rounded-xl border border-stone-700 bg-stone-950 px-4 py-3 text-stone-100 outline-none transition placeholder:text-stone-600 focus:border-amber-500"
      />

      {errorMessage && (
        <p className="rounded-xl border border-red-900 bg-red-950/40 px-4 py-3 text-sm text-red-300">
          {errorMessage}
        </p>
      )}

      <button
        type="submit"
        disabled={isSubmitting}
        className="rounded-xl bg-amber-600 px-5 py-3 font-bold text-stone-950 transition hover:bg-amber-500 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isSubmitting ? "Stamping..." : "Stamp Comment"}
      </button>
    </form>
  );
}
