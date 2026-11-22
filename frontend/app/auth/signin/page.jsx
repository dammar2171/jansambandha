"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Button from "@/components/ui/Button";
import Field from "@/components/ui/Field";



export default function SignInPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();

    const next = {};
    if (!email.trim()) next.email = "Enter your email address.";
    if (!password) next.password = "Enter your password.";
    setErrors(next);
    if (Object.keys(next).length) return;

    setLoading(true);
    // Placeholder: replace with a call to the backend login endpoint.
    // The backend returns the user's role, and the redirect below
    // should go to that role's dashboard.
    router.push("/citizen");
  }

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <section className="flex flex-col justify-between bg-brand-deep p-8 text-white lg:p-16">
        <div className="flex items-center gap-2.5">
          <div className="grid h-7 w-7 place-items-center rounded-md bg-brass font-serif text-base font-semibold text-[#0b2545]">
            J
          </div>
          <div>
            <p className="font-serif text-lg leading-[22px] font-semibold">
              JanSambandha
            </p>
            <p className="text-[11px] leading-3.5 text-side-text">
              Kailali Municipality
            </p>
          </div>
        </div>

        <div className="py-12">
          <h1 className="max-w-[460px] font-serif text-[40px] leading-[48px] font-semibold">
            Report problems. Follow projects. Give feedback.
          </h1>
          <p className="mt-4 max-w-[420px] text-base leading-[26px] text-side-text">
            See what your ward has proposed, what is being built and how it is
            going, and tell the municipality what you think.
          </p>
        </div>

        <span aria-hidden="true" />
      </section>

      <section className="flex items-center justify-center p-8 lg:p-12">
        <form
          onSubmit={handleSubmit}
          noValidate
          className="flex w-full max-w-[380px] flex-col gap-5"
        >
          <div>
            <h2 className="font-serif text-[26px] leading-[34px] font-semibold">
              Sign in
            </h2>
            <p className="mt-1 text-ink-2">
              Use the account registered with your ward or office.
            </p>
          </div>

          <Field
            label="Email"
            id="email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            error={errors.email}
          />
          <Field
            label="Password"
            id="password"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            error={errors.password}
          />

          <Button type="submit" disabled={loading}>
            {loading ? "Signing in" : "Sign in"}
          </Button>

          <p className="text-[13px] text-ink-2">
            New here?{" "}
            <Link
              href="/register"
              className="font-medium text-brand hover:underline"
            >
              Create a citizen account
            </Link>
          </p>
        </form>
      </section>
    </div>
  );
}