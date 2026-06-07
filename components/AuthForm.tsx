"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

export default function AuthForm() {
  const router = useRouter();
  const [securityKey, setSecurityKey] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ securityKey }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Something went wrong");
        return;
      }

      router.push("/dashboard");
    } catch {
      setError("Connection failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="mb-1 block text-sm text-slate-400">Security Key</label>
        <input
          type="password"
          value={securityKey}
          onChange={(e) => setSecurityKey(e.target.value)}
          className="input-field"
          placeholder="Enter your secret key"
          required
        />
      </div>

      {error && (
        <p className="rounded-lg bg-red-950 px-3 py-2 text-sm text-red-400">
          {error}
        </p>
      )}

      <button type="submit" disabled={loading} className="btn-primary w-full">
        {loading ? "Please wait..." : "Sign In"}
      </button>
    </form>
  );
}
