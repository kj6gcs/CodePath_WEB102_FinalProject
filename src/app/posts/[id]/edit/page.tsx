import { notFound } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import EditPostForm from "@/components/EditPostForm";

type PageProps = {
  params: Promise<{
    id: string;
  }>;
};

type PostImage = {
  id: string;
  image_url: string;
  position: number;
};

export default async function EditPostPage({ params }: PageProps) {
  const { id } = await params;

  const { data: post, error } = await supabase
    .from("posts")
    .select(
      `
      *,
      post_images(id, image_url, position)
    `,
    )
    .eq("id", id)
    .single();

  if (error || !post) {
    notFound();
  }

  const existingImages = post.post_images
    ? [...post.post_images].sort(
        (a: PostImage, b: PostImage) => a.position - b.position,
      )
    : [];

  return <EditPostForm post={post} existingImages={existingImages} />;
}
