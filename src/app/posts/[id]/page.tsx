import Link from "next/link";
import { notFound } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import CommentForm from "@/components/CommentForm";
import VoteControls from "@/components/VoteControls";
import PostActions from "@/components/PostActions";
import PostImageGallery from "@/components/PostImageGallery";
import BenchIDCard from "@/components/BenchIDCard";
import VideoEmbed from "@/components/VideoEmbed";
import CommentCard from "@/components/CommentCard";

type PageProps = {
  params: Promise<{
    id: string;
  }>;
};

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

type PostImage = {
  id: string;
  image_url: string;
  position: number;
};

function formatBenchName(section: string) {
  return section
    .split("-")
    .map((word) => word[0].toUpperCase() + word.slice(1))
    .join(" ");
}

export default async function PostPage({ params }: PageProps) {
  const { id } = await params;

  const { data: post, error } = await supabase
    .from("posts")
    .select(
      `
  *,
  profiles(username, display_name, role, avatar_url),
  post_images(id, image_url, position),
  repost:repost_of(
    id,
    title,
    section,
    created_at,
    profiles(username, display_name)
  ),
  comments(
    *,
    profiles!comments_user_id_fkey(username, display_name, role, avatar_url)
  )
`,
    )
    .eq("id", id)
    .single();

  if (error || !post) {
    notFound();
  }

  const comments = (post.comments ?? []) as Comment[];

  const topLevelComments = comments.filter(
    (comment) => !comment.parent_comment_id,
  );

  const repliesByParentId = comments.reduce<Record<string, Comment[]>>(
    (acc, comment) => {
      if (comment.parent_comment_id) {
        acc[comment.parent_comment_id] ??= [];
        acc[comment.parent_comment_id].push(comment);
      }

      return acc;
    },
    {},
  );

  return (
    <main className="min-h-screen bg-stone-950 px-6 py-12 text-stone-100">
      <article className="mx-auto max-w-3xl">
        <Link
          href="/"
          className="mb-8 inline-block text-sm font-semibold text-amber-500 hover:text-amber-400"
        >
          ← Back to The Bench
        </Link>

        <div className="rounded-2xl border border-stone-800 bg-stone-900/80 p-6 shadow-xl shadow-black/30">
          <div className="mb-4 flex flex-wrap items-center gap-3 text-xs uppercase tracking-wide text-stone-500">
            <span>{formatBenchName(post.section)}</span>
            <span>•</span>
            <span>{new Date(post.created_at).toLocaleString()}</span>
            <span>•</span>

            {post.profiles ? (
              <span className="inline-flex items-center gap-2">
                Posted by{" "}
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
              </span>
            ) : (
              <span>Posted by Unknown Leatherworker</span>
            )}
          </div>

          <h1 className="mb-4 text-3xl font-bold text-stone-50">
            {post.title}
          </h1>

          <BenchIDCard postId={post.id} section={post.section} />

          {post.repost && (
            <Link
              href={`/posts/${post.repost.id}`}
              className="mb-6 block rounded-xl border border-amber-800/60 bg-stone-950 p-4 transition hover:border-amber-500"
            >
              <p className="mb-2 text-xs font-bold uppercase tracking-[0.25em] text-amber-500">
                Referenced Post
              </p>

              <h2 className="text-lg font-bold text-stone-100">
                {post.repost.title}
              </h2>

              <p className="mt-2 text-xs text-stone-500">
                From {formatBenchName(post.repost.section)} • Posted by{" "}
                <span className="font-semibold text-amber-500">
                  {post.repost.profiles?.display_name ??
                    "Unknown Leatherworker"}
                </span>
              </p>
            </Link>
          )}

          <PostImageGallery
            images={
              post.post_images && post.post_images.length > 0
                ? [...post.post_images].sort(
                    (a: PostImage, b: PostImage) => a.position - b.position,
                  )
                : post.image_url
                  ? [
                      {
                        id: "legacy",
                        image_url: post.image_url,
                        position: 0,
                      },
                    ]
                  : []
            }
            title={post.title}
          />

          <VideoEmbed videoUrl={post.video_url} />

          {post.content ? (
            <p className="whitespace-pre-wrap leading-8 text-stone-300">
              {post.content}
            </p>
          ) : (
            <p className="italic text-stone-500">
              This post has no additional content.
            </p>
          )}

          <div className="mt-6 flex flex-wrap items-center justify-between gap-4 border-t border-stone-800 pt-5">
            <VoteControls
              postId={post.id}
              initialUpvotes={post.upvotes}
              initialDownvotes={post.downvotes ?? 0}
            />

            <PostActions postId={post.id} postUserId={post.user_id} />
          </div>
        </div>

        <section className="mt-8 rounded-2xl border border-stone-800 bg-stone-900/80 p-6 shadow-xl shadow-black/30">
          <h2 className="text-2xl font-bold text-stone-50">Comments</h2>

          <CommentForm postId={post.id} />

          <div className="mt-8 space-y-4">
            {topLevelComments.length > 0 ? (
              topLevelComments.map((comment) => (
                <CommentCard
                  key={comment.id}
                  comment={comment}
                  repliesByParentId={repliesByParentId}
                  postId={post.id}
                />
              ))
            ) : (
              <p className="mt-6 text-stone-500">
                No comments yet. Be the first to stamp one.
              </p>
            )}
          </div>
        </section>
      </article>
    </main>
  );
}
