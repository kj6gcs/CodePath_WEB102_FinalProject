"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

type VoteType = "up" | "down" | null;

type VoteControlsProps = {
  postId: string;
  initialUpvotes: number;
  initialDownvotes: number;
};

export default function VoteControls({
  postId,
  initialUpvotes,
  initialDownvotes,
}: VoteControlsProps) {
  const [upvotes, setUpvotes] = useState(initialUpvotes);
  const [downvotes, setDownvotes] = useState(initialDownvotes);
  const [userVote, setUserVote] = useState<VoteType>(null);
  const [isVoting, setIsVoting] = useState(false);

  useEffect(() => {
    async function loadUserVote() {
      const { data: userData } = await supabase.auth.getUser();

      if (!userData.user) return;

      const { data } = await supabase
        .from("post_votes")
        .select("vote_type")
        .eq("post_id", postId)
        .eq("user_id", userData.user.id)
        .single();

      if (data?.vote_type === "up" || data?.vote_type === "down") {
        setUserVote(data.vote_type);
      }
    }

    loadUserVote();
  }, [postId]);

  async function handleVote(nextVote: Exclude<VoteType, null>) {
    if (isVoting) return;

    setIsVoting(true);

    const { data: userData } = await supabase.auth.getUser();

    if (!userData.user) {
      setIsVoting(false);
      alert("You must be logged in to vote.");
      return;
    }

    let newUpvotes = upvotes;
    let newDownvotes = downvotes;
    let newUserVote: VoteType = nextVote;

    if (userVote === nextVote) {
      // remove existing same vote
      newUserVote = null;

      if (nextVote === "up") newUpvotes -= 1;
      if (nextVote === "down") newDownvotes -= 1;

      const { error } = await supabase
        .from("post_votes")
        .delete()
        .eq("post_id", postId)
        .eq("user_id", userData.user.id);

      if (error) {
        setIsVoting(false);
        alert(error.message);
        return;
      }
    } else if (userVote === null) {
      // add new vote
      if (nextVote === "up") newUpvotes += 1;
      if (nextVote === "down") newDownvotes += 1;

      const { error } = await supabase.from("post_votes").insert({
        post_id: postId,
        user_id: userData.user.id,
        vote_type: nextVote,
      });

      if (error) {
        setIsVoting(false);
        alert(error.message);
        return;
      }
    } else {
      // switch vote
      if (userVote === "up" && nextVote === "down") {
        newUpvotes -= 1;
        newDownvotes += 1;
      }

      if (userVote === "down" && nextVote === "up") {
        newDownvotes -= 1;
        newUpvotes += 1;
      }

      const { error } = await supabase
        .from("post_votes")
        .update({ vote_type: nextVote })
        .eq("post_id", postId)
        .eq("user_id", userData.user.id);

      if (error) {
        setIsVoting(false);
        alert(error.message);
        return;
      }
    }

    const { error: countError } = await supabase
      .from("posts")
      .update({
        upvotes: newUpvotes,
        downvotes: newDownvotes,
      })
      .eq("id", postId);

    if (countError) {
      setIsVoting(false);
      alert(countError.message);
      return;
    }

    setUpvotes(newUpvotes);
    setDownvotes(newDownvotes);
    setUserVote(newUserVote);
    setIsVoting(false);
  }

  return (
    <div className="flex flex-col items-center gap-0 rounded-xl border border-stone-800 bg-stone-950/60 p-3">
      <button
        type="button"
        onClick={() => handleVote("up")}
        disabled={isVoting}
        className={`flex flex-col items-center gap-0 rounded-lg px-3 py-2 text-xs font-bold transition ${
          userVote === "up"
            ? "bg-amber-600 text-stone-950"
            : "text-amber-500 hover:bg-stone-900 hover:text-amber-400"
        }`}
      >
        <img src="/icons/awl.svg" alt="Awl Yeah" className="h-5 w-5" />
        <span>Awl Yeah</span>
        <span>{upvotes}</span>
      </button>

      <button
        type="button"
        onClick={() => handleVote("down")}
        disabled={isVoting}
        className={`flex flex-col items-center gap-0 rounded-lg px-3 py-2 text-xs font-bold transition ${
          userVote === "down"
            ? "bg-red-900 text-red-100"
            : "text-red-300 hover:bg-stone-900 hover:text-red-200"
        }`}
      >
        <img src="/icons/skive.svg" alt="Skive Down" className="h-8 w-8" />
        <span>Skive Down</span>
        <span>{downvotes}</span>
      </button>
    </div>
  );
}
