import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { MyMeetingsHome } from "@/components/meetings/MyMeetingsHome";

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }

  return (
    <MyMeetingsHome
      user={{
        name: session.user.name,
        email: session.user.email,
        image: session.user.image,
      }}
    />
  );
}
