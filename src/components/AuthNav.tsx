"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Bell, LogOut, Pencil, User } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";

type Profile = {
  username: string;
  display_name: string;
  role: string;
  avatar_url: string | null;
};

export default function AuthNav() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  async function handleLogout() {
    await supabase.auth.signOut();
    setProfile(null);
    window.location.href = "/";
  }

  useEffect(() => {
    async function loadUser() {
      const { data: userData } = await supabase.auth.getUser();

      if (!userData.user) {
        setProfile(null);
        setIsLoading(false);
        return;
      }

      const { data: profileData, error } = await supabase
        .from("profiles")
        .select("username, display_name, role, avatar_url")
        .eq("id", userData.user.id)
        .single();

      if (error || !profileData) {
        setProfile(null);
        setIsLoading(false);
        return;
      }

      const { count } = await supabase
        .from("notifications")
        .select("id", { count: "exact", head: true })
        .eq("recipient_id", userData.user.id)
        .eq("is_read", false);

      setProfile(profileData);
      setUnreadCount(count ?? 0);
      setIsLoading(false);
    }

    loadUser();
  }, []);

  if (isLoading) {
    return <div className="text-sm text-stone-500">Checking account...</div>;
  }

  if (!profile) {
    return (
      <div className="flex flex-wrap gap-3">
        <Link
          href="/login"
          className="rounded-xl border border-stone-700 px-4 py-2 text-sm font-semibold text-stone-300 transition hover:border-amber-600 hover:text-amber-400"
        >
          Log In
        </Link>

        <Link
          href="/register"
          className="rounded-xl bg-amber-600 px-4 py-2 text-sm font-bold text-stone-950 transition hover:bg-amber-500"
        >
          Register
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-end gap-1 text-right">
      <div className="flex flex-wrap items-center justify-end gap-2 text-sm text-stone-400">
        {profile.avatar_url && (
          <img
            src={profile.avatar_url}
            alt={profile.display_name}
            className="h-8 w-8 rounded-full border border-stone-700 object-cover"
          />
        )}

        <span>
          Signed in as{" "}
          <Link
            href={`/user/${profile.username}`}
            className="font-semibold text-amber-500 transition hover:text-amber-400"
          >
            {profile.display_name}
          </Link>
        </span>

        {profile.role === "admin" && (
          <span className="rounded-full border border-amber-700 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-amber-500">
            Admin
          </span>
        )}

        {profile.role === "moderator" && (
          <span className="rounded-full border border-sky-700 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-sky-400">
            Moderator
          </span>
        )}
      </div>

      <div className="flex flex-wrap items-center justify-end gap-3">
        <Link
          href={`/user/${profile.username}`}
          title="Profile"
          className="text-amber-500 transition hover:text-amber-400"
        >
          <User className="h-5 w-5" />
        </Link>

        <Link
          href="/profile/edit"
          title="Edit Profile"
          className="text-amber-500 transition hover:text-amber-400"
        >
          <Pencil className="h-5 w-5" />
        </Link>

        <Link
          href="/notifications"
          title="Notifications"
          className={`relative transition ${
            unreadCount > 0
              ? "text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.9)]"
              : "text-amber-500 hover:text-amber-400"
          }`}
        >
          <Bell className="h-5 w-5" />

          {unreadCount > 0 && (
            <span className="absolute -right-2 -top-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-700 px-1 text-[10px] font-bold text-white">
              {unreadCount}
            </span>
          )}
        </Link>

        <button
          onClick={handleLogout}
          title="Log Out"
          className="text-amber-500 transition hover:text-red-800"
        >
          <LogOut className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
}
