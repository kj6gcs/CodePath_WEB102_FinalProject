"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

type Notification = {
  id: string;
  message: string;
  post_id: string | null;
  is_read: boolean;
  created_at: string;
};

export default function NotificationsPage() {
  const router = useRouter();

  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    async function loadNotifications() {
      const { data: userData } = await supabase.auth.getUser();

      if (!userData.user) {
        router.push("/login");
        return;
      }

      const { data, error } = await supabase
        .from("notifications")
        .select("id, message, post_id, is_read, created_at")
        .eq("recipient_id", userData.user.id)
        .order("created_at", { ascending: false });

      if (error) {
        setErrorMessage(error.message);
        setIsLoading(false);
        return;
      }

      setNotifications(data ?? []);
      setIsLoading(false);
    }

    loadNotifications();
  }, [router]);

  async function markAsRead(notificationId: string) {
    await supabase
      .from("notifications")
      .update({ is_read: true })
      .eq("id", notificationId);
  }

  if (isLoading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-stone-950 text-stone-100">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-stone-700 border-t-amber-500" />
          <p className="text-sm uppercase tracking-[0.3em] text-stone-400">
            Checking the Message Bench...
          </p>
        </div>
      </main>
    );
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

        <div className="rounded-2xl border border-stone-800 bg-stone-900/80 p-6">
          <h1 className="mb-6 text-3xl font-bold text-stone-50">
            Notifications
          </h1>

          {errorMessage && (
            <p className="mb-4 rounded-xl border border-red-900 bg-red-950/40 px-4 py-3 text-sm text-red-300">
              {errorMessage}
            </p>
          )}

          <div className="space-y-4">
            {notifications.length > 0 ? (
              notifications.map((notification) => (
                <Link
                  key={notification.id}
                  href={
                    notification.post_id
                      ? `/posts/${notification.post_id}`
                      : "/"
                  }
                  onClick={() => markAsRead(notification.id)}
                  className={`block rounded-xl border p-4 transition ${
                    notification.is_read
                      ? "border-stone-800 bg-stone-950"
                      : "border-amber-700 bg-stone-950 shadow-lg shadow-amber-950/20"
                  } hover:border-amber-500`}
                >
                  <p className="font-semibold text-stone-100">
                    {notification.message}
                  </p>

                  <p className="mt-2 text-xs text-stone-500">
                    {new Date(notification.created_at).toLocaleString()}
                  </p>
                </Link>
              ))
            ) : (
              <p className="text-stone-400">No notifications yet.</p>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}
