"use client";

import React from "react";

import "./Navbar.css";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { CircleUserRound } from "lucide-react";

const Navbar: React.FC = () => {
    const navigate = useRouter();
    const currentPath = usePathname();
  
    function navToAuthPage() {

    if (currentPath === "/" || currentPath === "/signup") {
      return;
    }

    navigate.push("/");
  }
  const isActive = (href: string) => currentPath === href;

  return (
    <div className="navbar">
      <div className="navbar-logo">
        <Link href="/" aria-label="Boudreau Fragrance Co">
          <Image
            src="/careledger_logo.PNG"
            alt="Boudreau Fragrance Co"
            width={180}
            height={50}
            className="text-logo"
          />
        </Link>
      </div>
      <div className="nav-login-cart">
        <div className="login-button_nav-link" onClick={navToAuthPage}>
          <CircleUserRound size={30} />
        </div>
      </div>
    </div>
  );
};
export default Navbar;
