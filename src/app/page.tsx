import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";
import VoteControls from "@/components/VoteControls";
import PostFeed from "@/components/PostFeed";

const benches = [
  {
    name: "Showcase",
    slug: "showcase",
    description: "Share finished leather projects and admire completed work.",
    icon: "🏆",
  },
  {
    name: "Sewing Pony",
    slug: "sewing-pony",
    description: "Post works in progress, build logs, and process photos.",
    icon: "🧵",
  },
  {
    name: "Draft Desk",
    slug: "draft-desk",
    description: "Share patterns, templates, layouts, and design ideas.",
    icon: "📐",
  },
  {
    name: "Tool Rack",
    slug: "tool-rack",
    description: "Discuss tools, care, upgrades, and recommendations.",
    icon: "🛠️",
  },
  {
    name: "The Tannery",
    slug: "tannery",
    description: "Talk leather types, cuts, weights, finishes, and suppliers.",
    icon: "🐄",
  },
  {
    name: "Scrap Bin",
    slug: "scrap-bin",
    description: "Ask questions, share advice, tips, tricks, and quick fixes.",
    icon: "🧰",
  },
];

type Post = {
  id: string;
  created_at: string;
  title: string;
  content: string | null;
  image_url: string | null;
  section: string;
  upvotes: number;
  comments?: { count: number }[];
  profiles?: {
    username: string;
    display_name: string;
  } | null;
};

function formatBenchName(section: string) {
  return section
    .split("-")
    .map((word) => word[0].toUpperCase() + word.slice(1))
    .join(" ");
}

export default async function Home() {
  const { data: posts, error } = await supabase
    .from("posts")
    .select(
      "*, comments(count), profiles(username, display_name, avatar_url), post_images(id, image_url, position)",
    )
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching posts:", error.message);
  }

  return (
    <main className="min-h-screen bg-stone-950 text-stone-100">
      <section className="mx-auto max-w-6xl px-6 py-12">
        <div className="mb-12 max-w-3xl">
          <h1 className="mb-6 text-4xl font-bold tracking-tight text-stone-50 sm:text-6xl">
            Pull up a stool and choose a bench.
          </h1>

          <p className="text-lg leading-8 text-stone-300">
            A leathercraft community for sharing projects, patterns, tools,
            questions, advice, and everything learned at the workbench.
          </p>

          <div className="mt-8 flex flex-wrap gap-4">
            <Link
              href="/posts/new"
              className="rounded-xl bg-amber-600 px-5 py-3 font-semibold text-stone-950 shadow-lg shadow-amber-950/30 transition hover:bg-amber-500"
            >
              Create a Post
            </Link>

            <a
              href="#latest-posts"
              className="rounded-xl border border-stone-700 px-5 py-3 font-semibold text-stone-200 transition hover:border-amber-500 hover:text-amber-400"
            >
              View Latest Posts
            </a>
          </div>
        </div>

        <section className="mb-14">
          <h2 className="mb-5 text-2xl font-bold text-stone-100">
            Choose a Bench
          </h2>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {benches.map((bench) => (
              <Link
                key={bench.slug}
                href={`/bench/${bench.slug}`}
                className="group rounded-2xl border border-stone-800 bg-stone-900/80 p-6 shadow-lg shadow-black/20 transition hover:-translate-y-1 hover:border-amber-600 hover:bg-stone-900"
              >
                <div className="mb-4 text-4xl">{bench.icon}</div>

                <h3 className="mb-2 text-xl font-bold text-stone-50 group-hover:text-amber-400">
                  {bench.name}
                </h3>

                <p className="text-sm leading-6 text-stone-400">
                  {bench.description}
                </p>
              </Link>
            ))}
          </div>
        </section>

        <PostFeed posts={posts ?? []} />
      </section>
    </main>
  );
}
