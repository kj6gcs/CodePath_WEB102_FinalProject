"use client";

import { useState } from "react";
import Link from "next/link";
import CommentForm from "@/components/CommentForm";
import DeleteCommentButton from "@/components/DeleteCommentButton";

type Comment = {
  id: string;
  created_at: string;
  content: string;
  user_id: string | null;
  parent_comment_id: string | null;
  profiles: {
    username: string;
    display_name: string;
    role: string;
    avatar_url: string | null;
  } | null;
};

type CommentCardProps = {
  comment: Comment;
  repliesByParentId: Record<string, Comment[]>;
  postId: string;
  depth?: number;
};

export default function CommentCard({
  comment,
  repliesByParentId,
  postId,
  depth = 0,
}: CommentCardProps) {
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  const replies = repliesByParentId[comment.id] ?? [];
  const hasReplies = replies.length > 0;

  return (
    <div className="rounded-xl border border-stone-800 bg-stone-950 p-4">
      <div className="mb-2 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          {comment.profiles?.avatar_url && (
            <img
              src={comment.profiles.avatar_url}
              alt={comment.profiles.display_name}
              className="h-7 w-7 rounded-full border border-stone-700 object-cover"
            />
          )}

          <p className="text-xs uppercase tracking-wide text-stone-500">
            Stamped by{" "}
            <Link
              href={
                comment.profiles ? `/user/${comment.profiles.username}` : "#"
              }
              className="font-semibold text-amber-500 transition hover:text-amber-400"
            >
              {comment.profiles?.display_name ?? "Unknown Leatherworker"}
            </Link>{" "}
            • {new Date(comment.created_at).toLocaleString()}
          </p>
        </div>

        <DeleteCommentButton
          commentId={comment.id}
          commentUserId={comment.user_id}
        />
      </div>

      {!isCollapsed && (
        <>
          <p className="whitespace-pre-wrap text-stone-300">
            {comment.content}
          </p>

          <div className="mt-3 flex flex-wrap gap-4">
            <button
              type="button"
              onClick={() => setShowReplyForm((current) => !current)}
              className="text-sm font-semibold text-amber-500 transition hover:text-amber-400"
            >
              {showReplyForm ? "Cancel Reply" : "Reply"}
            </button>

            {hasReplies && (
              <button
                type="button"
                onClick={() => setIsCollapsed(true)}
                className="text-sm font-semibold text-stone-400 transition hover:text-amber-400"
              >
                Collapse {replies.length} repl
                {replies.length === 1 ? "y" : "ies"}
              </button>
            )}
          </div>

          {showReplyForm && (
            <CommentForm
              postId={postId}
              parentCommentId={comment.id}
              parentCommentUserId={comment.user_id}
              parentCommentAuthorName={
                comment.profiles?.display_name ?? "Unknown Leatherworker"
              }
              onCommentSubmitted={() => setShowReplyForm(false)}
            />
          )}

          {hasReplies && (
            <div
              className={`mt-4 space-y-3 border-l border-stone-800 pl-4 ${
                depth >= 4 ? "ml-0" : ""
              }`}
            >
              {replies.map((reply) => (
                <CommentCard
                  key={reply.id}
                  comment={reply}
                  repliesByParentId={repliesByParentId}
                  postId={postId}
                  depth={depth + 1}
                />
              ))}
            </div>
          )}
        </>
      )}

      {isCollapsed && (
        <button
          type="button"
          onClick={() => setIsCollapsed(false)}
          className="text-sm font-semibold text-stone-400 transition hover:text-amber-400"
        >
          Expand thread ({replies.length} repl
          {replies.length === 1 ? "y" : "ies"})
        </button>
      )}
    </div>
  );
}
