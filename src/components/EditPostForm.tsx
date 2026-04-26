"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";

const benches = [
  { label: "Showcase", value: "showcase" },
  { label: "Sewing Pony", value: "sewing-pony" },
  { label: "Draft Desk", value: "draft-desk" },
  { label: "Tool Rack", value: "tool-rack" },
  { label: "The Tannery", value: "tannery" },
  { label: "Scrap Bin", value: "scrap-bin" },
];

type Post = {
  id: string;
  title: string;
  section: string;
  content: string | null;
  image_url: string | null;
};

type ExistingImage = {
  id: string;
  image_url: string;
  position: number;
};

export default function EditPostForm({
  post,
  existingImages = [],
}: {
  post: Post;
  existingImages?: ExistingImage[];
}) {
  const router = useRouter();

  const [title, setTitle] = useState(post.title);
  const [section, setSection] = useState(post.section);
  const [content, setContent] = useState(post.content ?? "");
  const [imageUrl, setImageUrl] = useState(post.image_url ?? "");
  const [images, setImages] = useState(existingImages);
  const [newFiles, setNewFiles] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  function removeImage(id: string) {
    setImages((current) => current.filter((img) => img.id !== id));
  }

  function moveUp(index: number) {
    if (index === 0) return;

    const updated = [...images];
    [updated[index - 1], updated[index]] = [updated[index], updated[index - 1]];

    setImages(updated);
  }

  function moveDown(index: number) {
    if (index === images.length - 1) return;

    const updated = [...images];
    [updated[index], updated[index + 1]] = [updated[index + 1], updated[index]];

    setImages(updated);
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErrorMessage("");

    if (!title.trim()) {
      setErrorMessage("Post title is required.");
      return;
    }

    if (images.length + newFiles.length > 6) {
      setErrorMessage("Maximum 6 images allowed.");
      return;
    }

    setIsSubmitting(true);

    const { data: userData } = await supabase.auth.getUser();

    if (!userData.user) {
      setIsSubmitting(false);
      setErrorMessage("You must be logged in.");
      return;
    }

    const { error: updateError } = await supabase
      .from("posts")
      .update({
        title: title.trim(),
        section,
        content: content.trim() || null,
        image_url: imageUrl.trim() || null,
      })
      .eq("id", post.id);

    if (updateError) {
      setIsSubmitting(false);
      setErrorMessage(updateError.message);
      return;
    }

    const keepIds = images.map((img) => img.id);

    await supabase
      .from("post_images")
      .delete()
      .eq("post_id", post.id)
      .not("id", "in", `(${keepIds.length ? keepIds.join(",") : "null"})`);

    for (let i = 0; i < images.length; i++) {
      await supabase
        .from("post_images")
        .update({ position: i })
        .eq("id", images[i].id);
    }

    const uploadRows = [];

    for (let i = 0; i < newFiles.length; i++) {
      const file = newFiles[i];
      const fileExt = file.name.split(".").pop();

      const filePath = `${userData.user.id}/${post.id}/edit-${Date.now()}-${i}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("post-images")
        .upload(filePath, file, {
          upsert: true,
        });

      if (uploadError) {
        setIsSubmitting(false);
        setErrorMessage(uploadError.message);
        return;
      }

      const { data: publicUrlData } = supabase.storage
        .from("post-images")
        .getPublicUrl(filePath);

      uploadRows.push({
        post_id: post.id,
        image_url: publicUrlData.publicUrl,
        position: images.length + i,
      });
    }

    if (uploadRows.length > 0) {
      const { error: insertError } = await supabase
        .from("post_images")
        .insert(uploadRows);

      if (insertError) {
        setIsSubmitting(false);
        setErrorMessage(insertError.message);
        return;
      }
    }

    setIsSubmitting(false);
    router.push(`/posts/${post.id}`);
    router.refresh();
  }

  return (
    <main className="min-h-screen bg-stone-950 px-6 py-12 text-stone-100">
      <section className="mx-auto max-w-3xl">
        <Link
          href={`/posts/${post.id}`}
          className="mb-8 inline-block text-sm font-semibold text-amber-500 hover:text-amber-400"
        >
          ← Back to Post
        </Link>

        <div className="rounded-2xl border border-stone-800 bg-stone-900/80 p-6 shadow-xl shadow-black/30">
          <p className="mb-3 text-sm font-semibold uppercase tracking-[0.3em] text-amber-500">
            Edit Post
          </p>

          <h1 className="mb-6 text-3xl font-bold text-stone-50">
            Refine Your Bench Post
          </h1>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="mb-2 block text-sm font-semibold text-stone-200">
                Title
              </label>

              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full rounded-xl border border-stone-700 bg-stone-950 px-4 py-3 text-stone-100 outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-stone-200">
                Choose a Bench
              </label>

              <select
                value={section}
                onChange={(e) => setSection(e.target.value)}
                className="w-full rounded-xl border border-stone-700 bg-stone-950 px-4 py-3 text-stone-100 outline-none focus:border-amber-500"
              >
                {benches.map((bench) => (
                  <option key={bench.value} value={bench.value}>
                    {bench.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-stone-200">
                Content
              </label>

              <textarea
                rows={7}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="w-full resize-y rounded-xl border border-stone-700 bg-stone-950 px-4 py-3 text-stone-100 outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-stone-200">
                Existing Gallery
              </label>

              <div className="space-y-3">
                {images.map((image, index) => (
                  <div
                    key={image.id}
                    className="flex items-center gap-3 rounded-xl border border-stone-800 bg-stone-950 p-3"
                  >
                    <img
                      src={image.image_url}
                      alt="Post image"
                      className="h-16 w-16 rounded-lg object-cover"
                    />

                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => moveUp(index)}
                        className="rounded-lg border border-stone-700 px-3 py-1 text-sm hover:border-amber-500"
                      >
                        ↑
                      </button>

                      <button
                        type="button"
                        onClick={() => moveDown(index)}
                        className="rounded-lg border border-stone-700 px-3 py-1 text-sm hover:border-amber-500"
                      >
                        ↓
                      </button>

                      <button
                        type="button"
                        onClick={() => removeImage(image.id)}
                        className="rounded-lg border border-red-900 px-3 py-1 text-sm text-red-300 hover:bg-red-950"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-stone-200">
                Upload More Images
              </label>

              <input
                type="file"
                accept="image/*"
                multiple
                onChange={(e) =>
                  setNewFiles(
                    Array.from(e.target.files ?? []).slice(
                      0,
                      6 - images.length,
                    ),
                  )
                }
                className="w-full rounded-xl border border-stone-700 bg-stone-950 px-4 py-3 text-stone-100 file:mr-4 file:rounded-lg file:border-0 file:bg-amber-600 file:px-4 file:py-2 file:font-semibold file:text-stone-950"
              />

              <p className="mt-2 text-xs text-stone-500">
                {images.length + newFiles.length}/6 total selected
              </p>
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
              {isSubmitting ? "Saving..." : "Save Changes"}
            </button>
          </form>
        </div>
      </section>
    </main>
  );
}
