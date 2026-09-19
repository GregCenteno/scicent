import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import ReelFeed from "@/components/ReelFeed";

export default async function FeedPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  return <ReelFeed userName={session.user?.name} />;
}
