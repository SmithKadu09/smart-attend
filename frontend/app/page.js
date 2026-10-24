
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";


const features = [
  {
    number: "01",
    icon: "◎",
    title: "Face-assisted recognition",
    description:
      "Compare classroom photos with enrolled student profiles to help automate attendance.",
    bg: "bg-[#D2F0D8]",
    color: "text-[#347451]",
  },
  {
    number: "02",
    icon: "⌘",
    title: "Simple classroom joining",
    description:
      "Let students join the right classroom using a class code, with QR support in the workflow.",
    bg: "bg-[#FFE5B5]",
    color: "text-[#93651D]",
  },
  {
    number: "03",
    icon: "▤",
    title: "Clear attendance records",
    description:
      "View session records, correct attendance, and finalize a classroom session.",
    bg: "bg-[#E5D8FB]",
    color: "text-[#7550A5]",
  },
  {
    number: "04",
    icon: "↗",
    title: "Fewer repetitive tasks",
    description:
      "Reduce manual work while keeping teachers in control of uncertain recognition results.",
    bg: "bg-[#FFDCCB]",
    color: "text-[#A94F36]",
  },
  {
    number: "05",
    icon: "◷",
    title: "Session-based tracking",
    description:
      "Organize attendance by classroom session instead of managing scattered records.",
    bg: "bg-[#C9EEE8]",
    color: "text-[#28756D]",
  },
  {
    number: "06",
    icon: "♡",
    title: "Designed around people",
    description:
      "Give students and teachers separate experiences with straightforward workflows.",
    bg: "bg-[#F8D8E4]",
    color: "text-[#A4496B]",
  },
];

const faqs = [
  {
    question: "Who can use SmartAttend?",
    answer:
      "SmartAttend is designed for teachers who manage classrooms and students who enroll, join classes, and view their attendance.",
  },
  {
    question: "How does photo-assisted attendance work?",
    answer:
      "A teacher starts a classroom session and uploads a photo. The system compares detected faces with enrolled profiles for that classroom. Uncertain matches should be reviewed before records are finalized.",
  },
  {
    question: "Can students join a classroom themselves?",
    answer:
      "Students can join using a classroom code. QR-based joining is part of the planned experience and must be connected to the appropriate frontend and backend flow.",
  },
  {
    question: "How are face profiles handled?",
    answer:
      "Face enrollment should require informed consent. Biometric information must be protected, access restricted, and deletion supported. Avoid uploading another person's biometric data without authorization.",
  },
  {
    question: "Does the system mark every student absent if they are not detected?",
    answer:
      "No. A student not detected in a photo should not automatically be treated as absent. Attendance records need an explicit review and finalization process.",
  },
  {
    question: "Is the landing page showing real attendance data?",
    answer:
      "No. The numbers and illustrations on this page are examples for presentation. Live information will appear only after the frontend is connected to the backend APIs.",
  },
];

function BrandMark() {
  return (
    <div className="flex h-12 w-12 rotate-[-5deg] items-center justify-center rounded-[19px] border border-white bg-[#CDEED4] text-xl font-black text-[#347451] shadow-[6px_7px_13px_rgba(91,138,103,0.2),-5px_-5px_12px_white]">
      S
    </div>
  );
}

function SectionLabel({ children, color = "text-[#7550A5]" }) {
  return (
    <p className={`text-xs font-black tracking-[0.2em] ${color}`}>
      {children}
    </p>
  );
}

function FaceArtwork() {
  return (
    <div className="relative mx-auto aspect-square w-full max-w-[470px]">
      <div className="absolute inset-[8%] rotate-[-9deg] rounded-[36%] border border-white bg-[#E5D8FB] shadow-[14px_16px_28px_rgba(117,80,165,0.18),-9px_-9px_22px_white]" />

      <div className="absolute left-[6%] top-[8%] flex h-16 w-16 rotate-[-12deg] items-center justify-center rounded-[22px] border border-white bg-[#FFE5A9] text-3xl text-[#93651D] shadow-[7px_8px_14px_rgba(141,100,28,0.2),-5px_-5px_12px_white]">
        ✳
      </div>

      <div className="absolute right-[3%] top-[28%] flex h-[70px] w-[70px] rotate-[12deg] items-center justify-center rounded-[24px] border border-white bg-[#FFDDCB] text-3xl text-[#A94F36] shadow-[7px_8px_14px_rgba(169,79,54,0.17),-5px_-5px_12px_white]">
        +
      </div>

      <div className="absolute bottom-[6%] left-[12%] flex h-[72px] w-[72px] rotate-[8deg] items-center justify-center rounded-[24px] border border-white bg-[#C9EEE8] text-3xl text-[#28756D] shadow-[7px_8px_14px_rgba(40,117,109,0.17),-5px_-5px_12px_white]">
        ✓
      </div>

      <div className="absolute inset-x-[20%] bottom-[12%] top-[13%] overflow-hidden rounded-[46%_46%_38%_38%] border border-white bg-[#F5D9C6] shadow-[12px_15px_25px_rgba(133,110,77,0.2),-7px_-7px_17px_white]">
        <div className="absolute left-[10%] top-[4%] h-[38%] w-[80%] rounded-t-[48%] rounded-b-[30%] bg-[#604638]" />

        <div className="absolute left-[23%] top-[23%] h-[46%] w-[54%] rounded-[44%_44%_48%_48%] bg-[#D89A77]" />

        <div className="absolute left-[32%] top-[43%] h-[7px] w-[7px] rounded-full bg-[#45342C]" />
        <div className="absolute right-[32%] top-[43%] h-[7px] w-[7px] rounded-full bg-[#45342C]" />

        <div className="absolute left-[46%] top-[48%] h-[13px] w-[8px] rounded-full border-r-2 border-[#B87C5E]" />

        <div className="absolute left-[41%] top-[59%] h-[9px] w-[18%] rounded-b-full border-b-[3px] border-[#985A4C]" />

        <div className="absolute left-[10%] top-[69%] h-[45%] w-[80%] rounded-t-[45%] bg-[#6D9C82]" />
        <div className="absolute left-[42%] top-[66%] h-[17%] w-[16%] rounded-b-xl bg-[#D89A77]" />
      </div>

      <div className="absolute bottom-[15%] right-[-1%] rounded-[20px] border border-white bg-white/95 px-4 py-3 shadow-[7px_8px_16px_rgba(133,110,77,0.17)]">
        <p className="text-xs font-bold text-[#293A32]">Teacher-controlled</p>
        <p className="mt-1 text-[10px] text-[#747C72]">
          Clear attendance records
        </p>
      </div>
    </div>
  );
}

export default function Home() {
  const router = useRouter();
  const [openFaq, setOpenFaq] = useState(0);

  return (
    <main className="min-h-screen overflow-hidden text-[#293A32]">
      {/* Navigation */}
      <header className="mx-auto flex max-w-7xl items-center justify-between px-5 py-5 sm:px-8 lg:px-12">
        <a href="/" className="flex items-center gap-3">
          <BrandMark />
          <div>
            <p className="text-lg font-black tracking-tight">SmartAttend</p>
            <p className="text-[10px] font-bold tracking-[0.16em] text-[#747C72]">
              SMARTER CLASSROOMS
            </p>
          </div>
        </a>

        <nav className="hidden items-center gap-7 text-sm font-semibold text-[#747C72] md:flex">
          <a href="#features" className="hover:text-[#7550A5]">
            Features
          </a>
          <a href="#how-it-works" className="hover:text-[#7550A5]">
            How it works
          </a>
          <a href="#privacy" className="hover:text-[#7550A5]">
            Privacy
          </a>
          <a href="#faq" className="hover:text-[#7550A5]">
            FAQs
          </a>
        </nav>

        <button
          onClick={() => router.push("/login")}
          className="clay-button clay-button-lavender min-h-0 px-4 py-3 text-sm"
        >
          Sign in <span aria-hidden="true">↗</span>
        </button>
      </header>

      {/* Hero */}
      <section className="mx-auto grid max-w-7xl items-center gap-5 px-5 pb-16 pt-8 sm:px-8 md:grid-cols-2 md:gap-8 md:pb-24 md:pt-12 lg:px-12">
        <div className="relative z-10">
          <div className="clay-badge mb-7">
            <span className="clay-dot" />
            A fresh take on attendance
          </div>

          <h1 className="max-w-2xl text-[clamp(3.2rem,7vw,5.8rem)] font-black leading-[0.96] tracking-[-0.065em]">
            Less admin.
            <span className="mt-2 block text-[#7550A5]">More learning.</span>
          </h1>

          <p className="mt-7 max-w-xl text-base leading-8 text-[#747C72] sm:text-lg">
            Make classroom attendance simpler. SmartAttend brings classroom
            management, photo-assisted face recognition, and attendance
            records into one connected experience.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <button onClick={() => router.push("/register")} className="clay-button">
              Get started <span aria-hidden="true">↗</span>
            </button>
            <a href="#how-it-works" className="clay-button clay-button-peach">
              See how it works <span aria-hidden="true">↓</span>
            </a>
          </div>

          <div className="mt-8 flex flex-wrap gap-x-6 gap-y-3 text-sm font-semibold text-[#747C72]">
            <span><span className="text-[#347451]">✓</span> For teachers</span>
            <span><span className="text-[#7550A5]">✓</span> For students</span>
            <span><span className="text-[#A4496B]">✓</span> Teacher oversight</span>
          </div>
        </div>

        <div className="relative mx-auto w-full max-w-xl">
          <div className="absolute right-0 top-[10%] h-48 w-48 rounded-full bg-[#FFE5A9]/65 blur-3xl" />
          <div className="absolute bottom-[5%] left-0 h-48 w-48 rounded-full bg-[#CDEED4]/75 blur-3xl" />
          <FaceArtwork />
        </div>
      </section>

      {/* Product summary strip */}
      <section className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-12">
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="clay-card flex items-center gap-4 p-5">
            <div className="clay-icon bg-[#D2F0D8] text-2xl text-[#347451]">◎</div>
            <div>
              <p className="font-extrabold">Photo-assisted</p>
              <p className="mt-1 text-sm text-[#747C72]">Face recognition workflow</p>
            </div>
          </div>
          <div className="clay-card flex items-center gap-4 p-5">
            <div className="clay-icon bg-[#FFE5B5] text-2xl text-[#93651D]">⌘</div>
            <div>
              <p className="font-extrabold">Connected classes</p>
              <p className="mt-1 text-sm text-[#747C72]">Codes and enrollment</p>
            </div>
          </div>
          <div className="clay-card flex items-center gap-4 p-5">
            <div className="clay-icon bg-[#E5D8FB] text-2xl text-[#7550A5]">▤</div>
            <div>
              <p className="font-extrabold">Clear records</p>
              <p className="mt-1 text-sm text-[#747C72]">Review and finalize</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="mx-auto max-w-7xl px-5 py-20 sm:px-8 lg:px-12">
        <div className="mb-10 max-w-3xl">
          <SectionLabel color="text-[#A4496B]">THE SMARTATTEND TOOLKIT</SectionLabel>
          <h2 className="mt-4 text-3xl font-black tracking-tight sm:text-5xl">
            Everyday tasks, made a little easier.
          </h2>
          <p className="mt-5 max-w-2xl leading-7 text-[#747C72]">
            From creating a classroom to checking a finished attendance session,
            each part of the workflow has a clear purpose.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => (
            <article key={feature.number} className="clay-card clay-card-hover p-6 sm:p-7">
              <div className="flex items-start justify-between">
                <div className={`clay-icon ${feature.bg} ${feature.color} text-3xl`}>
                  {feature.icon}
                </div>
                <span className="text-sm font-black text-[#B5B0A5]">
                  {feature.number}
                </span>
              </div>
              <h3 className="mt-7 text-xl font-extrabold">{feature.title}</h3>
              <p className="mt-3 text-sm leading-7 text-[#747C72]">
                {feature.description}
              </p>
            </article>
          ))}
        </div>
      </section>

      {/* Role-based experience */}
      <section className="mx-auto max-w-7xl px-5 py-8 sm:px-8 lg:px-12">
        <div className="grid gap-7 md:grid-cols-2">
          <article className="clay-panel bg-[#D2F0D8] p-7 sm:p-9">
            <div className="clay-icon bg-[#F9FFF7] text-3xl text-[#347451]">♙</div>
            <SectionLabel color="text-[#347451]">FOR TEACHERS</SectionLabel>
            <h2 className="mt-3 text-3xl font-black">Your classroom, organized.</h2>
            <p className="mt-4 leading-7 text-[#4F7059]">
              Manage subjects, create attendance sessions, upload classroom
              photos, inspect records, correct statuses, and finalize sessions.
            </p>
            <ul className="mt-6 space-y-3 text-sm font-semibold text-[#365C43]">
              <li>✓ Classroom and enrollment management</li>
              <li>✓ Photo-assisted attendance processing</li>
              <li>✓ Review, correction, and finalization</li>
            </ul>
            <button
              onClick={() => router.push("/register?role=teacher")}
              className="clay-button mt-7"
            >
              Join as a teacher ↗
            </button>
          </article>

          <article className="clay-panel bg-[#FFDCCB] p-7 sm:p-9">
            <div className="clay-icon bg-[#FFF9F5] text-3xl text-[#A94F36]">♧</div>
            <SectionLabel color="text-[#A94F36]">FOR STUDENTS</SectionLabel>
            <h2 className="mt-3 text-3xl font-black">Stay connected to class.</h2>
            <p className="mt-4 leading-7 text-[#80594B]">
              Join classrooms, enroll your face with consent, and view your
              attendance information from your student portal.
            </p>
            <ul className="mt-6 space-y-3 text-sm font-semibold text-[#80513F]">
              <li>✓ Join with a classroom code</li>
              <li>✓ Consent-based biometric enrollment</li>
              <li>✓ Classroom and attendance overview</li>
            </ul>
            <button
              onClick={() => router.push("/register?role=student")}
              className="clay-button clay-button-peach mt-7"
            >
              Join as a student ↗
            </button>
          </article>
        </div>
      </section>

      {/* Workflow */}
      <section id="how-it-works" className="mx-auto max-w-7xl px-5 py-20 sm:px-8 lg:px-12">
        <div className="clay-panel bg-[#E5D8FB] p-7 sm:p-10 lg:p-12">
          <SectionLabel>HOW IT WORKS</SectionLabel>
          <h2 className="mt-4 max-w-3xl text-3xl font-black tracking-tight sm:text-5xl">
            From classroom setup to a completed session.
          </h2>
          <p className="mt-5 max-w-2xl leading-7 text-[#655878]">
            The goal is a straightforward workflow that reduces repetitive
            work without hiding important decisions from teachers.
          </p>

          <div className="mt-9 grid gap-4 md:grid-cols-4">
            {[
              ["01", "Create", "Set up a classroom and invite students.", "bg-[#FFE5A9]", "text-[#8D641C]"],
              ["02", "Capture", "Start a session and upload a photo.", "bg-[#FFDCCB]", "text-[#A94F36]"],
              ["03", "Recognize", "Compare faces with enrolled profiles.", "bg-[#C9EEE8]", "text-[#28756D]"],
              ["04", "Finalize", "Review uncertain matches and confirm records.", "bg-[#D2F0D8]", "text-[#347451]"],
            ].map(([number, title, description, bg, color]) => (
              <div key={number} className="clay-card p-5">
                <div className={`clay-icon ${bg} ${color} text-xl font-black`}>
                  {number}
                </div>
                <h3 className="mt-5 text-lg font-extrabold">{title}</h3>
                <p className="mt-2 text-sm leading-6 text-[#747C72]">
                  {description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Privacy */}
      <section id="privacy" className="mx-auto max-w-7xl px-5 py-10 sm:px-8 lg:px-12">
        <div className="grid items-center gap-8 md:grid-cols-[0.8fr_1.2fr]">
          <div>
            <SectionLabel color="text-[#28756D]">PRIVACY & CONTROL</SectionLabel>
            <h2 className="mt-4 text-3xl font-black tracking-tight sm:text-4xl">
              Smart recognition. Human oversight.
            </h2>
            <p className="mt-5 leading-7 text-[#747C72]">
              Attendance automation should assist teachers, not remove their
              ability to check and correct records.
            </p>
          </div>

          <div className="clay-card p-6 sm:p-8">
            <div className="space-y-6">
              {[
                ["Consent comes first", "Students should understand biometric enrollment and consent before their face profile is stored.", "bg-[#D2F0D8]", "text-[#347451]"],
                ["Uncertain matches need care", "Ambiguous matches should be reviewed instead of silently treated as confirmed attendance.", "bg-[#FFE5B5]", "text-[#93651D]"],
                ["Records stay controllable", "Teachers can correct attendance and finalize sessions through explicit actions.", "bg-[#E5D8FB]", "text-[#7550A5]"],
              ].map(([title, description, bg, color]) => (
                <div key={title} className="flex gap-4">
                  <div className={`clay-icon ${bg} ${color} text-xl`}>✓</div>
                  <div>
                    <h3 className="font-extrabold">{title}</h3>
                    <p className="mt-2 text-sm leading-7 text-[#747C72]">
                      {description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="mx-auto max-w-4xl px-5 py-20 sm:px-8">
        <div className="mb-9 text-center">
          <SectionLabel color="text-[#A4496B]">GOOD QUESTIONS</SectionLabel>
          <h2 className="mt-4 text-3xl font-black tracking-tight sm:text-4xl">
            Frequently asked questions.
          </h2>
          <p className="mt-4 text-[#747C72]">
            A few things to know before getting started.
          </p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <article key={faq.question} className="clay-card overflow-hidden">
              <button
                type="button"
                aria-expanded={openFaq === index}
                onClick={() => setOpenFaq(openFaq === index ? -1 : index)}
                className="flex w-full items-center justify-between gap-5 p-5 text-left sm:p-6"
              >
                <span className="font-bold">{faq.question}</span>
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#E5D8FB] text-xl text-[#7550A5]">
                  {openFaq === index ? "−" : "+"}
                </span>
              </button>

              {openFaq === index && (
                <div className="px-5 pb-6 text-sm leading-7 text-[#747C72] sm:px-6">
                  {faq.answer}
                </div>
              )}
            </article>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-7xl px-5 py-10 sm:px-8 lg:px-12">
        <div className="clay-panel bg-[#FFE5A9] p-7 sm:p-10 lg:p-12">
          <div className="flex flex-col gap-7 md:flex-row md:items-center md:justify-between">
            <div>
              <SectionLabel color="text-[#8D641C]">YOUR NEXT CLASS STARTS HERE</SectionLabel>
              <h2 className="mt-4 max-w-2xl text-3xl font-black tracking-tight sm:text-4xl">
                Make more room for teaching.
              </h2>
              <p className="mt-4 max-w-xl leading-7 text-[#79633A]">
                Get started with a connected classroom attendance workflow.
              </p>
            </div>
            <button
              onClick={() => router.push("/register")}
              className="clay-button clay-button-lavender shrink-0"
            >
              Create your account ↗
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mx-auto mt-12 max-w-7xl border-t border-[#E9DFD0] px-5 py-8 sm:px-8 lg:px-12">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <a href="/" className="flex items-center gap-3">
            <BrandMark />
            <div>
              <p className="font-black">SmartAttend</p>
              <p className="text-xs text-[#747C72]">
                Thoughtfully designed for classrooms.
              </p>
            </div>
          </a>

          <div className="flex flex-wrap gap-x-5 gap-y-3 text-sm font-semibold text-[#747C72]">
            <a href="#features" className="hover:text-[#7550A5]">Features</a>
            <a href="#how-it-works" className="hover:text-[#7550A5]">How it works</a>
            <a href="#privacy" className="hover:text-[#7550A5]">Privacy</a>
            <a href="#faq" className="hover:text-[#7550A5]">FAQs</a>
          </div>
        </div>

        <p className="mt-7 text-xs leading-6 text-[#89887F]">
          © 2026 SmartAttend. Attendance assistance designed around people.
          Product illustrations and examples are illustrative, not live data.
        </p>
      </footer>
    </main>
  );
}
