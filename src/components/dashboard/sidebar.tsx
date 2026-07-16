"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const sections = [
  {
    title: "",
    items: [
      {
        label: "Dashboard",
        href: "/dashboard",
        icon: "🏠",
      },
      {
        label: "Scanner",
        href: "/dashboard/scanner",
        icon: "🔍",
      },
    ],
  },

  {
    title: "Privacy",
    items: [
      {
        label: "Privacy Policy",
        href: "/dashboard/policies/privacy",
        icon: "🛡️",
      },
      {
        label: "Cookie Policy",
        href: "/dashboard/policies/cookies",
        icon: "📄",
      },
      {
        label: "Cookie Banner",
        href: "/dashboard/banner",
        icon: "🍪",
      },
      {
        label: "Trust Center",
        href: "/dashboard/trust",
        icon: "🤝",
      },
    ],
  },

  {
    title: "Consent Management",
    items: [
      {
        label: "Templates",
        href: "/templates",
        icon: "📋",
      },
      {
        label: "Consents",
        href: "/consents",
        icon: "✅",
      },
    ],
  },

  {
    title: "Data Rights",
    items: [
      {
        label: "Requests",
        href: "/requests",
        icon: "📨",
      },
      {
        label: "Audit Logs",
        href: "/audit",
        icon: "📜",
      },
    ],
  },

  {
    title: "Organization",
    items: [
      {
        label: "Company Settings",
        href: "/settings/company",
        icon: "⚙️",
      },
    ],
  },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-72 border-r bg-white">
      <div className="border-b p-6">
        <h1 className="text-2xl font-bold">
          PrivyStack
        </h1>

        <p className="text-sm text-gray-500">
          Privacy OS
        </p>
      </div>

      <nav className="p-4">
        {sections.map((section, index) => (
  <div
    key={`${section.title}-${index}`}
    className="mb-6"
  >
            {section.title && (
              <p className="mb-2 px-3 text-xs font-semibold uppercase tracking-wide text-gray-400">
                {section.title}
              </p>
            )}

            <div className="space-y-1">
              {section.items.map((item) => {
                const active = pathname === item.href;

                return (
                  <Link
                    key={`${item.href}-${item.label}`}
                    href={item.href}
                    className={`flex items-center gap-3 rounded-lg px-4 py-3 transition ${
                      active
                        ? "bg-black text-white"
                        : "hover:bg-slate-100"
                    }`}
                  >
                    <span>{item.icon}</span>
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>
    </aside>
  );
}