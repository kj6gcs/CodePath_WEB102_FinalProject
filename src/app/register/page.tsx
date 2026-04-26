"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";

const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,}$/;

export default function RegisterPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [socialUrl1, setSocialUrl1] = useState("");
  const [socialUrl2, setSocialUrl2] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErrorMessage("");

    if (!email.trim() || !username.trim() || !displayName.trim()) {
      setErrorMessage("Email, username, and display name are required.");
      return;
    }

    if (!passwordRegex.test(password)) {
      setErrorMessage(
        "Password must be at least 8 characters and include uppercase, lowercase, number, and special symbol.",
      );
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage("Passwords do not match.");
      return;
    }

    setIsSubmitting(true);

    const { data, error } = await supabase.auth.signUp({
      email: email.trim(),
      password,
    });

    if (error || !data.user) {
      setIsSubmitting(false);
      setErrorMessage(error?.message ?? "Could not create account.");
      return;
    }

    const { error: profileError } = await supabase.from("profiles").insert({
      id: data.user.id,
      username: username.trim().toLowerCase().replace(/\s+/g, ""),
      display_name: displayName.trim(),
      avatar_url: avatarUrl.trim() || null,
      website_url: websiteUrl.trim() || null,
      social_url_1: socialUrl1.trim() || null,
      social_url_2: socialUrl2.trim() || null,
      role: "user",
    });

    setIsSubmitting(false);

    if (profileError) {
      setErrorMessage(profileError.message);
      return;
    }

    router.push("/login");
  }

  return (
    <main className="min-h-screen bg-stone-950 px-6 py-12 text-stone-100">
      <section className="mx-auto max-w-3xl">
        <Link
          href="/"
          className="mb-8 inline-block text-sm font-semibold text-amber-500 hover:text-amber-400"
        >
          ← Back to The Bench
        </Link>

        <div className="rounded-2xl border border-stone-800 bg-stone-900/80 p-6 shadow-xl shadow-black/30">
          <p className="mb-3 text-sm font-semibold uppercase tracking-[0.3em] text-amber-500">
            Join the Forum
          </p>

          <h1 className="mb-6 text-3xl font-bold text-stone-50">
            Create Your Account
          </h1>

          <form onSubmit={handleSubmit} className="space-y-6">
            <input
              type="email"
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-xl border border-stone-700 bg-stone-950 px-4 py-3 outline-none focus:border-amber-500"
            />

            <input
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full rounded-xl border border-stone-700 bg-stone-950 px-4 py-3 outline-none focus:border-amber-500"
            />

            <input
              type="text"
              placeholder="Display name"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="w-full rounded-xl border border-stone-700 bg-stone-950 px-4 py-3 outline-none focus:border-amber-500"
            />

            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-xl border border-stone-700 bg-stone-950 px-4 py-3 outline-none focus:border-amber-500"
            />

            <input
              type="password"
              placeholder="Confirm password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full rounded-xl border border-stone-700 bg-stone-950 px-4 py-3 outline-none focus:border-amber-500"
            />

            <div className="border-t border-stone-800 pt-6">
              <p className="mb-4 text-sm font-semibold text-stone-300">
                Optional Profile Details
              </p>

              <div className="space-y-4">
                <input
                  type="url"
                  placeholder="Profile image URL"
                  value={avatarUrl}
                  onChange={(e) => setAvatarUrl(e.target.value)}
                  className="w-full rounded-xl border border-stone-700 bg-stone-950 px-4 py-3 outline-none focus:border-amber-500"
                />

                <input
                  type="url"
                  placeholder="Website / portfolio URL"
                  value={websiteUrl}
                  onChange={(e) => setWebsiteUrl(e.target.value)}
                  className="w-full rounded-xl border border-stone-700 bg-stone-950 px-4 py-3 outline-none focus:border-amber-500"
                />

                <input
                  type="url"
                  placeholder="Social link 1"
                  value={socialUrl1}
                  onChange={(e) => setSocialUrl1(e.target.value)}
                  className="w-full rounded-xl border border-stone-700 bg-stone-950 px-4 py-3 outline-none focus:border-amber-500"
                />

                <input
                  type="url"
                  placeholder="Social link 2"
                  value={socialUrl2}
                  onChange={(e) => setSocialUrl2(e.target.value)}
                  className="w-full rounded-xl border border-stone-700 bg-stone-950 px-4 py-3 outline-none focus:border-amber-500"
                />
              </div>
            </div>

            {errorMessage && (
              <p className="rounded-xl border border-red-900 bg-red-950/40 px-4 py-3 text-sm text-red-300">
                {errorMessage}
              </p>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full rounded-xl bg-amber-600 px-5 py-3 font-bold text-stone-950 transition hover:bg-amber-500 disabled:opacity-60"
            >
              {isSubmitting ? "Creating Account..." : "Create Account"}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-stone-400">
            Already have an account?{" "}
            <Link href="/login" className="font-semibold text-amber-500">
              Log in
            </Link>
          </p>
        </div>
      </section>
    </main>
  );
}
