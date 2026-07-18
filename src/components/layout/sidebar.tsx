"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import {
  LayoutDashboard,
  FileText,
  Users,
  ShieldCheck,
  Settings,
  History,
  UserCheck,
  AlertCircle,
  Scale,
  CreditCard,
  Code2,
  Building2,
  Database,
} from "lucide-react";

const links = [
  {
    href: "/dashboard",
    label: "Dashboard",
    icon: LayoutDashboard,
  },
  {
    href: "/consents",
    label: "Consents",
    icon: ShieldCheck,
  },
  {
    href: "/templates",
    label: "Templates",
    icon: FileText,
  },
  {
    href: "/inventory",
    label: "Data Inventory",
    icon: Database,
  },
  {
    href: "/vendors",
    label: "Vendor Registry",
    icon: Building2,
  },
  {
    href: "/requests",
    label: "DSAR Requests",
    icon: UserCheck,
  },
  {
    href: "/audit",
    label: "Audit Logs",
    icon: History,
  },
  {
    href: "/compliance/breach",
    label: "CERT-In Breach",
    icon: AlertCircle,
  },
  {
    href: "/compliance/dpbi",
    label: "DPBI Guidance",
    icon: Scale,
  },
  {
    href: "/docs",
    label: "Developer API",
    icon: Code2,
  },
  {
    href: "/billing",
    label: "Billing",
    icon: CreditCard,
  },
  {
    href: "/settings/company",
    label: "Settings",
    icon: Settings,
  },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex h-screen w-64 flex-col border-r bg-white">
      <div className="border-b p-6">
        <h1 className="text-2xl font-bold">
          PrivyStack
        </h1>

        <p className="mt-1 text-sm text-gray-500">
          DPDP Compliance
        </p>
      </div>

      <nav className="flex-1 space-y-2 p-4">
        {links.map((link) => {
          const Icon = link.icon;
          const active = pathname === link.href;

          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex items-center gap-3 rounded-lg px-4 py-3 transition ${
                active
                  ? "bg-black text-white"
                  : "text-gray-700 hover:bg-slate-100"
              }`}
            >
              <Icon size={18} />
              {link.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}