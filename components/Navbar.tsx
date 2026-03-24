"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { CircleUserRound, LogOut } from "lucide-react";
import { useSession, signOut } from "next-auth/react";
import "./Navbar.css";

const Navbar: React.FC = () => {
  const currentPath = usePathname();
  const { data: session } = useSession();
  const [showMenu, setShowMenu] = useState(false);

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
  );
};

export default Navbar;
