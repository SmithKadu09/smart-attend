
"use client";

import { useCallback, useEffect, useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

import API_URL from "@/lib/api";

const buttonBase =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold transition duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#347451] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60";

const primaryButton =
  `${buttonBase} bg-[#347451] text-white shadow-[0_3px_0_#24563B] hover:-translate-y-0.5 hover:bg-[#2A6043] active:translate-y-0`;

const secondaryButton =
  `${buttonBase} border border-[#E8E1D6] bg-white text-[#347451] hover:bg-[#F8F5EF]`;

async function apiRequest(path, token) {
  const response = await fetch(`${API_URL}${path}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
    },
    cache: "no-store",
  });

  let data;

  try {
    data = await response.json();
  } catch {
    data = null;
  }

  if (!response.ok) {
    const detail = data?.detail;
    const message =
      typeof detail === "string"
        ? detail
        : detail != null
          ? JSON.stringify(detail, null, 2)
          : `Request failed with status ${response.status}`;

    throw new Error(message);
  }

  return data;
}

function formatDateTime(value) {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "—";

  return date.toLocaleString("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function formatPercentage(value) {
  if (value === null || value === undefined || value === "") {
    return "—";
  }

  const number = Number(value);

  if (!Number.isFinite(number)) return "—";

  const percentage =
    number >= 0 && number <= 1 ? number * 100 : number;

  return `${percentage.toFixed(1)}%`;
}

function isValidUUID(value) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    value || ""
  );
}

function Icon({ name, size = 20 }) {
  const paths = {
    arrow: <path d="M5 12h14m-7-7 7 7-7 7" />,
    back: <path d="m15 18-6-6 6-6" />,
    refresh: (
      <>
        <path d="M20 7v5h-5" />
        <path d="M4 17v-5h5" />
        <path d="M5.6 9a7 7 0 0 1 11.7-2L20 12" />
        <path d="M4 12l2.7 5a7 7 0 0 0 11.7-2" />
      </>
    ),
    calendar: (
      <>
        <rect x="3" y="5" width="18" height="16" rx="2" />
        <path d="M16 3v4M8 3v4M3 10h18" />
      </>
    ),
    users: (
      <>
        <circle cx="9" cy="8" r="3" />
        <path d="M3 20v-2a6 6 0 0 1 12 0v2" />
        <path d="M16 5.5a3 3 0 0 1 0 5.8M18 14a5 5 0 0 1 3 4.5V20" />
      </>
    ),
    check: <path d="m5 12 4 4L19 6" />,
    alert: (
      <>
        <path d="M12 3 2.8 20h18.4L12 3Z" />
        <path d="M12 9v4m0 3h.01" />
      </>
    ),
    chart: (
      <>
        <path d="M3 3v18h18" />
        <path d="m7 14 4-4 4 3 5-7" />
      </>
    ),
    file: (
      <>
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z" />
        <path d="M14 2v6h6M8 13h8M8 17h8" />
      </>
    ),
  };

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className="shrink-0"
    >
      {paths[name] || paths.file}
    </svg>
  );
}

function SectionHeading({ eyebrow, title, description }) {
  return (
    <div className="min-w-0">
      {eyebrow && (
        <p className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-[#A94F36] sm:text-xs">
          {eyebrow}
        </p>
      )}
      <h2 className="mt-1.5 text-lg font-extrabold tracking-tight text-[#25392F] sm:text-xl">
        {title}
      </h2>
      {description && (
        <p className="mt-1.5 text-sm leading-6 text-[#69786E]">
          {description}
        </p>
      )}
    </div>
  );
}

function AttendanceStatusBadge({ status }) {
  const normalizedStatus = String(status || "UNKNOWN")
    .toUpperCase()
    .replaceAll(" ", "_");

  const config = {
    PRESENT: {
      label: "Present",
      classes: "bg-[#CDEED4] text-[#286342] ring-[#B8D8BF]",
      dot: "bg-[#347451]",
    },
    ABSENT: {
      label: "Absent",
      classes: "bg-[#FFDDCB] text-[#813A28] ring-[#E9B9A2]",
      dot: "bg-[#A94F36]",
    },
    REVIEW: {
      label: "Under review",
      classes: "bg-[#FFECC2] text-[#805C17] ring-[#E9D69D]",
      dot: "bg-[#B17B1F]",
    },
    UNDER_REVIEW: {
      label: "Under review",
      classes: "bg-[#FFECC2] text-[#805C17] ring-[#E9D69D]",
      dot: "bg-[#B17B1F]",
    },
    UNKNOWN: {
      label: "Unknown",
      classes: "bg-[#F0EBE2] text-[#52645A] ring-[#E8E1D6]",
      dot: "bg-[#879188]",
    },
    NOT_DETECTED: {
      label: "Not detected",
      classes: "bg-[#DFEAFB] text-[#365A8B] ring-[#C8D9F4]",
      dot: "bg-[#537BB4]",
    },
  };

  const selected = config[normalizedStatus] || {
    label: String(status || "Unknown").replaceAll("_", " "),
    classes: "bg-[#F0EBE2] text-[#52645A] ring-[#E8E1D6]",
    dot: "bg-[#879188]",
  };

  return (
    <span
      className={`inline-flex max-w-full items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold ring-1 ring-inset ${selected.classes}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${selected.dot}`} />
      {selected.label}
    </span>
  );
}

function SummaryCard({ title, value, description, color = "neutral", icon }) {
  const styles = {
    neutral: {
      card: "border-[#E8E1D6] bg-white",
      icon: "bg-[#F0EBE2] text-[#52645A]",
      value: "text-[#25392F]",
    },
    green: {
      card: "border-[#C7E4CD] bg-[#F5FBF5]",
      icon: "bg-[#CDEED4] text-[#347451]",
      value: "text-[#347451]",
    },
    red: {
      card: "border-[#E9B9A2] bg-[#FFF8F4]",
      icon: "bg-[#FFDDCB] text-[#A94F36]",
      value: "text-[#A94F36]",
    },
    yellow: {
      card: "border-[#E9D69D] bg-[#FFFCF3]",
      icon: "bg-[#FFECC2] text-[#8D641C]",
      value: "text-[#8D641C]",
    },
    blue: {
      card: "border-[#C8D9F4] bg-[#F7FAFF]",
      icon: "bg-[#DFEAFB] text-[#365A8B]",
      value: "text-[#365A8B]",
    },
  };

  const style = styles[color] || styles.neutral;

  return (
    <article
      className={`rounded-2xl border p-4 shadow-[2px_3px_0px_#EDE5D9] transition duration-200 hover:-translate-y-0.5 sm:p-5 ${style.card}`}
    >
      <div className="flex items-start justify-between gap-3">
        <p className="text-sm font-semibold leading-5 text-[#52645A]">
          {title}
        </p>
        <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${style.icon}`}>
          <Icon name={icon} size={19} />
        </span>
      </div>

      <p className={`mt-4 text-3xl font-extrabold tracking-tight ${style.value}`}>
        {value ?? 0}
      </p>

      {description && (
        <p className="mt-2 text-xs leading-5 text-[#69786E]">
          {description}
        </p>
      )}
    </article>
  );
}

function EmptyState({ title, description }) {
  return (
    <div className="px-5 py-12 text-center sm:py-14">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#CDEED4] text-[#347451]">
        <Icon name="file" size={25} />
      </div>
      <h3 className="mt-4 font-extrabold text-[#25392F]">{title}</h3>
      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[#69786E]">
        {description}
      </p>
    </div>
  );
}

function AttendanceSummaryContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const sessionId =
    searchParams.get("session_id") ||
    searchParams.get("sessionId") ||
    "";

  const [summary, setSummary] = useState(null);
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [refreshing, setRefreshing] = useState(false);

  const loadSummary = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);

    setError("");

    try {
      if (!sessionId || !isValidUUID(sessionId)) {
        throw new Error(
          "A valid attendance session ID is missing from the URL. Return to the teacher dashboard and open an attendance session."
        );
      }

      const token = sessionStorage.getItem("smartattend_token");
      const storedUser = sessionStorage.getItem("smartattend_user");

      if (!token || !storedUser) {
        router.replace("/login");
        return;
      }

      let user;

      try {
        user = JSON.parse(storedUser);
      } catch {
        sessionStorage.removeItem("smartattend_user");
        sessionStorage.removeItem("smartattend_token");
        router.replace("/login");
        return;
      }

      if (user?.role?.toLowerCase() !== "teacher") {
        router.replace("/login");
        return;
      }

      const encodedId = encodeURIComponent(sessionId);

      const [summaryData, recordsData] = await Promise.all([
        apiRequest(`/attendance/sessions/${encodedId}/summary`, token),
        apiRequest(`/attendance/sessions/${encodedId}/records`, token),
      ]);

      setSummary(summaryData);
      setRecords(
        Array.isArray(recordsData?.records)
          ? recordsData.records
          : Array.isArray(recordsData)
            ? recordsData
            : []
      );
    } catch (err) {
      console.error("Failed to load attendance summary:", err);
      setSummary(null);
      setRecords([]);
      setError(
        err instanceof Error
          ? err.message
          : "Unable to load the attendance summary."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [sessionId, router]);

  useEffect(() => {
    loadSummary();
  }, [loadSummary]);

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#FFF8ED] px-4">
        <div className="text-center">
          <div className="mx-auto h-11 w-11 animate-spin rounded-full border-4 border-[#E8E1D6] border-t-[#347451]" />
          <p className="mt-4 text-sm font-medium text-[#52645A]">
            Loading attendance summary...
          </p>
        </div>
      </main>
    );
  }

  if (error || !summary) {
    return (
      <main className="min-h-screen bg-[#FFF8ED] px-4 py-8 sm:px-6 sm:py-12">
        <div className="mx-auto max-w-3xl rounded-3xl border border-[#E8E1D6] bg-white p-5 shadow-[4px_5px_0px_#EDE5D9] sm:p-8">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#FFDDCB] text-[#A94F36]">
            <Icon name="alert" size={24} />
          </div>

          <p className="mt-5 text-xs font-extrabold uppercase tracking-[0.18em] text-[#A94F36]">
            Attendance activity
          </p>
          <h1 className="mt-2 text-2xl font-extrabold tracking-tight text-[#25392F] sm:text-3xl">
            Unable to load attendance summary
          </h1>
          <p className="mt-3 whitespace-pre-wrap break-words text-sm leading-6 text-[#69786E]">
            {error || "The attendance session could not be found."}
          </p>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              onClick={() => loadSummary()}
              className={primaryButton}
            >
              <Icon name="refresh" size={17} />
              Try again
            </button>
            <Link href="/teacher/dashboard" className={secondaryButton}>
              <Icon name="back" size={17} />
              Back to dashboard
            </Link>
          </div>
        </div>
      </main>
    );
  }

  const totalRecords = summary.total_records ?? records.length;
  const present = summary.present ?? 0;
  const absent = summary.absent ?? 0;
  const underReview = summary.under_review ?? 0;
  const unknown = summary.unknown ?? 0;
  const notDetected = summary.not_detected ?? 0;

  const attendanceRate =
    totalRecords > 0
      ? ((present / totalRecords) * 100).toFixed(1)
      : "0.0";

  const breakdown = [
    {
      label: "Unknown",
      value: unknown,
      bg: "bg-[#F0EBE2]",
      text: "text-[#52645A]",
    },
    {
      label: "Not detected",
      value: notDetected,
      bg: "bg-[#DFEAFB]",
      text: "text-[#365A8B]",
    },
    {
      label: "Under review",
      value: underReview,
      bg: "bg-[#FFECC2]",
      text: "text-[#805C17]",
    },
  ];

  return (
    <main className="min-h-screen bg-[#FFF8ED] text-[#25392F]">
      {/* Navigation */}
      <header className="sticky top-0 z-20 border-b border-[#E8E1D6] bg-[#FFF8ED]/95 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3 sm:px-6 lg:px-8">
          <Link href="/teacher/dashboard" className="flex min-w-0 items-center gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[#CDEED4] text-[#347451] shadow-[2px_3px_0px_#B2DCC0]">
              <Icon name="calendar" size={22} />
            </span>
            <span className="min-w-0">
              <span className="block truncate text-base font-extrabold tracking-tight sm:text-lg">
                SmartAttend
              </span>
              <span className="block text-[10px] font-bold uppercase tracking-[0.16em] text-[#69786E]">
                Teacher portal
              </span>
            </span>
          </Link>

          <Link href="/teacher/dashboard" className={secondaryButton}>
            <Icon name="back" size={16} />
            <span className="hidden sm:inline">Dashboard</span>
            <span className="sm:hidden">Back</span>
          </Link>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-9 lg:px-8">
        {/* Page heading */}
        <section className="relative overflow-hidden rounded-[26px] bg-[#DCEFE0] p-5 shadow-[4px_5px_0px_#C4DEC9] sm:p-8 lg:p-9">
          <div className="pointer-events-none absolute -right-10 -top-14 h-40 w-40 rounded-full border-[22px] border-white/30 sm:h-52 sm:w-52" />

          <div className="relative z-10 flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
            <div className="max-w-2xl">
              <span className="inline-flex rounded-full border border-[#B8D8BF] bg-white/70 px-3 py-1.5 text-[10px] font-extrabold tracking-[0.15em] text-[#347451]">
                ATTENDANCE ACTIVITY
              </span>

              <h1 className="mt-4 text-2xl font-extrabold tracking-tight sm:text-3xl lg:text-4xl">
                Attendance Summary
                <span className="text-[#A94F36]">.</span>
              </h1>

              <p className="mt-3 max-w-xl text-sm leading-6 text-[#526D59] sm:text-base sm:leading-7">
                Review session statistics, monitor recognition outcomes, and
                check each student&apos;s attendance status.
              </p>
            </div>

            <button
              type="button"
              onClick={() => loadSummary(true)}
              disabled={refreshing}
              className={`${secondaryButton} shrink-0 border-[#B8D8BF]`}
            >
              <span className={refreshing ? "animate-spin" : ""}>
                <Icon name="refresh" size={17} />
              </span>
              {refreshing ? "Refreshing..." : "Refresh summary"}
            </button>
          </div>
        </section>

        {/* Session details */}
        <section className="mt-8 rounded-3xl border border-[#E8E1D6] bg-white p-5 shadow-[3px_4px_0px_#EDE5D9] sm:p-6">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0">
              <p className="text-xs font-extrabold uppercase tracking-[0.15em] text-[#A94F36]">
                Session details
              </p>
              <h2 className="mt-2 text-lg font-extrabold">Session information</h2>
              <p className="mt-2 break-all font-mono text-xs leading-5 text-[#69786E] sm:text-sm">
                {summary.session_id || sessionId}
              </p>
            </div>

            <div className="flex items-center gap-4 rounded-2xl bg-[#F5FBF5] p-4 sm:min-w-48">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#CDEED4] text-[#347451]">
                <Icon name="chart" size={22} />
              </div>
              <div>
                <p className="text-xs font-semibold text-[#52645A]">
                  Attendance rate
                </p>
                <p className="mt-1 text-2xl font-extrabold text-[#347451]">
                  {attendanceRate}%
                </p>
              </div>
            </div>
          </div>

          <div className="mt-5 grid grid-cols-1 gap-3 border-t border-[#F0EBE2] pt-5 sm:grid-cols-2">
            <div className="rounded-2xl bg-[#FFFDF8] p-4">
              <p className="text-xs font-semibold text-[#69786E]">Started at</p>
              <p className="mt-2 text-sm font-bold text-[#25392F]">
                {formatDateTime(summary.started_at)}
              </p>
            </div>
            <div className="rounded-2xl bg-[#FFFDF8] p-4">
              <p className="text-xs font-semibold text-[#69786E]">Completed at</p>
              <p className="mt-2 text-sm font-bold text-[#25392F]">
                {formatDateTime(summary.completed_at ?? summary.finalized_at)}
              </p>
            </div>
          </div>
        </section>

        {/* Overview cards */}
        <section className="mt-10">
          <SectionHeading
            eyebrow="At a glance"
            title="Session overview"
            description="A quick breakdown of attendance for this session."
          />

          <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <SummaryCard
              title="Total records"
              value={totalRecords}
              description="Attendance records in this session"
              color="neutral"
              icon="users"
            />
            <SummaryCard
              title="Present"
              value={present}
              description="Students marked present"
              color="green"
              icon="check"
            />
            <SummaryCard
              title="Absent"
              value={absent}
              description="Students marked absent"
              color="red"
              icon="users"
            />
            <SummaryCard
              title="Under review"
              value={underReview}
              description="Records requiring verification"
              color="yellow"
              icon="alert"
            />
          </div>
        </section>

        {/* Recognition breakdown */}
        <section className="mt-10 rounded-3xl border border-[#E8E1D6] bg-white p-5 shadow-[3px_4px_0px_#EDE5D9] sm:p-6">
          <SectionHeading
            eyebrow="Recognition details"
            title="Recognition breakdown"
            description="Additional recognition outcomes that may need attention."
          />

          <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
            {breakdown.map((item) => (
              <div
                key={item.label}
                className="flex items-center justify-between gap-3 rounded-2xl border border-[#E8E1D6] bg-[#FFFDF8] p-4"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${item.bg} ${item.text}`}>
                    <Icon name="file" size={19} />
                  </span>
                  <p className="text-sm font-bold text-[#52645A]">{item.label}</p>
                </div>
                <p className={`text-2xl font-extrabold ${item.text}`}>{item.value}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Student attendance */}
        <section className="mt-10 overflow-hidden rounded-3xl border border-[#E8E1D6] bg-white shadow-[3px_4px_0px_#EDE5D9]">
          <div className="flex flex-col gap-4 border-b border-[#E8E1D6] p-5 sm:p-6 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <SectionHeading
                eyebrow="Student records"
                title="Student attendance"
                description="Review each recorded student and their attendance status."
              />
              <span className="mt-3 inline-flex rounded-full bg-[#F0EBE2] px-3 py-1.5 text-xs font-bold text-[#52645A]">
                {records.length} {records.length === 1 ? "student" : "students"}
              </span>
            </div>

            <Link
              href={`/teacher/attendance/review?session_id=${encodeURIComponent(sessionId)}`}
              className={`${primaryButton} w-full sm:w-auto`}
            >
              <Icon name="file" size={17} />
              Review &amp; edit attendance
              <Icon name="arrow" size={16} />
            </Link>
          </div>

          {records.length === 0 ? (
            <EmptyState
              title="No attendance records found"
              description="This session does not currently have any student attendance records to display."
            />
          ) : (
            <>
              {/* Mobile-friendly record cards */}
              <div className="space-y-3 p-4 md:hidden">
                {records.map((record, index) => (
                  <article
                    key={
                      record.id ||
                      record.student_id ||
                      `${record.student_number || "student"}-${index}`
                    }
                    className="rounded-2xl border border-[#E8E1D6] bg-[#FFFDF8] p-4"
                  >
                    <div className="flex items-start gap-3">
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#CDEED4] text-sm font-extrabold text-[#347451]">
                        {index + 1}
                      </span>
                      <div className="min-w-0 flex-1">
                        <h3 className="break-words font-extrabold text-[#25392F]">
                          {record.student_name || "Name unavailable"}
                        </h3>
                        <p className="mt-1 break-words text-xs text-[#69786E]">
                          Student number: {record.student_number || "—"}
                        </p>
                      </div>
                    </div>

                    <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-[#F0EBE2] pt-3">
                      <AttendanceStatusBadge status={record.status} />
                      <span className="text-sm font-bold text-[#52645A]">
                        Confidence: {formatPercentage(record.confidence)}
                      </span>
                    </div>

                    <div className="mt-3 text-xs leading-5 text-[#69786E]">
                      <span className="font-semibold">Marked at: </span>
                      {formatDateTime(record.marked_at)}
                    </div>
                  </article>
                ))}
              </div>

              {/* Desktop and tablet table */}
              <div className="hidden overflow-x-auto md:block">
                <table className="w-full min-w-[760px] border-collapse text-left">
                  <thead>
                    <tr className="bg-[#F8F5EF] text-[10px] uppercase tracking-[0.12em] text-[#69786E]">
                      <th className="px-5 py-4 font-extrabold">#</th>
                      <th className="px-5 py-4 font-extrabold">Student name</th>
                      <th className="px-5 py-4 font-extrabold">Student number</th>
                      <th className="px-5 py-4 font-extrabold">Status</th>
                      <th className="px-5 py-4 font-extrabold">Confidence</th>
                      <th className="px-5 py-4 font-extrabold">Marked at</th>
                    </tr>
                  </thead>

                  <tbody>
                    {records.map((record, index) => (
                      <tr
                        key={
                          record.id ||
                          record.student_id ||
                          `${record.student_number || "student"}-${index}`
                        }
                        className="border-t border-[#F0EBE2] transition-colors hover:bg-[#FFFDF8]"
                      >
                        <td className="px-5 py-4 text-sm text-[#69786E]">
                          {index + 1}
                        </td>
                        <td className="px-5 py-4">
                          <p className="font-bold text-[#25392F]">
                            {record.student_name || "Name unavailable"}
                          </p>
                        </td>
                        <td className="px-5 py-4 text-sm text-[#69786E]">
                          {record.student_number || "—"}
                        </td>
                        <td className="px-5 py-4">
                          <AttendanceStatusBadge status={record.status} />
                        </td>
                        <td className="px-5 py-4 text-sm font-semibold text-[#52645A]">
                          {formatPercentage(record.confidence)}
                        </td>
                        <td className="px-5 py-4 text-sm text-[#69786E]">
                          {formatDateTime(record.marked_at)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}

          <div className="border-t border-[#E8E1D6] bg-[#F8F5EF] px-5 py-4 text-xs leading-5 text-[#69786E] sm:px-6">
            Only students returned by the attendance records API appear in this table.
          </div>
        </section>

        {/* Footer */}
        <footer className="mt-10 flex flex-col gap-4 border-t border-[#E8E1D6] py-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-extrabold text-[#25392F]">SmartAttend</p>
            <p className="mt-1 text-xs text-[#718075]">
              Attendance management · Teacher portal
            </p>
          </div>

          <Link
            href="/teacher/dashboard"
            className={`${secondaryButton} w-full sm:w-auto`}
          >
            <Icon name="back" size={17} />
            Return to dashboard
          </Link>
        </footer>
      </div>
    </main>
  );
}

export default function AttendanceSummaryPage() {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-screen items-center justify-center bg-[#FFF8ED] px-4">
          <div className="text-center">
            <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-[#E8E1D6] border-t-[#347451]" />
            <p className="mt-4 text-sm text-[#52645A]">
              Loading attendance summary...
            </p>
          </div>
        </main>
      }
    >
      <AttendanceSummaryContent />
    </Suspense>
  );
}
