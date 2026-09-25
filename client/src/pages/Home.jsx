import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { getPublicAchievements } from "../api/tpoApi";

/* ============================================================
   THEME ICONS
============================================================ */

function SunIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      className="h-4 w-4"
    >
      <circle cx="12" cy="12" r="4" />

      <path
        strokeLinecap="round"
        d="
          M12 2v2
          M12 20v2
          M4.93 4.93l1.41 1.41
          M17.66 17.66l1.41 1.41
          M2 12h2
          M20 12h2
          M4.93 19.07l1.41-1.41
          M17.66 6.34l1.41-1.41
        "
      />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      className="h-4 w-4"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="
          M21 12.79
          A9 9 0 1 1 11.21 3
          7 7 0 0 0 21 12.79Z
        "
      />
    </svg>
  );
}

/* ============================================================
   DATA
============================================================ */

const features = [
  {
    title: "Company Intelligence",
    description:
      "Explore companies visiting your campus and understand their hiring requirements.",
  },
  {
    title: "Placement Drives",
    description:
      "Track placement drives, application details, hiring rounds, and important dates.",
  },
  {
    title: "Eligibility Information",
    description:
      "Understand CGPA, academic, backlog, branch, and skill-based eligibility requirements.",
  },
  {
    title: "AI Interview Practice",
    description:
      "Practice company-focused mock interviews and receive structured feedback.",
  },
  {
    title: "Student Profile",
    description:
      "Maintain your academic details, skills, resume, and other placement information.",
  },
  {
    title: "Preparation Resources",
    description:
      "Prepare effectively with resources relevant to your placement journey.",
  },
];

const steps = [
  {
    number: "01",
    title: "Discover",
    description:
      "Find companies, placement drives, and opportunities available through your campus.",
  },
  {
    number: "02",
    title: "Understand",
    description:
      "Check eligibility criteria, hiring processes, rounds, and important drive details.",
  },
  {
    number: "03",
    title: "Prepare",
    description:
      "Use your profile, company information, resources, and AI interview practice.",
  },
  {
    number: "04",
    title: "Apply",
    description:
      "Apply to eligible placement opportunities and keep your journey organized.",
  },
];

/* ============================================================
   CTC FORMAT
============================================================ */

function formatCtc(value) {
  const amount = Number(value);

  if (!Number.isFinite(amount)) {
    return value ?? "Not specified";
  }

  if (amount < 1000) {
    return `₹${amount.toFixed(2)} LPA`;
  }

  return `₹${amount.toLocaleString("en-IN")}`;
}

/* ============================================================
   ACHIEVEMENT CARD
============================================================ */

function AchievementCard({ achievement, dark }) {
  const studentName =
    achievement?.studentName ||
    achievement?.studentProfileName ||
    "Student";

  const department =
    achievement?.branch ||
    achievement?.department ||
    achievement?.course ||
    "Department";

  const companyName =
    achievement?.companyName ||
    achievement?.company ||
    "Company";

  return (
    <article
      className={`
        w-55
        shrink-0
        overflow-hidden
        rounded-xl
        border
        shadow-sm
        transition-colors
        duration-300
        ${
          dark
            ? "border-white/10 bg-[#1e1a3d]"
            : "border-black/10 bg-[#fbf7ee]"
        }
      `}
    >
      {/* PHOTO */}
      <div
        className={`
          h-36.25
          w-full
          overflow-hidden
          ${dark ? "bg-[#2b2456]" : "bg-[#e8e0d1]"}
        `}
      >
        {achievement?.imageUrl ? (
          <img
            src={achievement.imageUrl}
            alt={studentName}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <span
              className={`
                text-4xl
                font-black
                ${dark ? "text-white/15" : "text-black/15"}
              `}
            >
              {studentName.charAt(0).toUpperCase()}
            </span>
          </div>
        )}
      </div>

      {/* DETAILS */}
      <div className="p-4">
        {/* STUDENT NAME */}
        <h3
          className={`
            truncate
            text-base
            font-extrabold
            ${dark ? "text-white" : "text-black"}
          `}
        >
          {studentName}
        </h3>

        {/* DEPARTMENT */}
        <p
          className={`
            mt-1
            text-xs
            ${dark ? "text-white/55" : "text-slate-500"}
          `}
        >
          {department}
        </p>

        {/* COMPANY */}
        <div
          className={`
            mt-4
            rounded-lg
            px-3
            py-2.5
            ${
              dark
                ? "bg-[#2b2456]"
                : "bg-[#eee7d9]"
            }
          `}
        >
          <p
            className={`
              text-[9px]
              font-semibold
              uppercase
              tracking-[0.16em]
              ${
                dark
                  ? "text-white/45"
                  : "text-slate-500"
              }
            `}
          >
            Company
          </p>

          <p
            className={`
              mt-1
              truncate
              text-sm
              font-bold
              ${dark ? "text-white" : "text-black"}
            `}
          >
            {companyName}
          </p>
        </div>

        {/* CTC */}
        <div
          className={`
            mt-2.5
            rounded-lg
            px-3
            py-2.5
            ${
              dark
                ? "bg-white text-black"
                : "bg-black text-white"
            }
          `}
        >
          <p
            className={`
              text-[9px]
              font-semibold
              uppercase
              tracking-[0.16em]
              ${
                dark
                  ? "text-black/45"
                  : "text-white/55"
              }
            `}
          >
            CTC Offered
          </p>

          <p className="mt-1 text-sm font-extrabold">
            {formatCtc(achievement?.ctcOffered)}
          </p>
        </div>
      </div>
    </article>
  );
}

/* ============================================================
   HOME PAGE
============================================================ */

export default function Home() {
  /*
   IMPORTANT:
   This is intentionally LOCAL state.

   It does NOT use ThemeContext.
   It does NOT modify document.documentElement.
   It does NOT modify localStorage.
   Therefore Login/Register/application theme remains unchanged.
  */
  const [dark, setDark] = useState(false);

  const [achievements, setAchievements] = useState([]);
  const [loadingAchievements, setLoadingAchievements] =
    useState(true);
  const [achievementError, setAchievementError] =
    useState("");

  const [currentIndex, setCurrentIndex] = useState(0);
  const [visibleCount, setVisibleCount] = useState(5);
  const [paused, setPaused] = useState(false);

  const viewportRef = useRef(null);

  /* ==========================================================
     LOAD ACHIEVEMENTS
  ========================================================== */

  useEffect(() => {
    async function loadAchievements() {
      setLoadingAchievements(true);
      setAchievementError("");

      try {
        const result = await getPublicAchievements();

        if (!result?.success) {
          throw new Error(
            result?.message ||
              "Failed to fetch achievements."
          );
        }

        const data = Array.isArray(result?.data)
          ? result.data
          : [];

        /*
          At most 10 achievements.
        */
        setAchievements(data.slice(0, 10));
      } catch (error) {
        console.error(
          "Failed to load achievements:",
          error
        );

        setAchievementError(
          "Unable to load achievements right now."
        );
      } finally {
        setLoadingAchievements(false);
      }
    }

    loadAchievements();
  }, []);

  /* ==========================================================
     RESPONSIVE VISIBLE CARD COUNT
  ========================================================== */

  useEffect(() => {
    function updateVisibleCount() {
      if (!viewportRef.current) {
        return;
      }

      const width = viewportRef.current.clientWidth;

      const cardWidth = 220;
      const gap = 20;

      const count = Math.max(
        1,
        Math.floor(
          (width + gap) /
            (cardWidth + gap)
        )
      );

      setVisibleCount(count);
    }

    updateVisibleCount();

    window.addEventListener(
      "resize",
      updateVisibleCount
    );

    const observer = new ResizeObserver(
      updateVisibleCount
    );

    if (viewportRef.current) {
      observer.observe(viewportRef.current);
    }

    return () => {
      window.removeEventListener(
        "resize",
        updateVisibleCount
      );

      observer.disconnect();
    };
  }, []);

  /* ==========================================================
     CAROUSEL
  ========================================================== */

  const maxIndex = Math.max(
    0,
    achievements.length - visibleCount
  );

  useEffect(() => {
    if (
      achievements.length <= visibleCount ||
      paused ||
      loadingAchievements
    ) {
      return;
    }

    const interval = setInterval(() => {
      setCurrentIndex((previous) => {
        if (previous >= maxIndex) {
          return 0;
        }

        return previous + 1;
      });
    }, 2600);

    return () => {
      clearInterval(interval);
    };
  }, [
    achievements.length,
    visibleCount,
    maxIndex,
    paused,
    loadingAchievements,
  ]);

  useEffect(() => {
    if (currentIndex > maxIndex) {
      setCurrentIndex(maxIndex);
    }
  }, [currentIndex, maxIndex]);

  const cardWidth = 220;
  const gap = 20;

  const translateX =
    currentIndex * (cardWidth + gap);

  function previousAchievement() {
    setCurrentIndex((previous) => {
      if (previous <= 0) {
        return maxIndex;
      }

      return previous - 1;
    });
  }

  function nextAchievement() {
    setCurrentIndex((previous) => {
      if (previous >= maxIndex) {
        return 0;
      }

      return previous + 1;
    });
  }

  /* ==========================================================
     PAGE
  ========================================================== */

  return (
    <div
      className={`
        min-h-screen
        transition-colors
        duration-300
        ${
          dark
            ? "bg-[#140f28] text-white"
            : "bg-[#f7f1e6] text-black"
        }
      `}
    >
      {/* ======================================================
          NAVBAR
      ====================================================== */}

      <header
        className={`
          sticky
          top-0
          z-50
          border-b
          backdrop-blur
          ${
            dark
              ? "border-white/10 bg-[#140f28]/95"
              : "border-black/10 bg-[#f7f1e6]/95"
          }
        `}
      >
        <div className="mx-auto flex h-18 max-w-350 items-center justify-between px-6 md:px-10">
          {/* LOGO */}
          <Link
            to="/"
            className="text-2xl font-black tracking-[-0.04em]"
          >
            PlaceIntel
          </Link>

          {/* DESKTOP NAV */}
          <nav className="hidden items-center gap-8 md:flex">
            <a
              href="#features"
              className="text-sm font-semibold transition-opacity hover:opacity-60"
            >
              Features
            </a>

            <a
              href="#how-it-works"
              className="text-sm font-semibold transition-opacity hover:opacity-60"
            >
              How It Works
            </a>

            <a
              href="#achievements"
              className="text-sm font-semibold transition-opacity hover:opacity-60"
            >
              Achievements
            </a>

            {/* LOCAL HOME THEME TOGGLE */}
            <button
              type="button"
              onClick={() => setDark((previous) => !previous)}
              aria-label="Toggle homepage theme"
              title="Toggle homepage theme"
              className={`
                relative
                h-8
                w-16
                cursor-pointer
                overflow-hidden
                rounded-full
                border
                ${
                  dark
                    ? "border-white/15 bg-white/10"
                    : "border-black/15 bg-black/10"
                }
              `}
            >
              {/* ICONS */}
              <span className="pointer-events-none absolute inset-0 flex items-center justify-between px-2">
                <span className="flex h-6 w-6 items-center justify-center text-amber-400">
                  <SunIcon />
                </span>

                <span className="flex h-6 w-6 items-center justify-center text-indigo-200">
                  <MoonIcon />
                </span>
              </span>

              {/* SLIDING KNOB */}
              <span
                className={`
                  absolute
                  left-0.5
                  top-0.5
                  flex
                  h-7
                  w-7
                  items-center
                  justify-center
                  rounded-full
                  bg-white
                  text-slate-800
                  shadow
                  transition-transform
                  duration-300
                  ${
                    dark
                      ? "translate-x-8"
                      : "translate-x-0"
                  }
                `}
              >
                {dark ? (
                  <MoonIcon />
                ) : (
                  <SunIcon />
                )}
              </span>
            </button>

            <Link
              to="/login"
              className="text-sm font-semibold transition-opacity hover:opacity-60"
            >
              Login
            </Link>

            <Link
              to="/register"
              className={`
                rounded-lg
                px-5
                py-2.5
                text-sm
                font-bold
                ${
                  dark
                    ? "bg-white text-black"
                    : "bg-black text-white"
                }
              `}
            >
              Get Started
            </Link>
          </nav>

          {/* MOBILE */}
          <div className="flex items-center gap-3 md:hidden">
            <button
              type="button"
              onClick={() =>
                setDark((previous) => !previous)
              }
              aria-label="Toggle homepage theme"
              className={`
                flex
                h-8
                w-8
                cursor-pointer
                items-center
                justify-center
                rounded-full
                border
                ${
                  dark
                    ? "border-white/15 text-indigo-200"
                    : "border-black/15 text-amber-500"
                }
              `}
            >
              {dark ? (
                <MoonIcon />
              ) : (
                <SunIcon />
              )}
            </button>

            <Link
              to="/login"
              className="text-sm font-semibold"
            >
              Login
            </Link>

            <Link
              to="/register"
              className={`
                rounded-lg
                px-4
                py-2
                text-sm
                font-bold
                ${
                  dark
                    ? "bg-white text-black"
                    : "bg-black text-white"
                }
              `}
            >
              Register
            </Link>
          </div>
        </div>
      </header>

      {/* ======================================================
          HERO
      ====================================================== */}

      <section
        className={`
          border-b
          ${
            dark
              ? "border-white/10"
              : "border-black/10"
          }
        `}
      >
        <div className="mx-auto flex min-h-[calc(100vh-72px)] max-w-275 items-center justify-center px-6 py-20 text-center">
          <div className="w-full">
            {/* BADGE */}
            <div
              className={`
                mx-auto
                inline-flex
                items-center
                gap-3
                rounded-full
                border
                px-5
                py-2.5
                ${
                  dark
                    ? "border-white/15"
                    : "border-black/15"
                }
              `}
            >
              <span className="h-2.5 w-2.5 rounded-full bg-current" />

              <span className="text-sm font-semibold">
                Smart Campus Placement Platform
              </span>
            </div>

            {/* MAIN HEADING */}
            <h1
              className="
                mx-auto
                mt-8
                max-w-4xl
                text-4xl
                font-black
                leading-none
                tracking-[-0.045em]
                sm:text-5xl
                md:text-6xl
              "
            >
              Your placement journey,
              <br />
              organized in one place.
            </h1>

            {/* DESCRIPTION */}
            <p
              className={`
                mx-auto
                mt-6
                max-w-2xl
                text-base
                leading-7
                ${
                  dark
                    ? "text-white/60"
                    : "text-slate-600"
                }
              `}
            >
              Discover companies, explore placement drives,
              understand eligibility, prepare for interviews,
              and stay informed throughout your placement journey.
            </p>

            {/* ONLY HERO BUTTONS */}
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link
                to="/register"
                className={`
                  rounded-lg
                  px-6
                  py-3
                  text-sm
                  font-bold
                  ${
                    dark
                      ? "bg-white text-black"
                      : "bg-black text-white"
                  }
                `}
              >
                Create Student Account
              </Link>

              <a
                href="#achievements"
                className={`
                  rounded-lg
                  border
                  px-6
                  py-3
                  text-sm
                  font-bold
                  ${
                    dark
                      ? "border-white/25 hover:bg-white hover:text-black"
                      : "border-black hover:bg-black hover:text-white"
                  }
                `}
              >
                View Achievements
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ======================================================
          STUDENT ACHIEVEMENTS
          IMMEDIATELY AFTER HERO
      ====================================================== */}

      <section
        id="achievements"
        className={`
          border-b
          ${
            dark
              ? "border-white/10"
              : "border-black/10"
          }
        `}
      >
        <div className="mx-auto max-w-312.5 px-6 py-18 md:px-10 md:py-20">
          {/* HEADING */}
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-xs font-bold uppercase tracking-[0.2em]">
              Student Achievements
            </p>

            <h2 className="mt-3 text-3xl font-black tracking-[-0.035em]">
              Celebrating student placements
            </h2>

            <p
              className={`
                mx-auto
                mt-4
                max-w-xl
                text-sm
                leading-6
                ${
                  dark
                    ? "text-white/60"
                    : "text-slate-600"
                }
              `}
            >
              Real placement achievements added by the placement
              team, showcasing students, departments, companies,
              and CTCs.
            </p>
          </div>

          {/* LOADING */}
          {loadingAchievements && (
            <div className="flex justify-center py-14">
              <div
                className={`
                  h-8
                  w-8
                  animate-spin
                  rounded-full
                  border-4
                  ${
                    dark
                      ? "border-white/10 border-t-white"
                      : "border-black/10 border-t-black"
                  }
                `}
              />
            </div>
          )}

          {/* ERROR */}
          {!loadingAchievements &&
            achievementError && (
              <div className="py-12 text-center">
                <p
                  className={`
                    text-sm
                    ${
                      dark
                        ? "text-white/60"
                        : "text-slate-500"
                    }
                  `}
                >
                  {achievementError}
                </p>
              </div>
            )}

          {/* EMPTY */}
          {!loadingAchievements &&
            !achievementError &&
            achievements.length === 0 && (
              <div className="py-12 text-center">
                <p
                  className={`
                    text-sm
                    ${
                      dark
                        ? "text-white/60"
                        : "text-slate-500"
                    }
                  `}
                >
                  No placement achievements available yet.
                </p>
              </div>
            )}

          {/* ==================================================
              HORIZONTAL CAROUSEL
          ================================================== */}

          {!loadingAchievements &&
            !achievementError &&
            achievements.length > 0 && (
              <div className="mx-auto mt-10 max-w-295">
                <div
                  ref={viewportRef}
                  className="overflow-hidden px-1 py-2"
                  onMouseEnter={() => setPaused(true)}
                  onMouseLeave={() => setPaused(false)}
                >
                  <div
                    className={`flex gap-5 ${
                      achievements.length <= visibleCount
                        ? "justify-center"
                        : ""
                    }`}
                    style={{
                      transform:
                        achievements.length <= visibleCount
                          ? "none"
                          : `translateX(-${translateX}px)`,
                      transition:
                        "transform 650ms cubic-bezier(0.22,1,0.36,1)",
                    }}
                  >
                    {achievements.map(
                      (achievement, index) => (
                        <AchievementCard
                          key={
                            achievement?.id ||
                            `achievement-${index}`
                          }
                          achievement={achievement}
                          dark={dark}
                        />
                      )
                    )}
                  </div>
                </div>

                {/* CONTROLS */}
                {achievements.length >
                  visibleCount && (
                  <div className="mt-6 flex items-center justify-center gap-4">
                    <button
                      type="button"
                      onClick={previousAchievement}
                      aria-label="Previous achievement"
                      className={`
                        flex
                        h-8
                        w-8
                        cursor-pointer
                        items-center
                        justify-center
                        rounded-full
                        border
                        text-lg
                        ${
                          dark
                            ? "border-white/15 hover:bg-white hover:text-black"
                            : "border-black/15 hover:bg-black hover:text-white"
                        }
                      `}
                    >
                      ‹
                    </button>

                    <button
                      type="button"
                      onClick={nextAchievement}
                      aria-label="Next achievement"
                      className={`
                        flex
                        h-8
                        w-8
                        cursor-pointer
                        items-center
                        justify-center
                        rounded-full
                        border
                        text-lg
                        ${
                          dark
                            ? "border-white/15 hover:bg-white hover:text-black"
                            : "border-black/15 hover:bg-black hover:text-white"
                        }
                      `}
                    >
                      ›
                    </button>
                  </div>
                )}
              </div>
            )}
        </div>
      </section>

      {/* ======================================================
          FEATURES
      ====================================================== */}

      <section
        id="features"
        className={`
          border-b
          ${
            dark
              ? "border-white/10"
              : "border-black/10"
          }
        `}
      >
        <div className="mx-auto max-w-287.5 px-6 py-20">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-xs font-bold uppercase tracking-[0.2em]">
              Features
            </p>

            <h2 className="mt-3 text-3xl font-black tracking-[-0.035em]">
              Everything you need for placements
            </h2>
          </div>

          <div className="mx-auto mt-10 grid max-w-5xl grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => (
              <div
                key={feature.title}
                className={`
                  rounded-xl
                  border
                  p-5
                  ${
                    dark
                      ? "border-white/10 bg-[#1c1840]"
                      : "border-black/10 bg-[#fbf7ee]"
                  }
                `}
              >
                <h3 className="text-base font-extrabold">
                  {feature.title}
                </h3>

                <p
                  className={`
                    mt-3
                    text-sm
                    leading-6
                    ${
                      dark
                        ? "text-white/60"
                        : "text-slate-600"
                    }
                  `}
                >
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ======================================================
          HOW IT WORKS
      ====================================================== */}

      <section id="how-it-works">
        <div className="mx-auto max-w-287.5 px-6 py-20">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-xs font-bold uppercase tracking-[0.2em]">
              How It Works
            </p>

            <h2 className="mt-3 text-3xl font-black tracking-[-0.035em]">
              From discovery to placement
            </h2>
          </div>

          <div className="mx-auto mt-10 grid max-w-5xl grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
            {steps.map((step) => (
              <div
                key={step.number}
                className={`
                  rounded-xl
                  border
                  p-5
                  ${
                    dark
                      ? "border-white/10 bg-[#1c1840]"
                      : "border-black/10 bg-[#fbf7ee]"
                  }
                `}
              >
                <p className="text-xs font-black tracking-[0.15em]">
                  {step.number}
                </p>

                <h3 className="mt-5 text-lg font-black">
                  {step.title}
                </h3>

                <p
                  className={`
                    mt-3
                    text-sm
                    leading-6
                    ${
                      dark
                        ? "text-white/60"
                        : "text-slate-600"
                    }
                  `}
                >
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ======================================================
          FOOTER
      ====================================================== */}

      <footer
        className={`
          border-t
          ${
            dark
              ? "border-white/10"
              : "border-black/10"
          }
        `}
      >
        <div className="mx-auto max-w-287.5 px-6 py-10 text-center">
          <h3 className="text-xl font-black">
            PlaceIntel
          </h3>

          <p
            className={`
              mx-auto
              mt-2
              max-w-xl
              text-sm
              leading-6
              ${
                dark
                  ? "text-white/60"
                  : "text-slate-500"
              }
            `}
          >
            A centralized platform for discovering companies,
            placement drives, and placement preparation.
          </p>

          <p
            className={`
              mt-7
              text-xs
              ${
                dark
                  ? "text-white/40"
                  : "text-slate-400"
              }
            `}
          >
            © {new Date().getFullYear()} PlaceIntel. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}