"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import Button from "@/components/ui/Button";
import Field from "@/components/ui/Field";
import PasswordField from "@/components/ui/PasswordField";
import { signIn } from "@/lib/session";
import AuthLayout from "@/components/auth/AuthLayout";

export default function RegisterPage() {
  const router = useRouter();
  const [v, setV] = useState({ name: "", identity: "", ward: "", password: "", confirm: "" });
  const [errors, setErrors] = useState({});
  const set = (k) => (e) => setV((s) => ({ ...s, [k]: e.target.value }));

  function onSubmit(e) {
    e.preventDefault();
    const n = {};
    if (!v.name.trim()) n.name = "Enter your full name.";
    if (!v.identity.trim()) n.identity = "Enter an email or mobile number.";
    if (!/^\d+$/.test(v.ward) || Number(v.ward) < 1) n.ward = "Enter your ward number, for example 4.";
    if (v.password.length < 8) n.password = "Use at least 8 characters.";
    if (v.confirm !== v.password) n.confirm = "Passwords do not match.";
    setErrors(n);
    if (Object.keys(n).length) return;
    signIn({ role: "citizen", name: v.name.trim(), identity: v.identity.trim(), ward: Number(v.ward) }, true);
    router.push("/citizen");
  }

  return (
    <AuthLayout>
      <form onSubmit={onSubmit} noValidate className="flex flex-col gap-5">
        <h1 className="text-[30px] font-bold leading-tight text-ink">Create a citizen account</h1>
        <p className="text-sm text-ink-3">
          Your contact details stay private. Only your comments appear on projects.
        </p>
        <Field label="Full name" autoComplete="name" value={v.name} onChange={set("name")} error={errors.name} />
        <Field label="Email or mobile number" autoComplete="username" value={v.identity} onChange={set("identity")} error={errors.identity} />
        <Field label="Ward number" inputMode="numeric" value={v.ward} onChange={set("ward")} error={errors.ward} hint="You can find this on your municipal tax receipt." />
        <PasswordField label="Password" autoComplete="new-password" value={v.password} onChange={set("password")} error={errors.password} />
        <PasswordField label="Confirm password" autoComplete="new-password" value={v.confirm} onChange={set("confirm")} error={errors.confirm} />
        <Button type="submit" className="w-full">Create account</Button>
        <p className="text-center text-[13px] text-ink-2">
          Already registered?{" "}
          <Link href="/login" className="font-medium text-brand hover:underline">Sign in</Link>
        </p>
      </form>
    </AuthLayout>
  );
}