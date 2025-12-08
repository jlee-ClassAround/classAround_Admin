import { Card } from "@/components/ui/card";
import { db } from "@/lib/db";
import { PostForm } from "./_components/post-form";

interface Props {
  params: Promise<{ postId: string }>;
}

export default async function PostPage({ params }: Props) {
  const { postId } = await params;

  const id = Number(postId);

  const post = isNaN(id)
    ? null
    : await db.post.findUnique({
        where: {
          id,
        },
      });

  return (
    <Card className="p-8">
      <PostForm initialData={post} />
    </Card>
  );
}
