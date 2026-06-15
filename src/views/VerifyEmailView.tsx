"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { CheckCircle2, LoaderCircle, XCircle } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { verifyEmailActionCode } from "../api/auth.api";
import { ROUTES } from "../lib/routes";

type VerificationState = "loading" | "success" | "error";

export function VerifyEmailView() {
  const searchParams = useSearchParams();
  const [state, setState] = useState<VerificationState>("loading");

  useEffect(() => {
    const code = searchParams?.get("oobCode");
    const mode = searchParams?.get("mode");

    if (!code || mode !== "verifyEmail") {
      setState("error");
      return;
    }

    void verifyEmailActionCode(code)
      .then(() => setState("success"))
      .catch(() => setState("error"));
  }, [searchParams]);

  return (
    <section className="auth-card verification-card">
      {state === "loading" ? (
        <>
          <LoaderCircle
            className="verification-icon verification-icon--spin"
            size={36}
          />
          <h2>Đang xác thực email</h2>
          <p className="auth-copy">
            DocuMind đang kiểm tra liên kết kích hoạt của bạn.
          </p>
        </>
      ) : null}
      {state === "success" ? (
        <>
          <CheckCircle2
            className="verification-icon verification-icon--success"
            size={36}
          />
          <h2>Tài khoản đã được kích hoạt</h2>
          <p className="auth-copy">
            Bạn có thể đăng nhập và bắt đầu sử dụng DocuMind.
          </p>
          <Link className="primary-button" href={ROUTES.login}>
            Đăng nhập
          </Link>
        </>
      ) : null}
      {state === "error" ? (
        <>
          <XCircle
            className="verification-icon verification-icon--error"
            size={36}
          />
          <h2>Liên kết không hợp lệ</h2>
          <p className="auth-copy">
            Liên kết kích hoạt đã hết hạn hoặc đã được sử dụng.
          </p>
          <Link className="primary-button" href={ROUTES.login}>
            Về trang đăng nhập
          </Link>
        </>
      ) : null}
    </section>
  );
}
