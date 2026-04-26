"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

type Profile = {
  id: string;
  username: string;
  display_name: string;
  avatar_url: string | null;
  website_url: string | null;
  social_url_1: string | null;
  social_url_2: string | null;
};

export default function EditProfilePage() {
  const router = useRouter();

  const [profile, setProfile] = useState<Profile | null>(null);
  const [displayName, setDisplayName] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [socialUrl1, setSocialUrl1] = useState("");
  const [socialUrl2, setSocialUrl2] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);

  useEffect(() => {
    async function loadProfile() {
      const { data: userData } = await supabase.auth.getUser();

      if (!userData.user) {
        router.push("/login");
        return;
      }

      const { data, error } = await supabase
        .from("profiles")
        .select(
          "id, username, display_name, avatar_url, website_url, social_url_1, social_url_2",
        )
        .eq("id", userData.user.id)
        .single();

      if (error || !data) {
        setErrorMessage("Could not load profile.");
        setIsLoading(false);
        return;
      }

      setProfile(data);
      setDisplayName(data.display_name ?? "");
      setAvatarUrl(data.avatar_url ?? "");
      setWebsiteUrl(data.website_url ?? "");
      setSocialUrl1(data.social_url_1 ?? "");
      setSocialUrl2(data.social_url_2 ?? "");
      setIsLoading(false);
    }

    loadProfile();
  }, [router]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErrorMessage("");

    if (!profile) return;

    if (!displayName.trim()) {
      setErrorMessage("Display name is required.");
      return;
    }

    setIsSaving(true);

    let uploadedAvatarUrl = avatarUrl.trim() || null;

    if (avatarFile) {
      const fileExt = avatarFile.name.split(".").pop();
      const filePath = `${profile.id}/avatar-${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(filePath, avatarFile, {
          upsert: true,
        });

      if (uploadError) {
        setIsSaving(false);
        setErrorMessage(uploadError.message);
        return;
      }

      const { data: publicUrlData } = supabase.storage
        .from("avatars")
        .getPublicUrl(filePath);

      uploadedAvatarUrl = publicUrlData.publicUrl;
    }

    const { error } = await supabase
      .from("profiles")
      .update({
        display_name: displayName.trim(),
        avatar_url: uploadedAvatarUrl,
        website_url: websiteUrl.trim() || null,
        social_url_1: socialUrl1.trim() || null,
        social_url_2: socialUrl2.trim() || null,
      })
      .eq("id", profile.id);

    setIsSaving(false);

    if (error) {
      setErrorMessage(error.message);
      return;
    }

    router.push(`/user/${profile.username}`);
    router.refresh();
  }

  if (isLoading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-stone-950 text-stone-100">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-stone-700 border-t-amber-500" />
          <p className="text-sm uppercase tracking-[0.3em] text-stone-400">
            Loading Profile...
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-stone-950 px-6 py-12 text-stone-100">
      <section className="mx-auto max-w-3xl">
        <Link
          href={profile ? `/user/${profile.username}` : "/"}
          className="mb-8 inline-block text-sm font-semibold text-amber-500 hover:text-amber-400"
        >
          ← Back to Profile
        </Link>

        <div className="rounded-2xl border border-stone-800 bg-stone-900/80 p-6 shadow-xl shadow-black/30">
          <p className="mb-3 text-sm font-semibold uppercase tracking-[0.3em] text-amber-500">
            Profile Settings
          </p>

          <h1 className="mb-6 text-3xl font-bold text-stone-50">
            Edit Your Profile
          </h1>

          {profile && (
            <p className="mb-6 text-sm text-stone-400">
              Username:{" "}
              <span className="font-semibold text-amber-500">
                @{profile.username}
              </span>
            </p>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label
                htmlFor="displayName"
                className="mb-2 block text-sm font-semibold text-stone-200"
              >
                Display Name <span className="text-amber-500">*</span>
              </label>

              <input
                id="displayName"
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="w-full rounded-xl border border-stone-700 bg-stone-950 px-4 py-3 text-stone-100 outline-none transition focus:border-amber-500"
              />
            </div>

            <div>
              <label
                htmlFor="avatarUrl"
                className="mb-2 block text-sm font-semibold text-stone-200"
              >
                Profile Image URL
              </label>

              <input
                id="avatarUrl"
                type="url"
                value={avatarUrl}
                onChange={(e) => setAvatarUrl(e.target.value)}
                placeholder="https://example.com/profile-image.jpg"
                className="w-full rounded-xl border border-stone-700 bg-stone-950 px-4 py-3 text-stone-100 outline-none transition placeholder:text-stone-600 focus:border-amber-500"
              />
            </div>

            <div>
              <label
                htmlFor="avatarFile"
                className="mb-2 block text-sm font-semibold text-stone-200"
              >
                Upload Profile Image
              </label>

              <input
                id="avatarFile"
                type="file"
                accept="image/*"
                onChange={(e) => setAvatarFile(e.target.files?.[0] ?? null)}
                className="w-full rounded-xl border border-stone-700 bg-stone-950 px-4 py-3 text-stone-100 file:mr-4 file:rounded-lg file:border-0 file:bg-amber-600 file:px-4 file:py-2 file:font-semibold file:text-stone-950 hover:file:bg-amber-500"
              />

              <p className="mt-2 text-xs text-stone-500">
                Uploading a file will replace the image URL when you save.
              </p>
            </div>

            <div>
              <label
                htmlFor="websiteUrl"
                className="mb-2 block text-sm font-semibold text-stone-200"
              >
                Website / Portfolio URL
              </label>

              <input
                id="websiteUrl"
                type="url"
                value={websiteUrl}
                onChange={(e) => setWebsiteUrl(e.target.value)}
                placeholder="https://widemanleather.works"
                className="w-full rounded-xl border border-stone-700 bg-stone-950 px-4 py-3 text-stone-100 outline-none transition placeholder:text-stone-600 focus:border-amber-500"
              />
            </div>

            <div>
              <label
                htmlFor="socialUrl1"
                className="mb-2 block text-sm font-semibold text-stone-200"
              >
                Social Link 1
              </label>

              <input
                id="socialUrl1"
                type="url"
                value={socialUrl1}
                onChange={(e) => setSocialUrl1(e.target.value)}
                placeholder="Instagram, TikTok, Facebook, LinkedIn, etc."
                className="w-full rounded-xl border border-stone-700 bg-stone-950 px-4 py-3 text-stone-100 outline-none transition placeholder:text-stone-600 focus:border-amber-500"
              />
            </div>

            <div>
              <label
                htmlFor="socialUrl2"
                className="mb-2 block text-sm font-semibold text-stone-200"
              >
                Social Link 2
              </label>

              <input
                id="socialUrl2"
                type="url"
                value={socialUrl2}
                onChange={(e) => setSocialUrl2(e.target.value)}
                placeholder="Another public link"
                className="w-full rounded-xl border border-stone-700 bg-stone-950 px-4 py-3 text-stone-100 outline-none transition placeholder:text-stone-600 focus:border-amber-500"
              />
            </div>

            {errorMessage && (
              <p className="rounded-xl border border-red-900 bg-red-950/40 px-4 py-3 text-sm text-red-300">
                {errorMessage}
              </p>
            )}

            <button
              type="submit"
              disabled={isSaving}
              className="w-full rounded-xl bg-amber-600 px-5 py-3 font-bold text-stone-950 shadow-lg shadow-amber-950/30 transition hover:bg-amber-500 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSaving ? "Saving Profile..." : "Save Profile"}
            </button>
          </form>
        </div>
      </section>
    </main>
  );
}
