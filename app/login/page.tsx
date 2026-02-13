"use client";

import "./auth.css";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function Login() {
    const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  async function signInWithEmail() {
    router.push("/dashboard");
  }

  return (
    <>
      <div id="authContainer">
        <h1>Gaineville Community Outreach</h1>
        <div className="inputs">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          ></input>
          <div>
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            ></input>
            <Link href="/reset-password" className="forgot-pass">
              Forgot password
            </Link>
          </div>
        </div>
        <button className="submitButton" onClick={signInWithEmail}>
          Log In
        </button>
        <h3>
          First time? 
          <Link href="/signup" className="signup-link">
            <>Sign up!</>
          </Link>
        </h3>
      </div>
    </>
  );
}
