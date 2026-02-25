import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Layout from "@/components/Layout";

export default async function StudentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session || session.user.role !== "STUDENT") redirect("/login");

  return (
    <Layout
      role={session.user.role}
      firstName={session.user.firstName}
      lastName={session.user.lastName}
    >
      {children}
    </Layout>
  );
}
