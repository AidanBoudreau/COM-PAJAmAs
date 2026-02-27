"use client";

import React from "react";

import "./Footer.css";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { House, UsersRound, CalendarRange, Calendar, Settings } from "lucide-react";

const Footer: React.FC = () => {
    const navigate = useRouter();
    const currentPath = usePathname();
  
    function navToAuthPage() {

    if (currentPath === "/login" || currentPath === "/signup") {
      return;
    }

    navigate.push("/login");
  }
  const isActive = (href: string) => currentPath === href;

  return (
    <nav className="bottom-nav">
      <ul className="nav-menu">
        <li>
          <Link href="/" className="nav-link">
            <House size={20} />
            Home{isActive("/") ? <hr /> : null}
          </Link>
        </li>

        <li>
          <Link href="/clients" className="nav-link">
            <UsersRound size={20} />
            Clients{isActive("/clients") ? <hr /> : null}
          </Link>
        </li>

        <li>
          <Link href="/schedule" className="nav-link">
            <Calendar size={20} />
            Schedule{isActive("/schedule") ? <hr /> : null}
          </Link>
        </li>
        <li>
          <Link href="/settings" className="nav-link">
            <Settings size={20} />
            Settings{isActive("/settings") ? <hr /> : null}
          </Link>
        </li>
      </ul>
    </nav>
  );
};
export default Footer;
