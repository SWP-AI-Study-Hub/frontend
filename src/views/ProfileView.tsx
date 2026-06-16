'use client'

import { FormEvent, useEffect, useState } from 'react'
import Image from 'next/image'
import {
  CalendarDays,
  Camera,
  Check,
  Fingerprint,
  KeyRound,
  Link2,
  LoaderCircle,
  Mail,
  Save,
  ShieldCheck,
  Trash2,
  UserRound,
} from 'lucide-react'
import { getProfile } from '../api/profile.api'
import { useAuth } from '../features/auth/useAuth'
import type { UserProfile } from '../types/auth'
import { useLanguage } from '../i18n/LanguageProvider'
import { localize } from '../i18n/localize'

export function ProfileView() {
  const { locale } = useLanguage()
  const text = (vi: string, en: string) => localize(locale, vi, en)
  const { user, updateProfile } = useAuth()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [fullName, setFullName] = useState(user?.fullName ?? '')
  const [avatarUrl, setAvatarUrl] = useState(user?.avatarUrl ?? '')
  const [avatarFailed, setAvatarFailed] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    let active = true

    getProfile()
      .then((nextProfile) => {
        if (!active) return
        setProfile(nextProfile)
        setFullName(nextProfile.fullName)
        setAvatarUrl(nextProfile.avatarUrl ?? '')
      })
      .catch((loadError: unknown) => {
        if (!active) return
        setError(
          loadError instanceof Error
            ? loadError.message
            : localize(locale, 'Không thể tải hồ sơ.', 'Could not load your profile.'),
        )
      })
      .finally(() => {
        if (active) setIsLoading(false)
      })

    return () => {
      active = false
    }
  }, [locale])

  const displayName =
    profile?.fullName ??
    user?.fullName ??
    text('Thành viên học tập', 'Study member')
  const currentAvatar = avatarUrl.trim()
  const initial = displayName.charAt(0).toUpperCase()
  const hasChanges =
    fullName.trim() !== (profile?.fullName ?? user?.fullName ?? '') ||
    currentAvatar !== (profile?.avatarUrl ?? user?.avatarUrl ?? '')

  async function submit(event: FormEvent) {
    event.preventDefault()
    const trimmedName = fullName.trim()
    if (!trimmedName || trimmedName.length > 100) return

    setError('')
    setSuccess('')
    setIsSaving(true)

    try {
      const updatedUser = await updateProfile({
        fullName: trimmedName,
        avatarUrl: currentAvatar || null,
      })
      const nextProfile: UserProfile = {
        id: updatedUser.id,
        email: updatedUser.email,
        fullName: updatedUser.fullName,
        avatarUrl: updatedUser.avatarUrl,
        role: updatedUser.role,
        status: updatedUser.status,
        createdAt: updatedUser.createdAt,
        updatedAt: updatedUser.updatedAt ?? new Date().toISOString(),
      }
      setProfile(nextProfile)
      setFullName(nextProfile.fullName)
      setAvatarUrl(nextProfile.avatarUrl ?? '')
      setAvatarFailed(false)
      setSuccess(text('Đã lưu hồ sơ thành công.', 'Profile saved successfully.'))
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : text('Không thể lưu hồ sơ.', 'Could not save your profile.'))
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <main className="profile-page" id="main-content">
      <header className="profile-page-heading">
        <div>
          <p className="eyebrow">{text('CÀI ĐẶT TÀI KHOẢN', 'ACCOUNT SETTINGS')}</p>
          <h1>{text('Thông tin hồ sơ của bạn.', 'Your profile, kept current.')}</h1>
          <p>{text('Quản lý thông tin hiển thị trong thư viện, cộng đồng và không gian AI.', 'Manage the identity shown across your library, community sources, and AI workspace.')}</p>
        </div>
        <span className={`profile-state profile-state--${(profile?.status ?? user?.status ?? 'ACTIVE').toLowerCase()}`}>
          <ShieldCheck size={15} />
          {profile?.status ?? user?.status}
        </span>
      </header>

      <section className="profile-layout">
        <aside className="profile-identity-panel">
          <div className="profile-avatar-frame">
            {currentAvatar && !avatarFailed ? (
              <Image
                src={currentAvatar}
                alt={`${displayName} ${text('ảnh đại diện', 'avatar')}`}
                width={128}
                height={128}
                unoptimized
                onError={() => setAvatarFailed(true)}
              />
            ) : (
              <span>{initial}</span>
            )}
          </div>
          <div>
            <p className="eyebrow">{text('THÀNH VIÊN DOCUMIND', 'DOCUMIND MEMBER')}</p>
            <h2>{displayName}</h2>
            <p>{profile?.email ?? user?.email}</p>
          </div>
          <div className="profile-badges">
            <span className="status-pill role">{profile?.role ?? user?.role}</span>
            <span className="status-pill success">{profile?.status ?? user?.status}</span>
          </div>
          <div className="profile-identity-note">
            <Camera size={18} />
            <p>{text('Sử dụng URL ảnh HTTPS an toàn. Để trống trường này để xóa ảnh đại diện.', 'Use a secure HTTPS image URL for your avatar. Empty the field to remove it.')}</p>
          </div>
        </aside>

        <div className="profile-main-column">
          <form className="profile-edit-panel" onSubmit={submit}>
            <header>
              <div>
                <p className="eyebrow">{text('THÔNG TIN CÁ NHÂN', 'PERSONAL DETAILS')}</p>
                <h2>{text('Chỉnh sửa hồ sơ', 'Edit profile')}</h2>
              </div>
              {isLoading ? <LoaderCircle className="spin" size={20} /> : <UserRound size={20} />}
            </header>

            <div className="profile-form-grid">
              <label>
                {text('Họ và tên', 'Full name')}
                <div className="profile-input">
                  <UserRound size={17} />
                  <input
                    value={fullName}
                    onChange={(event) => setFullName(event.target.value)}
                    minLength={1}
                    maxLength={100}
                    required
                    disabled={isLoading || isSaving}
                  />
                </div>
              </label>
              <label>
                {text('Địa chỉ email', 'Email address')}
                <div className="profile-input profile-input--locked">
                  <Mail size={17} />
                  <input value={profile?.email ?? user?.email ?? ''} readOnly />
                </div>
                <small>{text('Email được quản lý bởi nhà cung cấp xác thực.', 'Email is managed by your authentication provider.')}</small>
              </label>
              <label className="profile-avatar-url-field">
                {text('URL ảnh đại diện', 'Avatar URL')}
                <div className="profile-input">
                  <Link2 size={17} />
                  <input
                    value={avatarUrl}
                    onChange={(event) => {
                      setAvatarUrl(event.target.value)
                      setAvatarFailed(false)
                    }}
                    type="url"
                    maxLength={2048}
                    placeholder="https://example.com/avatar.jpg"
                    disabled={isLoading || isSaving}
                  />
                  {avatarUrl ? (
                    <button type="button" title={text('Xóa ảnh đại diện', 'Remove avatar')} onClick={() => setAvatarUrl('')}>
                      <Trash2 size={16} />
                    </button>
                  ) : null}
                </div>
              </label>
            </div>

            {error ? <p className="form-error">{error}</p> : null}
            {success ? <p className="form-success"><Check size={16} />{success}</p> : null}

            <footer>
              <span>{hasChanges ? text('Bạn có thay đổi chưa lưu.', 'You have unsaved changes.') : text('Thông tin hồ sơ đã được cập nhật.', 'Profile information is up to date.')}</span>
              <button
                type="submit"
                className="primary-button"
                disabled={isLoading || isSaving || !hasChanges || !fullName.trim()}
              >
                {isSaving ? <LoaderCircle className="spin" size={17} /> : <Save size={17} />}
                {isSaving ? text('Đang lưu...', 'Saving...') : text('Lưu thay đổi', 'Save changes')}
              </button>
            </footer>
          </form>

          <section className="profile-account-panel">
            <header>
              <div><p className="eyebrow">{text('TÀI KHOẢN', 'ACCOUNT')}</p><h2>{text('Thông tin truy cập', 'Access information')}</h2></div>
              <KeyRound size={20} />
            </header>
            <div className="profile-account-grid">
              <article><KeyRound size={17} /><span>{text('Phương thức xác thực', 'Authentication')}</span><strong>{user?.authProvider ?? 'Firebase'}</strong></article>
              <article><ShieldCheck size={17} /><span>{text('Vai trò truy cập', 'Role access')}</span><strong>{profile?.role ?? user?.role}</strong></article>
              <article><CalendarDays size={17} /><span>{text('Thành viên từ', 'Member since')}</span><strong>{formatDate(profile?.createdAt ?? user?.createdAt, locale)}</strong></article>
              <article><Fingerprint size={17} /><span>{text('ID tài khoản', 'Account ID')}</span><strong>{profile?.id ?? user?.id}</strong></article>
            </div>
          </section>
        </div>
      </section>
    </main>
  )
}

function formatDate(value: string | undefined, locale: 'vi' | 'en') {
  if (!value) return locale === 'vi' ? 'Không có dữ liệu' : 'Not available'
  return new Intl.DateTimeFormat(locale === 'vi' ? 'vi-VN' : 'en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(new Date(value))
}
