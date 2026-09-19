import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import CommunityPanel from "@/components/CommunityPanel";

export default async function CommunityPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  return <CommunityPanel />;
}
