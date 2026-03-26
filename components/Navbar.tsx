"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { CircleUserRound, LogOut, Moon, Sun } from "lucide-react";
import { useSession, signOut } from "next-auth/react";
import "./Navbar.css";

const Navbar: React.FC = () => {
  const currentPath = usePathname();
  const { data: session } = useSession();
  const [showMenu, setShowMenu] = useState(false);
  const [theme, setTheme] = useState<"light" | "dark">("light");

  useEffect(() => {
    const current = document.documentElement.getAttribute("data-theme");
    if (current === "dark" || current === "light") {
      setTheme(current);
      return;
    }

    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const nextTheme = prefersDark ? "dark" : "light";
    document.documentElement.setAttribute("data-theme", nextTheme);
    setTheme(nextTheme);
  }, []);

  function toggleTheme() {
    const nextTheme = theme === "dark" ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", nextTheme);
    localStorage.setItem("theme", nextTheme);
    setTheme(nextTheme);
  }

  if (currentPath === "/login") return null;

  return (
    <div className="navbar">
      <div className="navbar-logo">
        <Link href="/dashboard">
          <Image
            src="/careledger_logo.PNG"
            alt="CareLedger"
            width={180}
            height={50}
            className="text-logo"
          />
        </Link>
      </div>
      <div className="nav-controls">
        <button
          className="nav-theme-btn"
          onClick={toggleTheme}
          aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
          title={theme === "dark" ? "Light mode" : "Dark mode"}
        >
          {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
        </button>
        <div className="nav-user">
          <button
            className="nav-user-btn"
            onClick={() => setShowMenu(!showMenu)}
          >
            <CircleUserRound size={28} />
          </button>
          {showMenu && (
            <div className="nav-user-menu">
              {session?.user?.email && (
                <div className="nav-user-email">{session.user.email}</div>
              )}
              <button
                className="nav-user-logout"
                onClick={() => signOut({ callbackUrl: "/login" })}
              >
                <LogOut size={16} /> Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Navbar;
