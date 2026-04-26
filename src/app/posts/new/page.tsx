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

export default function NewPostPage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [section, setSection] = useState("showcase");
  const [flag, setFlag] = useState("General");
  const [content, setContent] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [repostOf, setRepostOf] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErrorMessage("");

    if (!title.trim()) {
      setErrorMessage("Post title is required.");
      return;
    }

    if (imageFiles.length > 6) {
      setErrorMessage("You can upload up to 6 images per post.");
      return;
    }

    setIsSubmitting(true);

    const { data: userData } = await supabase.auth.getUser();

    if (!userData.user) {
      setErrorMessage("You must be logged in to create a post.");
      setIsSubmitting(false);
      return;
    }

    const { data: createdPost, error: postError } = await supabase
      .from("posts")
      .insert({
        title: title.trim(),
        section,
        flag,
        content: content.trim() || null,
        image_url: imageUrl.trim() || null,
        video_url: videoUrl.trim() || null,
        repost_of: repostOf.trim() || null,
        upvotes: 0,
        downvotes: 0,
        user_id: userData.user.id,
      })
      .select("id")
      .single();

    if (postError || !createdPost) {
      setErrorMessage(postError?.message ?? "Could not create post.");
      setIsSubmitting(false);
      return;
    }

    const imageRows: {
      post_id: string;
      image_url: string;
      position: number;
    }[] = [];

    if (imageUrl.trim()) {
      imageRows.push({
        post_id: createdPost.id,
        image_url: imageUrl.trim(),
        position: 0,
      });
    }

    for (let i = 0; i < imageFiles.length; i++) {
      const file = imageFiles[i];
      const fileExt = file.name.split(".").pop();

      const filePath = `${userData.user.id}/${createdPost.id}/image-${i}-${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("post-images")
        .upload(filePath, file, {
          upsert: true,
        });

      if (uploadError) {
        setErrorMessage(uploadError.message);
        setIsSubmitting(false);
        return;
      }

      const { data: publicUrlData } = supabase.storage
        .from("post-images")
        .getPublicUrl(filePath);

      imageRows.push({
        post_id: createdPost.id,
        image_url: publicUrlData.publicUrl,
        position: imageRows.length,
      });
    }

    if (imageRows.length > 0) {
      const { error: imageInsertError } = await supabase
        .from("post_images")
        .insert(imageRows);

      if (imageInsertError) {
        setErrorMessage(imageInsertError.message);
        setIsSubmitting(false);
        return;
      }
    }

    setIsSubmitting(false);
    router.push(`/posts/${createdPost.id}`);
    router.refresh();
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
            Create Post
          </p>

          <h1 className="mb-6 text-3xl font-bold text-stone-50">
            Post to the Bench
          </h1>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Title */}
            <div>
              <label
                htmlFor="title"
                className="mb-2 block text-sm font-semibold text-stone-200"
              >
                Title <span className="text-amber-500">*</span>
              </label>

              <input
                id="title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="What are you working on?"
                className="w-full rounded-xl border border-stone-700 bg-stone-950 px-4 py-3 text-stone-100 outline-none transition placeholder:text-stone-600 focus:border-amber-500"
              />
            </div>

            {/* Bench */}
            <div>
              <label
                htmlFor="section"
                className="mb-2 block text-sm font-semibold text-stone-200"
              >
                Choose a Bench
              </label>

              <select
                id="section"
                value={section}
                onChange={(e) => setSection(e.target.value)}
                className="w-full rounded-xl border border-stone-700 bg-stone-950 px-4 py-3 text-stone-100 outline-none transition focus:border-amber-500"
              >
                {benches.map((bench) => (
                  <option key={bench.value} value={bench.value}>
                    {bench.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Post Type */}
            <div>
              <label
                htmlFor="flag"
                className="mb-2 block text-sm font-semibold text-stone-200"
              >
                Post Type
              </label>

              <select
                id="flag"
                value={flag}
                onChange={(e) => setFlag(e.target.value)}
                className="w-full rounded-xl border border-stone-700 bg-stone-950 px-4 py-3 text-stone-100 outline-none transition focus:border-amber-500"
              >
                <option value="General">General</option>
                <option value="Question">Question</option>
                <option value="Opinion">Opinion</option>
                <option value="Showcase">Showcase</option>
                <option value="Advice">Advice</option>
                <option value="Pattern">Pattern</option>
                <option value="Tool Review">Tool Review</option>
              </select>
            </div>

            {/* Content */}
            <div>
              <label
                htmlFor="content"
                className="mb-2 block text-sm font-semibold text-stone-200"
              >
                Content
              </label>

              <textarea
                id="content"
                rows={7}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Share details, questions, process notes, or advice..."
                className="w-full resize-y rounded-xl border border-stone-700 bg-stone-950 px-4 py-3 text-stone-100 outline-none transition placeholder:text-stone-600 focus:border-amber-500"
              />
            </div>

            {/* Image URL */}
            <div>
              <label
                htmlFor="imageUrl"
                className="mb-2 block text-sm font-semibold text-stone-200"
              >
                Image URL
              </label>

              <input
                id="imageUrl"
                type="url"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="https://example.com/image.jpg"
                className="w-full rounded-xl border border-stone-700 bg-stone-950 px-4 py-3 text-stone-100 outline-none transition placeholder:text-stone-600 focus:border-amber-500"
              />

              <p className="mt-2 text-xs text-stone-500">
                Optional. You can also upload images below.
              </p>
            </div>

            {/* Upload Images */}
            <div>
              <label
                htmlFor="imageFiles"
                className="mb-2 block text-sm font-semibold text-stone-200"
              >
                Upload Images
              </label>

              <input
                id="imageFiles"
                type="file"
                accept="image/*"
                multiple
                onChange={(e) => {
                  const files = Array.from(e.target.files ?? []).slice(0, 6);
                  setImageFiles(files);
                }}
                className="w-full rounded-xl border border-stone-700 bg-stone-950 px-4 py-3 text-stone-100 file:mr-4 file:rounded-lg file:border-0 file:bg-amber-600 file:px-4 file:py-2 file:font-semibold file:text-stone-950 hover:file:bg-amber-500"
              />

              <p className="mt-2 text-xs text-stone-500">
                Upload up to 6 images. Selected: {imageFiles.length}/6
              </p>
            </div>

            {/* Video URL */}
            <div>
              <label
                htmlFor="videoUrl"
                className="mb-2 block text-sm font-semibold text-stone-200"
              >
                Video URL
              </label>

              <input
                id="videoUrl"
                type="url"
                value={videoUrl}
                onChange={(e) => setVideoUrl(e.target.value)}
                placeholder="Optional: YouTube video URL"
                className="w-full rounded-xl border border-stone-700 bg-stone-950 px-4 py-3 text-stone-100 outline-none transition placeholder:text-stone-600 focus:border-amber-500"
              />

              <p className="mt-2 text-xs text-stone-500">
                Paste a YouTube link to embed a video with your post.
              </p>
            </div>

            {/* Referenced Post */}
            <div>
              <label
                htmlFor="repostOf"
                className="mb-2 block text-sm font-semibold text-stone-200"
              >
                Referenced Post ID
              </label>

              <input
                id="repostOf"
                type="text"
                value={repostOf}
                onChange={(e) => setRepostOf(e.target.value)}
                placeholder="Optional: paste another post ID to reference it"
                className="w-full rounded-xl border border-stone-700 bg-stone-950 px-4 py-3 text-stone-100 outline-none transition placeholder:text-stone-600 focus:border-amber-500"
              />

              <p className="mt-2 text-xs text-stone-500">
                Use this to repost or reference another post.
              </p>
            </div>

            {/* Errors */}
            {errorMessage && (
              <p className="rounded-xl border border-red-900 bg-red-950/40 px-4 py-3 text-sm text-red-300">
                {errorMessage}
              </p>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full rounded-xl bg-amber-600 px-5 py-3 font-bold text-stone-950 shadow-lg shadow-amber-950/30 transition hover:bg-amber-500 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting ? "Posting..." : "Post to the Bench"}
            </button>
          </form>
        </div>
      </section>
    </main>
  );
}
