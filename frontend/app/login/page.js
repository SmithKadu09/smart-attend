
"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Button,
  Badge,
  Input,
} from "@/components/ui";

export default function LoginPage() {
  const router = useRouter();

  const [role, setRole] = useState("student");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  
async function handleSubmit(event) {
  event.preventDefault();
  setError("");

  if (!email.trim() || !password) {
    setError("Please enter your email and password.");
    return;
  }

  try {
    const response = await fetch("http://127.0.0.1:8000/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: email.trim(),
        password,
      }),
    });

    const result = await response.json().catch(() => ({}));

    if (!response.ok) {
      const detail = result.detail;

      if (Array.isArray(detail)) {
        throw new Error(detail.map((item) => item.msg).join(" "));
      }

      throw new Error(
        typeof detail === "string"
          ? detail
          : "Login failed. Please check your credentials."
      );
    }

    if (!result.access_token || !result.user) {
      throw new Error("The server returned an unexpected login response.");
    }

    if (result.user.role !== role) {
      throw new Error(
        `This account belongs to the ${result.user.role} role. Please select the correct role.`
      );
    }

    // Temporary storage for local development.
    // We'll improve session handling as the app develops.
    sessionStorage.setItem("smartattend_token", result.access_token);
    sessionStorage.setItem(
      "smartattend_user",
      JSON.stringify(result.user)
    );

    router.push(
      role === "teacher" ? "/teacher/dashboard" : "/student/dashboard"
    );
  } catch (error) {
    if (error instanceof TypeError) {
      setError(
        "Could not connect to the server. Make sure the backend is running."
      );
    } else {
      setError(error.message || "Something went wrong. Please try again.");
    }
  }
}


  return (
    <main className="min-h-screen bg-[#fff8ed] px-4 py-5 sm:px-7 lg:px-10">
      <header className="mx-auto flex max-w-7xl items-center justify-between">
        <Link href="/" className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#cdeed4] text-2xl shadow-[4px_4px_0_#a7d9b2]">
            🌱
          </div>
          <div>
            <p className="text-xl font-black tracking-tight text-[#293a32]">
              SmartAttend
            </p>
            <p className="text-xs font-bold text-[#718078]">
              Attendance, made smarter
            </p>
          </div>
        </Link>

        <Link
          href="/"
          className="rounded-full px-4 py-2 text-sm font-bold text-[#347451] hover:bg-[#e5f4e7]"
        >
          ← Back home
        </Link>
      </header>

      <section className="mx-auto grid max-w-7xl items-stretch gap-8 py-8 lg:grid-cols-[1.05fr_0.95fr] lg:py-12">
        {/* Welcome panel */}
        <div className="relative flex min-h-[360px] flex-col justify-between overflow-hidden rounded-[32px] border-2 border-white/70 bg-[#cdeed4] p-7 shadow-[8px_9px_0_rgba(52,116,81,0.12)] sm:p-10 lg:min-h-[650px]">
          <div className="pointer-events-none absolute -right-12 -top-12 h-48 w-48 rounded-full border-[24px] border-white/30" />
          <div className="pointer-events-none absolute -bottom-16 -left-12 h-48 w-48 rounded-full bg-[#ffe5a9]/70" />

          <div className="relative z-10">
            <Badge variant="green">YOUR CLASSROOM, CONNECTED</Badge>

            <h1 className="mt-7 max-w-lg text-4xl font-black leading-[1.08] tracking-tight text-[#234d35] sm:text-5xl">
              Good to see
              <br />
              you <span className="text-[#a94f36]">again!</span>
            </h1>

            <p className="mt-5 max-w-md text-base leading-7 text-[#456b53] sm:text-lg">
              Sign in to make every class count. Your attendance,
              classrooms, and learning community are waiting for you.
            </p>
          </div>

          <div className="relative z-10 mt-8 flex items-end justify-between gap-4">
            <div className="max-w-[230px] rounded-[24px] border-2 border-white/80 bg-[#fff8ed] p-5 shadow-[5px_5px_0_rgba(52,116,81,0.12)]">
              <span className="text-3xl" aria-hidden="true">✦</span>
              <p className="mt-2 text-lg font-black text-[#293a32]">
                Every class counts.
              </p>
              <p className="mt-1 text-sm leading-5 text-[#718078]">
                Less paperwork. More learning.
              </p>
            </div>

            <div className="hidden h-40 w-36 rotate-3 items-center justify-center rounded-[30px] border-2 border-white bg-[#e5d8fb] text-7xl shadow-[6px_7px_0_rgba(117,80,165,0.15)] sm:flex">
              🪴
            </div>
          </div>
        </div>

        {/* Login form */}
        <div className="flex items-center justify-center rounded-[32px] border-2 border-white bg-white/70 p-5 shadow-[7px_8px_0_rgba(41,58,50,0.06)] sm:p-9 lg:p-12">
          <div className="w-full max-w-md">
            <Badge variant="lavender">WELCOME BACK</Badge>

            <h2 className="mt-5 text-3xl font-black tracking-tight text-[#293a32] sm:text-4xl">
              Sign in
            </h2>

            <p className="mt-3 leading-6 text-[#718078]">
              Choose your account type and enter your details.
            </p>

            <form onSubmit={handleSubmit} className="mt-8 space-y-6">
              <fieldset>
                <legend className="mb-3 text-sm font-bold text-[#293a32]">
                  I&apos;m signing in as
                </legend>

                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setRole("student")}
                    aria-pressed={role === "student"}
                    className={`rounded-2xl border-2 p-4 text-left transition ${
                      role === "student"
                        ? "border-[#347451] bg-[#e4f5e7] shadow-[3px_3px_0_#b5dfbf]"
                        : "border-[#e9e6dc] bg-white hover:bg-[#fff8ed]"
                    }`}
                  >
                    <span className="text-2xl" aria-hidden="true">🎒</span>
                    <span className="mt-2 block font-black text-[#293a32]">
                      Student
                    </span>
                    <span className="mt-1 block text-xs text-[#718078]">
                      My attendance
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setRole("teacher")}
                    aria-pressed={role === "teacher"}
                    className={`rounded-2xl border-2 p-4 text-left transition ${
                      role === "teacher"
                        ? "border-[#7550a5] bg-[#f0e9fc] shadow-[3px_3px_0_#d4c3f0]"
                        : "border-[#e9e6dc] bg-white hover:bg-[#fff8ed]"
                    }`}
                  >
                    <span className="text-2xl" aria-hidden="true">🧑‍🏫</span>
                    <span className="mt-2 block font-black text-[#293a32]">
                      Teacher
                    </span>
                    <span className="mt-1 block text-xs text-[#718078]">
                      Manage classes
                    </span>
                  </button>
                </div>
              </fieldset>

              <Input
                label="Email address"
                id="login-email"
                name="email"
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
              />

              <div className="space-y-2">
                <Input
                  label="Password"
                  id="login-password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  required
                />

                <div className="flex justify-between gap-3">
                  <button
                    type="button"
                    onClick={() => setShowPassword((current) => !current)}
                    className="text-sm font-bold text-[#347451] hover:underline"
                  >
                    {showPassword ? "Hide password" : "Show password"}
                  </button>

                  <Link
                    href="/forgot-password"
                    className="text-sm font-bold text-[#7550a5] hover:underline"
                  >
                    Forgot password?
                  </Link>
                </div>
              </div>

              {error && (
                <p
                  role="alert"
                  className="rounded-2xl border border-[#e9b7a6] bg-[#fff0e9] p-3 text-sm font-semibold leading-6 text-[#a94f36]"
                >
                  {error}
                </p>
              )}

              <Button type="submit" className="w-full justify-center" size="lg">
                Sign in as {role === "student" ? "Student" : "Teacher"} →
              </Button>
            </form>

            <p className="mt-7 text-center text-sm text-[#718078]">
              New to SmartAttend?{" "}
              <Link
                href={`/register?role=${role}`}
                className="font-black text-[#347451] hover:underline"
              >
                Create an account
              </Link>
            </p>

            <p className="mt-6 text-center text-xs leading-5 text-[#8a948e]">
              Your account gives you access to the classrooms and tools
              assigned to your role.
            </p>
          </div>
        </div>
      </section>

      <footer className="mx-auto max-w-7xl pb-4 text-center text-xs text-[#8a948e]">
        Made for better classrooms · SmartAttend
      </footer>
    </main>
  );
}
