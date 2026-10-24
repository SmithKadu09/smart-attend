
import Link from "next/link";

/**
 * SmartAttend shared UI components
 * Theme: colorful cartoon-style claymorphism
 */

const buttonVariants = {
  green: "clay-button",
  peach: "clay-button clay-button-peach",
  lavender: "clay-button clay-button-lavender",
  yellow: "clay-button clay-button-yellow",
  pink: "clay-button clay-button-pink",
  blue: "clay-button clay-button-blue",
  outline: "clay-button clay-button-outline",
};

const badgeVariants = {
  green: "clay-badge clay-badge-green",
  peach: "clay-badge clay-badge-peach",
  lavender: "clay-badge clay-badge-lavender",
  yellow: "clay-badge clay-badge-yellow",
  pink: "clay-badge clay-badge-pink",
  blue: "clay-badge clay-badge-blue",
  mint: "clay-badge",
};

function joinClasses(...classes) {
  return classes.filter(Boolean).join(" ");
}

/* -----------------------------------------
   BUTTON
   ----------------------------------------- */

export function Button({
  children,
  variant = "green",
  size = "md",
  className = "",
  type = "button",
  disabled = false,
  ...props
}) {
  const sizes = {
    sm: "text-sm px-4 py-2",
    md: "",
    lg: "text-base px-7 py-4",
  };

  return (
    <button
      type={type}
      disabled={disabled}
      className={joinClasses(
        buttonVariants[variant] || buttonVariants.green,
        sizes[size] || sizes.md,
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}

/* -----------------------------------------
   LINK BUTTON
   ----------------------------------------- */

export function ButtonLink({
  href,
  children,
  variant = "green",
  size = "md",
  className = "",
  ...props
}) {
  const sizes = {
    sm: "text-sm px-4 py-2",
    md: "",
    lg: "text-base px-7 py-4",
  };

  return (
    <Link
      href={href}
      className={joinClasses(
        buttonVariants[variant] || buttonVariants.green,
        sizes[size] || sizes.md,
        className
      )}
      {...props}
    >
      {children}
    </Link>
  );
}

/* -----------------------------------------
   CARD
   ----------------------------------------- */

export function Card({
  children,
  className = "",
  hover = false,
  padding = "md",
  ...props
}) {
  const paddingSizes = {
    none: "p-0",
    sm: "p-4",
    md: "p-6",
    lg: "p-8",
  };

  return (
    <div
      className={joinClasses(
        "clay-card",
        hover && "clay-card-hover",
        paddingSizes[padding] || paddingSizes.md,
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

/* -----------------------------------------
   COLORED BADGE
   ----------------------------------------- */

export function Badge({
  children,
  variant = "mint",
  className = "",
  dot = false,
  ...props
}) {
  return (
    <span
      className={joinClasses(
        badgeVariants[variant] || badgeVariants.mint,
        className
      )}
      {...props}
    >
      {dot && <span className="clay-dot" aria-hidden="true" />}
      {children}
    </span>
  );
}

/* -----------------------------------------
   INPUT FIELD
   ----------------------------------------- */

export function Input({
  label,
  id,
  error,
  hint,
  className = "",
  ...props
}) {
  const inputId = id || props.name;

  return (
    <div className="w-full space-y-2">
      {label && (
        <label
          htmlFor={inputId}
          className="block text-sm font-bold text-[#293a32]"
        >
          {label}
          {props.required && (
            <span className="ml-1 text-[#a94f36]" aria-hidden="true">
              *
            </span>
          )}
        </label>
      )}

      <input
        id={inputId}
        className={joinClasses(
          "clay-input",
          error && "border-red-400",
          className
        )}
        aria-invalid={Boolean(error)}
        aria-describedby={
          error
            ? `${inputId}-error`
            : hint
              ? `${inputId}-hint`
              : undefined
        }
        {...props}
      />

      {error && (
        <p
          id={`${inputId}-error`}
          className="text-sm font-semibold text-red-600"
          role="alert"
        >
          {error}
        </p>
      )}

      {!error && hint && (
        <p id={`${inputId}-hint`} className="text-sm text-muted">
          {hint}
        </p>
      )}
    </div>
  );
}

/* -----------------------------------------
   TEXTAREA
   ----------------------------------------- */

export function Textarea({
  label,
  id,
  hint,
  className = "",
  ...props
}) {
  const textareaId = id || props.name;

  return (
    <div className="w-full space-y-2">
      {label && (
        <label
          htmlFor={textareaId}
          className="block text-sm font-bold text-[#293a32]"
        >
          {label}
        </label>
      )}

      <textarea
        id={textareaId}
        className={joinClasses(
          "clay-input min-h-32 resize-y",
          className
        )}
        {...props}
      />

      {hint && <p className="text-sm text-muted">{hint}</p>}
    </div>
  );
}

/* -----------------------------------------
   PAGE HEADER
   ----------------------------------------- */

export function PageHeader({
  eyebrow,
  title,
  description,
  action,
  className = "",
}) {
  return (
    <div
      className={joinClasses(
        "mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between",
        className
      )}
    >
      <div className="max-w-2xl space-y-3">
        {eyebrow && <Badge variant="lavender">{eyebrow}</Badge>}

        <h1 className="text-3xl font-black tracking-tight sm:text-4xl">
          {title}
        </h1>

        {description && (
          <p className="max-w-xl text-muted">{description}</p>
        )}
      </div>

      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}

/* -----------------------------------------
   EMPTY STATE
   ----------------------------------------- */

export function EmptyState({
  icon = "🌱",
  title,
  description,
  action,
  className = "",
}) {
  return (
    <Card
      className={joinClasses(
        "flex flex-col items-center text-center",
        className
      )}
      padding="lg"
    >
      <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-[26px] bg-[#e5d8fb] text-4xl shadow-[5px_6px_0_rgba(117,80,165,0.12)]">
        <span aria-hidden="true">{icon}</span>
      </div>

      <h2 className="mb-2 text-xl font-black">{title}</h2>

      {description && (
        <p className="mb-5 max-w-md text-muted">{description}</p>
      )}

      {action}
    </Card>
  );
}

/* -----------------------------------------
   LOADING INDICATOR
   ----------------------------------------- */

export function LoadingSpinner({ label = "Loading...", className = "" }) {
  return (
    <div
      className={joinClasses(
        "flex items-center justify-center gap-3 py-6",
        className
      )}
      role="status"
      aria-live="polite"
    >
      <span
        className="h-6 w-6 animate-spin rounded-full border-4 border-[#cdeed4] border-t-[#347451]"
        aria-hidden="true"
      />
      <span className="font-bold text-[#347451]">{label}</span>
    </div>
  );
}
