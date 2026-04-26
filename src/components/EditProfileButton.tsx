"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";

type EditProfileButtonProps = {
  profileId: string;
};

export default function EditProfileButton({
  profileId,
}: EditProfileButtonProps) {
  const [canEdit, setCanEdit] = useState(false);

  useEffect(() => {
    async function checkUser() {
      const { data } = await supabase.auth.getUser();

      if (data.user?.id === profileId) {
        setCanEdit(true);
      }
    }

    checkUser();
  }, [profileId]);

  if (!canEdit) return null;

  return (
    <Link
      href="/profile/edit"
      className="rounded-xl border border-stone-700 px-4 py-2 text-sm font-semibold text-stone-300 transition hover:border-amber-600 hover:text-amber-400"
    >
      Edit Profile
    </Link>
  );
}
