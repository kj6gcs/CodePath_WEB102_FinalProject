"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import VoteControls from "@/components/VoteControls";

type Post = {
  id: string;
  created_at: string;
  title: string;
  content: string | null;
  image_url: string | null;
  video_url: string | null;
  section: string;
  flag: string | null;
  upvotes: number;
  downvotes: number;
  comments?: { count: number }[];
  profiles?: {
    username: string;
    display_name: string;
    avatar_url: string | null;
  } | null;
  post_images?: {
    id: string;
    image_url: string;
    position: number;
  }[];
};

type PostFeedProps = {
  posts: Post[];
};

function formatBenchName(section: string) {
  return section
    .split("-")
    .map((word) => word[0].toUpperCase() + word.slice(1))
    .join(" ");
}

function getYouTubeThumbnail(url: string | null) {
  if (!url) return null;

  try {
    const parsedUrl = new URL(url);

    if (parsedUrl.hostname.includes("youtube.com")) {
      const videoId = parsedUrl.searchParams.get("v");
      return videoId
        ? `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`
        : null;
    }

    if (parsedUrl.hostname.includes("youtu.be")) {
      const videoId = parsedUrl.pathname.replace("/", "");
      return videoId
        ? `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`
        : null;
    }

    return null;
  } catch {
    return null;
  }
}

function getFlagLabel(flag: string | null) {
  return flag ?? "General";
}

export default function PostFeed({ posts }: PostFeedProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("newest");

  const [flagFilter, setFlagFilter] = useState("All");
  const [mediaFilter, setMediaFilter] = useState("All");

  const filteredPosts = useMemo(() => {
    const searched = posts.filter((post) => {
      const matchesSearch = post.title
        .toLowerCase()
        .includes(searchTerm.toLowerCase());

      const matchesFlag = flagFilter === "All" || post.flag === flagFilter;

      const hasImages =
        (post.post_images && post.post_images.length > 0) || !!post.image_url;

      const hasVideo = !!post.video_url;

      const matchesMedia =
        mediaFilter === "All" ||
        (mediaFilter === "Images" && hasImages) ||
        (mediaFilter === "Video" && hasVideo) ||
        (mediaFilter === "Images + Video" && hasImages && hasVideo);

      return matchesSearch && matchesFlag && matchesMedia;
    });

    return [...searched].sort((a, b) => {
      if (sortBy === "upvotes") {
        return b.upvotes - a.upvotes;
      }

      return (
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
    });
  }, [posts, searchTerm, sortBy, flagFilter, mediaFilter]);

  return (
    <section id="latest-posts">
      <div className="mb-5 flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <h2 className="text-2xl font-bold text-stone-100">
            Latest from The Bench
          </h2>
          <p className="text-sm text-stone-400">
            Recent posts from all benches.
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
          <input
            type="text"
            placeholder="Search post titles..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="rounded-xl border border-stone-700 bg-stone-950 px-4 py-2 text-sm text-stone-100 outline-none transition placeholder:text-stone-600 focus:border-amber-500"
          />

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="rounded-xl border border-stone-700 bg-stone-950 px-4 py-2 text-sm text-stone-100 outline-none transition focus:border-amber-500"
          >
            <option value="newest">Newest First</option>
            <option value="upvotes">Most Awl Yeahs</option>
          </select>

          <select
            value={flagFilter}
            onChange={(e) => setFlagFilter(e.target.value)}
            className="rounded-xl border border-stone-700 bg-stone-950 px-4 py-2 text-sm text-stone-100 outline-none transition focus:border-amber-500"
          >
            <option value="All">All Types</option>
            <option value="General">General</option>
            <option value="Question">Question</option>
            <option value="Opinion">Opinion</option>
            <option value="Showcase">Showcase</option>
            <option value="Advice">Advice</option>
            <option value="Pattern">Pattern</option>
            <option value="Tool Review">Tool Review</option>
          </select>

          <select
            value={mediaFilter}
            onChange={(e) => setMediaFilter(e.target.value)}
            className="rounded-xl border border-stone-700 bg-stone-950 px-4 py-2 text-sm text-stone-100 outline-none transition focus:border-amber-500"
          >
            <option value="All">All Media</option>
            <option value="Images">Images</option>
            <option value="Video">Video</option>
            <option value="Images + Video">Images + Video</option>
          </select>
        </div>
      </div>

      <div className="space-y-4">
        {filteredPosts.length > 0 ? (
          filteredPosts.map((post) => {
            const videoThumbnail = getYouTubeThumbnail(post.video_url);

            const thumbnail =
              post.post_images && post.post_images.length > 0
                ? [...post.post_images].sort(
                    (a, b) => a.position - b.position,
                  )[0]
                : post.image_url
                  ? { image_url: post.image_url }
                  : videoThumbnail
                    ? { image_url: videoThumbnail }
                    : null;

            return (
              <div
                key={post.id}
                className="flex gap-4 rounded-2xl border border-stone-800 bg-stone-900/70 p-5 transition hover:border-amber-600 hover:bg-stone-900"
              >
                <div className="shrink-0">
                  <VoteControls
                    postId={post.id}
                    initialUpvotes={post.upvotes}
                    initialDownvotes={post.downvotes ?? 0}
                  />
                </div>

                <div className="min-w-0 flex-1">
                  <div className="mb-2 flex flex-wrap items-center gap-3 text-xs uppercase tracking-wide text-stone-500">
                    <span>{formatBenchName(post.section)}</span>
                    <span>•</span>
                    <span className="rounded-full border border-amber-700 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-amber-500">
                      {getFlagLabel(post.flag)}
                    </span>
                    <span>•</span>
                    <span>{new Date(post.created_at).toLocaleString()}</span>
                    <span>•</span>
                    <span className="flex items-center gap-2">
                      Posted by{" "}
                      {post.profiles ? (
                        <Link
                          href={`/user/${post.profiles.username}`}
                          className="inline-flex items-center gap-2 font-semibold text-amber-500 transition hover:text-amber-400"
                        >
                          {post.profiles.avatar_url && (
                            <img
                              src={post.profiles.avatar_url}
                              alt={post.profiles.display_name}
                              className="h-6 w-6 rounded-full border border-stone-700 object-cover"
                            />
                          )}

                          {post.profiles.display_name}
                        </Link>
                      ) : (
                        <span className="font-semibold text-amber-500">
                          Unknown Leatherworker
                        </span>
                      )}
                    </span>
                  </div>

                  <Link href={`/posts/${post.id}`} className="block">
                    <h3 className="text-xl font-bold text-stone-100 transition hover:text-amber-400">
                      {post.title}
                    </h3>

                    <p className="mt-2 text-sm text-stone-500">
                      {post.comments?.[0]?.count ?? 0} comments
                    </p>
                    {post.video_url && (
                      <p className="mt-2 inline-flex items-center rounded-full border border-amber-700 px-2 py-0.5 text-xs font-bold uppercase tracking-wide text-amber-500">
                        ▶ Video
                      </p>
                    )}
                  </Link>
                </div>

                {thumbnail && (
                  <Link
                    href={`/posts/${post.id}`}
                    className="relative hidden shrink-0 self-center sm:block"
                  >
                    <img
                      src={thumbnail.image_url}
                      alt={post.title}
                      className="h-24 w-24 rounded-xl border border-stone-800 object-cover transition hover:border-amber-600"
                    />

                    {videoThumbnail &&
                      !post.post_images?.length &&
                      !post.image_url && (
                        <span className="absolute inset-0 flex items-center justify-center rounded-xl bg-black/35 text-2xl text-amber-400">
                          ▶
                        </span>
                      )}
                  </Link>
                )}
              </div>
            );
          })
        ) : (
          <div className="rounded-2xl border border-dashed border-stone-700 p-8 text-center text-stone-400">
            No posts found.
          </div>
        )}
      </div>
    </section>
  );
}
