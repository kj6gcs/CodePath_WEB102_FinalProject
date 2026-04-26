"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import Image from "next/image";

type UpvoteButtonProps = {
  postId: string;
  currentVotes: number;
};

export default function UpvoteButton({
  postId,
  currentVotes,
}: UpvoteButtonProps) {
  const router = useRouter();

  const [votes, setVotes] = useState(currentVotes);
  const [isVoting, setIsVoting] = useState(false);

  async function handleUpvote() {
    if (isVoting) return;

    setIsVoting(true);

    const newVoteTotal = votes + 1;

    const { error } = await supabase
      .from("posts")
      .update({ upvotes: newVoteTotal })
      .eq("id", postId);

    if (!error) {
      setVotes(newVoteTotal);
      router.refresh();
    }

    setIsVoting(false);
  }

  return (
    <button
      onClick={handleUpvote}
      disabled={isVoting}
      className="inline-flex items-center gap-2 rounded-xl border border-amber-700 bg-stone-900 px-4 py-2 font-semibold text-amber-400 transition hover:bg-stone-800 hover:text-amber-300 disabled:cursor-not-allowed disabled:opacity-60"
    >
      <Image src="/icons/awl.svg" alt="Awl Yeah" width={30} height={30} />
      <span>{isVoting ? "Voting..." : `Awl Yeah (${votes})`}</span>
    </button>
  );
}
