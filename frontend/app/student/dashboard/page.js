"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

function StatCard({ title, value, description, icon, color }) {
  const styles = {
    green: {
      card: "bg-[#F0F7EF] border-[#D7E8D5]",
      icon: "bg-[#CDEED4] text-[#24563B]",
    },
    orange: {
      card: "bg-[#FFF3E9] border-[#F0DDCE]",
      icon: "bg-[#FFDDCB] text-[#A94F36]",
    },
    lavender: {
      card: "bg-[#F5F0FC] border-[#E5D8FB]",
      icon: "bg-[#E5D8FB] text-[#654A91]",
    },
    yellow: {
      card: "bg-[#FFF9E9] border-[#F0E4BD]",
      icon: "bg-[#FFE5A9] text-[#8A6418]",
    },
  };

  const style = styles[color] || styles.green;

  return (
    <div
      className={`rounded-[24px] border p-5 transition duration-200 hover:-translate-y-1 hover:shadow-[5px_7px_0px_#EDE5D9] sm:p-6 ${style.card}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-semibold text-[#69786E]">
            {title}
          </p>

          <p className="mt-3 break-words text-3xl font-extrabold tracking-tight text-[#25392F] sm:text-4xl">
            {value}
          </p>
        </div>

        <div
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl text-lg font-extrabold ${style.icon}`}
        >
          {icon}
        </div>
      </div>

      <p className="mt-3 text-sm leading-6 text-[#69786E]">
        {description}
      </p>
    </div>
  );
}

function QuickAction({ href, title, description, icon, color }) {
  const styles = {
    green:
      "bg-[#CDEED4] text-[#24563B] group-hover:bg-[#347451] group-hover:text-white",
    orange:
      "bg-[#FFDDCB] text-[#A94F36] group-hover:bg-[#A94F36] group-hover:text-white",
    lavender:
      "bg-[#E5D8FB] text-[#654A91] group-hover:bg-[#654A91] group-hover:text-white",
    yellow:
      "bg-[#FFE5A9] text-[#8A6418] group-hover:bg-[#347451] group-hover:text-white",
  };

  return (
    <Link
      href={href}
      className="group flex min-w-0 items-start gap-4 rounded-[24px] border border-[#E8E1D6] bg-white p-5 shadow-[3px_4px_0px_#EDE5D9] transition duration-200 hover:-translate-y-0.5 hover:border-[#B8D4BC] hover:shadow-[5px_6px_0px_#EDE5D9] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#347451] focus-visible:ring-offset-2 sm:p-6"
    >
      <div
        className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-xl font-extrabold transition duration-200 ${styles[color] || styles.green}`}
      >
        {icon}
      </div>

      <div className="min-w-0 flex-1">
        <h3 className="font-bold leading-6 text-[#25392F]">
          {title}
        </h3>

        <p className="mt-2 text-sm leading-6 text-[#69786E]">
          {description}
        </p>

        <span className="mt-3 inline-flex items-center gap-2 text-sm font-bold text-[#347451]">
          Open
          <span className="transition group-hover:translate-x-1">
            →
          </span>
        </span>
      </div>
    </Link>
  );
}

function SectionHeading({ eyebrow, title, description }) {
  return (
    <div className="mb-5">
      {eyebrow && (
        <p className="mb-2 text-xs font-extrabold uppercase tracking-[0.16em] text-[#A94F36]">
          {eyebrow}
        </p>
      )}

      <h2 className="text-xl font-extrabold tracking-tight text-[#25392F] sm:text-2xl">
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

export default function StudentDashboard() {
  const router = useRouter();

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loggingOut, setLoggingOut] = useState(false);

  const [stats, setStats] = useState({
    classrooms: 0,
    attendanceRate: null,
    sessionsAttended: 0,
    pendingItems: 0,
  });

  const [dashboardDataLoading, setDashboardDataLoading] =
    useState(true);
  const [dashboardError, setDashboardError] = useState("");

  // Authenticate the student.
  useEffect(() => {
    const token = sessionStorage.getItem("smartattend_token");
    const storedUser = sessionStorage.getItem("smartattend_user");

    if (!token || !storedUser) {
      router.replace("/login");
      return;
    }

    try {
      const parsedUser = JSON.parse(storedUser);

      if (!parsedUser || !parsedUser.role) {
        sessionStorage.removeItem("smartattend_user");
        sessionStorage.removeItem("smartattend_token");
        router.replace("/login");
        return;
      }

      const role = parsedUser.role.toLowerCase();

      if (role !== "student") {
        if (role === "teacher") {
          router.replace("/teacher/dashboard");
        } else {
          router.replace("/login");
        }

        return;
      }

      setUser(parsedUser);
    } catch (error) {
      console.error("Unable to read the logged-in user:", error);

      sessionStorage.removeItem("smartattend_user");
      sessionStorage.removeItem("smartattend_token");
      router.replace("/login");
    } finally {
      setLoading(false);
    }
  }, [router]);

  // Fetch data belonging to the logged-in student.
  useEffect(() => {
    if (!user) return;

    let cancelled = false;

    async function loadDashboardData() {
      setDashboardDataLoading(true);
      setDashboardError("");

      try {
        const token = sessionStorage.getItem("smartattend_token");

        if (!token) {
          throw new Error(
            "Your session has expired. Please log in again."
          );
        }

        const headers = {
          Authorization: `Bearer ${token}`,
        };

        const [classroomsResponse, historyResponse] =
          await Promise.all([
            fetch(`${API_URL}/classrooms/joined`, { headers }),
            fetch(`${API_URL}/attendance/my-history`, { headers }),
          ]);

        if (!classroomsResponse.ok) {
          const message = await classroomsResponse.text();

          throw new Error(
            `Unable to load classrooms (${classroomsResponse.status}): ${message}`
          );
        }

        if (!historyResponse.ok) {
          const message = await historyResponse.text();

          throw new Error(
            `Unable to load attendance history (${historyResponse.status}): ${message}`
          );
        }

        const classroomsPayload =
          await classroomsResponse.json();
        const historyPayload = await historyResponse.json();

        const classrooms = Array.isArray(classroomsPayload)
          ? classroomsPayload
          : classroomsPayload.classrooms ??
            classroomsPayload.items ??
            classroomsPayload.data ??
            [];

        const history = Array.isArray(historyPayload)
          ? historyPayload
          : historyPayload.records ??
            historyPayload.history ??
            historyPayload.attendance ??
            historyPayload.items ??
            historyPayload.data ??
            [];

        if (!Array.isArray(classrooms) || !Array.isArray(history)) {
          throw new Error(
            "The dashboard API returned an unexpected data format."
          );
        }

        const getStatus = (record) =>
          String(record.status || "").toUpperCase();

        const presentCount = history.filter(
          (record) => getStatus(record) === "PRESENT"
        ).length;

        const absentCount = history.filter(
          (record) => getStatus(record) === "ABSENT"
        ).length;

        const pendingCount = history.filter((record) =>
          ["REVIEW", "UNKNOWN", "NOT_DETECTED"].includes(
            getStatus(record)
          )
        ).length;

        // Only PRESENT and ABSENT records count toward the rate.
        const countedSessions = presentCount + absentCount;

        const attendanceRate =
          countedSessions > 0
            ? Math.round(
                (presentCount / countedSessions) * 100
              )
            : null;

        if (!cancelled) {
          setStats({
            classrooms: classrooms.length,
            attendanceRate,
            sessionsAttended: presentCount,
            pendingItems: pendingCount,
          });
        }
      } catch (error) {
        console.error("Failed to load student dashboard:", error);

        if (!cancelled) {
          setDashboardError(
            error.message || "Unable to load dashboard data."
          );
        }
      } finally {
        if (!cancelled) {
          setDashboardDataLoading(false);
        }
      }
    }

    loadDashboardData();

    return () => {
      cancelled = true;
    };
  }, [user]);

  const handleLogout = () => {
    setLoggingOut(true);

    sessionStorage.removeItem("smartattend_token");
    sessionStorage.removeItem("smartattend_user");

    router.replace("/login");
  };

  if (loading || !user) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#FFF8ED] px-5">
        <div className="text-center">
          <div className="mx-auto h-11 w-11 animate-spin rounded-full border-4 border-[#E8E1D6] border-t-[#347451]" />

          <p className="mt-4 text-sm font-medium text-[#69786E]">
            Loading your student dashboard...
          </p>
        </div>
      </main>
    );
  }

  const displayName =
    user.name ||
    user.full_name ||
    user.email?.split("@")[0] ||
    "Student";

  const initials = displayName
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join("");

  return (
    <div className="min-h-screen bg-[#FFF8ED] text-[#25392F]">
      {/* Navigation */}
      <header className="sticky top-0 z-20 border-b border-[#E8E1D6] bg-[#FFF8ED]/95 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3.5 sm:px-8 sm:py-4">
          <Link
            href="/student/dashboard"
            className="flex min-w-0 items-center gap-3 rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#347451]"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#347451] text-xl font-extrabold text-white shadow-sm sm:h-11 sm:w-11">
              S
            </div>

            <div className="min-w-0">
              <p className="truncate text-base font-extrabold tracking-tight text-[#25392F] sm:text-lg">
                SmartAttend
              </p>
              <p className="text-xs font-medium text-[#69786E]">
                Student portal
              </p>
            </div>
          </Link>

          <div className="flex shrink-0 items-center gap-2 sm:gap-3">
            <div className="hidden text-right md:block">
              <p className="max-w-40 truncate text-sm font-bold text-[#25392F]">
                {displayName}
              </p>
              <p className="text-xs text-[#69786E]">
                Student account
              </p>
            </div>

            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#CDEED4] text-sm font-extrabold text-[#24563B]">
              {initials || "S"}
            </div>

            <button
              type="button"
              onClick={handleLogout}
              disabled={loggingOut}
              className="min-h-10 rounded-xl border border-[#E8E1D6] bg-white px-3 py-2 text-sm font-bold text-[#25392F] transition hover:border-[#E6C9BE] hover:bg-[#FFF3E9] hover:text-[#A94F36] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#347451] disabled:cursor-not-allowed disabled:opacity-60 sm:px-4"
            >
              {loggingOut ? "Logging out..." : "Logout"}
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-7 sm:px-8 sm:py-9 lg:py-10">
        {/* Welcome banner */}
        <section className="relative overflow-hidden rounded-[28px] border border-[#D7E8D5] bg-[#EAF4E7] p-5 shadow-[4px_5px_0px_#EDE5D9] sm:p-8 lg:p-10">
          <div className="pointer-events-none absolute -right-12 -top-16 h-56 w-56 rounded-full border-[28px] border-[#347451]/10 sm:h-72 sm:w-72 sm:border-[38px]" />

          <div className="pointer-events-none absolute -bottom-20 right-28 h-40 w-40 rounded-full bg-[#CDEED4]/60 sm:right-56 sm:h-52 sm:w-52" />

          <div className="relative z-10 max-w-3xl">
            <span className="inline-flex rounded-full border border-[#C6DCC4] bg-white/70 px-3 py-1.5 text-[11px] font-extrabold tracking-[0.14em] text-[#347451] sm:text-xs">
              STUDENT DASHBOARD
            </span>

            <h1 className="mt-5 break-words text-3xl font-extrabold leading-tight tracking-tight text-[#25392F] sm:text-4xl lg:text-5xl">
              Welcome back, {displayName}!
            </h1>

            <p className="mt-4 max-w-2xl text-sm leading-7 text-[#52685A] sm:text-base">
              Keep track of your classes, monitor your attendance,
              and stay up to date with your academic progress.
            </p>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <Link
                href="/student/classrooms/join"
                className="inline-flex min-h-12 items-center justify-center rounded-xl bg-[#347451] px-5 py-3 text-center text-sm font-extrabold text-white shadow-sm transition hover:bg-[#24563B] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#347451] focus-visible:ring-offset-2"
              >
                + Join a classroom
              </Link>

              <Link
                href="/student/biometrics"
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-[#B8D4BC] bg-white px-5 py-3 text-center text-sm font-extrabold text-[#24563B] transition hover:bg-[#F7FBF5] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#347451] focus-visible:ring-offset-2"
              >
                <span aria-hidden="true">◎</span>
                Register your face
              </Link>

              <Link
                href="/student/attendance"
                className="inline-flex min-h-12 items-center justify-center rounded-xl border border-[#C6DCC4] bg-white/60 px-5 py-3 text-center text-sm font-bold text-[#25392F] transition hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#347451] focus-visible:ring-offset-2"
              >
                View attendance →
              </Link>
            </div>
          </div>
        </section>

        {/* Statistics */}
        <section className="mt-10 sm:mt-11">
          <SectionHeading
            eyebrow="Your activity"
            title="Your overview"
            description="A quick look at your classroom participation and attendance."
          />

          {dashboardError && (
            <div
              role="alert"
              className="mb-5 rounded-2xl border border-[#E6C9BE] bg-[#FFF3E9] p-4 text-sm text-[#8E3E2B]"
            >
              <p className="font-extrabold">
                Unable to load your dashboard data.
              </p>
              <p className="mt-1 break-words leading-6">
                {dashboardError}
              </p>
            </div>
          )}

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard
              title="My classrooms"
              value={
                dashboardDataLoading ? "..." : stats.classrooms
              }
              description="Classrooms you have joined"
              icon="C"
              color="green"
            />

            <StatCard
              title="Attendance rate"
              value={
                dashboardDataLoading
                  ? "..."
                  : stats.attendanceRate === null
                    ? "—"
                    : `${stats.attendanceRate}%`
              }
              description="Based on present and absent records"
              icon="%"
              color="yellow"
            />

            <StatCard
              title="Sessions attended"
              value={
                dashboardDataLoading
                  ? "..."
                  : stats.sessionsAttended
              }
              description="Sessions marked present"
              icon="A"
              color="lavender"
            />

            <StatCard
              title="Pending items"
              value={
                dashboardDataLoading ? "..." : stats.pendingItems
              }
              description="Records requiring review"
              icon="!"
              color="orange"
            />
          </div>

          {dashboardDataLoading && (
            <p
              role="status"
              className="mt-4 text-sm text-[#69786E]"
            >
              Loading your latest classroom and attendance data...
            </p>
          )}

          {!dashboardDataLoading &&
            !dashboardError &&
            stats.classrooms === 0 &&
            stats.sessionsAttended === 0 &&
            stats.pendingItems === 0 && (
              <div className="mt-5 rounded-2xl border border-dashed border-[#D8CEBD] bg-white/60 p-5">
                <p className="font-bold text-[#25392F]">
                  Your journey starts here.
                </p>
                <p className="mt-1 text-sm leading-6 text-[#69786E]">
                  You don&apos;t have any classroom or attendance
                  activity yet. Join a classroom to get started.
                </p>
                <Link
                  href="/student/classrooms/join"
                  className="mt-4 inline-flex min-h-11 items-center justify-center rounded-xl bg-[#347451] px-4 py-2.5 text-sm font-bold text-white transition hover:bg-[#24563B]"
                >
                  Join your first classroom →
                </Link>
              </div>
            )}
        </section>

        {/* Quick actions */}
        <section className="mt-10 sm:mt-11">
          <SectionHeading
            eyebrow="Get things done"
            title="Quick actions"
            description="Access your most-used student features in one place."
          />

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <QuickAction
              href="/student/classrooms/join"
              title="Join a classroom"
              description="Enter a classroom code and connect with your teacher's class."
              icon="+"
              color="green"
            />

            <QuickAction
              href="/student/classrooms"
              title="My classrooms"
              description="View your enrolled classrooms and access your subjects."
              icon="C"
              color="lavender"
            />

            <QuickAction
              href="/student/attendance"
              title="Attendance history"
              description="Review your attendance records and track your participation."
              icon="A"
              color="yellow"
            />

            <QuickAction
              href="/student/biometrics"
              title="Face enrollment"
              description="Register your face securely, with your consent, for attendance recognition."
              icon="◎"
              color="orange"
            />
          </div>
        </section>

        {/* Face enrollment reminder */}
        <section className="mt-10 overflow-hidden rounded-[24px] border border-[#E8E1D6] bg-white shadow-[4px_5px_0px_#EDE5D9] sm:mt-11">
          <div className="flex flex-col gap-5 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-7">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#FFDDCB] text-xl font-extrabold text-[#A94F36]">
                ◎
              </div>

              <div className="min-w-0">
                <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-[#A94F36]">
                  Attendance setup
                </p>

                <h2 className="mt-2 text-lg font-extrabold text-[#25392F] sm:text-xl">
                  Have you registered your face?
                </h2>

                <p className="mt-2 max-w-2xl text-sm leading-6 text-[#69786E]">
                  Complete face enrollment before using face-based
                  attendance recognition. Follow the enrollment
                  instructions and provide consent when prompted.
                </p>
              </div>
            </div>

            <Link
              href="/student/biometrics"
              className="inline-flex min-h-12 shrink-0 items-center justify-center rounded-xl bg-[#347451] px-5 py-3 text-center text-sm font-extrabold text-white transition hover:bg-[#24563B] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#347451] focus-visible:ring-offset-2"
            >
              Go to enrollment →
            </Link>
          </div>
        </section>

        {/* Student information */}
        <section className="mt-10 rounded-[24px] border border-[#E8E1D6] bg-white p-5 shadow-[4px_5px_0px_#EDE5D9] sm:mt-11 sm:p-7">
          <div className="flex flex-col gap-6">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[#CDEED4] text-xl font-extrabold text-[#24563B]">
                {initials || "S"}
              </div>

              <div>
                <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-[#A94F36]">
                  Account details
                </p>
                <h2 className="mt-1 text-xl font-extrabold text-[#25392F]">
                  Your profile
                </h2>
                <p className="mt-1 text-sm text-[#69786E]">
                  Your student account information.
                </p>
              </div>

              <span className="ml-auto hidden shrink-0 rounded-full border border-[#D7E8D5] bg-[#F0F7EF] px-3 py-2 text-xs font-bold text-[#347451] sm:inline-flex">
                Student account
              </span>
            </div>

            <div className="grid grid-cols-1 gap-5 border-t border-[#EEE7DC] pt-5 sm:grid-cols-2">
              <div className="min-w-0">
                <p className="text-xs font-extrabold uppercase tracking-[0.12em] text-[#8A948C]">
                  Full name
                </p>
                <p className="mt-2 break-words text-sm font-bold text-[#25392F]">
                  {displayName}
                </p>
              </div>

              <div className="min-w-0">
                <p className="text-xs font-extrabold uppercase tracking-[0.12em] text-[#8A948C]">
                  Email address
                </p>
                <p className="mt-2 break-all text-sm font-bold text-[#25392F]">
                  {user.email || "Not provided"}
                </p>
              </div>
            </div>

            <span className="inline-flex w-fit rounded-full border border-[#D7E8D5] bg-[#F0F7EF] px-3 py-2 text-xs font-bold text-[#347451] sm:hidden">
              Student account
            </span>
          </div>
        </section>

        {/* Footer */}
        <footer className="mt-10 border-t border-[#E8E1D6] py-6 sm:mt-11">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm font-extrabold text-[#347451]">
              SmartAttend
            </p>

            <p className="text-xs leading-5 text-[#69786E]">
              Smart attendance management for students and teachers.
            </p>
          </div>
        </footer>
      </main>
    </div>
  );
}