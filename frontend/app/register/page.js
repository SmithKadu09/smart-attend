
"use client";

import { useState , Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Button, Badge, Input } from "@/components/ui";
import API_URL from "@/lib/api";



function RegisterForm()  {
    const searchParams = useSearchParams();
    const initialRole = searchParams.get("role") === "teacher" ? "teacher" : "student";

    const [role, setRole] = useState(initialRole);
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [studentNumber, setStudentNumber] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [consent, setConsent] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const [isSubmitting, setIsSubmitting] = useState(false);


    async function handleSubmit(event) {
        event.preventDefault();
        setError("");
        setSuccess("");

        if (!name.trim() || !email.trim() || !password || !confirmPassword) {
            setError("Please complete all required fields.");
            return;
        }

        if (role === "student" && !studentNumber.trim()) {
            setError("Please enter your college student ID.");
            return;
        }

        if (password.length < 8) {
            setError("Your password must contain at least 8 characters.");
            return;
        }

        if (password !== confirmPassword) {
            setError("Your passwords do not match.");
            return;
        }

        if (role === "student" && !consent) {
            setError("Please acknowledge the biometric registration information.");
            return;
        }

        setIsSubmitting(true);

        try {
            const response = awaitfetch(`${API_URL}/auth/register`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    name: name.trim(),
                    email: email.trim(),
                    password,
                    role,
                    ...(role === "student"
                        ? { student_number: studentNumber.trim() }
                        : {}),
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
                        : "Registration failed. Please try again."
                );
            }

            setSuccess(
                `Account created successfully for ${result.name || name.trim()}! You can now sign in.`
            );
        } catch (error) {
            if (error instanceof TypeError) {
                setError(
                    "Could not connect to the SmartAttend server. Make sure the backend is running."
                );
            } else {
                setError(error.message || "Something went wrong. Please try again.");
            }
        } finally {
            setIsSubmitting(false);
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
                    href="/login"
                    className="rounded-full px-4 py-2 text-sm font-bold text-[#347451] hover:bg-[#e5f4e7]"
                >
                    Sign in →
                </Link>
            </header>

            <section className="mx-auto grid max-w-7xl items-start gap-8 py-8 lg:grid-cols-[0.85fr_1.15fr] lg:py-12">
                {/* Welcome panel */}
                <aside className="relative overflow-hidden rounded-[32px] border-2 border-white/70 bg-[#e5d8fb] p-7 shadow-[8px_9px_0_rgba(117,80,165,0.12)] sm:p-10 lg:sticky lg:top-8">
                    <div className="pointer-events-none absolute -right-12 -top-12 h-44 w-44 rounded-full border-[22px] border-white/35" />

                    <Badge variant="lavender">START YOUR SMARTER CLASSROOM</Badge>

                    <h1 className="relative mt-7 text-4xl font-black leading-tight tracking-tight text-[#49356a] sm:text-5xl">
                        Your next
                        <br />
                        chapter starts
                        <br />
                        <span className="text-[#a94f36]">here.</span>
                    </h1>

                    <p className="relative mt-5 max-w-md leading-7 text-[#65527f]">
                        Create your account and bring your classroom activities,
                        attendance records, and learning community together.
                    </p>

                    <div className="relative mt-9 grid gap-3">
                        {[
                            ["01", "Set up your account", "Create your personal login."],
                            ["02", "Join or create a class", "Connect with your classroom."],
                            ["03", "Make attendance simpler", "Spend less time on paperwork."],
                        ].map(([number, title, description]) => (
                            <div
                                key={number}
                                className="flex items-start gap-4 rounded-2xl border border-white/80 bg-white/65 p-4"
                            >
                                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#fff8ed] font-black text-[#7550a5] shadow-[2px_2px_0_rgba(117,80,165,0.12)]">
                                    {number}
                                </span>
                                <div>
                                    <p className="font-black text-[#49356a]">{title}</p>
                                    <p className="mt-1 text-sm leading-5 text-[#76678a]">
                                        {description}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="relative mt-6 rounded-2xl bg-[#ffe5a9] p-4 text-sm font-bold leading-6 text-[#76561c]">
                        ✨ One account, a more organized classroom experience.
                    </div>
                </aside>

                {/* Registration form */}
                <div className="rounded-[32px] border-2 border-white bg-white/75 p-5 shadow-[7px_8px_0_rgba(41,58,50,0.06)] sm:p-9 lg:p-10">
                    <div className="mx-auto max-w-xl">
                        <Badge variant="green">CREATE YOUR ACCOUNT</Badge>

                        <h2 className="mt-5 text-3xl font-black tracking-tight text-[#293a32] sm:text-4xl">
                            Join SmartAttend
                        </h2>

                        <p className="mt-3 leading-6 text-[#718078]">
                            Start with a few details. You can complete your classroom setup later.
                        </p>

                        <form onSubmit={handleSubmit} className="mt-8 space-y-5">
                            <fieldset>
                                <legend className="mb-3 text-sm font-bold text-[#293a32]">
                                    Choose your account type
                                </legend>

                                <div className="grid grid-cols-2 gap-3">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setRole("student");
                                            setError("");
                                            setSuccess("");
                                        }}
                                        aria-pressed={role === "student"}
                                        className={`rounded-2xl border-2 p-4 text-left transition ${role === "student"
                                                ? "border-[#347451] bg-[#e4f5e7] shadow-[3px_3px_0_#b5dfbf]"
                                                : "border-[#e9e6dc] bg-white hover:bg-[#fff8ed]"
                                            }`}
                                    >
                                        <span className="text-2xl" aria-hidden="true">🎒</span>
                                        <span className="mt-2 block font-black text-[#293a32]">
                                            Student
                                        </span>
                                        <span className="mt-1 block text-xs text-[#718078]">
                                            Attend classes
                                        </span>
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() => {
                                            setRole("teacher");
                                            setError("");
                                            setSuccess("");
                                        }}
                                        aria-pressed={role === "teacher"}
                                        className={`rounded-2xl border-2 p-4 text-left transition ${role === "teacher"
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
                                label="Full name"
                                id="register-name"
                                name="name"
                                type="text"
                                autoComplete="name"
                                placeholder="Enter your full name"
                                value={name}
                                onChange={(event) => setName(event.target.value)}
                                required
                            />

                            <Input
                                label="Email address"
                                id="register-email"
                                name="email"
                                type="email"
                                autoComplete="email"
                                placeholder="you@example.com"
                                value={email}
                                onChange={(event) => setEmail(event.target.value)}
                                required
                            />

                            {role === "student" && (
                                <Input
                                    label="Student number"
                                    id="register-student-number"
                                    name="student_number"
                                    type="text"
                                    placeholder="Enter your college student ID"
                                    value={studentNumber}
                                    onChange={(event) => setStudentNumber(event.target.value)}
                                    required
                                />
                            )}

                            <div className="space-y-2">
                                <Input
                                    label="Password"
                                    id="register-password"
                                    name="password"
                                    type={showPassword ? "text" : "password"}
                                    autoComplete="new-password"
                                    placeholder="At least 8 characters"
                                    value={password}
                                    onChange={(event) => setPassword(event.target.value)}
                                    minLength={8}
                                    required
                                />

                                <button
                                    type="button"
                                    onClick={() => setShowPassword((current) => !current)}
                                    className="text-sm font-bold text-[#347451] hover:underline"
                                >
                                    {showPassword ? "Hide password" : "Show password"}
                                </button>
                            </div>

                            <Input
                                label="Confirm password"
                                id="register-confirm-password"
                                name="confirm_password"
                                type={showPassword ? "text" : "password"}
                                autoComplete="new-password"
                                placeholder="Enter your password again"
                                value={confirmPassword}
                                onChange={(event) => setConfirmPassword(event.target.value)}
                                required
                            />

                            {role === "student" && (
                                <label className="flex items-start gap-3 rounded-2xl border border-[#d8e9dc] bg-[#f0f8f0] p-4 text-sm leading-6 text-[#456b53]">
                                    <input
                                        type="checkbox"
                                        checked={consent}
                                        onChange={(event) => setConsent(event.target.checked)}
                                        className="mt-1 h-4 w-4 accent-[#347451]"
                                    />
                                    <span>
                                        I understand that face registration is a separate step
                                        and requires clear information and consent before my
                                        biometric data is collected.
                                    </span>
                                </label>
                            )}

                            {error && (
                                <p
                                    role="alert"
                                    className="rounded-2xl border border-[#e9b7a6] bg-[#fff0e9] p-3 text-sm font-semibold leading-6 text-[#a94f36]"
                                >
                                    {error}
                                </p>
                            )}

                            {success && (
                                <p
                                    role="status"
                                    className="rounded-2xl border border-[#b5dfbf] bg-[#e4f5e7] p-3 text-sm font-semibold leading-6 text-[#347451]"
                                >
                                    {success}
                                </p>
                            )}


                            <Button
                                type="submit"
                                size="lg"
                                className="w-full justify-center"
                                disabled={isSubmitting}
                            >
                                {isSubmitting
                                    ? "Creating account..."
                                    : `Create ${role === "student" ? "Student" : "Teacher"} Account →`}
                            </Button>

                        </form>

                        <p className="mt-7 text-center text-sm text-[#718078]">
                            Already have an account?{" "}
                            <Link
                                href="/login"
                                className="font-black text-[#347451] hover:underline"
                            >
                                Sign in
                            </Link>
                        </p>

                        <p className="mt-5 text-center text-xs leading-5 text-[#8a948e]">
                            Your account details will be sent securely once API integration
                            is enabled. This page does not create an account yet.
                        </p>
                    </div>
                </div>
            </section>
        </main>
    );
}

export default function RegisterPage() {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-screen items-center justify-center bg-[#fff8ed]">
          <p className="font-bold text-[#347451]">
            Loading registration form...
          </p>
        </main>
      }
    >
      <RegisterForm />
    </Suspense>
  );
}
