
"use client";

import { useCallback, useEffect, useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

const STATUS_OPTIONS = [
  { value: "PRESENT", label: "Present" },
  { value: "ABSENT", label: "Absent" },
  { value: "REVIEW", label: "Under review" },
  { value: "UNKNOWN", label: "Unknown" },
  { value: "NOT_DETECTED", label: "Not detected" },
];

const buttonBase =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold transition duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#347451] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60";

const primaryButton =
  `${buttonBase} bg-[#347451] text-white shadow-[0_3px_0_#24563B] hover:-translate-y-0.5 hover:bg-[#2A6043] active:translate-y-0`;

const secondaryButton =
  `${buttonBase} border border-[#E8E1D6] bg-white text-[#347451] hover:bg-[#F8F5EF]`;

async function apiRequest(path, token, options = {}) {
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      Accept: "application/json",
      ...(options.body ? { "Content-Type": "application/json" } : {}),
      ...options.headers,
      Authorization: `Bearer ${token}`,
    },
    cache: "no-store",
  });

  let data = null;

  try {
    data = await response.json();
  } catch {
    // Some successful responses may not contain JSON.
  }

  if (!response.ok) {
    const detail = data?.detail;
    const message =
      typeof detail === "string"
        ? detail
        : detail != null
          ? JSON.stringify(detail)
          : `Request failed (${response.status})`;

    throw new Error(message);
  }

  return data;
}

function normalizeStatus(status) {
  return String(status || "UNKNOWN")
    .toUpperCase()
    .replaceAll(" ", "_");
}

function isValidUUID(value) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    value || ""
  );
}

function formatPercentage(value) {
  if (value === null || value === undefined || value === "") {
    return "—";
  }

  const number = Number(value);

  if (!Number.isFinite(number)) return "—";

  return `${(number >= 0 && number <= 1 ? number * 100 : number).toFixed(1)}%`;
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
    save: (
      <>
        <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2Z" />
        <path d="M17 21v-8H7v8M7 3v5h8" />
      </>
    ),
    reset: (
      <>
        <path d="M3 12a9 9 0 1 0 3-6.7L3 8" />
        <path d="M3 3v5h5" />
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

function StatusBadge({ status }) {
  const normalized = normalizeStatus(status);

  const styles = {
    PRESENT: "bg-[#CDEED4] text-[#286342] ring-[#B8D8BF]",
    ABSENT: "bg-[#FFDDCB] text-[#813A28] ring-[#E9B9A2]",
    REVIEW: "bg-[#FFECC2] text-[#805C17] ring-[#E9D69D]",
    UNDER_REVIEW: "bg-[#FFECC2] text-[#805C17] ring-[#E9D69D]",
    UNKNOWN: "bg-[#F0EBE2] text-[#52645A] ring-[#E8E1D6]",
    NOT_DETECTED: "bg-[#DFEAFB] text-[#365A8B] ring-[#C8D9F4]",
  };

  const labels = {
    PRESENT: "Present",
    ABSENT: "Absent",
    REVIEW: "Under review",
    UNDER_REVIEW: "Under review",
    UNKNOWN: "Unknown",
    NOT_DETECTED: "Not detected",
  };

  const dots = {
    PRESENT: "bg-[#347451]",
    ABSENT: "bg-[#A94F36]",
    REVIEW: "bg-[#B17B1F]",
    UNDER_REVIEW: "bg-[#B17B1F]",
    UNKNOWN: "bg-[#879188]",
    NOT_DETECTED: "bg-[#537BB4]",
  };

  return (
    <span
      className={`inline-flex max-w-full items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold ring-1 ring-inset ${
        styles[normalized] || styles.UNKNOWN
      }`}
    >
      <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${dots[normalized] || dots.UNKNOWN}`} />
      {labels[normalized] || normalized.replaceAll("_", " ")}
    </span>
  );
}

function StatCard({ title, value, description, color = "neutral", icon }) {
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
        {value}
      </p>
      <p className="mt-2 text-xs leading-5 text-[#69786E]">{description}</p>
    </article>
  );
}

function AttendanceReviewContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const sessionId = searchParams.get("session_id") || "";

  const [records, setRecords] = useState([]);
  const [originalStatuses, setOriginalStatuses] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [savingIds, setSavingIds] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  const loadRecords = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);

    setError("");
    setNotice("");

    try {
      if (!isValidUUID(sessionId)) {
        throw new Error(
          "A valid session ID is missing. Return to the attendance summary and open a valid session."
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
        sessionStorage.removeItem("smartattend_token");
        sessionStorage.removeItem("smartattend_user");
        router.replace("/login");
        return;
      }

      if (user?.role?.toLowerCase() !== "teacher") {
        router.replace("/login");
        return;
      }

      const data = await apiRequest(
        `/attendance/sessions/${encodeURIComponent(sessionId)}/records`,
        token
      );

      const loadedRecords = Array.isArray(data?.records)
        ? data.records.map((record) => ({
            ...record,
            status: normalizeStatus(record.status),
          }))
        : Array.isArray(data)
          ? data.map((record) => ({
              ...record,
              status: normalizeStatus(record.status),
            }))
          : [];

      setRecords(loadedRecords);

      const statuses = {};
      loadedRecords.forEach((record) => {
        if (record.student_id) {
          statuses[record.student_id] = normalizeStatus(record.status);
        }
      });

      setOriginalStatuses(statuses);
    } catch (err) {
      console.error("Unable to load attendance records:", err);
      setError(err.message || "Unable to load attendance records.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [sessionId, router]);

  useEffect(() => {
    loadRecords();
  }, [loadRecords]);

  function updateStatus(studentId, newStatus) {
    setRecords((current) =>
      current.map((record) =>
        record.student_id === studentId
          ? { ...record, status: newStatus }
          : record
      )
    );
    setNotice("");
    setError("");
  }

  async function saveRecord(record) {
    const studentId = record.student_id;

    if (!studentId) {
      setError("This record does not have a student ID.");
      return;
    }

    const currentStatus = normalizeStatus(record.status);
    const originalStatus = originalStatuses[studentId];

    if (currentStatus === originalStatus) {
      setNotice("There are no changes to save for this student.");
      return;
    }

    setSavingIds((current) =>
      current.includes(studentId) ? current : [...current, studentId]
    );
    setError("");
    setNotice("");

    try {
      const token = sessionStorage.getItem("smartattend_token");

      if (!token) {
        router.replace("/login");
        return;
      }

      await apiRequest(
        `/attendance/sessions/${encodeURIComponent(sessionId)}/records/${encodeURIComponent(studentId)}`,
        token,
        {
          method: "PATCH",
          body: JSON.stringify({ status: currentStatus }),
        }
      );

      setOriginalStatuses((current) => ({
        ...current,
        [studentId]: currentStatus,
      }));

      setNotice(
        `Attendance updated for ${record.student_name || "the student"}.`
      );
    } catch (err) {
      console.error("Unable to update attendance:", err);
      setError(err.message || "Failed to save the attendance change.");
    } finally {
      setSavingIds((current) =>
        current.filter((id) => id !== studentId)
      );
    }
  }

  function resetChanges(record) {
    const originalStatus = originalStatuses[record.student_id];
    if (!originalStatus) return;

    updateStatus(record.student_id, originalStatus);
  }

  const reviewRecords = records.filter((record) =>
    ["REVIEW", "UNDER_REVIEW"].includes(normalizeStatus(record.status))
  );

  const changedCount = records.filter(
    (record) =>
      normalizeStatus(record.status) !== originalStatuses[record.student_id]
  ).length;

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#FFF8ED] px-4">
        <div className="text-center">
          <div className="mx-auto h-11 w-11 animate-spin rounded-full border-4 border-[#E8E1D6] border-t-[#347451]" />
          <p className="mt-4 text-sm font-medium text-[#52645A]">
            Loading attendance records...
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#FFF8ED] text-[#25392F]">
      {/* Navigation */}
      <header className="sticky top-0 z-20 border-b border-[#E8E1D6] bg-[#FFF8ED]/95 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3 sm:px-6 lg:px-8">
          <Link href="/teacher/dashboard" className="flex min-w-0 items-center gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[#CDEED4] text-[#347451] shadow-[2px_3px_0px_#B2DCC0]">
              <Icon name="users" size={22} />
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
                ATTENDANCE MANAGEMENT
              </span>
              <h1 className="mt-4 text-2xl font-extrabold tracking-tight sm:text-3xl lg:text-4xl">
                Review attendance<span className="text-[#A94F36]">.</span>
              </h1>
              <p className="mt-3 max-w-xl text-sm leading-6 text-[#526D59] sm:text-base sm:leading-7">
                Verify student attendance, correct recognition results, and
                save changes with confidence.
              </p>
            </div>

            <button
              type="button"
              onClick={() => loadRecords(true)}
              disabled={refreshing || savingIds.length > 0}
              className={`${secondaryButton} shrink-0 border-[#B8D8BF]`}
            >
              <span className={refreshing ? "animate-spin" : ""}>
                <Icon name="refresh" size={17} />
              </span>
              {refreshing ? "Refreshing..." : "Refresh records"}
            </button>
          </div>
        </section>

        {/* Notifications */}
        {error && (
          <div
            role="alert"
            className="mt-6 flex flex-col gap-3 rounded-2xl border border-[#E9B9A2] bg-[#FFF1E9] p-4 text-sm text-[#813A28] sm:flex-row sm:items-center"
          >
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#FFDDCB]">
              <Icon name="alert" size={19} />
            </span>
            <p className="min-w-0 flex-1 break-words leading-6">{error}</p>
            <button
              type="button"
              onClick={() => setError("")}
              className="min-h-10 self-start rounded-lg px-3 font-bold hover:bg-white/60 sm:self-center"
              aria-label="Dismiss error"
            >
              Dismiss
            </button>
          </div>
        )}

        {notice && (
          <div
            role="status"
            className="mt-6 flex items-start gap-3 rounded-2xl border border-[#B8D8BF] bg-[#F0FAF1] p-4 text-sm text-[#286342]"
          >
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#CDEED4]">
              <Icon name="check" size={19} />
            </span>
            <p className="min-w-0 flex-1 break-words leading-6">{notice}</p>
            <button
              type="button"
              onClick={() => setNotice("")}
              className="min-h-10 rounded-lg px-3 font-bold hover:bg-white/60"
              aria-label="Dismiss notification"
            >
              ×
            </button>
          </div>
        )}

        {/* Overview */}
        <section className="mt-9">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <SectionHeading
              eyebrow="At a glance"
              title="Review overview"
              description="Track outstanding reviews and changes awaiting a save."
            />
            {changedCount > 0 && (
              <span className="inline-flex items-center gap-2 rounded-full bg-[#DFEAFB] px-3 py-1.5 text-xs font-bold text-[#365A8B]">
                <span className="h-2 w-2 rounded-full bg-[#537BB4]" />
                {changedCount} unsaved {changedCount === 1 ? "change" : "changes"}
              </span>
            )}
          </div>

          <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-3">
            <StatCard
              title="Total records"
              value={records.length}
              description="Students with attendance records"
              color="neutral"
              icon="users"
            />
            <StatCard
              title="Awaiting review"
              value={reviewRecords.length}
              description="Records needing verification"
              color="yellow"
              icon="alert"
            />
            <StatCard
              title="Unsaved changes"
              value={changedCount}
              description="Edited records not yet saved"
              color="blue"
              icon="save"
            />
          </div>
        </section>

        {/* Instructions */}
        <section className="mt-7 rounded-2xl border border-[#B8D8BF] bg-[#F0FAF1] p-5 sm:p-6">
          <div className="flex items-start gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#CDEED4] text-[#347451]">
              <Icon name="check" size={21} />
            </span>
            <div>
              <h2 className="font-extrabold text-[#286342]">
                How to edit attendance
              </h2>
              <p className="mt-2 text-sm leading-6 text-[#526D59]">
                Choose a status from the dropdown, then select Save for that
                student. Your changes are not stored until you save them.
                Records marked Under review are highlighted.
              </p>
            </div>
          </div>
        </section>

        {/* Student records */}
        <section className="mt-9 overflow-hidden rounded-3xl border border-[#E8E1D6] bg-white shadow-[3px_4px_0px_#EDE5D9]">
          <div className="flex flex-col gap-4 border-b border-[#E8E1D6] p-5 sm:p-6 md:flex-row md:items-center md:justify-between">
            <SectionHeading
              eyebrow="Attendance records"
              title="Student records"
              description="Edit individual attendance statuses and save each record."
            />
            <span className="inline-flex w-fit shrink-0 rounded-full bg-[#F0EBE2] px-3 py-1.5 text-xs font-bold text-[#52645A]">
              {records.length} {records.length === 1 ? "student" : "students"}
            </span>
          </div>

          {records.length === 0 ? (
            <div className="px-5 py-14 text-center">
              <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#F0EBE2] text-[#52645A]">
                <Icon name="file" size={25} />
              </span>
              <h3 className="mt-4 font-extrabold text-[#25392F]">
                No attendance records found
              </h3>
              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[#69786E]">
                There are no recorded students for this session. Once attendance
                records are created, they will appear here.
              </p>
            </div>
          ) : (
            <>
              {/* Mobile layout */}
              <div className="space-y-4 p-4 md:hidden">
                {records.map((record, index) => {
                  const studentId = record.student_id;
                  const originalStatus = originalStatuses[studentId];
                  const currentStatus = normalizeStatus(record.status);
                  const isChanged = currentStatus !== originalStatus;
                  const isSaving = savingIds.includes(studentId);
                  const needsReview = ["REVIEW", "UNDER_REVIEW"].includes(currentStatus);

                  return (
                    <article
                      key={studentId || index}
                      className={`rounded-2xl border p-4 ${
                        needsReview
                          ? "border-[#E9D69D] bg-[#FFFCF3]"
                          : "border-[#E8E1D6] bg-[#FFFDF8]"
                      }`}
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

                      <div className="mt-4">
                        <p className="mb-2 text-xs font-bold text-[#69786E]">
                          Saved status
                        </p>
                        <StatusBadge status={originalStatus || record.status} />
                        {isChanged && (
                          <p className="mt-2 text-xs font-bold text-[#365A8B]">
                            Edited — not saved yet
                          </p>
                        )}
                      </div>

                      <div className="mt-4">
                        <label
                          htmlFor={`status-${studentId || index}`}
                          className="mb-2 block text-xs font-bold text-[#52645A]"
                        >
                          Change attendance status
                        </label>
                        <select
                          id={`status-${studentId || index}`}
                          value={currentStatus}
                          onChange={(event) => updateStatus(studentId, event.target.value)}
                          disabled={isSaving}
                          className="min-h-12 w-full rounded-xl border border-[#D9D9CD] bg-white px-3 py-3 text-sm font-medium text-[#25392F] outline-none transition focus:border-[#347451] focus:ring-2 focus:ring-[#CDEED4] disabled:bg-[#F0EBE2]"
                        >
                          {STATUS_OPTIONS.map((option) => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="mt-3 flex items-center justify-between gap-3 rounded-xl bg-white/80 p-3">
                        <span className="text-xs font-semibold text-[#69786E]">
                          Confidence
                        </span>
                        <span className="text-sm font-bold text-[#52645A]">
                          {formatPercentage(record.confidence)}
                        </span>
                      </div>

                      <div className="mt-4 grid grid-cols-2 gap-3">
                        <button
                          type="button"
                          onClick={() => saveRecord(record)}
                          disabled={!isChanged || isSaving || !studentId}
                          className={`${primaryButton} w-full px-3`}
                        >
                          <Icon name="save" size={16} />
                          {isSaving ? "Saving..." : "Save"}
                        </button>
                        <button
                          type="button"
                          onClick={() => resetChanges(record)}
                          disabled={!isChanged || isSaving}
                          className={`${secondaryButton} w-full px-3`}
                        >
                          <Icon name="reset" size={16} />
                          Reset
                        </button>
                      </div>
                    </article>
                  );
                })}
              </div>

              {/* Laptop and tablet table */}
              <div className="hidden overflow-x-auto md:block">
                <table className="w-full min-w-[850px] border-collapse text-left">
                  <thead>
                    <tr className="bg-[#F8F5EF] text-[10px] uppercase tracking-[0.12em] text-[#69786E]">
                      <th className="px-4 py-4 font-extrabold lg:px-5">Student</th>
                      <th className="px-4 py-4 font-extrabold lg:px-5">Student number</th>
                      <th className="px-4 py-4 font-extrabold lg:px-5">Saved status</th>
                      <th className="px-4 py-4 font-extrabold lg:px-5">Change status</th>
                      <th className="px-4 py-4 font-extrabold lg:px-5">Confidence</th>
                      <th className="px-4 py-4 font-extrabold lg:px-5">Actions</th>
                    </tr>
                  </thead>

                  <tbody>
                    {records.map((record, index) => {
                      const studentId = record.student_id;
                      const originalStatus = originalStatuses[studentId];
                      const currentStatus = normalizeStatus(record.status);
                      const isChanged = currentStatus !== originalStatus;
                      const isSaving = savingIds.includes(studentId);
                      const needsReview = ["REVIEW", "UNDER_REVIEW"].includes(currentStatus);

                      return (
                        <tr
                          key={studentId || index}
                          className={`border-t border-[#F0EBE2] transition-colors ${
                            needsReview ? "bg-[#FFFCF3]" : "hover:bg-[#FFFDF8]"
                          }`}
                        >
                          <td className="px-4 py-4 lg:px-5">
                            <p className="font-bold text-[#25392F]">
                              {record.student_name || "Name unavailable"}
                            </p>
                            <p className="mt-1 text-xs text-[#8A9189]">
                              Student {index + 1}
                            </p>
                          </td>
                          <td className="px-4 py-4 text-sm text-[#69786E] lg:px-5">
                            {record.student_number || "—"}
                          </td>
                          <td className="px-4 py-4 lg:px-5">
                            <StatusBadge status={originalStatus || record.status} />
                            {isChanged && (
                              <p className="mt-2 text-xs font-bold text-[#365A8B]">
                                Edited, not saved
                              </p>
                            )}
                          </td>
                          <td className="min-w-48 px-4 py-4 lg:px-5">
                            <label className="sr-only" htmlFor={`desktop-status-${studentId || index}`}>
                              Attendance status for {record.student_name || "student"}
                            </label>
                            <select
                              id={`desktop-status-${studentId || index}`}
                              value={currentStatus}
                              onChange={(event) => updateStatus(studentId, event.target.value)}
                              disabled={isSaving}
                              className="min-h-11 w-full rounded-xl border border-[#D9D9CD] bg-white px-3 py-2.5 text-sm font-medium text-[#25392F] outline-none transition focus:border-[#347451] focus:ring-2 focus:ring-[#CDEED4] disabled:bg-[#F0EBE2]"
                            >
                              {STATUS_OPTIONS.map((option) => (
                                <option key={option.value} value={option.value}>
                                  {option.label}
                                </option>
                              ))}
                            </select>
                          </td>
                          <td className="whitespace-nowrap px-4 py-4 text-sm font-semibold text-[#52645A] lg:px-5">
                            {formatPercentage(record.confidence)}
                          </td>
                          <td className="px-4 py-4 lg:px-5">
                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() => saveRecord(record)}
                                disabled={!isChanged || isSaving || !studentId}
                                className={`${primaryButton} min-h-10 px-3 py-2 text-xs`}
                              >
                                <Icon name="save" size={15} />
                                {isSaving ? "Saving..." : "Save"}
                              </button>
                              <button
                                type="button"
                                onClick={() => resetChanges(record)}
                                disabled={!isChanged || isSaving}
                                className={`${secondaryButton} min-h-10 px-3 py-2 text-xs`}
                              >
                                Reset
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </>
          )}

          <div className="border-t border-[#E8E1D6] bg-[#F8F5EF] px-5 py-4 text-xs leading-5 text-[#69786E] sm:px-6">
            Attendance changes are saved individually. Remember to save each edited student before leaving this page.
          </div>
        </section>

        {/* Footer */}
        <footer className="mt-9 flex flex-col gap-4 border-t border-[#E8E1D6] py-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-extrabold text-[#25392F]">SmartAttend</p>
            <p className="mt-1 text-xs text-[#718075]">
              Attendance management · Teacher portal
            </p>
          </div>

          <Link
            href={`/teacher/attendance/summary?session_id=${encodeURIComponent(sessionId)}`}
            className={`${secondaryButton} w-full sm:w-auto`}
          >
            <Icon name="back" size={17} />
            Return to summary
          </Link>
        </footer>
      </div>
    </main>
  );
}

export default function AttendanceReviewPage() {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-screen items-center justify-center bg-[#FFF8ED] px-4">
          <div className="text-center">
            <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-[#E8E1D6] border-t-[#347451]" />
            <p className="mt-4 text-sm text-[#52645A]">
              Loading attendance review...
            </p>
          </div>
        </main>
      }
    >
      <AttendanceReviewContent />
    </Suspense>
  );
}
