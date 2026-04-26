import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";
import VoteControls from "@/components/VoteControls";

type BenchPageProps = {
  slug: string;
  title: string;
  description: string;
};

type Post = {
  id: string;
  created_at: string;
  title: string;
  section: string;
  flag: string | null;
  upvotes: number;
  downvotes: number;
  comments?: { count: number }[];
  profiles?: {
    username: string;
    display_name: string;
  } | null;
  post_images?: {
    id: string;
    image_url: string;
    position: number;
  }[];
  image_url: string | null;
};

export default async function BenchPage({
  slug,
  title,
  description,
}: BenchPageProps) {
  const { data: posts } = await supabase
    .from("posts")
    .select(
      "*, comments(count), profiles(username, display_name), post_images(id, image_url, position)",
    )
    .eq("section", slug)
    .order("created_at", { ascending: false });

  return (
    <main className="min-h-screen bg-stone-950 px-6 py-12 text-stone-100">
      <section className="mx-auto max-w-5xl">
        <Link
          href="/"
          className="mb-8 inline-block text-sm font-semibold text-amber-500 hover:text-amber-400"
        >
          ← Back to The Bench
        </Link>

        <div className="mb-10 rounded-2xl border border-stone-800 bg-stone-900/80 p-6">
          <p className="mb-2 text-sm font-semibold uppercase tracking-[0.3em] text-amber-500">
            Choose a Bench
          </p>

          <h1 className="text-4xl font-bold text-stone-50">{title}</h1>

          <p className="mt-4 text-stone-300">{description}</p>
        </div>

        <div className="space-y-4">
          {posts && posts.length > 0 ? (
            posts.map((post: Post) => {
              const thumbnail =
                post.post_images && post.post_images.length > 0
                  ? [...post.post_images].sort(
                      (a, b) => a.position - b.position,
                    )[0]
                  : post.image_url
                    ? { image_url: post.image_url }
                    : null;

              return (
                <div
                  key={post.id}
                  className="flex gap-4 rounded-2xl border border-stone-800 bg-stone-900/70 p-5 transition hover:border-amber-600"
                >
                  <div className="shrink-0">
                    <VoteControls
                      postId={post.id}
                      initialUpvotes={post.upvotes}
                      initialDownvotes={post.downvotes ?? 0}
                    />
                  </div>

                  <Link href={`/posts/${post.id}`} className="block flex-1">
                    <div className="mb-2 flex flex-wrap items-center gap-3 text-xs uppercase tracking-wide text-stone-500">
                      <span>{new Date(post.created_at).toLocaleString()}</span>
                      <span>•</span>
                      <span className="rounded-full border border-amber-700 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-amber-500">
                        {post.flag ?? "General"}
                      </span>
                      <span>•</span>
                      <span>
                        Posted by{" "}
                        <span className="font-semibold text-amber-500">
                          {post.profiles?.display_name ??
                            "Unknown Leatherworker"}
                        </span>
                      </span>
                    </div>

                    <h2 className="text-xl font-bold text-stone-100 transition hover:text-amber-400">
                      {post.title}
                    </h2>

                    <p className="mt-2 text-sm text-stone-500">
                      {post.comments?.[0]?.count ?? 0} comments
                    </p>
                  </Link>

                  {thumbnail && (
                    <Link
                      href={`/posts/${post.id}`}
                      className="hidden shrink-0 sm:block"
                    >
                      <img
                        src={thumbnail.image_url}
                        alt={post.title}
                        className="h-24 w-24 rounded-xl border border-stone-800 object-cover transition hover:border-amber-600"
                      />
                    </Link>
                  )}
                </div>
              );
            })
          ) : (
            <div className="rounded-2xl border border-dashed border-stone-700 p-8 text-center text-stone-400">
              No posts yet in {title}.
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
