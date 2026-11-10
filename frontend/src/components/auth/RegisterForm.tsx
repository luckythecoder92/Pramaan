import { useState, type FormEvent } from "react";
import {
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  Eye,
  EyeOff,
  Loader2,
  MailCheck,
} from "lucide-react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import { getApiErrorMessage } from "../../utils/errors";
import {
  validateConfirmPassword,
  validateEmail,
  validatePassword,
} from "../../utils/validation";
import { FormField, inputClasses } from "../ui/FormField";

export function RegisterForm() {
  const { register, status } = useAuth();
  const { pushToast } = useToast();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [confirmError, setConfirmError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [confirmationEmail, setConfirmationEmail] = useState<string | null>(
    null,
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (status === "authenticated") {
    return <Navigate to="/app" replace />;
  }

  if (confirmationEmail) {
    return (
      <div className="rounded-2xl border border-success/25 bg-success/5 p-6 text-center">
        <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-success/10 text-success">
          <MailCheck className="h-6 w-6" aria-hidden="true" />
        </span>
        <h2 className="mt-4 text-lg font-semibold text-foreground">
          Confirm your email
        </h2>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          Your account was created, but the server did not return a session.
          Check <span className="font-medium text-foreground">{confirmationEmail}</span>{" "}
          for a confirmation link, then sign in.
        </p>
        <Link
          to="/login"
          className="mt-5 inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground shadow-sm transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        >
          Go to sign in
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </Link>
      </div>
    );
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError(null);

    const nextEmailError = validateEmail(email);
    const nextPasswordError = validatePassword(password, "register");
    const nextConfirmError = validateConfirmPassword(password, confirmPassword);
    setEmailError(nextEmailError);
    setPasswordError(nextPasswordError);
    setConfirmError(nextConfirmError);

    if (nextEmailError || nextPasswordError || nextConfirmError) {
      return;
    }

    setIsSubmitting(true);

    try {
      const outcome = await register(email, password);

      if (outcome.requiresConfirmation) {
        setConfirmationEmail(email.trim());
        pushToast({
          variant: "success",
          title: "Account created",
          description: "Confirm your email, then sign in.",
        });
        return;
      }

      pushToast({
        variant: "success",
        title: "Workspace created",
        description: "Upload your first PDF to get started.",
      });
      navigate("/app", { replace: true });
    } catch (error) {
      setFormError(getApiErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <div className="mb-7">
        <h1 className="text-2xl font-semibold tracking-[-0.03em] text-foreground">
          Create your workspace
        </h1>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          Start asking grounded questions across your documents in a private
          workspace.
        </p>
      </div>

      <form noValidate onSubmit={handleSubmit} className="space-y-5">
        {formError && (
          <div
            role="alert"
            className="flex items-start gap-2.5 rounded-lg border border-danger/30 bg-danger/10 px-3.5 py-3 text-sm text-danger"
          >
            <AlertCircle
              className="mt-0.5 h-4 w-4 shrink-0"
              aria-hidden="true"
            />
            <span>{formError}</span>
          </div>
        )}

        <FormField
          id="register-email"
          label="Email address"
          error={emailError ?? undefined}
          required
        >
          <input
            id="register-email"
            name="email"
            type="email"
            autoComplete="email"
            inputMode="email"
            value={email}
            onChange={(event) => {
              setEmail(event.target.value);
              if (emailError) setEmailError(null);
            }}
            aria-invalid={Boolean(emailError)}
            aria-describedby={emailError ? "register-email-error" : undefined}
            placeholder="you@company.com"
            className={`${inputClasses} h-11`}
            disabled={isSubmitting}
          />
        </FormField>

        <FormField
          id="register-password"
          label="Password"
          error={passwordError ?? undefined}
          hint="At least 12 characters."
          required
        >
          <div className="relative">
            <input
              id="register-password"
              name="password"
              type={showPassword ? "text" : "password"}
              autoComplete="new-password"
              value={password}
              onChange={(event) => {
                setPassword(event.target.value);
                if (passwordError) setPasswordError(null);
                if (confirmError) setConfirmError(null);
              }}
              aria-invalid={Boolean(passwordError)}
              aria-describedby={
                passwordError
                  ? "register-password-error"
                  : "register-password-hint"
              }
              placeholder="Create a strong password"
              className={`${inputClasses} h-11 pr-11`}
              disabled={isSubmitting}
            />
            <button
              type="button"
              onClick={() => setShowPassword((visible) => !visible)}
              aria-label={showPassword ? "Hide password" : "Show password"}
              className="absolute inset-y-0 right-0 inline-flex w-11 items-center justify-center rounded-r-lg text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Eye className="h-4 w-4" aria-hidden="true" />
              )}
            </button>
          </div>
        </FormField>

        <FormField
          id="register-confirm-password"
          label="Confirm password"
          error={confirmError ?? undefined}
          required
        >
          <div className="relative">
            <input
              id="register-confirm-password"
              name="confirmPassword"
              type={showPassword ? "text" : "password"}
              autoComplete="new-password"
              value={confirmPassword}
              onChange={(event) => {
                setConfirmPassword(event.target.value);
                if (confirmError) setConfirmError(null);
              }}
              aria-invalid={Boolean(confirmError)}
              aria-describedby={
                confirmError ? "register-confirm-password-error" : undefined
              }
              placeholder="Re-enter your password"
              className={`${inputClasses} h-11 pr-11`}
              disabled={isSubmitting}
            />
            {confirmPassword && password === confirmPassword && (
              <span className="pointer-events-none absolute inset-y-0 right-0 flex w-11 items-center justify-center text-success">
                <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
              </span>
            )}
          </div>
        </FormField>

        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground shadow-sm transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-60"
        >
          {isSubmitting ? (
            <>
              <Loader2
                className="h-4 w-4 animate-spin motion-reduce:animate-none"
                aria-hidden="true"
              />
              Creating account…
            </>
          ) : (
            <>
              Create account
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </>
          )}
        </button>
      </form>
    </div>
  );
}
