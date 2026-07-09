import { UserButton } from "@clerk/nextjs";

export function Navbar() {
  return (
    <header className="flex h-16 items-center justify-between border-b bg-white px-8">
      <div className="w-full max-w-md">
        <input
          placeholder="Search..."
          className="w-full rounded-lg border px-4 py-2 outline-none focus:ring-2 focus:ring-black"
        />
      </div>

      <div className="flex items-center gap-6">
        <button className="text-xl">
          🔔
        </button>

        <UserButton />
      </div>
    </header>
  );
}