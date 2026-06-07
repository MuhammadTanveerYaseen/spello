"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AppLogo from "@/components/AppLogo";

interface Profile {
  ownerName: string;
  cafeName: string;
  email: string;
  phone: string;
  address: string;
}

export default function ProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState<Profile>({
    ownerName: "",
    cafeName: "Spello Cafe",
    email: "",
    phone: "",
    address: "",
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch("/api/profile")
      .then((r) => r.json())
      .then(setProfile);
  }, []);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    setSaved(false);

    await fetch("/api/profile", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(profile),
    });

    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.replace("/");
  }

  return (
    <div className="space-y-5">
      <div className="page-header text-center">
        <div className="mx-auto mb-3 flex justify-center">
          <AppLogo size="md" showText={false} />
        </div>
        <h1 className="text-xl font-bold">{profile.cafeName}</h1>
        <p className="text-sm text-slate-400">{profile.ownerName || "Account"}</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-400">
          Business Details
        </h2>

        <div>
          <label className="mb-1 block text-sm text-slate-400">Your Name</label>
          <input
            value={profile.ownerName}
            onChange={(e) => setProfile({ ...profile, ownerName: e.target.value })}
            className="input-field"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm text-slate-400">Cafe Name</label>
          <input
            value={profile.cafeName}
            onChange={(e) => setProfile({ ...profile, cafeName: e.target.value })}
            className="input-field"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm text-slate-400">Email</label>
          <input
            type="email"
            value={profile.email}
            onChange={(e) => setProfile({ ...profile, email: e.target.value })}
            className="input-field"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm text-slate-400">Phone</label>
          <input
            type="tel"
            value={profile.phone}
            onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
            className="input-field"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm text-slate-400">Address</label>
          <input
            value={profile.address}
            onChange={(e) => setProfile({ ...profile, address: e.target.value })}
            className="input-field"
          />
        </div>

        <button type="submit" disabled={saving} className="btn-primary w-full">
          {saving ? "Saving..." : saved ? "✓ Saved!" : "Save Profile"}
        </button>
      </form>

      <div className="card p-4">
        <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-slate-400">
          Security
        </h3>
        <p className="text-sm text-slate-400">
          Your app is protected by a security key. Log out to lock the app.
        </p>
        <button
          onClick={handleLogout}
          className="btn-danger mt-3 w-full text-sm"
        >
          Log Out & Lock
        </button>
      </div>
    </div>
  );
}
