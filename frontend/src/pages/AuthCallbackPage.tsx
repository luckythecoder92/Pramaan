import { useEffect, useRef, useState } from "react";
import { AlertCircle, ArrowRight, CheckCircle2, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import { AuthLayout } from "../components/layout/AuthLayout";
import { confirmEmail, me as meRequest } from "../services/auth.service";
import { saveSession, saveToken } from "../services/authStorage";
import { getApiErrorMessage } from "../utils/errors";

type Phase = "verifying" | "verified" | "error";

interface CallbackParams {
  code: string | null;
  tokenHash: string | null;
  type: string | null;
  accessToken: string | null;
  error: string | null;
}

const MAX_ERROR_LENGTH = 200;

function firstValue(...values: (string | null)[]): string | null {
  for (const value of values) {
    if (typeof value === "string" && value.trim().length > 0) {
      return value.trim();
    }
  }

  return null;
}

/**
 * Supabase can land on the callback in three shapes:
 *   ?code=...                          authorization code flow
 *   ?token_hash=...&type=signup        email OTP links
 *   #access_token=...&refresh_token=.. implicit flow
 * plus `error` / `error_description` when verification failed upstream.
 */
function readCallbackParams(): CallbackParams {
  const search = new URLSearchParams(window.location.search);
  const hash = new URLSearchParams(window.location.hash.replace(/^#/, ""));

  const error = firstValue(
    search.get("error_description"),
    hash.get("error_description"),
    search.get("error"),
    hash.get("error"),
  );

  return {
    code: firstValue(search.get("code")),
    tokenHash: firstValue(search.get("token_hash")),
    type: firstValue(search.get("type")),
    accessToken: firstValue(hash.get("access_token")),
    error: error ? error.slice(0, MAX_ERROR_LENGTH) : null,
  };
}

export function AuthCallbackPage() {
  const [phase, setPhase] = useState<Phase>("verifying");
  const [message, setMessage] = useState<string>(
    "Verifying your email address. This only takes a moment.",
  );
  const started = useRef(false);

  useEffect(() => {
    if (started.current) {
      return;
    }

    // Guards against React StrictMode double-invocation: confirmation codes
    // are single use, so the exchange must happen exactly once.
    started.current = true;

    async function finishSignIn(token: string) {
      saveToken(token);

      try {
        const response = await meRequest();
        saveSession(token, response.user);
      } catch {
        // The token stays stored; AuthProvider revalidates it on /app and
        // signs the user out cleanly if it is rejected.
      }

      // Full navigation keeps the AuthProvider state consistent with storage.
      window.location.replace("/app");
    }

    async function completeVerification() {
      const params = readCallbackParams();

      // Drop codes/tokens from the address bar and browser history immediately.
      window.history.replaceState(null, "", window.location.pathname);

      if (params.error) {
        setPhase("error");
        setMessage(params.error);
        return;
      }

      try {
        let token = params.accessToken;

        if (!token && (params.code || params.tokenHash)) {
          const response = await confirmEmail(
            params.code
              ? { code: params.code }
              : {
                  token_hash: params.tokenHash ?? undefined,
                  type: params.type ?? undefined,
                },
          );

          token = response.access_token;
        }

        if (!token) {
          // The address is already confirmed but Supabase issued no session
          // (for example when the link was opened a second time). Signing in
          // normally still works, so send the user there instead of looping.
          setPhase("verified");
          setMessage(
            "Your email address is confirmed. Sign in to open your workspace.",
          );
          return;
        }

        await finishSignIn(token);
      } catch (error) {
        setPhase("error");
        setMessage(getApiErrorMessage(error));
      }
    }

    void completeVerification();
  }, []);

  return (
    <AuthLayout
      footer={
        <>
          Having trouble?{" "}
          <Link
            to="/register"
            className="font-semibold text-primary underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            Create a new account
          </Link>
        </>
      }
    >
      <div
        role="status"
        aria-live="polite"
        className="rounded-2xl border border-border bg-surface/60 p-8 text-center"
      >
        <span
          className={[
            "mx-auto flex h-12 w-12 items-center justify-center rounded-2xl",
            phase === "error"
              ? "bg-destructive/10 text-destructive"
              : phase === "verified"
                ? "bg-success/10 text-success"
                : "bg-primary/10 text-primary",
          ].join(" ")}
        >
          {phase === "verifying" ? (
            <Loader2 className="h-6 w-6 animate-spin" aria-hidden="true" />
          ) : phase === "verified" ? (
            <CheckCircle2 className="h-6 w-6" aria-hidden="true" />
          ) : (
            <AlertCircle className="h-6 w-6" aria-hidden="true" />
          )}
        </span>

        <h1 className="mt-4 text-xl font-semibold tracking-[-0.02em] text-foreground">
          {phase === "verifying"
            ? "Confirming your email"
            : phase === "verified"
              ? "Email confirmed"
              : "We could not confirm this link"}
        </h1>

        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          {message}
        </p>

        {phase !== "verifying" && (
          <Link
            to="/login"
            className="mt-6 inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground shadow-sm transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          >
            Go to sign in
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        )}
      </div>
    </AuthLayout>
  );
}
