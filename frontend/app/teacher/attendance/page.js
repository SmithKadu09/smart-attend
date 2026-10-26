"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import API_URL from "@/lib/api";

const STATUS_STYLES = {
    PRESENT: "bg-[#CDEED4] text-[#347451]",
    REVIEW: "bg-[#FFE5A9] text-[#8D641C]",
    UNKNOWN: "bg-[#E5D8FB] text-[#7550A5]",
    NOT_DETECTED: "bg-[#F8D8E4] text-[#A4496B]",
    ABSENT: "bg-[#FFDDCB] text-[#A94F36]",
};

async function apiRequest(path, token, options = {}) {
    const response = await fetch(`${API_URL}${path}`, {
        ...options,
        headers: {
            ...(options.body instanceof FormData
                ? {}
                : { "Content-Type": "application/json" }),
            Authorization: `Bearer ${token}`,
            ...options.headers,
        },
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
        throw new Error(
            data.detail || data.message || `Request failed (${response.status})`
        );
    }

    return data;
}

function ClayButton({
    children,
    onClick,
    disabled = false,
    variant = "green",
    type = "button",
}) {
    const colors = {
        green: "bg-[#CDEED4] text-[#286444] shadow-[0_4px_0_#A8D6B4]",
        peach: "bg-[#FFDDCB] text-[#A94F36] shadow-[0_4px_0_#E9B9A2]",
        lavender: "bg-[#E5D8FB] text-[#7550A5] shadow-[0_4px_0_#C8B6E8]",
        dark: "bg-[#253D32] text-white shadow-[0_4px_0_#16291F]",
        yellow: "bg-[#FFE5A9] text-[#8D641C] shadow-[0_4px_0_#E7CA83]",
    };

    return (
        <button
            type={type}
            onClick={onClick}
            disabled={disabled}
            className={`rounded-2xl px-5 py-3 text-sm font-bold transition-all hover:-translate-y-0.5 active:translate-y-1 disabled:cursor-not-allowed disabled:opacity-50 ${colors[variant]}`}
        >
            {children}
        </button>
    );
}

function StatusBadge({ status }) {
    return (
        <span
            className={`inline-flex rounded-full px-3 py-1 text-xs font-bold ${STATUS_STYLES[status] || "bg-gray-100 text-gray-600"
                }`}
        >
            {(status || "UNKNOWN").replaceAll("_", " ")}
        </span>
    );
}

export default function TeacherAttendancePage() {
    const router = useRouter();

    const [token, setToken] = useState("");
    const [classrooms, setClassrooms] = useState([]);
    const [classroomId, setClassroomId] = useState("");
    const [sessionId, setSessionId] = useState("");
    const [records, setRecords] = useState([]);
    const [summary, setSummary] = useState(null);

    const [photo, setPhoto] = useState(null);
    const [photoInputKey, setPhotoInputKey] = useState(0);
    const [filter, setFilter] = useState("ALL");

    const [loadingClassrooms, setLoadingClassrooms] = useState(true);
    const [loadingRecords, setLoadingRecords] = useState(false);
    const [startingSession, setStartingSession] = useState(false);
    const [uploadingPhoto, setUploadingPhoto] = useState(false);
    const [finalizing, setFinalizing] = useState(false);

    const [error, setError] = useState("");
    const [notice, setNotice] = useState("");

    const selectedClassroom = classrooms.find(
        (classroom) => classroom.id === classroomId
    );

    useEffect(() => {
        const savedToken = sessionStorage.getItem("smartattend_token");
        const savedUser = sessionStorage.getItem("smartattend_user");

        if (!savedToken) {
            router.replace("/login");
            return;
        }

        try {
            const user = JSON.parse(savedUser || "{}");

            if (user.role !== "teacher") {
                router.replace("/student/dashboard");
                return;
            }
        } catch {
            router.replace("/login");
            return;
        }

        setToken(savedToken);
    }, [router]);

    const loadClassrooms = useCallback(async () => {
        if (!token) return;

        setLoadingClassrooms(true);
        setError("");

        try {
            const data = await apiRequest("/classrooms/mine", token);
            const list = Array.isArray(data)
                ? data
                : data.classrooms || data.items || data.data || [];

            setClassrooms(list);

            setClassroomId((current) => {
                if (current && list.some((item) => item.id === current)) {
                    return current;
                }
                return list[0]?.id || "";
            });
        } catch (err) {
            setError(err.message || "Could not load classrooms.");
        } finally {
            setLoadingClassrooms(false);
        }
    }, [token]);

    useEffect(() => {
        loadClassrooms();
    }, [loadClassrooms]);

    const loadRecords = useCallback(
        async (id = sessionId) => {
            if (!token || !id) return;

            setLoadingRecords(true);
            setError("");

            try {
                const data = await apiRequest(
                    `/attendance/sessions/${id}/records`,
                    token
                );

                const list = Array.isArray(data)
                    ? data
                    : data.records || data.items || data.data || [];

                setRecords(list);
            } catch (err) {
                setError(err.message || "Could not load attendance records.");
            } finally {
                setLoadingRecords(false);
            }
        },
        [token, sessionId]
    );

    const loadSummary = useCallback(
        async (id = sessionId) => {
            if (!token || !id) return;

            try {
                const data = await apiRequest(
                    `/attendance/sessions/${id}/summary`,
                    token
                );
                setSummary(data);
            } catch {
                // Summary is supplementary; records can still be displayed.
                setSummary(null);
            }
        },
        [token, sessionId]
    );

    async function startSession() {
        if (!classroomId) {
            setError("Please select a classroom first.");
            return;
        }

        setStartingSession(true);
        setError("");
        setNotice("");
        setRecords([]);
        setSummary(null);
        setPhoto(null);
        setPhotoInputKey((key) => key + 1);

        try {
            const data = await apiRequest("/attendance/sessions", token, {
                method: "POST",
                body: JSON.stringify({ classroom_id: classroomId }),
            });

            const id = data.id || data.session_id;

            if (!id) {
                throw new Error(
                    "The server created a response without a session ID. Check the API response."
                );
            }

            setSessionId(id);
            setNotice("Attendance session started. Upload a classroom photo next.");
        } catch (err) {
            setError(err.message || "Could not start the session.");
        } finally {
            setStartingSession(false);
        }
    }

    async function uploadClassroomPhoto() {
        if (!sessionId) {
            setError("Start an attendance session first.");
            return;
        }

        if (!photo) {
            setError("Please choose a classroom photo.");
            return;
        }

        setUploadingPhoto(true);
        setError("");
        setNotice("");

        try {
            const formData = new FormData();
            formData.append("image", photo);

            const data = await apiRequest(
                `/attendance/sessions/${sessionId}/photo`,
                token,
                {
                    method: "POST",
                    body: formData,
                }
            );

            setNotice(
                data.message ||
                "Photo processed. Check the attendance records below."
            );

            await loadRecords(sessionId);
            await loadSummary(sessionId);
        } catch (err) {
            setError(err.message || "Could not process the photo.");
        } finally {
            setUploadingPhoto(false);
        }
    }

    async function updateRecord(studentId, status) {
        if (!sessionId || !studentId) return;

        setError("");
        setNotice("");

        try {
            await apiRequest(
                `/attendance/sessions/${sessionId}/records/${studentId}`,
                token,
                {
                    method: "PATCH",
                    body: JSON.stringify({ status }),
                }
            );

            setNotice("Attendance record updated.");
            await loadRecords(sessionId);
            await loadSummary(sessionId);
        } catch (err) {
            setError(err.message || "Could not update this record.");
        }
    }

    async function finalizeAttendance() {
        if (!sessionId) return;

        const confirmed = window.confirm(
            "Finalize this attendance session? Make sure you have reviewed the records."
        );

        if (!confirmed) return;

        setFinalizing(true);
        setError("");
        setNotice("");

        try {
            const data = await apiRequest(
                `/attendance/sessions/${sessionId}/finalize`,
                token,
                {
                    method: "POST",
                    body: JSON.stringify({}),
                }
            );

            setNotice(data.message || "Attendance session finalized.");
            await loadRecords(sessionId);
            await loadSummary(sessionId);
        } catch (err) {
            setError(err.message || "Could not finalize attendance.");
        } finally {
            setFinalizing(false);
        }
    }

    const filteredRecords = records.filter((record) => {
        if (filter === "ALL") return true;
        return record.status === filter;
    });

    const counts = records.reduce(
        (result, record) => {
            const status = record.status || "UNKNOWN";
            result[status] = (result[status] || 0) + 1;
            return result;
        },
        {}
    );

    return (
        <main className="min-h-screen bg-[#FFF8ED] px-4 py-8 text-[#293D31] sm:px-8 lg:px-12">
            <div className="mx-auto max-w-7xl">
                <header className="mb-8 flex flex-wrap items-center justify-between gap-4">
                    <Link
                        href="/teacher/dashboard"
                        className="inline-flex items-center gap-2 text-sm font-bold text-[#347451] hover:underline"
                    >
                        <span aria-hidden="true">←</span> Teacher Dashboard
                    </Link>

                    <span className="rounded-full bg-[#CDEED4] px-4 py-2 text-xs font-bold text-[#347451]">
                        TEACHER PORTAL
                    </span>
                </header>

                <section className="mb-8">
                    <p className="mb-3 text-xs font-extrabold tracking-[0.22em] text-[#A94F36]">
                        SMARTATTEND / ATTENDANCE
                    </p>

                    <h1 className="text-4xl font-black tracking-tight sm:text-5xl">
                        Take attendance<span className="text-[#E7A17E]">.</span>
                    </h1>

                    <p className="mt-3 max-w-2xl text-sm leading-6 text-[#718075] sm:text-base">
                        Start a classroom session, upload a group photo, and review the
                        face-recognition results before finalizing attendance.
                    </p>
                </section>

                {error && (
                    <div
                        role="alert"
                        className="mb-5 rounded-2xl border border-[#E9B9A2] bg-[#FFDDCB] p-4 text-sm font-semibold text-[#8D3D2A]"
                    >
                        {error}
                    </div>
                )}

                {notice && (
                    <div
                        role="status"
                        className="mb-5 rounded-2xl border border-[#A8D6B4] bg-[#CDEED4] p-4 text-sm font-semibold text-[#286444]"
                    >
                        {notice}
                    </div>
                )}

                <div className="grid gap-6 lg:grid-cols-[0.85fr_1.15fr]">
                    <section className="space-y-6">
                        <div className="rounded-[28px] border border-white bg-white/80 p-6 shadow-[0_8px_0_#EDE2D1] sm:p-8">
                            <div className="mb-5 flex items-center gap-3">
                                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#CDEED4] text-xl">
                                    01
                                </div>
                                <div>
                                    <h2 className="text-xl font-extrabold">Choose classroom</h2>
                                    <p className="text-sm text-[#718075]">
                                        Select where attendance is being taken.
                                    </p>
                                </div>
                            </div>

                            {loadingClassrooms ? (
                                <p className="py-4 text-sm text-[#718075]">
                                    Loading your classrooms...
                                </p>
                            ) : classrooms.length === 0 ? (
                                <div className="rounded-2xl bg-[#F6F0E6] p-5">
                                    <p className="text-sm text-[#718075]">
                                        You have not created any classrooms yet.
                                    </p>
                                    <Link
                                        href="/teacher/classrooms/create"
                                        className="mt-3 inline-block text-sm font-bold text-[#347451] underline"
                                    >
                                        Create a classroom
                                    </Link>
                                </div>
                            ) : (
                                <>
                                    <label
                                        htmlFor="classroom"
                                        className="mb-2 block text-sm font-bold"
                                    >
                                        Your classrooms
                                    </label>

                                    <select
                                        id="classroom"
                                        value={classroomId}
                                        onChange={(event) => setClassroomId(event.target.value)}
                                        disabled={Boolean(sessionId)}
                                        className="w-full rounded-2xl border-2 border-[#E8E2D6] bg-[#FFFDF8] px-4 py-3 text-sm outline-none focus:border-[#83B995] disabled:opacity-60"
                                    >
                                        {classrooms.map((classroom) => (
                                            <option key={classroom.id} value={classroom.id}>
                                                {classroom.name}
                                                {classroom.subject ? ` — ${classroom.subject}` : ""}
                                            </option>
                                        ))}
                                    </select>

                                    {selectedClassroom && (
                                        <div className="mt-4 rounded-2xl bg-[#F3F8EF] p-4">
                                            <p className="text-xs font-bold uppercase tracking-wider text-[#718075]">
                                                Selected classroom
                                            </p>
                                            <p className="mt-1 font-extrabold">
                                                {selectedClassroom.name}
                                            </p>
                                            {selectedClassroom.subject && (
                                                <p className="mt-1 text-sm text-[#718075]">
                                                    {selectedClassroom.subject}
                                                </p>
                                            )}
                                        </div>
                                    )}

                                    <div className="mt-6">
                                        <ClayButton
                                            onClick={startSession}
                                            disabled={startingSession || Boolean(sessionId)}
                                            variant="green"
                                        >
                                            {startingSession
                                                ? "Starting session..."
                                                : sessionId
                                                    ? "Session started"
                                                    : "Start attendance session →"}
                                        </ClayButton>
                                    </div>
                                </>
                            )}
                        </div>

                        <div className="rounded-[28px] border border-white bg-white/80 p-6 shadow-[0_8px_0_#EDE2D1] sm:p-8">
                            <div className="mb-5 flex items-center gap-3">
                                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#FFDDCB] text-xl">
                                    02
                                </div>
                                <div>
                                    <h2 className="text-xl font-extrabold">Upload photo</h2>
                                    <p className="text-sm text-[#718075]">
                                        Use a clear classroom group photo.
                                    </p>
                                </div>
                            </div>

                            {!sessionId ? (
                                <p className="rounded-2xl bg-[#FFF2E9] p-4 text-sm leading-6 text-[#A94F36]">
                                    Start a session first to enable photo processing.
                                </p>
                            ) : (
                                <>
                                    <label
                                        htmlFor="classroom-photo"
                                        className="mb-2 block text-sm font-bold"
                                    >
                                        Classroom photo
                                    </label>

                                    <input
                                        key={photoInputKey}
                                        id="classroom-photo"
                                        type="file"
                                        accept="image/jpeg,image/png,image/webp"
                                        onChange={(event) =>
                                            setPhoto(event.target.files?.[0] || null)
                                        }
                                        className="block w-full rounded-2xl border-2 border-dashed border-[#D8CBB9] bg-[#FFFDF8] p-4 text-sm file:mr-3 file:rounded-xl file:border-0 file:bg-[#E5D8FB] file:px-3 file:py-2 file:font-bold file:text-[#7550A5]"
                                    />

                                    <p className="mt-2 text-xs leading-5 text-[#718075]">
                                        JPEG, PNG, or WebP. Use only photos you are authorized to
                                        process, with appropriate student consent.
                                    </p>

                                    {photo && (
                                        <p className="mt-3 break-all rounded-xl bg-[#F3F8EF] p-3 text-xs text-[#347451]">
                                            Selected: {photo.name}
                                        </p>
                                    )}

                                    <div className="mt-5 flex flex-wrap gap-3">
                                        <ClayButton
                                            onClick={uploadClassroomPhoto}
                                            disabled={uploadingPhoto || !photo}
                                            variant="peach"
                                        >
                                            {uploadingPhoto
                                                ? "Processing photo..."
                                                : "Process classroom photo"}
                                        </ClayButton>

                                        <ClayButton
                                            variant="lavender"
                                            onClick={() => loadRecords(sessionId)}
                                            disabled={loadingRecords}
                                        >
                                            Refresh records
                                        </ClayButton>
                                    </div>
                                </>
                            )}
                        </div>
                    </section>

                    <section className="rounded-[28px] border border-white bg-white/80 p-6 shadow-[0_8px_0_#EDE2D1] sm:p-8">
                        <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
                            <div>
                                <p className="mb-2 text-xs font-extrabold tracking-[0.16em] text-[#A94F36]">
                                    LIVE SESSION
                                </p>
                                <h2 className="text-2xl font-extrabold">Attendance records</h2>
                                <p className="mt-2 text-sm text-[#718075]">
                                    Review the results before finalizing.
                                </p>
                            </div>

                            {sessionId && (
                                <span className="rounded-full bg-[#CDEED4] px-3 py-2 text-xs font-bold text-[#347451]">
                                    SESSION ACTIVE
                                </span>
                            )}
                        </div>

                        {sessionId && (
                            <div className="mb-5 rounded-2xl bg-[#F3F8EF] p-4">
                                <p className="text-xs font-bold text-[#718075]">
                                    SESSION ID
                                </p>
                                <p className="mt-1 break-all font-mono text-xs">{sessionId}</p>
                            </div>
                        )}

                        <div className="mb-5 grid grid-cols-2 gap-3 sm:grid-cols-3">
                            {[
                                ["PRESENT", "Present", "#CDEED4"],
                                ["REVIEW", "Review", "#FFE5A9"],
                                ["UNKNOWN", "Unknown", "#E5D8FB"],
                                ["NOT_DETECTED", "Not detected", "#F8D8E4"],
                                ["ABSENT", "Absent", "#FFDDCB"],
                            ].map(([key, label, color]) => (
                                <div
                                    key={key}
                                    className="rounded-2xl p-4"
                                    style={{ backgroundColor: color }}
                                >
                                    <p className="text-xs font-bold opacity-80">{label}</p>
                                    <p className="mt-1 text-2xl font-black">
                                        {counts[key] || 0}
                                    </p>
                                </div>
                            ))}
                            <div className="rounded-2xl bg-[#E8EDE6] p-4">
                                <p className="text-xs font-bold text-[#536356]">Total</p>
                                <p className="mt-1 text-2xl font-black">{records.length}</p>
                            </div>
                        </div>

                        {summary && (
                            <details className="mb-5 rounded-2xl bg-[#F6F0E6] p-4">
                                <summary className="cursor-pointer text-sm font-bold">
                                    View server summary
                                </summary>
                                <pre className="mt-3 overflow-auto whitespace-pre-wrap break-words text-xs">
                                    {JSON.stringify(summary, null, 2)}
                                </pre>
                            </details>
                        )}

                        <div className="mb-5 flex flex-wrap gap-2">
                            {[
                                "ALL",
                                "PRESENT",
                                "REVIEW",
                                "UNKNOWN",
                                "NOT_DETECTED",
                                "ABSENT",
                            ].map((status) => (
                                <button
                                    key={status}
                                    onClick={() => setFilter(status)}
                                    className={`rounded-full px-3 py-2 text-xs font-bold transition ${filter === status
                                        ? "bg-[#253D32] text-white"
                                        : "bg-[#F3EEE5] text-[#647266] hover:bg-[#E8E2D6]"
                                        }`}
                                >
                                    {status.replaceAll("_", " ")}
                                </button>
                            ))}
                        </div>

                        {!sessionId ? (
                            <div className="rounded-2xl bg-[#F6F0E6] px-5 py-12 text-center">
                                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#FFE5A9] text-2xl">
                                    ✳
                                </div>
                                <h3 className="font-extrabold">Ready when you are</h3>
                                <p className="mx-auto mt-2 max-w-xs text-sm leading-6 text-[#718075]">
                                    Select a classroom and start a session to begin taking
                                    attendance.
                                </p>
                            </div>
                        ) : loadingRecords ? (
                            <p className="py-10 text-center text-sm text-[#718075]">
                                Loading attendance records...
                            </p>
                        ) : filteredRecords.length === 0 ? (
                            <div className="rounded-2xl bg-[#F6F0E6] px-5 py-10 text-center">
                                <h3 className="font-extrabold">No records to display</h3>
                                <p className="mt-2 text-sm leading-6 text-[#718075]">
                                    Process a photo or choose another status filter.
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {filteredRecords.map((record, index) => {
                                    const studentId =
                                        record.student_id || record.student?.id;
                                    const recordKey =
                                        record.id || studentId || `record-${index}`;

                                    return (
                                        <article
                                            key={recordKey}
                                            className="rounded-2xl border border-[#EEE5D7] bg-[#FFFDF8] p-4"
                                        >
                                            <div className="flex flex-wrap items-start justify-between gap-3">
                                                <div className="min-w-0">
                                                    <p className="break-all font-bold">
                                                        {record.student_name ||
                                                            record.student?.name ||
                                                            (studentId
                                                                ? `Student ${studentId.slice(0, 8)}`
                                                                : "Unidentified student")}
                                                    </p>
                                                    {record.confidence != null && (
                                                        <p className="mt-1 text-xs text-[#718075]">
                                                            Confidence:{" "}
                                                            {(Number(record.confidence) * 100).toFixed(1)}%
                                                        </p>
                                                    )}
                                                    <p className="mt-1 text-xs text-[#718075]">
                                                        {record.marked_at
                                                            ? `Marked: ${new Date(
                                                                record.marked_at
                                                            ).toLocaleString()}`
                                                            : "Not marked"}
                                                    </p>
                                                </div>
                                                <StatusBadge status={record.status} />
                                            </div>

                                            {studentId && (
                                                <div className="mt-4 flex flex-wrap gap-2">
                                                    {["PRESENT", "ABSENT", "REVIEW"].map((status) => {
                                                        const isSelected = record.status === status;

                                                        const colors = {
                                                            PRESENT: isSelected
                                                                ? "bg-[#347451] text-white border-[#347451] shadow-[0_3px_0_#24563A]"
                                                                : "bg-[#CDEED4] text-[#347451] border-[#A8D6B4]",

                                                            ABSENT: isSelected
                                                                ? "bg-[#A94F36] text-white border-[#A94F36] shadow-[0_3px_0_#813A28]"
                                                                : "bg-[#FFDDCB] text-[#A94F36] border-[#E9B9A2]",

                                                            REVIEW: isSelected
                                                                ? "bg-[#B98216] text-white border-[#B98216] shadow-[0_3px_0_#8D641C]"
                                                                : "bg-[#FFE5A9] text-[#8D641C] border-[#E7CA83]",
                                                        };

                                                        return (
                                                            <button
                                                                key={status}
                                                                type="button"
                                                                onClick={() => updateRecord(studentId, status)}
                                                                aria-pressed={isSelected}
                                                                className={`rounded-xl border px-3 py-2 text-xs font-bold transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0.5 ${colors[status]}`}
                                                            >
                                                                {isSelected ? "✓ " : ""}
                                                                Mark {status.toLowerCase()}
                                                            </button>
                                                        );
                                                    })}
                                                    


                                                </div>
                                            )}
                                        </article>
                                    );
                                })}
                            </div>
                        )}

                        <div className="mt-8 border-t border-[#E8E2D6] pt-6">
                            <p className="mb-4 text-xs leading-5 text-[#718075]">
                                Review uncertain matches and correct any mistakes. A student
                                who was not detected should not automatically be treated as
                                absent.
                            </p>

                            <ClayButton
                                onClick={finalizeAttendance}
                                disabled={!sessionId || finalizing || records.length === 0}
                                variant="dark"
                            >
                                {finalizing ? "Finalizing..." : "Finalize attendance →"}
                            </ClayButton>
                        </div>
                    </section>
                </div>

                <footer className="mt-10 flex flex-wrap justify-between gap-3 border-t border-[#E8E2D6] py-6 text-xs text-[#718075]">
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
