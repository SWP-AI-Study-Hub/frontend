"use client";

import { FormEvent, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { LogIn } from "lucide-react";
import { useAuth } from "../features/auth/useAuth";
import { useLanguage } from "../i18n/LanguageProvider";
import { setFlashMessage } from "../lib/flash-message";
import { ROUTES, getAuthenticatedHomeRoute } from "../lib/routes";

const GOOGLE_LOGIN_SUCCESS_MESSAGE = "Đã đăng nhập thành công bằng google";
const FLASH_DURATION_MS = 5000;
const POPUP_CLOSE_FALLBACK_DELAY_MS = 1500;
const GOOGLE_POPUP_RESOLVED_EVENT = "ai-study-hub:google-popup-resolved";

function getErrorCode(error: unknown) {
  if (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    typeof error.code === "string"
  ) {
    return error.code;
  }

  return undefined;
}

function isGooglePopupClosedError(error: unknown) {
  const code = getErrorCode(error);

  return (
    code === "auth/popup-closed-by-user" ||
    code === "auth/cancelled-popup-request" ||
    code === "auth/popup-blocked"
  );
}

export function LoginView() {
  const { login, loginWithGoogle } = useAuth();
  const { t } = useLanguage();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGoogleSubmitting, setIsGoogleSubmitting] = useState(false);
  const googleLoginAttemptRef = useRef(0);

  function redirectAfterLogin(role: "ADMIN" | "USER") {
    const from = searchParams?.get("from");
    router.replace(from ?? getAuthenticatedHomeRoute(role));
  }

  function flashGoogleLoginErrorAndReload() {
    setFlashMessage({
      type: "error",
      message: t("auth.googleFailed"),
      durationMs: FLASH_DURATION_MS,
    });
    window.location.reload();
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      const user = await login({ email, password });
      redirectAfterLogin(user.role);
    } catch (err) {
      setError(err instanceof Error ? err.message : t("auth.loginFailed"));
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleGoogleLogin() {
    setError("");
    setIsGoogleSubmitting(true);

    const attemptId = googleLoginAttemptRef.current + 1;
    googleLoginAttemptRef.current = attemptId;
    let hasSettled = false;
    let fallbackTimeoutId: number | undefined;

    function handleReturnToLoginWindow() {
      if (fallbackTimeoutId) window.clearTimeout(fallbackTimeoutId);

      fallbackTimeoutId = window.setTimeout(() => {
        if (!hasSettled && googleLoginAttemptRef.current === attemptId) {
          flashGoogleLoginErrorAndReload();
        }
      }, POPUP_CLOSE_FALLBACK_DELAY_MS);
    }

    function handleGooglePopupResolved() {
      hasSettled = true;
      if (fallbackTimeoutId) window.clearTimeout(fallbackTimeoutId);
    }

    window.addEventListener("focus", handleReturnToLoginWindow);
    document.addEventListener("visibilitychange", handleReturnToLoginWindow);
    window.addEventListener(GOOGLE_POPUP_RESOLVED_EVENT, handleGooglePopupResolved);

    try {
      const result = await loginWithGoogle();
      hasSettled = true;

      if (result.status === "registration-required") {
        router.push(ROUTES.register);
        return;
      }

      setFlashMessage({
        type: "success",
        message: GOOGLE_LOGIN_SUCCESS_MESSAGE,
        durationMs: FLASH_DURATION_MS,
      });
      redirectAfterLogin(result.user.role);
    } catch (err) {
      hasSettled = true;

      if (isGooglePopupClosedError(err)) {
        flashGoogleLoginErrorAndReload();
        return;
      }

      setError(err instanceof Error ? err.message : t("auth.googleFailed"));
    } finally {
      hasSettled = true;
      if (fallbackTimeoutId) window.clearTimeout(fallbackTimeoutId);
      window.removeEventListener("focus", handleReturnToLoginWindow);
      document.removeEventListener("visibilitychange", handleReturnToLoginWindow);
      window.removeEventListener(
        GOOGLE_POPUP_RESOLVED_EVENT,
        handleGooglePopupResolved,
      );
      setIsGoogleSubmitting(false);
    }
  }

  return (
    <section className="auth-card">
      <p className="eyebrow">DOCUMIND</p>
      <h2>{t("auth.loginTitle")}</h2>
      <p className="auth-copy">{t("auth.loginBody")}</p>
      <button
        className="google-button"
        type="button"
        disabled={isSubmitting || isGoogleSubmitting}
        onClick={handleGoogleLogin}
      >
        <Image
          src="/google.svg"
          alt=""
          aria-hidden="true"
          width={18}
          height={18}
        />
        {isGoogleSubmitting ? t("auth.connecting") : t("auth.google")}
      </button>
      <div className="auth-divider">
        <span>{t("auth.or")}</span>
      </div>
      <form onSubmit={handleSubmit} className="form-stack">
        <label>
          {t("auth.email")}
          <input
            name="email"
            autoComplete="email"
            spellCheck={false}
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            type="email"
            required
          />
        </label>
        <label>
          {t("auth.password")}
          <input
            name="password"
            autoComplete="current-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            type="password"
            required
          />
        </label>
        {error ? <p className="form-error">{error}</p> : null}
        <button
          className="primary-button"
          type="submit"
          disabled={isSubmitting || isGoogleSubmitting}
        >
          <LogIn size={18} />
          {isSubmitting ? t("auth.processing") : t("common.login")}
        </button>
      </form>
      <div className="form-links">
        <Link href={ROUTES.forgotPassword}>{t("auth.forgot")}</Link>
        <Link href={ROUTES.register}>{t("auth.create")}</Link>
      </div>
    </section>
  );
}
