import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { ensureCompany } from "@/services/company.service";

export default async function DashboardPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  const user = await currentUser();

  if (!user) {
  redirect("/sign-in");
}

const company = await ensureCompany(
  userId,
  user.firstName
    ? `${user.firstName}'s Company`
    : "My Company"
);

  return (
    <main className="min-h-screen p-10">
      <h1 className="text-4xl font-bold">
        Welcome back 👋
      </h1>

      <p className="mt-3 text-gray-600">
        Signed in as
      </p>

      <div className="mt-2 rounded-lg border p-6">
        <h2 className="text-2xl font-semibold">
          {user?.firstName}
        </h2>

        <p>{user?.emailAddresses[0].emailAddress}</p>

        <p className="mt-6 text-sm text-gray-500">
        Company: {company.company_name}
        </p>
      </div>
    </main>
  );
}