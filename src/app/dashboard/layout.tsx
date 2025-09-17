"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Home, Users, Dumbbell, BookHeadphones, FileVideo, Send, Settings, ChevronDown, Menu, X, LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { useUserStore } from "@/stores/useUserStore";

// Navigation structure with dropdown
const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: Home },
  { href: "/dashboard/users", label: "User Management", icon: Users },
  { href: "/dashboard/exercises", label: "Exercises", icon: Dumbbell },
  { href: "/dashboard/exercise-categories", label: "Exercise Categories", icon: Dumbbell },
  { href: "/dashboard/educational-videos", label: "Educational Videos", icon: BookHeadphones },
  { href: "/dashboard/educational-categories", label: "Educational Categories", icon: BookHeadphones },

  {
    label: "Rehab Plans",
    icon: FileVideo,
    children: [
      { href: "/dashboard/rehab-plans", label: "Rehab Plans" },
      { href: "/dashboard/plan-categories", label: "Categories" },
      { href: "/dashboard/rehab-plans/sessions", label: "Session Exercises" },
    ],
  },

  { href: "/dashboard/notifications", label: "Notifications", icon: Send },
  { href: "/dashboard/settings", label: "Content", icon: Settings },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { loading, logout } = useUserStore();
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [expandedMenus, setExpandedMenus] = useState<{ [key: string]: boolean }>({});

  const router = useRouter();
  const handleLogout = async (e: React.FormEvent) => {
    e.preventDefault();
    const success = await logout();
    localStorage.removeItem("token");

    if (success) {
      router.push('/');
    }
  };
  const checkLogin = () => {
    if (localStorage.getItem("token")) {
      return true;
    }
    return false;
  }
  // Expand menu if current route matches any child
  useEffect(() => {
    const newExpandedMenus: { [key: string]: boolean } = {};
    navItems.forEach((item) => {
      if (item.children) {
        newExpandedMenus[item.label] = false;
      }
    });
    setExpandedMenus(newExpandedMenus);
    if (!checkLogin()) {
      router.push("/");
    }
  }, []);

  const toggleMenu = (label: string) => {
    setExpandedMenus((prev) => ({ ...prev, [label]: !prev[label] }));
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full relative">
      <div className="p-4 border-b border-gray-700 flex items-center">
        <Image
          src={"/logo.png"}
          alt="Logo"
          width={40}
          height={40}
          className="mb-2"
        />
        <h1 className="text-xl font-bold text-[#72B8BE] absolute top-5 left-15">
          THE HIP PHYSIO
        </h1>
      </div>
      <nav className="flex-1 px-2 py-4 space-y-2 overflow-y-auto">
        {navItems.map((item) =>
          item.children ? (
            <div key={item.label}>
              {/* Dropdown Parent */}
              <button
                onClick={() => toggleMenu(item.label)}
                className={`w-full flex items-center justify-between px-4 py-2.5 text-sm rounded-lg transition-colors ${expandedMenus[item.label]
                  ? "bg-brand text-white"
                  : "text-gray-300 hover:bg-gray-700 hover:text-white"
                  }`}
              >
                <div className="flex items-center">
                  <item.icon className="w-5 h-5 mr-3" />
                  {item.label}
                </div>
                <ChevronDown
                  className={`w-4 h-4 transform transition-transform ${expandedMenus[item.label] ? "rotate-180" : ""
                    }`}
                />
              </button>

              {/* Dropdown Children */}
              {expandedMenus[item.label] && (
                <div className="pl-10 mt-1 space-y-1">
                  {item.children.map((child) => (
                    <Link
                      key={child.href}
                      href={child.href}
                      onClick={() => setSidebarOpen(false)}
                      className={`block text-sm px-2 py-1 rounded-md transition-colors ${pathname === child.href
                        ? "bg-brand text-white"
                        : "text-gray-400 hover:bg-gray-700 hover:text-white"
                        }`}
                    >
                      {child.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setSidebarOpen(false)}
              className={`flex items-center px-4 py-2.5 text-sm rounded-lg transition-colors ${pathname === item.href
                ? "bg-brand text-white"
                : "text-gray-300 hover:bg-gray-700 hover:text-white"
                }`}
            >
              <item.icon className="w-5 h-5 mr-3" />
              {item.label}
            </Link>
          )
        )}
        <Link
          href={""}
          onClick={handleLogout}
          className={`flex items-center px-4 py-2.5 text-sm rounded-lg transition-colors text-gray-300 hover:bg-gray-700 hover:text-white
                }`}
        >
          <LogOut className="w-5 h-5 mr-3" />

          Logout
        </Link>
      </nav>
    </div>
  );

  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-900">
      {/* Mobile Sidebar */}
      <div
        className={`fixed inset-0 z-30 transition-transform transform ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"
          } bg-gray-800 md:hidden`}
      >
        <SidebarContent />
      </div>

      {/* Desktop Sidebar */}
      <div className="hidden w-64 bg-gray-800 text-white md:flex md:flex-col">
        <SidebarContent />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="flex items-center justify-between p-4 bg-white border-b dark:bg-gray-800 dark:border-gray-700">
          <button
            onClick={() => setSidebarOpen(!isSidebarOpen)}
            className="text-gray-500 focus:outline-none md:hidden"
          >
            {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white md:hidden">
            Dashboard
          </h2>
          <div className="flex-1" />
          {/* User dropdown or profile menu can go here */}
        </header>

        <main className="flex-1 overflow-x-hidden overflow-y-auto p-4 md:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
