
"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

async function apiRequest(path, token) {
  const response = await fetch(`${API_URL}${path}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
    },
    cache: "no-store",
  });

  const contentType = response.headers.get("content-type") || "";
  const data = contentType.includes("application/json")
    ? await response.json()
    : null;

  if (!response.ok) {
    const message =
      data?.detail ||
      data?.message ||
      `Request failed (${response.status})`;

    throw new Error(
      typeof message === "string" ? message : "Unable to load dashboard data."
    );
  }

  return data;
}

function formatDate(value) {
  if (!value) return "Not completed";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "—";

  return date.toLocaleString(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function StatIcon({ name }) {
  const common = {
    width: 23,
    height: 23,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.8,
    strokeLinecap: "round",
    strokeLinejoin: "round",
    "aria-hidden": true,
  };

  const paths = {
    classrooms: (
      <>
        <path d="m3 10 9-6 9 6" />
        <path d="M5 10v10h14V10" />
        <path d="M9 20v-6h6v6" />
      </>
    ),
    students: (
      <>
        <circle cx="9" cy="8" r="3" />
        <path d="M3 20v-2a6 6 0 0 1 12 0v2" />
        <path d="M16 5.5a3 3 0 0 1 0 5.8" />
        <path d="M18 14a5 5 0 0 1 3 4.5V20" />
      </>
    ),
    sessions: (
      <>
        <rect x="3" y="5" width="18" height="16" rx="2" />
        <path d="M7 3v4M17 3v4M3 10h18M8 14h3M8 17h6" />
      </>
    ),
    records: (
      <>
        <path d="M8 4H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-3" />
        <path d="M8 2h8v5H8z" />
        <path d="m13 13 2 2 6-6" />
      </>
    ),
  };

  return <svg {...common}>{paths[name] || paths.records}</svg>;
}

function StatCard({ label, value, description, icon, color, accent }) {
  return (
    <article className="rounded-3xl border border-[#E8E1D6] bg-white p-5 shadow-[3px_4px_0px_#EDE5D9] transition hover:-translate-y-1 sm:p-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-[#52645A]">{label}</p>
          <p className="mt-4 text-3xl font-extrabold tracking-tight">
            {value}
          </p>
        </div>

        <div
          className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${color} ${accent}`}
        >
          <StatIcon name={icon} />
        </div>
      </div>

      <p className="mt-4 text-xs leading-5 text-[#69786E]">
        {description}
      </p>
    </article>
  );
}

function SectionHeading({ eyebrow, title, description }) {
  return (
    <div>
      <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-[#A94F36]">
        {eyebrow}
      </p>
      <h2 className="mt-2 text-xl font-extrabold tracking-tight sm:text-2xl">
        {title}
      </h2>
      {description && (
        <p className="mt-2 text-sm leading-6 text-[#69786E]">
          {description}
        </p>
      )}
    </div>
  );
}

function EmptyState({ title, description, action, href }) {
  return (
    <div className="rounded-2xl bg-[#F8F5EF] px-5 py-10 text-center">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#CDEED4] text-2xl">
        ✳
      </div>

      <h3 className="mt-4 font-extrabold">{title}</h3>
      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[#69786E]">
        {description}
      </p>

      {action && href && (
        <Link
          href={href}
          className="mt-5 inline-flex rounded-xl bg-[#347451] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#24563B]"
        >
          {action}
        </Link>
      )}
    </div>
  );
}

export default function TeacherDashboardPage() {
  const router = useRouter();

  const [token, setToken] = useState("");
  const [user, setUser] = useState(null);

  const [classrooms, setClassrooms] = useState([]);
  const [stats, setStats] = useState(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    try {
      const savedToken = sessionStorage.getItem("smartattend_token");
      const savedUser = sessionStorage.getItem("smartattend_user");

      if (!savedToken || !savedUser) {
        router.replace("/login");
        return;
      }

      const parsedUser = JSON.parse(savedUser);

      if (parsedUser.role?.toLowerCase() !== "teacher") {
        router.replace("/login");
        return;
      }

      setToken(savedToken);
      setUser(parsedUser);
    } catch {
      router.replace("/login");
    }
  }, [router]);


  const loadDashboard = useCallback(
    async (isRefresh = false) => {
      if (!token) return;

      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError("");

      try {
        const [classroomResult, statsResult] = await Promise.all([
          apiRequest("/classrooms/mine", token),
          apiRequest("/attendance/dashboard-stats", token),
        ]);

        const classroomList = Array.isArray(classroomResult)
          ? classroomResult
          : classroomResult?.classrooms ??
          classroomResult?.items ??
          classroomResult?.data ??
          [];

        // Confirm the actual response received by the frontend.


        setClassrooms(classroomList);
        setStats(statsResult);
      } catch (err) {
        console.error("Dashboard loading failed:", err);
        setError(
          err.message || "Could not load dashboard data. Please try again."
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [token]
  );


  useEffect(() => {
    if (token) loadDashboard();
  }, [token, loadDashboard]);

  function handleLogout() {
    sessionStorage.removeItem("smartattend_token");
    sessionStorage.removeItem("smartattend_user");
    router.replace("/login");
  }

  const firstName =
    user?.name?.trim()?.split(/\s+/)[0] || "Teacher";

  const statCards = [
    {
      label: "My classrooms",
      value: stats?.total_classrooms ?? "—",
      description: "Classrooms you manage",
      icon: "classrooms",
      color: "bg-[#CDEED4]",
      accent: "text-[#347451]",
    },
    {
      label: "Total students",
      value: stats?.total_students ?? "—",
      description: "Student enrollments across your classrooms",
      icon: "students",
      color: "bg-[#E5D8FB]",
      accent: "text-[#7550A5]",
    },
    {
      label: "Sessions conducted",
      value: stats?.total_sessions ?? "—",
      description: "Attendance sessions created",
      icon: "sessions",
      color: "bg-[#FFDDCB]",
      accent: "text-[#A94F36]",
    },
    {
      label: "Attendance records",
      value: stats?.total_records ?? "—",
      description: "Records across your attendance sessions",
      icon: "records",
      color: "bg-[#FFE5A9]",
      accent: "text-[#8D641C]",
    },
  ];

  const recentSessions = stats?.recent_sessions || [];

  return (
    <main className="min-h-screen bg-[#FFF8ED] text-[#25392F]">
      {/* Navigation */}
      <header className="sticky top-0 z-20 border-b border-[#E8E1D6] bg-[#FFF8ED]/95 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-4 sm:px-8">
          <Link
            href="/teacher/dashboard"
            className="flex items-center gap-3"
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#CDEED4] text-[#347451] shadow-[3px_3px_0px_#B2DCC0]">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                className="h-6 w-6"
                aria-hidden="true"
              >
                <path d="M3 9.5 12 4l9 5.5-9 5.5-9-5.5Z" />
                <path d="M7 12v5c3.3 2.5 6.7 2.5 10 0v-5" />
                <path d="M21 10v6" />
              </svg>
            </div>

            <div>
              <p className="text-lg font-extrabold tracking-tight">
                SmartAttend
              </p>
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#69786E]">
                Teacher portal
              </p>
            </div>
          </Link>

          <div className="flex items-center gap-3">
            <div className="hidden text-right sm:block">
              <p className="text-sm font-semibold">{user?.name || "Teacher"}</p>
              <p className="text-xs text-[#69786E]">Teacher account</p>
            </div>

            <div className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-white bg-[#E5D8FB] font-bold text-[#7550A5] shadow-[2px_3px_0px_#D3C3F0]">
              {firstName.charAt(0).toUpperCase()}
            </div>

            <button
              type="button"
              onClick={handleLogout}
              className="rounded-xl border border-[#E8E1D6] bg-white px-3 py-2 text-sm font-semibold text-[#52645A] transition hover:bg-[#F5EDE1] focus:outline-none focus:ring-2 focus:ring-[#347451]"
            >
              Sign out
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-5 py-8 sm:px-8 sm:py-10">
        {/* Welcome */}
        <section className="relative overflow-hidden rounded-[28px] bg-[#DCEFE0] p-6 shadow-[5px_6px_0px_#C4DEC9] sm:p-9 lg:p-10">
          <div className="pointer-events-none absolute -right-8 -top-12 h-44 w-44 rounded-full border-[24px] border-white/30" />
          <div className="pointer-events-none absolute -bottom-16 right-36 h-40 w-40 rounded-full bg-[#B8DEC2]/50" />

          <div className="relative z-10 max-w-2xl">
            <span className="inline-flex rounded-full border border-[#B8D8BF] bg-white/70 px-3 py-1.5 text-[10px] font-extrabold tracking-[0.16em] text-[#347451]">
              TEACHER WORKSPACE
            </span>

            <p className="mt-5 text-sm font-semibold text-[#526D59]">
              Your classroom overview
            </p>

            <h1 className="mt-2 text-3xl font-extrabold tracking-tight sm:text-4xl lg:text-5xl">
              Welcome back, {firstName}
              <span className="text-[#A94F36]">.</span>
            </h1>

            <p className="mt-4 max-w-xl text-sm leading-7 text-[#526D59] sm:text-base">
              Manage your classrooms, start attendance sessions, and review
              student attendance — all from one place.
            </p>

            <div className="mt-7 flex flex-wrap gap-3">
              <Link
                href="/teacher/attendance"
                className="inline-flex items-center justify-center rounded-xl bg-[#347451] px-5 py-3 text-sm font-bold text-white shadow-[0_4px_0_#24563B] transition hover:-translate-y-0.5 hover:bg-[#2A6043] active:translate-y-0"
              >
                Take attendance <span className="ml-2">→</span>
              </Link>

              <Link
                href="/teacher/classrooms/create"
                className="inline-flex items-center justify-center rounded-xl border border-[#B8D8BF] bg-white/80 px-5 py-3 text-sm font-bold text-[#347451] transition hover:bg-white"
              >
                + Create classroom
              </Link>
            </div>
          </div>
        </section>

        {/* Error message */}
        {error && (
          <div
            role="alert"
            className="mt-7 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-[#E9B9A2] bg-[#FFDDCB]/60 p-4 text-sm text-[#813A28]"
          >
            <p>{error}</p>
            <button
              type="button"
              onClick={() => loadDashboard(true)}
              className="rounded-lg bg-white px-4 py-2 font-bold text-[#A94F36] transition hover:bg-[#FFF8ED]"
            >
              Try again
            </button>
          </div>
        )}

        {/* Statistics */}
        <section className="mt-10">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <SectionHeading
              eyebrow="At a glance"
              title="Your dashboard"
              description="A live overview of your teaching activity."
            />

            <button
              type="button"
              onClick={() => loadDashboard(true)}
              disabled={loading || refreshing}
              className="rounded-xl border border-[#E8E1D6] bg-white px-4 py-2.5 text-sm font-bold text-[#347451] transition hover:bg-[#F8F5EF] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {refreshing ? "Refreshing..." : "↻ Refresh data"}
            </button>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
            {statCards.map((stat) => (
              <StatCard
                key={stat.label}
                {...stat}
                value={loading ? "…" : stat.value}
              />
            ))}
          </div>

          <p className="mt-4 text-xs text-[#8A9189]">
            {loading
              ? "Loading your latest dashboard data..."
              : "Statistics are loaded from your SmartAttend backend."}
          </p>
        </section>

        {/* Classrooms and quick actions */}
        <section className="mt-11 grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="rounded-[24px] border border-[#E8E1D6] bg-white p-6 shadow-[4px_5px_0px_#EDE5D9] sm:p-7 lg:col-span-2">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <SectionHeading
                eyebrow="Stay organized"
                title="Your classrooms"
                description="Access your classes and their joining codes."
              />

              <Link
                href="/teacher/classrooms"
                className="text-sm font-bold text-[#347451] transition hover:text-[#24563B] hover:underline"
              >
                View all →
              </Link>
            </div>

            <div className="mt-6">
              {loading ? (
                <div className="space-y-3">
                  {[1, 2].map((item) => (
                    <div
                      key={item}
                      className="h-28 animate-pulse rounded-2xl bg-[#F8F5EF]"
                    />
                  ))}
                </div>
              ) : classrooms.length === 0 ? (
                <EmptyState
                  title="No classrooms yet"
                  description="Create your first classroom to organize students and start taking attendance."
                  action="Create your first classroom →"
                  href="/teacher/classrooms/create"
                />
              ) : (
                <div className="space-y-3">
                  {classrooms.slice(0, 5).map((classroom) => (
                    <article
                      key={classroom.id}
                      className="rounded-2xl border border-[#E8E1D6] bg-[#FFFDF8] p-4 transition hover:border-[#B8D8BF] sm:p-5"
                    >
                      <div className="flex flex-wrap items-start justify-between gap-4">
                        <div className="flex min-w-0 items-start gap-3">
                          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#CDEED4] text-[#347451]">
                            <StatIcon name="classrooms" />
                          </div>

                          <div className="min-w-0">
                            <h3 className="break-words font-extrabold">
                              {classroom.name}
                            </h3>
                            <p className="mt-1 text-sm text-[#69786E]">
                              {classroom.subject || "Subject not specified"}
                            </p>
                            {classroom.class_code && (
                              <p className="mt-2 text-xs text-[#69786E]">
                                Join code:{" "}
                                <span className="font-extrabold tracking-wider text-[#347451]">
                                  {classroom.class_code}
                                </span>
                              </p>
                            )}
                          </div>
                        </div>

                        <Link
                          href="/teacher/attendance"
                          className="shrink-0 rounded-xl bg-[#347451] px-3 py-2 text-xs font-bold text-white transition hover:bg-[#24563B]"
                        >
                          Take attendance →
                        </Link>
                      </div>
                    </article>
                  ))}

                  {classrooms.length > 5 && (
                    <Link
                      href="/teacher/classrooms"
                      className="block rounded-xl bg-[#F8F5EF] px-4 py-3 text-center text-sm font-bold text-[#347451] transition hover:bg-[#F0EADF]"
                    >
                      View all {classrooms.length} classrooms →
                    </Link>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Quick actions */}
          <aside className="rounded-[24px] border border-[#E8E1D6] bg-[#F4EFE5] p-6 sm:p-7">
            <SectionHeading
              eyebrow="Shortcuts"
              title="Quick actions"
              description="Jump straight into your next task."
            />

            <div className="mt-6 space-y-3">
              <Link
                href="/teacher/classrooms/create"
                className="flex items-center gap-3 rounded-2xl border border-[#E8E1D6] bg-white p-4 transition hover:-translate-y-0.5 hover:border-[#B8D8BF]"
              >
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#CDEED4] text-lg">
                  +
                </span>
                <span>
                  <span className="block text-sm font-extrabold">
                    Create classroom
                  </span>
                  <span className="mt-1 block text-xs text-[#69786E]">
                    Set up a new class
                  </span>
                </span>
              </Link>

              <Link
                href="/teacher/classrooms"
                className="flex items-center gap-3 rounded-2xl border border-[#E8E1D6] bg-white p-4 transition hover:-translate-y-0.5 hover:border-[#B8D8BF]"
              >
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#E5D8FB] text-lg">
                  ▦
                </span>
                <span>
                  <span className="block text-sm font-extrabold">
                    Manage classrooms
                  </span>
                  <span className="mt-1 block text-xs text-[#69786E]">
                    View your class list
                  </span>
                </span>
              </Link>

              <Link
                href="/teacher/attendance"
                className="flex items-center gap-3 rounded-2xl border border-[#E8E1D6] bg-white p-4 transition hover:-translate-y-0.5 hover:border-[#B8D8BF]"
              >
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#FFDDCB] text-lg">
                  ✓
                </span>
                <span>
                  <span className="block text-sm font-extrabold">
                    Take attendance
                  </span>
                  <span className="mt-1 block text-xs text-[#69786E]">
                    Start a session and process a photo
                  </span>
                </span>
              </Link>
            </div>
          </aside>
        </section>

        {/* Recent attendance sessions */}
        <section className="mt-11 rounded-[24px] border border-[#E8E1D6] bg-white p-6 shadow-[4px_5px_0px_#EDE5D9] sm:p-7">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <SectionHeading
              eyebrow="Attendance activity"
              title="Recent sessions"
              description="Open a session's summary to review its attendance statistics."
            />

            <Link
              href="/teacher/attendance"
              className="text-sm font-bold text-[#347451] transition hover:underline"
            >
              Start a session →
            </Link>
          </div>

          <div className="mt-6">
            {loading ? (
              <div className="h-24 animate-pulse rounded-2xl bg-[#F8F5EF]" />
            ) : recentSessions.length === 0 ? (
              <EmptyState
                title="No attendance sessions yet"
                description="Once you start taking attendance, your recent sessions will appear here."
                action="Go to attendance →"
                href="/teacher/attendance"
              />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[600px] border-collapse text-left">
                  <thead>
                    <tr className="border-b border-[#E8E1D6] text-xs uppercase tracking-wider text-[#69786E]">
                      <th className="px-4 py-3 font-bold">Classroom</th>
                      <th className="px-4 py-3 font-bold">Subject</th>
                      <th className="px-4 py-3 font-bold">Started</th>
                      <th className="px-4 py-3 font-bold">Status</th>
                      <th className="px-4 py-3 text-right font-bold">Action</th>
                    </tr>
                  </thead>

                  <tbody>
                    {recentSessions.map((session, index) => (
                      <tr
                        key={session.id ?? session.session_id ?? `${session.classroom_id}-${session.started_at}-${index}`}
                        className="border-b border-[#F0EBE2] last:border-0 hover:bg-[#FFFDF8]"
                      >
                        <td className="px-4 py-4">
                          <p className="font-bold">
                            {session.classroom_name || "Classroom"}
                          </p>
                        </td>

                        <td className="px-4 py-4 text-sm text-[#69786E]">
                          {session.subject || "—"}
                        </td>

                        <td className="px-4 py-4 text-sm text-[#69786E]">
                          {formatDate(session.started_at)}
                        </td>

                        <td className="px-4 py-4">
                          <span
                            className={`inline-flex rounded-full px-3 py-1 text-xs font-bold ${session.completed_at
                              ? "bg-[#CDEED4] text-[#347451]"
                              : "bg-[#FFE5A9] text-[#8D641C]"
                              }`}
                          >
                            {session.completed_at
                              ? "Finalized"
                              : "In progress"}
                          </span>
                        </td>

                        <td className="px-4 py-4 text-right">
                          {(() => {
                            const sessionId =
                              session.session_id ||
                              session.id ||
                              session.attendance_session_id;

                            if (!sessionId) {
                              return (
                                <span className="text-xs text-gray-500">
                                  Summary unavailable
                                </span>
                              );
                            }

                            return (
                              <Link
                                href={`/teacher/attendance/summary?session_id=${encodeURIComponent(
                                  session.session_id || session.id || ""
                                )}`}
                                className="inline-flex rounded-lg border border-[#B8D8BF] bg-white px-3 py-2 text-xs font-bold text-[#347451] transition hover:bg-[#CDEED4]"
                              >
                                View summary →
                              </Link>
                            );
                          })()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </section>

        {/* Footer */}
        <footer className="mt-10 flex flex-wrap items-center justify-between gap-3 border-t border-[#E8E1D6] py-6 text-xs text-[#718075]">
          <p>SmartAttend · Attendance management</p>
          <Link
            href="/teacher/classrooms"
            className="font-bold text-[#347451] hover:underline"
          >
            My classrooms →
          </Link>
        </footer>
      </div>
    </main>
  );
}
