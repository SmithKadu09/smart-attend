
"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import API_URL from "@/lib/api";

const STATUS_STYLES = {
  PRESENT: "bg-[#DDF3D9] text-[#347451]",
  ABSENT: "bg-[#FADDE2] text-[#A44959]",
  REVIEW: "bg-[#FFE8B8] text-[#8D641C]",
  UNKNOWN: "bg-[#E8E4F7] text-[#7550A5]",
  NOT_DETECTED: "bg-[#FFDDCB] text-[#A94F36]",
};

export default function StudentAttendancePage() {
  const router = useRouter();

  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  const loadHistory = useCallback(async () => {
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
      const response = await fetch(`${API_URL}/attendance/my-history`, {
        headers: { Authorization: `Bearer ${token}` },
        cache: "no-store",
      });

      if (response.status === 401 || response.status === 403) {
        sessionStorage.removeItem("smartattend_token");
        sessionStorage.removeItem("smartattend_user");
        router.replace("/login");
        return;
      }

      if (!response.ok) {
        throw new Error("Unable to load your attendance history.");
      }

      const data = await response.json();

      if (!Array.isArray(data.records)) {
        throw new Error("Unexpected attendance data received.");
      }

      setRecords(data.records);
    } catch (err) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  const filteredRecords = useMemo(() => {
    const query = search.trim().toLowerCase();

    return records.filter((record) => {
      const matchesSearch =
        (record.classroom_name || "").toLowerCase().includes(query) ||
        (record.subject || "").toLowerCase().includes(query);

      return (
        matchesSearch &&
        (statusFilter === "ALL" || record.status === statusFilter)
      );
    });
  }, [records, search, statusFilter]);

  const stats = useMemo(() => {
    const present = records.filter((r) => r.status === "PRESENT").length;
    const absent = records.filter((r) => r.status === "ABSENT").length;
    const review = records.filter((r) =>
      ["REVIEW", "UNKNOWN", "NOT_DETECTED"].includes(r.status)
    ).length;

    return {
      total: records.length,
      present,
      absent,
      review,
      rate: records.length
        ? Math.round((present / records.length) * 100)
        : 0,
    };
  }, [records]);

  function logout() {
    sessionStorage.removeItem("smartattend_token");
    sessionStorage.removeItem("smartattend_user");
    router.replace("/login");
  }

  return (
    <main className="min-h-screen bg-[#FFF8ED] px-4 py-5 text-[#3D3548] sm:px-7 lg:px-10">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <header className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <Link
            href="/student/dashboard"
            className="flex items-center gap-3"
          >
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
              href="/student/classrooms"
              className="rounded-xl px-4 py-2.5 text-sm font-bold text-[#776A82] transition hover:bg-white"
            >
              My Classrooms
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
        <section className="relative mb-8 overflow-hidden rounded-[30px] border-2 border-white bg-[#E5D8FB] p-6 shadow-[0_8px_0_#D0BFEF] sm:p-9 lg:p-10">
          <div className="pointer-events-none absolute -right-5 -top-12 h-48 w-48 rounded-full border-[24px] border-white/30" />
          <div className="pointer-events-none absolute bottom-[-45px] right-36 h-32 w-32 rounded-full bg-[#CDEED4]/70" />

          <div className="relative z-10 max-w-2xl">
            <span className="inline-flex rounded-full border-2 border-white/80 bg-white/60 px-3 py-1.5 text-xs font-black tracking-wide text-[#7550A5]">
              YOUR LEARNING JOURNEY
            </span>
            <h1 className="mt-4 text-3xl font-black leading-tight tracking-tight text-[#493A62] sm:text-4xl lg:text-5xl">
              Attendance
              <br className="sm:hidden" /> history.
            </h1>
            <p className="mt-3 max-w-lg text-sm font-medium leading-6 text-[#6D5B85] sm:text-base">
              Every class counts. Keep track of your progress and see your
              attendance journey in one place.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href="/student/classrooms"
                className="clay-button inline-flex items-center justify-center rounded-2xl bg-[#CDEED4] px-5 py-3 font-black text-[#347451] transition hover:-translate-y-0.5"
              >
                Explore classrooms →
              </Link>
              <button
                onClick={loadHistory}
                disabled={loading}
                className="rounded-2xl border-2 border-white bg-white/75 px-5 py-3 font-black text-[#655375] shadow-[0_4px_0_rgba(117,80,165,0.12)] transition hover:-translate-y-0.5 disabled:opacity-60"
              >
                {loading ? "Loading..." : "↻ Refresh"}
              </button>
            </div>
          </div>
        </section>

        {/* Stats */}
        <section className="mb-9">
          <div className="mb-4 flex items-end justify-between gap-3">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.16em] text-[#9A8B9F]">
                YOUR PROGRESS
              </p>
              <h2 className="mt-1 text-2xl font-black tracking-tight">
                At a glance
              </h2>
            </div>
            <span className="hidden rounded-full bg-white px-3 py-1.5 text-xs font-bold text-[#897B90] shadow-sm sm:block">
              Based on saved records
            </span>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard
              label="Total records"
              value={loading ? "—" : stats.total}
              detail="Attendance entries"
              icon="▦"
              color="lavender"
            />
            <StatCard
              label="Present"
              value={loading ? "—" : stats.present}
              detail="Marked present"
              icon="✓"
              color="sage"
            />
            <StatCard
              label="Absent"
              value={loading ? "—" : stats.absent}
              detail="Marked absent"
              icon="−"
              color="pink"
            />
            <StatCard
              label="Needs attention"
              value={loading ? "—" : stats.review}
              detail="Review or unmatched"
              icon="!"
              color="butter"
            />
          </div>
        </section>

        {/* Attendance records */}
        <section className="rounded-[28px] border-2 border-white bg-[#FFFEFA] p-5 shadow-[0_7px_0_#EEE3D5] sm:p-7">
          <div className="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-center">
            <div>
              <span className="text-xs font-black uppercase tracking-[0.16em] text-[#A18EA6]">
                YOUR RECORDS
              </span>
              <h2 className="mt-1 text-2xl font-black tracking-tight">
                Class attendance
              </h2>
              <p className="mt-2 text-sm font-medium text-[#95889A]">
                Browse your saved attendance by class and status.
              </p>
            </div>
            <div className="rounded-2xl border-2 border-[#F0E7F6] bg-[#F7F0FC] px-4 py-3">
              <p className="text-xs font-bold text-[#927BA7]">RECORDS SHOWN</p>
              <p className="mt-1 text-xl font-black text-[#7550A5]">
                {loading ? "—" : filteredRecords.length}
              </p>
            </div>
          </div>

          <div className="mb-6 grid gap-3 sm:grid-cols-2">
            <div>
              <label
                htmlFor="attendance-search"
                className="mb-2 block text-xs font-black text-[#807387]"
              >
                SEARCH CLASSROOM
              </label>
              <input
                id="attendance-search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Enter classroom or subject..."
                className="clay-input w-full rounded-2xl border-2 border-[#EDE3D7] bg-[#FFF9F0] px-4 py-3 text-sm font-semibold outline-none placeholder:text-[#B5A8B8] focus:border-[#C8B3EE]"
              />
            </div>

            <div>
              <label
                htmlFor="attendance-status"
                className="mb-2 block text-xs font-black text-[#807387]"
              >
                FILTER BY STATUS
              </label>
              <select
                id="attendance-status"
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value)}
                className="clay-input w-full rounded-2xl border-2 border-[#EDE3D7] bg-[#FFF9F0] px-4 py-3 text-sm font-bold outline-none focus:border-[#C8B3EE]"
              >
                <option value="ALL">All statuses</option>
                <option value="PRESENT">Present</option>
                <option value="ABSENT">Absent</option>
                <option value="REVIEW">Under review</option>
                <option value="UNKNOWN">Unknown</option>
                <option value="NOT_DETECTED">Not detected</option>
              </select>
            </div>
          </div>

          {error ? (
            <div className="rounded-2xl border-2 border-[#F3C9C8] bg-[#FFF0EE] p-6 text-center">
              <h3 className="text-lg font-black text-[#A44936]">
                Oops! We couldn't load your records.
              </h3>
              <p className="mt-2 text-sm font-medium text-[#A76B65]">
                {error}
              </p>
              <button
                onClick={loadHistory}
                className="mt-4 rounded-xl bg-[#FFDDCB] px-5 py-3 font-black text-[#A94F36] shadow-[0_4px_0_#EABBA3]"
              >
                Try again
              </button>
            </div>
          ) : loading ? (
            <div className="grid gap-4">
              {[1, 2, 3].map((item) => (
                <div
                  key={item}
                  className="h-24 animate-pulse rounded-2xl border-2 border-white bg-[#F2EDE8]"
                />
              ))}
            </div>
          ) : filteredRecords.length === 0 ? (
            <div className="rounded-[24px] border-2 border-dashed border-[#E9DCEB] bg-[#FBF6FC] px-5 py-12 text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-[22px] border-2 border-white bg-[#E5D8FB] text-2xl font-black text-[#7550A5] shadow-[0_5px_0_#D0BFEF]">
                ▦
              </div>
              <h3 className="mt-5 text-xl font-black">
                {records.length === 0
                  ? "Your story starts here"
                  : "No matching records"}
              </h3>
              <p className="mx-auto mt-2 max-w-md text-sm font-medium leading-6 text-[#96889A]">
                {records.length === 0
                  ? "Once your teacher processes an attendance session, your saved record will appear here."
                  : "Try another search or change the selected status."}
              </p>
              {records.length > 0 && (
                <button
                  onClick={() => {
                    setSearch("");
                    setStatusFilter("ALL");
                  }}
                  className="mt-4 rounded-xl bg-[#E5D8FB] px-4 py-2.5 font-black text-[#7550A5] shadow-[0_3px_0_#D0BFEF]"
                >
                  Clear filters
                </button>
              )}
              {records.length === 0 && (
                <Link
                  href="/student/classrooms"
                  className="mt-5 inline-flex rounded-2xl bg-[#CDEED4] px-5 py-3 font-black text-[#347451] shadow-[0_4px_0_#A6D4B1]"
                >
                  View my classrooms →
                </Link>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredRecords.map((record, index) => (
                <AttendanceCard
                  key={`${record.session_id}-${index}`}
                  record={record}
                  index={index}
                />
              ))}
            </div>
          )}

          {!loading && !error && filteredRecords.length > 0 && (
            <div className="mt-5 flex flex-wrap items-center justify-between gap-2 border-t-2 border-dashed border-[#F0E7DC] pt-5 text-xs font-bold text-[#A092A1]">
              <span>
                Showing {filteredRecords.length} of {records.length} records
              </span>
              <span>Updated from your saved attendance history</span>
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

function StatCard({ label, value, detail, icon, color }) {
  const themes = {
    lavender: {
      bg: "bg-[#E5D8FB]",
      text: "text-[#7550A5]",
      shadow: "shadow-[0_6px_0_#D0BFEF]",
      icon: "bg-white/70",
    },
    sage: {
      bg: "bg-[#CDEED4]",
      text: "text-[#347451]",
      shadow: "shadow-[0_6px_0_#A6D4B1]",
      icon: "bg-white/70",
    },
    pink: {
      bg: "bg-[#F8D8E4]",
      text: "text-[#A4496B]",
      shadow: "shadow-[0_6px_0_#E9BCCD]",
      icon: "bg-white/70",
    },
    butter: {
      bg: "bg-[#FFE5A9]",
      text: "text-[#8D641C]",
      shadow: "shadow-[0_6px_0_#EED18B]",
      icon: "bg-white/70",
    },
  };

  const theme = themes[color];

  return (
    <article
      className={`rounded-[24px] border-2 border-white ${theme.bg} p-5 transition duration-200 hover:-translate-y-1 ${theme.shadow}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className={`text-sm font-black ${theme.text}`}>{label}</p>
          <p className={`mt-4 text-4xl font-black tracking-tight ${theme.text}`}>
            {value}
          </p>
        </div>
        <div
          className={`flex h-12 w-12 items-center justify-center rounded-2xl border-2 border-white text-xl font-black ${theme.text} ${theme.icon}`}
        >
          {icon}
        </div>
      </div>
      <p className={`mt-3 text-xs font-bold opacity-75 ${theme.text}`}>
        {detail}
      </p>
    </article>
  );
}

function AttendanceCard({ record, index }) {
  const accents = [
    {
      bg: "bg-[#F4EDFF]",
      border: "border-[#E6D8FB]",
      icon: "bg-[#E5D8FB] text-[#7550A5]",
    },
    {
      bg: "bg-[#ECF8EC]",
      border: "border-[#D5EED5]",
      icon: "bg-[#CDEED4] text-[#347451]",
    },
    {
      bg: "bg-[#FFF1E8]",
      border: "border-[#F9DFCF]",
      icon: "bg-[#FFDDCB] text-[#A94F36]",
    },
    {
      bg: "bg-[#FFF6D9]",
      border: "border-[#F5E9B9]",
      icon: "bg-[#FFE5A9] text-[#8D641C]",
    },
  ];

  const accent = accents[index % accents.length];
  const statusStyle =
    STATUS_STYLES[record.status] || "bg-[#EDE8F1] text-[#6F6379]";

  const statusLabel = {
    PRESENT: "Present",
    ABSENT: "Absent",
    REVIEW: "Under review",
    UNKNOWN: "Unknown",
    NOT_DETECTED: "Not detected",
  }[record.status] || record.status;

  return (
    <article
      className={`rounded-[22px] border-2 ${accent.border} ${accent.bg} p-4 transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_5px_0_rgba(105,83,125,0.08)] sm:p-5`}
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <div
          className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border-2 border-white text-xl font-black ${accent.icon}`}
        >
          {(record.classroom_name || "C").trim().charAt(0).toUpperCase()}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="break-words text-base font-black text-[#44384F] sm:text-lg">
              {record.classroom_name || "Classroom"}
            </h3>
            <span
              className={`rounded-full px-3 py-1 text-xs font-black ${statusStyle}`}
            >
              {statusLabel}
            </span>
          </div>
          <p className="mt-1 text-sm font-semibold text-[#8D7D94]">
            {record.subject || "Subject not specified"}
          </p>
          <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs font-bold text-[#96889A]">
            <span>{formatDate(record.session_started_at)}</span>
            <span>Marked: {formatTime(record.marked_at)}</span>
          </div>
        </div>

        <div className="rounded-2xl border-2 border-white/80 bg-white/60 px-4 py-3 sm:min-w-[120px] sm:text-center">
          <p className="text-[10px] font-black uppercase tracking-wider text-[#A092A1]">
            Confidence
          </p>
          <p className="mt-1 text-xl font-black text-[#5C4A6B]">
            {record.confidence == null
              ? "—"
              : `${Math.round(record.confidence * 100)}%`}
          </p>
        </div>
      </div>
    </article>
  );
}

function formatDate(value) {
  if (!value) return "—";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";

  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
}

function formatTime(value) {
  if (!value) return "Not marked";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";

  return new Intl.DateTimeFormat("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  }).format(date);
}
