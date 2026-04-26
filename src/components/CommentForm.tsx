"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

type CommentFormProps = {
  postId: string;
  parentCommentId?: string;
  parentCommentUserId?: string | null;
  parentCommentAuthorName?: string;
  onCommentSubmitted?: () => void;
};

export default function CommentForm({
  postId,
  parentCommentId,
  parentCommentUserId,
  parentCommentAuthorName,
  onCommentSubmitted,
}: CommentFormProps) {
  const router = useRouter();
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const isReply = Boolean(parentCommentId);

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

    const { data: postData, error: postError } = await supabase
      .from("posts")
      .select("user_id, title")
      .eq("id", postId)
      .single();

    if (postError || !postData) {
      setIsSubmitting(false);
      setErrorMessage("Could not find the post owner.");
      return;
    }

    const { data: commentData, error: commentError } = await supabase
      .from("comments")
      .insert({
        post_id: postId,
        content: content.trim(),
        user_id: userData.user.id,
        parent_comment_id: parentCommentId ?? null,
      })
      .select("id")
      .single();

    if (commentError || !commentData) {
      setIsSubmitting(false);
      setErrorMessage(commentError?.message ?? "Could not create comment.");
      return;
    }

    if (isReply) {
      if (parentCommentUserId && parentCommentUserId !== userData.user.id) {
        const { error: notificationError } = await supabase
          .from("notifications")
          .insert({
            recipient_id: parentCommentUserId,
            actor_id: userData.user.id,
            post_id: postId,
            comment_id: commentData.id,
            type: "comment_reply",
            message: `Someone replied to your comment on: ${postData.title}`,
          });

        if (notificationError) {
          console.error("Notification error:", notificationError.message);
        }
      }
    } else if (postData.user_id && postData.user_id !== userData.user.id) {
      const { error: notificationError } = await supabase
        .from("notifications")
        .insert({
          recipient_id: postData.user_id,
          actor_id: userData.user.id,
          post_id: postId,
          comment_id: commentData.id,
          type: "post_comment",
          message: `Someone commented on your post: ${postData.title}`,
        });

      if (notificationError) {
        console.error("Notification error:", notificationError.message);
      }
    }

    setIsSubmitting(false);
    setContent("");
    onCommentSubmitted?.();
    router.refresh();
  }

  return (
    <form
      onSubmit={handleSubmit}
      className={isReply ? "mt-4 space-y-3" : "mt-8 space-y-4"}
    >
      <label
        htmlFor={isReply ? `reply-${parentCommentId}` : "comment"}
        className="block text-sm font-semibold text-stone-200"
      >
        {isReply
          ? `Reply to ${parentCommentAuthorName ?? "comment"}`
          : "Stamp a Comment"}
      </label>

      <textarea
        id={isReply ? `reply-${parentCommentId}` : "comment"}
        value={content}
        onChange={(e) => setContent(e.target.value)}
        rows={isReply ? 3 : 4}
        placeholder={
          isReply
            ? "Write your reply..."
            : "Add your thoughts, advice, or feedback..."
        }
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
        {isSubmitting
          ? isReply
            ? "Replying..."
            : "Stamping..."
          : isReply
            ? "Post Reply"
            : "Stamp Comment"}
      </button>
    </form>
  );
}
