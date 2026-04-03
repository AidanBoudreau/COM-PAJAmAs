"use client";

import "./auth.css";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  async function signInWithEmail() {
    setIsSubmitting(true);
    setErrorMessage("");

    const response = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    if (response?.error) {
      setErrorMessage("Invalid email or password.");
      setIsSubmitting(false);
      return;
    }

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
          </div>
        </div>
        <button className="submitButton" onClick={signInWithEmail} disabled={isSubmitting}>
          Log In
        </button>
        {errorMessage && <p>{errorMessage}</p>}
      </div>
    </>
  );
}
