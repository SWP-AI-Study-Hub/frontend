"use client";

import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import {
  BookOpen,
  Bookmark,
  CreditCard,
  FileText,
  FileUp,
  LayoutDashboard,
  LibraryBig,
  LogOut,
  Menu,
  PanelLeftClose,
  Sparkles,
  UserRound,
  UsersRound,
  X,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Brand } from "../components/ui/Brand";
import { LanguageSwitcher } from "../components/ui/LanguageSwitcher";
import { useAuth } from "../features/auth/useAuth";
import { useLanguage } from "../i18n/LanguageProvider";
import { ROUTES } from "../lib/routes";

type NavItem = {
  href: string;
  label: string;
  icon: typeof LayoutDashboard;
  accent?: boolean;
};

function isActivePath(pathname: string, href: string) {
  return (
    pathname === href ||
    (href !== ROUTES.dashboard && pathname.startsWith(`${href}/`))
  );
}

export function AppLayout({ children }: { children: ReactNode }) {
  const { user, logout } = useAuth();
  const { t } = useLanguage();
  const pathname = usePathname() ?? ROUTES.dashboard;
  const router = useRouter();
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const [isSidebarCompact, setIsSidebarCompact] = useState(false);
  const initial = user?.fullName?.charAt(0).toUpperCase() ?? "D";

  const workspaceNav: NavItem[] = [
    {
      href: ROUTES.dashboard,
      label: t("nav.dashboard"),
      icon: LayoutDashboard,
    },
    { href: ROUTES.library, label: t("nav.library"), icon: LibraryBig },
    { href: ROUTES.upload, label: t("nav.upload"), icon: FileUp },
    { href: ROUTES.community, label: t("nav.community"), icon: UsersRound },
    { href: ROUTES.saved, label: t("nav.saved"), icon: Bookmark },
  ];

  const aiNav: NavItem[] = [
    {
      href: ROUTES.askDocument,
      label: "Hỏi tài liệu này",
      icon: FileText,
      accent: true,
    },
    {
      href: ROUTES.askLibrary,
      label: "Hỏi thư viện của tôi",
      icon: BookOpen,
      accent: true,
    },
  ];

  const accountNav: NavItem[] = [
    {
      href: ROUTES.subscription,
      label: t("nav.subscription"),
      icon: CreditCard,
    },
    { href: ROUTES.profile, label: t("common.profile"), icon: UserRound },
  ];

  useEffect(() => {
    setIsMobileNavOpen(false);
  }, [pathname]);

  async function handleLogout() {
    await logout();
    router.replace(ROUTES.login);
  }

  function renderLink(item: NavItem) {
    const Icon = item.icon;
    return (
      <Link
        key={item.href}
        href={item.href}
        className={`${isActivePath(pathname, item.href) ? "active" : ""}${item.accent ? " ai-nav-link" : ""}`}
        title={isSidebarCompact ? item.label : undefined}
      >
        <Icon size={18} />
        <span>{item.label}</span>
      </Link>
    );
  }

  return (
    <div
      className={`app-shell${isSidebarCompact ? " app-shell--compact" : ""}`}
    >
      {isMobileNavOpen ? (
        <button
          type="button"
          className="sidebar-backdrop"
          aria-label="Đóng thanh điều hướng"
          onClick={() => setIsMobileNavOpen(false)}
        />
      ) : null}

      <aside className={`sidebar${isMobileNavOpen ? " sidebar--open" : ""}`}>
        <div className="sidebar-brand-row">
          <Brand compact={isSidebarCompact} />
          <button
            type="button"
            className="sidebar-close-mobile"
            aria-label="Đóng thanh điều hướng"
            onClick={() => setIsMobileNavOpen(false)}
          >
            <X size={19} />
          </button>
        </div>

        <nav className="side-nav" aria-label="Điều hướng không gian học tập">
          <span className="side-nav-label">Không gian học tập</span>
          {workspaceNav.map(renderLink)}
        </nav>

        <nav className="side-nav side-nav--ai" aria-label="Điều hướng AI">
          <span className="side-nav-label">
            <Sparkles size={13} />
            Hỏi AI
          </span>
          {aiNav.map(renderLink)}
        </nav>

        <nav
          className="side-nav side-nav--utility"
          aria-label="Điều hướng tài khoản"
        >
          <span className="side-nav-label">Tài khoản</span>
          {accountNav.map(renderLink)}
          {user?.role === "ADMIN"
            ? renderLink({
                href: ROUTES.adminUsers,
                label: t("common.admin"),
                icon: UsersRound,
              })
            : null}
        </nav>

        <button
          type="button"
          className="sidebar-collapse"
          onClick={() => setIsSidebarCompact((current) => !current)}
          aria-label={
            isSidebarCompact ? "Mở rộng thanh bên" : "Thu gọn thanh bên"
          }
          title={isSidebarCompact ? "Mở rộng thanh bên" : "Thu gọn thanh bên"}
        >
          <PanelLeftClose size={17} />
          <span>Thu gọn thanh bên</span>
        </button>
      </aside>

      <div className="main-column">
        <header className="app-topbar">
          <button
            type="button"
            className="mobile-menu-button"
            aria-label="Mở thanh điều hướng"
            aria-expanded={isMobileNavOpen}
            onClick={() => setIsMobileNavOpen(true)}
          >
            <Menu size={20} />
          </button>
          <div className="app-topbar-user">
            {user?.avatarUrl ? (
              <span
                className="mini-avatar mini-avatar--image"
                style={{ backgroundImage: `url(${user.avatarUrl})` }}
              />
            ) : (
              <span className="mini-avatar">{initial}</span>
            )}
            <div>
              <strong>{user?.fullName}</strong>
              <span>{user?.email}</span>
            </div>
          </div>
          <div className="app-topbar-actions">
            <LanguageSwitcher />
            <button
              type="button"
              className="icon-text-button"
              onClick={() => void handleLogout()}
            >
              <LogOut size={17} />
              <span>{t("common.logout")}</span>
            </button>
          </div>
        </header>
        {children}
      </div>
    </div>
  );
}
