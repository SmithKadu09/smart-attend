
"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

const MAX_FILE_SIZE = 5 * 1024 * 1024;

export default function FaceEnrollment() {
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState("");
  const [consent, setConsent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [dragging, setDragging] = useState(false);

  const fileInputRef = useRef(null);
  const previewRef = useRef("");

  useEffect(() => {
    return () => {
      if (previewRef.current) {
        URL.revokeObjectURL(previewRef.current);
      }
    };
  }, []);

  function clearPreview() {
    if (previewRef.current) {
      URL.revokeObjectURL(previewRef.current);
    }

    previewRef.current = "";
    setPreview("");
  }

  function handleImageChange(event) {
    const file = event.target.files?.[0];
    if (file) selectImage(file);
  }

  function selectImage(file) {
    setMessage("");
    setError("");

    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
    ];

    if (!allowedTypes.includes(file.type)) {
      setError("Please choose a JPEG, PNG, or WebP image.");
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      setError("Your image must be 5 MB or smaller.");
      return;
    }

    clearPreview();

    const nextPreview = URL.createObjectURL(file);
    previewRef.current = nextPreview;

    setImage(file);
    setPreview(nextPreview);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  function removeImage() {
    setImage(null);
    clearPreview();
    setError("");
    setMessage("");

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  async function handleSubmit(event) {
    event.preventDefault();

    setError("");
    setMessage("");

    if (!image) {
      setError("Please select a clear photo of your face.");
      return;
    }

    if (!consent) {
      setError(
        "Please provide consent before enrolling your face."
      );
      return;
    }

    const token = sessionStorage.getItem("smartattend_token");

    if (!token) {
      setError("Your session has expired. Please log in again.");
      return;
    }

    const formData = new FormData();
    formData.append("image", image);
    formData.append("consent", "true");

    setLoading(true);

    try {
      const response = await fetch(
        `${API_URL}/biometrics/enroll`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        }
      );

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        const detail = data.detail;

        throw new Error(
          typeof detail === "string"
            ? detail
            : "Face enrollment failed. Please try again."
        );
      }

      setMessage(
        data.message || "Your face has been enrolled successfully."
      );

      setImage(null);
      clearPreview();
      setConsent(false);

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (err) {
      setError(
        err.message ||
          "Unable to connect to the server. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#FFF8ED] text-[#25392F]">
      {/* Top navigation */}
      <header className="sticky top-0 z-20 border-b border-[#E8E1D6] bg-[#FFF8ED]/95 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3 sm:px-8">
          <Link
            href="/student/dashboard"
            className="flex items-center gap-3 rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#347451]"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#347451] text-lg font-extrabold text-white">
              S
            </div>

            <div>
              <p className="font-extrabold tracking-tight">
                SmartAttend
              </p>
              <p className="text-xs text-[#69786E]">
                Student portal
              </p>
            </div>
          </Link>

          <Link
            href="/student/dashboard"
            className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-[#E8E1D6] bg-white px-3 py-2 text-sm font-bold transition hover:border-[#B8D4BC] hover:bg-[#F0F7EF] sm:px-4"
          >
            <span aria-hidden="true">←</span>
            <span className="hidden sm:inline">Back to dashboard</span>
            <span className="sm:hidden">Dashboard</span>
          </Link>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-4 py-7 sm:px-8 sm:py-10 lg:py-12">
        {/* Page heading */}
        <section className="mb-8 max-w-3xl sm:mb-10">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#D7E8D5] bg-[#F0F7EF] px-3 py-2 text-xs font-extrabold uppercase tracking-[0.13em] text-[#347451]">
            <span aria-hidden="true">◎</span>
            Biometric setup
          </div>

          <h1 className="mt-5 text-3xl font-extrabold tracking-tight sm:text-4xl lg:text-5xl">
            Face enrollment
          </h1>

          <p className="mt-4 max-w-2xl text-sm leading-7 text-[#69786E] sm:text-base">
            Set up your face profile for SmartAttend. Follow the
            steps below to upload a clear photo and provide your
            consent before enrollment.
          </p>
        </section>

        {/* Main content */}
        <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[0.85fr_1.15fr] lg:gap-8">
          {/* Left information panel */}
          <aside className="space-y-5">
            <section className="relative overflow-hidden rounded-[28px] border border-[#D7E8D5] bg-[#EAF4E7] p-5 shadow-[4px_5px_0px_#EDE5D9] sm:p-7">
              <div className="pointer-events-none absolute -right-12 -top-12 h-40 w-40 rounded-full border-[24px] border-[#347451]/10" />

              <div className="relative">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-[#C6DCC4] bg-white text-3xl text-[#347451]">
                  ◎
                </div>

                <p className="mt-5 text-xs font-extrabold uppercase tracking-[0.15em] text-[#347451]">
                  Your setup guide
                </p>

                <h2 className="mt-2 text-2xl font-extrabold leading-tight">
                  Three simple steps
                </h2>

                <p className="mt-3 text-sm leading-6 text-[#52685A]">
                  Prepare your photo, review the consent statement,
                  and submit your enrollment.
                </p>

                <div className="mt-7 space-y-6">
                  {[
                    {
                      number: "01",
                      title: "Choose your photo",
                      description:
                        "Upload a clear, well-lit image with your face visible.",
                    },
                    {
                      number: "02",
                      title: "Review and consent",
                      description:
                        "Read the biometric consent statement and decide whether to agree.",
                    },
                    {
                      number: "03",
                      title: "Complete enrollment",
                      description:
                        "Submit your photo securely to the SmartAttend backend.",
                    },
                  ].map((step) => (
                    <div
                      key={step.number}
                      className="flex items-start gap-4"
                    >
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[#C6DCC4] bg-white text-sm font-extrabold text-[#347451]">
                        {step.number}
                      </div>

                      <div>
                        <h3 className="font-extrabold">
                          {step.title}
                        </h3>
                        <p className="mt-1 text-sm leading-6 text-[#52685A]">
                          {step.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* Photo guidelines */}
            <section className="rounded-[24px] border border-[#E8E1D6] bg-white p-5 shadow-[3px_4px_0px_#EDE5D9] sm:p-6">
              <h2 className="flex items-center gap-2 font-extrabold">
                <span className="text-lg text-[#347451]">✓</span>
                Photo guidelines
              </h2>

              <ul className="mt-4 space-y-3 text-sm leading-6 text-[#69786E]">
                <li className="flex items-start gap-3">
                  <span className="mt-0.5 font-extrabold text-[#347451]">
                    ✓
                  </span>
                  Use a well-lit photo with your face clearly visible.
                </li>

                <li className="flex items-start gap-3">
                  <span className="mt-0.5 font-extrabold text-[#347451]">
                    ✓
                  </span>
                  Keep your face centered and avoid heavy filters.
                </li>

                <li className="flex items-start gap-3">
                  <span className="mt-0.5 font-extrabold text-[#347451]">
                    ✓
                  </span>
                  Accepted formats: JPEG, PNG, and WebP.
                </li>

                <li className="flex items-start gap-3">
                  <span className="mt-0.5 font-extrabold text-[#347451]">
                    ✓
                  </span>
                  Maximum image size: 5 MB.
                </li>
              </ul>
            </section>

            {/* Privacy note */}
            <section className="rounded-[24px] border border-[#F0DDCE] bg-[#FFF3E9] p-5 sm:p-6">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#FFDDCB] text-lg text-[#A94F36]">
                  !
                </div>

                <div>
                  <h2 className="font-extrabold text-[#8E3E2B]">
                    Your choice matters
                  </h2>
                  <p className="mt-2 text-sm leading-6 text-[#8E5B4C]">
                    Enrollment requires your consent. Review the
                    statement in the form before submitting. This
                    page does not claim that your biometric data is
                    stored or processed in any particular way beyond
                    what your backend implements.
                  </p>
                </div>
              </div>
            </section>
          </aside>

          {/* Right enrollment form */}
          <section className="min-w-0 rounded-[28px] border border-[#E8E1D6] bg-white p-5 shadow-[4px_5px_0px_#EDE5D9] sm:p-7 lg:p-8">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-extrabold uppercase tracking-[0.15em] text-[#A94F36]">
                  Enrollment form
                </p>

                <h2 className="mt-2 text-2xl font-extrabold tracking-tight">
                  Register your face
                </h2>

                <p className="mt-2 text-sm leading-6 text-[#69786E]">
                  Upload one photo to get started.
                </p>
              </div>

              <div className="hidden h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#CDEED4] text-xl font-extrabold text-[#24563B] sm:flex">
                01
              </div>
            </div>

            <form onSubmit={handleSubmit} className="mt-7 space-y-6">
              {/* Upload area */}
              <div>
                <label
                  htmlFor="face-image"
                  className="mb-3 block text-sm font-extrabold"
                >
                  Your face photo
                </label>

                <div
                  onDragOver={(event) => {
                    event.preventDefault();
                    if (!loading) setDragging(true);
                  }}
                  onDragLeave={() => setDragging(false)}
                  onDrop={(event) => {
                    event.preventDefault();
                    setDragging(false);

                    if (loading) return;

                    const file = event.dataTransfer.files?.[0];
                    if (file) selectImage(file);
                  }}
                  className={`rounded-[22px] border-2 border-dashed p-4 transition sm:p-6 ${
                    dragging
                      ? "border-[#347451] bg-[#F0F7EF]"
                      : "border-[#D8D2C6] bg-[#FFFCF6] hover:border-[#8EB89A]"
                  }`}
                >
                  {!preview ? (
                    <div className="py-5 text-center sm:py-8">
                      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-[22px] bg-[#CDEED4] text-3xl text-[#24563B]">
                        ↑
                      </div>

                      <h3 className="mt-5 text-base font-extrabold">
                        Drop your photo here
                      </h3>

                      <p className="mt-2 text-sm text-[#69786E]">
                        Or choose an image from your device
                      </p>

                      <label
                        htmlFor="face-image"
                        className="mt-5 inline-flex min-h-11 cursor-pointer items-center justify-center rounded-xl bg-[#347451] px-5 py-3 text-sm font-extrabold text-white transition hover:bg-[#24563B] focus-within:ring-2 focus-within:ring-[#347451] focus-within:ring-offset-2"
                      >
                        Browse photos
                      </label>

                      <p className="mt-4 text-xs text-[#8A948C]">
                        JPEG, PNG, or WebP · Up to 5 MB
                      </p>
                    </div>
                  ) : (
                    <div>
                      <div className="mb-4 flex items-center justify-between gap-3">
                        <div>
                          <p className="font-extrabold">
                            Photo preview
                          </p>
                          <p className="mt-1 text-xs text-[#69786E]">
                            Check your image before submitting.
                          </p>
                        </div>

                        <span className="rounded-full border border-[#D7E8D5] bg-[#F0F7EF] px-3 py-1.5 text-xs font-bold text-[#347451]">
                          Selected
                        </span>
                      </div>

                      <div className="overflow-hidden rounded-2xl border border-[#E8E1D6] bg-[#F8F6F0] p-2">
                        <img
                          src={preview}
                          alt="Preview of your selected face photo"
                          className="mx-auto max-h-80 w-full rounded-xl object-contain"
                        />
                      </div>

                      <p className="mt-3 break-all text-xs leading-5 text-[#69786E]">
                        {image?.name}
                      </p>

                      <button
                        type="button"
                        disabled={loading}
                        onClick={removeImage}
                        className="mt-3 inline-flex min-h-10 items-center justify-center rounded-xl border border-[#E8E1D6] px-3 py-2 text-sm font-bold text-[#A94F36] transition hover:bg-[#FFF3E9] disabled:opacity-50"
                      >
                        Remove photo
                      </button>
                    </div>
                  )}
                </div>

                <input
                  ref={fileInputRef}
                  id="face-image"
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleImageChange}
                  disabled={loading}
                  className="sr-only"
                />
              </div>

              {/* Consent */}
              <div>
                <label
                  className={`flex items-start gap-3 rounded-2xl border p-4 transition sm:p-5 ${
                    consent
                      ? "border-[#B8D4BC] bg-[#F5FAF3]"
                      : "border-[#E8E1D6] bg-white hover:border-[#B8D4BC]"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={consent}
                    onChange={(event) => {
                      setConsent(event.target.checked);
                      setError("");
                    }}
                    disabled={loading}
                    className="mt-1 h-5 w-5 shrink-0 accent-[#347451]"
                  />

                  <span className="min-w-0">
                    <span className="block text-sm font-extrabold">
                      Consent to biometric processing
                    </span>

                    <span className="mt-2 block text-sm leading-6 text-[#69786E]">
                      I consent to SmartAttend processing my facial
                      biometric data for attendance-related purposes.
                    </span>
                  </span>
                </label>

                <p className="mt-3 text-xs leading-5 text-[#8A948C]">
                  You can only proceed after selecting the consent
                  checkbox. Read the statement before agreeing.
                </p>
              </div>

              {/* Feedback */}
              {error && (
                <div
                  role="alert"
                  className="rounded-2xl border border-[#E6C9BE] bg-[#FFF3E9] p-4"
                >
                  <p className="font-extrabold text-[#8E3E2B]">
                    Enrollment unsuccessful
                  </p>
                  <p className="mt-1 break-words text-sm leading-6 text-[#8E5B4C]">
                    {error}
                  </p>
                </div>
              )}

              {message && (
                <div
                  role="status"
                  className="rounded-2xl border border-[#D7E8D5] bg-[#F0F7EF] p-4"
                >
                  <div className="flex items-start gap-3">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#CDEED4] font-extrabold text-[#24563B]">
                      ✓
                    </span>

                    <div>
                      <p className="font-extrabold text-[#24563B]">
                        Enrollment successful
                      </p>
                      <p className="mt-1 break-words text-sm leading-6 text-[#52685A]">
                        {message}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Submit */}
              <div className="border-t border-[#EEE7DC] pt-5">
                <button
                  type="submit"
                  disabled={loading}
                  className="inline-flex min-h-12 w-full items-center justify-center gap-3 rounded-xl bg-[#347451] px-5 py-3 text-sm font-extrabold text-white shadow-sm transition hover:bg-[#24563B] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#347451] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loading && (
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                  )}

                  {loading
                    ? "Enrolling your face..."
                    : "Complete face enrollment →"}
                </button>

                <p className="mt-3 text-center text-xs leading-5 text-[#8A948C]">
                  Please keep this page open while enrollment is
                  processing.
                </p>
              </div>
            </form>
          </section>
        </div>

        {/* Footer */}
        <footer className="mt-10 border-t border-[#E8E1D6] pt-6">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm font-extrabold text-[#347451]">
              SmartAttend
            </p>
            <p className="text-xs leading-5 text-[#69786E]">
              Smart attendance management for students and teachers.
            </p>
          </div>
        </footer>
      </div>
    </main>
  );
}
