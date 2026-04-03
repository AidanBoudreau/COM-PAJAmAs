"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { House, UsersRound, Calendar, FileBarChart } from "lucide-react";
import "./Footer.css";

const Footer: React.FC = () => {
  const currentPath = usePathname();

  if (currentPath === "/login") return null;

  const isActive = (href: string) => currentPath.startsWith(href);

  return (
    <nav className="bottom-nav">
      <ul className="nav-menu">
        <li>
          <Link href="/dashboard" className={`nav-link ${isActive("/dashboard") ? "active" : ""}`}>
            <House size={20} />
            Home
          </Link>
        </li>
        <li>
          <Link href="/clients" className={`nav-link ${isActive("/clients") ? "active" : ""}`}>
            <UsersRound size={20} />
            Clients
          </Link>
        </li>
        <li>
          <Link href="/calendar" className={`nav-link ${isActive("/calendar") ? "active" : ""}`}>
            <Calendar size={20} />
            Calendar
          </Link>
        </li>
        <li>
          <Link href="/reports" className={`nav-link ${isActive("/reports") ? "active" : ""}`}>
            <FileBarChart size={20} />
            Reports
          </Link>
        </li>
      </ul>
    </nav>
  );
};

export default Footer;
