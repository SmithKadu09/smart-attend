
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function JoinClassroomPage() {
  const router = useRouter();

  const [user, setUser] = useState(null);
  const [classCode, setClassCode] = useState("");
  const [loadingPage, setLoadingPage] = useState(true);
  const [joining, setJoining] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    try {
      const token = sessionStorage.getItem("smartattend_token");
      const storedUser = sessionStorage.getItem("smartattend_user");

      if (!token || !storedUser) {
        router.replace("/login");
        return;
      }

      const parsedUser = JSON.parse(storedUser);

      if (parsedUser.role !== "student") {
        router.replace("/teacher/dashboard");
        return;
      }

      setUser(parsedUser);
      setLoadingPage(false);
    } catch {
      sessionStorage.removeItem("smartattend_token");
      sessionStorage.removeItem("smartattend_user");
      router.replace("/login");
    }
  }, [router]);

  async function handleJoin(event) {
    event.preventDefault();
    setError("");
    setSuccess("");

    const normalizedCode = classCode.trim().toUpperCase();

    if (!normalizedCode) {
      setError("Please enter a classroom code.");
      return;
    }

    const token = sessionStorage.getItem("smartattend_token");

    if (!token) {
      router.replace("/login");
      return;
    }

    setJoining(true);

    try {
      const response = await fetch("http://127.0.0.1:8000/classrooms/join", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          class_code: normalizedCode,
        }),
      });

      const result = await response.json().catch(() => ({}));

      if (!response.ok) {
        const message =
          typeof result.detail === "string"
            ? result.detail
            : "Unable to join this classroom. Please check the code and try again.";

        throw new Error(message);
      }

      setSuccess("You've successfully joined the classroom!");
      setClassCode("");
    } catch (err) {
      setError(
        err.message ||
          "Unable to connect to SmartAttend. Please check your connection."
      );
    } finally {
      setJoining(false);
    }
  }

  if (loadingPage || !user) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#FFF8ED]">
        <div className="h-9 w-9 animate-spin rounded-full border-4 border-[#DCE8DC] border-t-[#347451]" />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#FFF8ED] text-[#25392F]">
      {/* Header */}
      <header className="border-b border-[#E8E1D6] bg-[#FFF8ED]">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-4 sm:px-8">
          <Link href="/student/dashboard" className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#CDEED4] text-[#347451] shadow-[3px_3px_0px_#B2DCC0]">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                className="h-6 w-6"
                aria-hidden="true"
              >
                <path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v16H6.5A2.5 2.5 0 0 0 4 21V5.5Z" />
                <path d="M4 17.5A2.5 2.5 0 0 1 6.5 15H20" />
              </svg>
            </div>

            <div>
              <p className="text-lg font-extrabold tracking-tight">
                SmartAttend
              </p>
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#69786E]">
                Student portal
              </p>
            </div>
          </Link>

          <Link
            href="/student/dashboard"
            className="rounded-xl border border-[#E8E1D6] bg-white px-4 py-2.5 text-sm font-semibold text-[#52645A] transition hover:bg-[#F5EDE1]"
          >
            Back to dashboard
          </Link>
        </div>
      </header>

      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-10 px-5 py-10 sm:px-8 lg:grid-cols-2 lg:items-center lg:gap-16 lg:py-16">
        {/* Left content */}
        <section>
          <span className="inline-flex rounded-full border border-[#C1DCC7] bg-[#E5F4E8] px-3 py-1.5 text-[11px] font-bold tracking-[0.12em] text-[#347451]">
            CLASSROOM ENROLLMENT
          </span>

          <h1 className="mt-5 max-w-xl text-4xl font-extrabold leading-tight tracking-tight sm:text-5xl">
            Your next class starts here.
          </h1>

          <p className="mt-5 max-w-lg text-base leading-7 text-[#69786E]">
            Join your teacher's classroom with a unique class code. Once
            enrolled, you can access your classroom and keep track of your
            attendance.
          </p>

          <div className="mt-9 space-y-5">
            <InfoRow
              number="01"
              title="Get your class code"
              description="Ask your teacher for the classroom code."
              bg="bg-[#CDEED4]"
              color="text-[#347451]"
            />

            <InfoRow
              number="02"
              title="Enter the code"
              description="Type the code below to find your classroom."
              bg="bg-[#E5D8FB]"
              color="text-[#7550A5]"
            />

            <InfoRow
              number="03"
              title="Join and get started"
              description="Your enrollment will be linked to your student account."
              bg="bg-[#FFDDCB]"
              color="text-[#A94F36]"
            />
          </div>
        </section>

        {/* Join form */}
        <section className="rounded-[28px] border border-[#E8E1D6] bg-white p-6 shadow-[5px_6px_0px_#EDE5D9] sm:p-9">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#CDEED4] text-[#347451]">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              className="h-7 w-7"
              aria-hidden="true"
            >
              <path d="M12 5v14M5 12h14" />
              <rect x="3" y="3" width="18" height="18" rx="4" />
            </svg>
          </div>

          <h2 className="mt-6 text-2xl font-extrabold">
            Join a classroom
          </h2>

          <p className="mt-2 text-sm leading-6 text-[#69786E]">
            Enter the code provided by your teacher to enroll.
          </p>

          <form onSubmit={handleJoin} className="mt-8 space-y-5">
            <div>
              <label
                htmlFor="classCode"
                className="mb-2 block text-sm font-bold text-[#34473A]"
              >
                Classroom code
              </label>

              <input
                id="classCode"
                type="text"
                value={classCode}
                onChange={(event) => {
                  setClassCode(
                    event.target.value
                      .toUpperCase()
                      .replace(/\s/g, "")
                      .slice(0, 8)
                  );
                  setError("");
                  setSuccess("");
                }}
                placeholder="e.g. 2TPQR9QH"
                autoComplete="off"
                maxLength={8}
                required
                disabled={joining}
                className="w-full rounded-xl border border-[#DED8CD] bg-[#FFFCF7] px-4 py-4 text-base font-bold uppercase tracking-[0.15em] text-[#25392F] outline-none transition placeholder:font-medium placeholder:tracking-normal placeholder:text-[#A5A69D] focus:border-[#347451] focus:ring-4 focus:ring-[#CDEED4]/60 disabled:opacity-60"
              />

              <p className="mt-2 text-xs text-[#8A9189]">
                Classroom codes contain up to 8 letters or numbers.
              </p>
            </div>

            {error && (
              <div
                role="alert"
                className="rounded-xl border border-[#E9BDB5] bg-[#FFF0EC] px-4 py-3 text-sm font-medium text-[#A33F32]"
              >
                {error}
              </div>
            )}

            {success && (
              <div
                role="status"
                className="rounded-xl border border-[#B8DCC1] bg-[#EDF8EF] px-4 py-3 text-sm font-medium text-[#347451]"
              >
                {success}
                <Link
                  href="/student/classrooms"
                  className="mt-2 block font-bold underline underline-offset-4"
                >
                  View my classrooms
                </Link>
              </div>
            )}

            <button
              type="submit"
              disabled={joining || !classCode.trim()}
              className="flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#347451] px-5 py-3 text-sm font-bold text-white shadow-[0_4px_0px_#24563B] transition hover:-translate-y-0.5 hover:bg-[#2D6547] active:translate-y-0.5 active:shadow-none disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
            >
              {joining ? (
                <>
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                  Joining classroom...
                </>
              ) : (
                "Join classroom"
              )}
            </button>
          </form>

          <div className="mt-6 rounded-xl bg-[#F8F5EF] p-4">
            <p className="text-sm font-bold text-[#34473A]">
              Need a classroom code?
            </p>
            <p className="mt-1 text-xs leading-5 text-[#69786E]">
              Contact your teacher and ask them to share the classroom code
              with you.
            </p>
          </div>
        </section>
      </div>

      <footer className="border-t border-[#E8E1D6] px-5 py-6 text-center text-xs text-[#8A9189]">
        SmartAttend · Classroom attendance management
      </footer>
    </main>
  );
}

function InfoRow({ number, title, description, bg, color }) {
  return (
    <div className="flex items-start gap-4">
      <div
        className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${bg} ${color} text-sm font-extrabold`}
      >
        {number}
      </div>

      <div className="pt-0.5">
        <h3 className="text-sm font-bold">{title}</h3>
        <p className="mt-1 text-sm leading-6 text-[#69786E]">
          {description}
        </p>
      </div>
    </div>
  );
}
