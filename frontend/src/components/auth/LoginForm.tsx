import { useState, type FormEvent } from "react";
import { AlertCircle, ArrowRight, Eye, EyeOff, Loader2 } from "lucide-react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import { getApiErrorMessage } from "../../utils/errors";
import { validateEmail, validatePassword } from "../../utils/validation";
import { FormField, inputClasses } from "../ui/FormField";

interface RedirectState {
  from?: {
    pathname?: string;
    search?: string;
    hash?: string;
  };
}

function getRedirectTarget(state: unknown): string {
  if (typeof state !== "object" || state === null) {
    return "/app";
  }

  const from = (state as RedirectState).from;

  if (!from || typeof from.pathname !== "string") {
    return "/app";
  }

  if (!from.pathname.startsWith("/app")) {
    return "/app";
  }

  return `${from.pathname}${from.search ?? ""}${from.hash ?? ""}`;
}

export function LoginForm() {
  const { login, status } = useAuth();
  const { pushToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const redirectTo = getRedirectTarget(location.state);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (status === "authenticated") {
    return <Navigate to={redirectTo} replace />;
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError(null);

    const nextEmailError = validateEmail(email);
    const nextPasswordError = validatePassword(password, "login");
    setEmailError(nextEmailError);
    setPasswordError(nextPasswordError);

    if (nextEmailError || nextPasswordError) {
      return;
    }

    setIsSubmitting(true);

    try {
      await login(email, password);
      pushToast({
        variant: "success",
        title: "Welcome back",
        description: "Your document workspace is ready.",
      });
      navigate(redirectTo, { replace: true });
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
          Welcome back
        </h1>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          Sign in to open your document workspace and continue where you left
          off.
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
          id="login-email"
          label="Email address"
          error={emailError ?? undefined}
          required
        >
          <input
            id="login-email"
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
            aria-describedby={emailError ? "login-email-error" : undefined}
            placeholder="you@company.com"
            className={`${inputClasses} h-11`}
            disabled={isSubmitting}
          />
        </FormField>

        <FormField
          id="login-password"
          label="Password"
          error={passwordError ?? undefined}
          required
        >
          <div className="relative">
            <input
              id="login-password"
              name="password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              value={password}
              onChange={(event) => {
                setPassword(event.target.value);
                if (passwordError) setPasswordError(null);
              }}
              aria-invalid={Boolean(passwordError)}
              aria-describedby={
                passwordError ? "login-password-error" : undefined
              }
              placeholder="Enter your password"
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
              Signing in…
            </>
          ) : (
            <>
              Sign in
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </>
          )}
        </button>
      </form>
    </div>
  );
}
