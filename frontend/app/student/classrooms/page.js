
"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

const API_URL = "http://127.0.0.1:8000";

const PALETTES = [
  {
    background: "bg-[#E5D8FB]",
    border: "border-[#D5C2F2]",
    text: "text-[#7550A5]",
    shadow: "shadow-[0_6px_0_#D0BFEF]",
    icon: "bg-white/70",
    label: "CLASS 01",
  },
  {
    background: "bg-[#CDEED4]",
    border: "border-[#B9E2C2]",
    text: "text-[#347451]",
    shadow: "shadow-[0_6px_0_#A6D4B1]",
    icon: "bg-white/70",
    label: "CLASS 02",
  },
  {
    background: "bg-[#FFDDCB]",
    border: "border-[#F4C9B4]",
    text: "text-[#A94F36]",
    shadow: "shadow-[0_6px_0_#EABBA3]",
    icon: "bg-white/70",
    label: "CLASS 03",
  },
  {
    background: "bg-[#FFE5A9]",
    border: "border-[#F1D58F]",
    text: "text-[#8D641C]",
    shadow: "shadow-[0_6px_0_#EED18B]",
    icon: "bg-white/70",
    label: "CLASS 04",
  },
  {
    background: "bg-[#F8D8E4]",
    border: "border-[#EDC3D3]",
    text: "text-[#A4496B]",
    shadow: "shadow-[0_6px_0_#E9BCCD]",
    icon: "bg-white/70",
    label: "CLASS 05",
  },
  {
    background: "bg-[#C9EEE8]",
    border: "border-[#B4E1D9]",
    text: "text-[#28756D]",
    shadow: "shadow-[0_6px_0_#A6D9CF]",
    icon: "bg-white/70",
    label: "CLASS 06",
  },
];

export default function StudentClassroomsPage() {
  const router = useRouter();

  const [classrooms, setClassrooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  const loadClassrooms = useCallback(async () => {
    const token = sessionStorage.getItem("smartattend_token");
    const storedUser = sessionStorage.getItem("smartattend_user");

    if (!token) {
      router.replace("/login");
      return;
    }

    try {
      const user = JSON.parse(storedUser || "{}");

      if (user.role !== "student") {
        router.replace(
          user.role === "teacher" ? "/teacher/dashboard" : "/login"
        );
        return;
      }
    } catch {
      router.replace("/login");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch(`${API_URL}/classrooms/joined`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        cache: "no-store",
      });

      if (response.status === 401 || response.status === 403) {
        sessionStorage.removeItem("smartattend_token");
        sessionStorage.removeItem("smartattend_user");
        router.replace("/login");
        return;
      }

      if (!response.ok) {
        throw new Error("Unable to load your classrooms. Please try again.");
      }

      const data = await response.json();

      const list = Array.isArray(data)
        ? data
        : data.classrooms ?? data.items ?? data.data;

      if (!Array.isArray(list)) {
        throw new Error("Unexpected classroom data received from the server.");
      }

      setClassrooms(list);
    } catch (err) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    loadClassrooms();
  }, [loadClassrooms]);

  const query = search.trim().toLowerCase();

  const filteredClassrooms = classrooms.filter((classroom) => {
    return (
      (classroom.name || classroom.classroom_name || "")
        .toLowerCase()
        .includes(query) ||
      (classroom.subject || "").toLowerCase().includes(query) ||
      (classroom.class_code || "").toLowerCase().includes(query)
    );
  });

  function logout() {
    sessionStorage.removeItem("smartattend_token");
    sessionStorage.removeItem("smartattend_user");
    router.replace("/login");
  }

  return (
    <main className="min-h-screen bg-[#FFF8ED] px-4 py-5 text-[#3D3548] sm:px-7 lg:px-10">
      <div className="mx-auto max-w-7xl">
        {/* Navigation */}
        <header className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <Link href="/student/dashboard" className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl border-2 border-white bg-[#CDEED4] text-xl font-black text-[#347451] shadow-[0_5px_0_#A6D4B1]">
              S
            </div>
            <div>
              <h2 className="text-xl font-black tracking-tight">
                SmartAttend
              </h2>
              <p className="text-xs font-semibold text-[#8C8194]">
                YOUR STUDENT SPACE
              </p>
            </div>
          </Link>

          <nav className="flex flex-wrap items-center gap-2">
            <Link
              href="/student/dashboard"
              className="rounded-xl px-4 py-2.5 text-sm font-bold text-[#776A82] transition hover:bg-white"
            >
              Dashboard
            </Link>
            <Link
              href="/student/attendance"
              className="rounded-xl px-4 py-2.5 text-sm font-bold text-[#776A82] transition hover:bg-white"
            >
              Attendance
            </Link>
            <button
              onClick={logout}
              className="rounded-xl border-2 border-[#EADFD1] bg-white px-4 py-2.5 text-sm font-bold shadow-[0_3px_0_#EADFD1] transition hover:-translate-y-0.5"
            >
              Sign out
            </button>
          </nav>
        </header>

        {/* Welcome banner */}
        <section className="relative mb-9 overflow-hidden rounded-[30px] border-2 border-white bg-[#CDEED4] p-6 shadow-[0_8px_0_#A6D4B1] sm:p-9 lg:p-10">
          <div className="pointer-events-none absolute -right-6 -top-12 h-48 w-48 rounded-full border-[24px] border-white/40" />
          <div className="pointer-events-none absolute -bottom-12 right-36 h-32 w-32 rounded-full bg-[#FFE5A9]/80" />

          <div className="relative z-10 max-w-2xl">
            <span className="inline-flex rounded-full border-2 border-white/80 bg-white/65 px-3 py-1.5 text-xs font-black tracking-wide text-[#347451]">
              YOUR LEARNING SPACE
            </span>
            <h1 className="mt-4 text-3xl font-black leading-tight tracking-tight text-[#285B40] sm:text-4xl lg:text-5xl">
              My classrooms.
            </h1>
            <p className="mt-3 max-w-lg text-sm font-medium leading-6 text-[#477B5C] sm:text-base">
              All your classes, subjects, and classroom codes together in one
              place. Pick a class and keep your learning moving.
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href="/student/classrooms/join"
                className="inline-flex items-center justify-center rounded-2xl border-2 border-white bg-[#FFF8ED] px-5 py-3 font-black text-[#347451] shadow-[0_5px_0_#A6D4B1] transition hover:-translate-y-0.5"
              >
                + Join a classroom
              </Link>
              <button
                onClick={loadClassrooms}
                disabled={loading}
                className="rounded-2xl border-2 border-white bg-white/65 px-5 py-3 font-black text-[#347451] transition hover:-translate-y-0.5 disabled:opacity-60"
              >
                {loading ? "Loading..." : "↻ Refresh classes"}
              </button>
            </div>
          </div>
        </section>

        {/* Summary */}
        <section className="mb-8 grid gap-4 sm:grid-cols-2">
          <div className="rounded-[24px] border-2 border-white bg-[#E5D8FB] p-5 shadow-[0_6px_0_#D0BFEF]">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-black text-[#7550A5]">
                  Joined classrooms
                </p>
                <p className="mt-3 text-4xl font-black tracking-tight text-[#7550A5]">
                  {loading ? "—" : classrooms.length}
                </p>
                <p className="mt-2 text-xs font-bold text-[#8065A0]">
                  Your enrolled classes
                </p>
              </div>
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl border-2 border-white bg-white/70 text-2xl font-black text-[#7550A5]">
                ▦
              </div>
            </div>
          </div>

          <div className="rounded-[24px] border-2 border-white bg-[#FFE5A9] p-5 shadow-[0_6px_0_#EED18B]">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-black text-[#8D641C]">
                  Find your class
                </p>
                <p className="mt-3 text-lg font-black text-[#8D641C]">
                  Search & explore
                </p>
                <p className="mt-2 text-xs font-bold text-[#9B762D]">
                  Use a name, subject, or code
                </p>
              </div>
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl border-2 border-white bg-white/70 text-2xl font-black text-[#8D641C]">
                ⌕
              </div>
            </div>
          </div>
        </section>

        {/* Classroom list */}
        <section className="rounded-[28px] border-2 border-white bg-[#FFFEFA] p-5 shadow-[0_7px_0_#EEE3D5] sm:p-7">
          <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.16em] text-[#A18EA6]">
                YOUR ENROLLMENTS
              </p>
              <h2 className="mt-1 text-2xl font-black tracking-tight">
                Your classes
              </h2>
              <p className="mt-2 text-sm font-medium text-[#95889A]">
                Select a classroom to view its details and code.
              </p>
            </div>
            <div className="rounded-2xl border-2 border-[#F0E7F6] bg-[#F7F0FC] px-4 py-3">
              <p className="text-xs font-bold text-[#927BA7]">SHOWING</p>
              <p className="mt-1 text-xl font-black text-[#7550A5]">
                {loading ? "—" : filteredClassrooms.length}
              </p>
            </div>
          </div>

          <div className="mb-7">
            <label
              htmlFor="classroom-search"
              className="mb-2 block text-xs font-black text-[#807387]"
            >
              SEARCH YOUR CLASSROOMS
            </label>
            <input
              id="classroom-search"
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search by classroom, subject, or code..."
              className="w-full rounded-2xl border-2 border-[#EDE3D7] bg-[#FFF9F0] px-4 py-3.5 text-sm font-semibold outline-none transition placeholder:text-[#B5A8B8] focus:border-[#C8B3EE] focus:bg-white sm:max-w-xl"
            />
          </div>

          {error ? (
            <div className="rounded-2xl border-2 border-[#F3C9C8] bg-[#FFF0EE] p-6 text-center">
              <h3 className="text-lg font-black text-[#A44936]">
                We couldn't load your classrooms.
              </h3>
              <p className="mt-2 text-sm font-medium text-[#A76B65]">
                {error}
              </p>
              <button
                onClick={loadClassrooms}
                className="mt-4 rounded-xl bg-[#FFDDCB] px-5 py-3 font-black text-[#A94F36] shadow-[0_4px_0_#EABBA3]"
              >
                Try again
              </button>
            </div>
          ) : loading ? (
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {[1, 2, 3].map((item) => (
                <div
                  key={item}
                  className="h-64 animate-pulse rounded-[24px] border-2 border-white bg-[#F2EDE8]"
                />
              ))}
            </div>
          ) : filteredClassrooms.length === 0 ? (
            <div className="rounded-[24px] border-2 border-dashed border-[#E9DCEB] bg-[#FBF6FC] px-5 py-12 text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-[22px] border-2 border-white bg-[#E5D8FB] text-2xl font-black text-[#7550A5] shadow-[0_5px_0_#D0BFEF]">
                ▦
              </div>
              <h3 className="mt-5 text-xl font-black">
                {classrooms.length === 0
                  ? "Your classroom journey starts here"
                  : "No matching classrooms"}
              </h3>
              <p className="mx-auto mt-2 max-w-md text-sm font-medium leading-6 text-[#96889A]">
                {classrooms.length === 0
                  ? "Join a classroom using the code provided by your teacher. Your enrolled classes will appear here."
                  : "Try another search term or clear the search to see all your classes."}
              </p>
              {classrooms.length === 0 ? (
                <Link
                  href="/student/classrooms/join"
                  className="mt-5 inline-flex rounded-2xl bg-[#CDEED4] px-5 py-3 font-black text-[#347451] shadow-[0_4px_0_#A6D4B1] transition hover:-translate-y-0.5"
                >
                  Join your first classroom →
                </Link>
              ) : (
                <button
                  onClick={() => setSearch("")}
                  className="mt-5 rounded-xl bg-[#E5D8FB] px-4 py-2.5 font-black text-[#7550A5] shadow-[0_3px_0_#D0BFEF]"
                >
                  Clear search
                </button>
              )}
            </div>
          ) : (
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {filteredClassrooms.map((classroom, index) => (
                <ClassroomCard
                  key={classroom.id || classroom.class_code || index}
                  classroom={classroom}
                  index={index}
                />
              ))}
            </div>
          )}

          {!loading && !error && filteredClassrooms.length > 0 && (
            <div className="mt-7 flex flex-wrap items-center justify-between gap-2 border-t-2 border-dashed border-[#F0E7DC] pt-5 text-xs font-bold text-[#A092A1]">
              <span>
                Showing {filteredClassrooms.length} of {classrooms.length} classrooms
              </span>
              <Link
                href="/student/classrooms/join"
                className="text-[#7550A5] transition hover:underline"
              >
                Have another class code? Join a class →
              </Link>
            </div>
          )}
        </section>

        <footer className="flex flex-col justify-between gap-2 px-1 py-7 text-xs font-semibold text-[#A092A1] sm:flex-row">
          <p>SmartAttend · Learn consistently, grow confidently.</p>
          <Link
            href="/student/dashboard"
            className="text-[#7550A5] hover:underline"
          >
            ← Back to dashboard
          </Link>
        </footer>
      </div>
    </main>
  );
}

function ClassroomCard({ classroom, index }) {
  const palette = PALETTES[index % PALETTES.length];
  const name = classroom.name || classroom.classroom_name || "Classroom";
  const subject = classroom.subject || "Subject not specified";
  const code = classroom.class_code || "";

  return (
    <article
      className={`flex min-h-[270px] flex-col rounded-[24px] border-2 border-white ${palette.background} p-5 transition duration-200 hover:-translate-y-1 ${palette.shadow}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div
          className={`flex h-14 w-14 items-center justify-center rounded-2xl border-2 ${palette.border} ${palette.icon} text-2xl font-black ${palette.text}`}
        >
          {name.trim().charAt(0).toUpperCase()}
        </div>
        <span
          className={`rounded-full border border-white/80 bg-white/60 px-3 py-1.5 text-[10px] font-black tracking-wider ${palette.text}`}
        >
          {palette.label}
        </span>
      </div>

      <div className="mt-5">
        <h3 className="break-words text-xl font-black leading-snug text-[#44384F]">
          {name}
        </h3>
        <p className={`mt-1 text-sm font-bold ${palette.text}`}>{subject}</p>
      </div>

      <div className="mt-5 rounded-2xl border-2 border-white/80 bg-white/55 p-3">
        <p className="text-[10px] font-black uppercase tracking-wider text-[#A092A1]">
          Classroom code
        </p>
        <div className="mt-1 flex items-center justify-between gap-2">
          <p className="break-all font-mono text-lg font-black tracking-[0.12em] text-[#5C4A6B]">
            {code || "Not available"}
          </p>
          {code && (
            <button
              type="button"
              onClick={() => {
                if (navigator.clipboard?.writeText) {
                  navigator.clipboard.writeText(code);
                }
              }}
              title="Copy classroom code"
              aria-label={`Copy classroom code ${code}`}
              className={`shrink-0 rounded-xl border-2 border-white bg-white/80 px-3 py-2 text-xs font-black ${palette.text} transition hover:-translate-y-0.5`}
            >
              Copy
            </button>
          )}
        </div>
      </div>

      <div className="mt-auto pt-5">
        <div
          className={`flex items-center gap-2 text-xs font-bold ${palette.text}`}
        >
          <span className="h-2 w-2 rounded-full bg-current" />
          Enrollment active
        </div>
      </div>
    </article>
  );
}
