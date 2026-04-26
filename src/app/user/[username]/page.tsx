import Link from "next/link";
import { notFound } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import EditProfileButton from "@/components/EditProfileButton";
import {
  FaInstagram,
  FaFacebook,
  FaTiktok,
  FaYoutube,
  FaXTwitter,
  FaLinkedin,
  FaGlobe,
} from "react-icons/fa6";
import SocialLinkIcon from "@/components/SocialLinkIcon";

type PageProps = {
  params: Promise<{
    username: string;
  }>;
};

export default async function UserProfilePage({ params }: PageProps) {
  const { username } = await params;

  const { data: profile, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("username", username)
    .single();

  if (error || !profile) {
    notFound();
  }

  const { data: posts } = await supabase
    .from("posts")
    .select("*, comments(count)")
    .eq("user_id", profile.id)
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

        <div className="mb-8 rounded-2xl border border-stone-800 bg-stone-900/80 p-6 shadow-xl shadow-black/30">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
            {profile.avatar_url ? (
              <img
                src={profile.avatar_url}
                alt={profile.display_name}
                className="h-24 w-24 rounded-full border border-stone-700 object-cover"
              />
            ) : (
              <div className="flex h-24 w-24 items-center justify-center rounded-full border border-stone-700 bg-stone-950 text-3xl font-bold text-amber-500">
                {profile.display_name?.[0] ?? "?"}
              </div>
            )}

            <div>
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="text-3xl font-bold text-stone-50">
                  {profile.display_name}
                </h1>

                {profile.role === "admin" && (
                  <span className="rounded-full border border-amber-700 px-3 py-1 text-xs font-bold uppercase tracking-wide text-amber-400">
                    Admin
                  </span>
                )}
                <EditProfileButton profileId={profile.id} />
              </div>

              <p className="mt-2 text-stone-400">@{profile.username}</p>
            </div>
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            {profile.website_url && (
              <a
                href={profile.website_url}
                target="_blank"
                rel="noreferrer"
                className="rounded-xl border border-stone-700 px-4 py-2 text-sm font-semibold text-stone-300 transition hover:border-amber-600 hover:text-amber-400"
              >
                Website
              </a>
            )}

            {profile.social_url_1 && (
              <SocialLinkIcon url={profile.social_url_1} />
            )}

            {profile.social_url_2 && (
              <SocialLinkIcon url={profile.social_url_2} />
            )}
          </div>
        </div>

        <section>
          <h2 className="mb-5 text-2xl font-bold text-stone-100">
            Posts by {profile.display_name}
          </h2>

          <div className="space-y-4">
            {posts && posts.length > 0 ? (
              posts.map((post) => (
                <Link
                  key={post.id}
                  href={`/posts/${post.id}`}
                  className="block rounded-2xl border border-stone-800 bg-stone-900/70 p-5 transition hover:border-amber-600 hover:bg-stone-900"
                >
                  <div className="mb-2 flex flex-wrap items-center gap-3 text-xs uppercase tracking-wide text-stone-500">
                    <span>{post.section}</span>
                    <span>•</span>
                    <span>{new Date(post.created_at).toLocaleString()}</span>
                    <span>•</span>
                    <span>{post.comments?.[0]?.count ?? 0} comments</span>
                  </div>

                  <h3 className="text-xl font-bold text-stone-100">
                    {post.title}
                  </h3>
                </Link>
              ))
            ) : (
              <div className="rounded-2xl border border-dashed border-stone-700 p-8 text-center text-stone-400">
                No posts from this leatherworker yet.
              </div>
            )}
          </div>
        </section>
      </section>
    </main>
  );
}
