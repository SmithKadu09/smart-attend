
"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

const API_URL = "http://127.0.0.1:8000";

export default function CreateClassroomPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [subject, setSubject] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [createdClassroom, setCreatedClassroom] = useState(null);

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");

    const token = sessionStorage.getItem("smartattend_token");
    const storedUser = sessionStorage.getItem("smartattend_user");

    if (!token) {
      router.replace("/login");
      return;
    }

    try {
      const user = JSON.parse(storedUser || "{}");

      if (user.role !== "teacher") {
        router.replace(
          user.role === "student" ? "/student/dashboard" : "/login"
        );
        return;
      }
    } catch {
      router.replace("/login");
      return;
    }

    if (!name.trim() || !subject.trim()) {
      setError("Please enter both the classroom name and subject.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/classrooms`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: name.trim(),
          subject: subject.trim(),
        }),
      });

      const data = await response.json().catch(() => ({}));

      if (response.status === 401 || response.status === 403) {
        setError("Your session may have expired. Please sign in again.");
        return;
      }

      if (!response.ok) {
        throw new Error(
          data.detail || "Unable to create the classroom. Please try again."
        );
      }

      setCreatedClassroom(data);
    } catch (err) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function copyClassCode() {
    const code = createdClassroom?.class_code;

    if (!code) return;

    try {
      await navigator.clipboard.writeText(code);
    } catch {
      setError("Unable to copy the code. You can select and copy it manually.");
    }
  }

  return (
    <main className="min-h-screen bg-[#FFF8ED] px-4 py-6 text-[#3D3548] sm:px-7 lg:px-10">
      <div className="mx-auto max-w-6xl">
        <header className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <Link href="/teacher/dashboard" className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl border-2 border-white bg-[#CDEED4] text-xl font-black text-[#347451] shadow-[0_5px_0_#A6D4B1]">
              S
            </div>
            <div>
              <h2 className="text-xl font-black tracking-tight">
                SmartAttend
              </h2>
              <p className="text-xs font-semibold text-[#8C8194]">
                TEACHER WORKSPACE
              </p>
            </div>
          </Link>

          <Link
            href="/teacher/dashboard"
            className="rounded-xl border-2 border-[#EADFD1] bg-white px-4 py-2.5 text-sm font-bold shadow-[0_3px_0_#EADFD1] transition hover:-translate-y-0.5"
          >
            ← Back to dashboard
          </Link>
        </header>

        <section className="relative mb-9 overflow-hidden rounded-[30px] border-2 border-white bg-[#E5D8FB] p-6 shadow-[0_8px_0_#D0BFEF] sm:p-9 lg:p-10">
          <div className="pointer-events-none absolute -right-8 -top-12 h-48 w-48 rounded-full border-[24px] border-white/40" />

          <div className="relative z-10 max-w-2xl">
            <span className="inline-flex rounded-full border-2 border-white/80 bg-white/65 px-3 py-1.5 text-xs font-black tracking-wide text-[#7550A5]">
              CLASSROOM SETUP
            </span>
            <h1 className="mt-4 text-3xl font-black leading-tight tracking-tight text-[#63418D] sm:text-4xl lg:text-5xl">
              Create a classroom.
            </h1>
            <p className="mt-3 max-w-lg text-sm font-medium leading-6 text-[#8065A0] sm:text-base">
              Set up a space for your students. Once it’s created, share its
              classroom code so students can join.
            </p>
          </div>
        </section>

        <div className="grid gap-7 lg:grid-cols-[1.2fr_0.8fr]">
          <section className="rounded-[28px] border-2 border-white bg-[#FFFEFA] p-5 shadow-[0_7px_0_#EEE3D5] sm:p-8">
            <p className="text-xs font-black uppercase tracking-[0.16em] text-[#A18EA6]">
              CLASS DETAILS
            </p>
            <h2 className="mt-2 text-2xl font-black tracking-tight">
              Your new classroom
            </h2>
            <p className="mt-2 text-sm font-medium leading-6 text-[#95889A]">
              Add a clear classroom name and the subject you teach.
            </p>

            <form onSubmit={handleSubmit} className="mt-7 space-y-5">
              <div>
                <label
                  htmlFor="classroom-name"
                  className="mb-2 block text-sm font-black text-[#63556D]"
                >
                  Classroom name
                </label>
                <input
                  id="classroom-name"
                  type="text"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  placeholder="e.g. Computer Science - Year 2"
                  maxLength={100}
                  required
                  className="w-full rounded-2xl border-2 border-[#EDE3D7] bg-[#FFF9F0] px-4 py-3.5 text-sm font-semibold outline-none transition placeholder:text-[#B5A8B8] focus:border-[#C8B3EE] focus:bg-white"
                />
              </div>

              <div>
                <label
                  htmlFor="classroom-subject"
                  className="mb-2 block text-sm font-black text-[#63556D]"
                >
                  Subject
                </label>
                <input
                  id="classroom-subject"
                  type="text"
                  value={subject}
                  onChange={(event) => setSubject(event.target.value)}
                  placeholder="e.g. Data Structures"
                  maxLength={100}
                  required
                  className="w-full rounded-2xl border-2 border-[#EDE3D7] bg-[#FFF9F0] px-4 py-3.5 text-sm font-semibold outline-none transition placeholder:text-[#B5A8B8] focus:border-[#C8B3EE] focus:bg-white"
                />
              </div>

              {error && (
                <div
                  role="alert"
                  className="rounded-2xl border-2 border-[#F3C9C8] bg-[#FFF0EE] p-4 text-sm font-semibold text-[#A44936]"
                >
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading || Boolean(createdClassroom)}
                className="w-full rounded-2xl border-2 border-white bg-[#CDEED4] px-5 py-3.5 font-black text-[#347451] shadow-[0_5px_0_#A6D4B1] transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading
                  ? "Creating classroom..."
                  : createdClassroom
                    ? "Classroom created"
                    : "Create classroom →"}
              </button>
            </form>
          </section>

          <aside className="space-y-5">
            <section className="rounded-[28px] border-2 border-white bg-[#FFE5A9] p-6 shadow-[0_7px_0_#EED18B]">
              <p className="text-xs font-black uppercase tracking-[0.16em] text-[#9B762D]">
                HOW IT WORKS
              </p>
              <h2 className="mt-2 text-xl font-black text-[#8D641C]">
                Three simple steps
              </h2>

              <ol className="mt-5 space-y-4">
                {[
                  ["01", "Name your class", "Choose a name and subject."],
                  ["02", "Create it", "SmartAttend sets up your classroom."],
                  ["03", "Share the code", "Students use it to join."],
                ].map(([number, title, description]) => (
                  <li key={number} className="flex gap-3">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border-2 border-white bg-white/70 text-sm font-black text-[#8D641C]">
                      {number}
                    </span>
                    <div>
                      <h3 className="font-black text-[#765719]">{title}</h3>
                      <p className="mt-1 text-sm font-medium leading-5 text-[#9B762D]">
                        {description}
                      </p>
                    </div>
                  </li>
                ))}
              </ol>
            </section>

            {createdClassroom ? (
              <section
                aria-live="polite"
                className="rounded-[28px] border-2 border-white bg-[#CDEED4] p-6 shadow-[0_7px_0_#A6D4B1]"
              >
                <p className="text-xs font-black uppercase tracking-[0.16em] text-[#347451]">
                  CLASSROOM CREATED
                </p>
                <h2 className="mt-2 break-words text-xl font-black text-[#285B40]">
                  {createdClassroom.name || name}
                </h2>
                <p className="mt-1 text-sm font-semibold text-[#477B5C]">
                  {createdClassroom.subject || subject}
                </p>

                <div className="mt-5 rounded-2xl border-2 border-white bg-white/65 p-4">
                  <p className="text-xs font-black uppercase tracking-wider text-[#477B5C]">
                    Your classroom code
                  </p>
                  <p className="mt-2 break-all font-mono text-2xl font-black tracking-[0.12em] text-[#285B40]">
                    {createdClassroom.class_code || "Not returned by server"}
                  </p>
                  {createdClassroom.class_code && (
                    <button
                      type="button"
                      onClick={copyClassCode}
                      className="mt-3 rounded-xl border-2 border-white bg-white px-4 py-2.5 text-sm font-black text-[#347451] transition hover:-translate-y-0.5"
                    >
                      Copy classroom code
                    </button>
                  )}
                </div>

                <Link
                  href="/teacher/dashboard"
                  className="mt-5 inline-flex rounded-xl border-2 border-white bg-white/70 px-4 py-3 text-sm font-black text-[#347451] transition hover:-translate-y-0.5"
                >
                  Return to dashboard →
                </Link>
              </section>
            ) : (
              <section className="rounded-[28px] border-2 border-white bg-[#C9EEE8] p-6 shadow-[0_7px_0_#A6D9CF]">
                <p className="text-xs font-black uppercase tracking-[0.16em] text-[#28756D]">
                  A QUICK TIP
                </p>
                <h2 className="mt-2 text-xl font-black text-[#225F59]">
                  Keep your code handy
                </h2>
                <p className="mt-2 text-sm font-medium leading-6 text-[#3C827A]">
                  After creation, share the generated code with your students.
                  Only share it with the intended class.
                </p>
              </section>
            )}
          </aside>
        </div>

        <footer className="flex flex-col justify-between gap-2 px-1 py-7 text-xs font-semibold text-[#A092A1] sm:flex-row">
          <p>SmartAttend · Make every class count.</p>
          <Link
            href="/teacher/dashboard"
            className="text-[#7550A5] hover:underline"
          >
            ← Back to teacher dashboard
          </Link>
        </footer>
      </div>
    </main>
  );
}
