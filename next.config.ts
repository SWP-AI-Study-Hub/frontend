import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: '/__/auth/action',
        destination: '/xu-ly-xac-thuc',
      },
    ]
  },
  async redirects() {
    return [
      { source: '/login', destination: '/dang-nhap', permanent: true },
      { source: '/register', destination: '/dang-ky', permanent: true },
      {
        source: '/forgot-password',
        destination: '/quen-mat-khau',
        permanent: true,
      },
      {
        source: '/reset-password',
        destination: '/dat-lai-mat-khau',
        permanent: true,
      },
      { source: '/dashboard', destination: '/tong-quan', permanent: true },
      { source: '/library', destination: '/thu-vien', permanent: true },
      { source: '/upload', destination: '/tai-len', permanent: true },
      { source: '/community', destination: '/cong-dong', permanent: true },
      { source: '/saved', destination: '/da-luu', permanent: true },
      {
        source: '/ask-document',
        destination: '/hoi-tai-lieu',
        permanent: true,
      },
      {
        source: '/ask-library',
        destination: '/hoi-thu-vien',
        permanent: true,
      },
      {
        source: '/subscription',
        destination: '/goi-dich-vu',
        permanent: true,
      },
      { source: '/profile', destination: '/ho-so', permanent: true },
      {
        source: '/admin/users',
        destination: '/quan-tri/nguoi-dung',
        permanent: true,
      },
      {
        source: '/unauthorized',
        destination: '/khong-co-quyen',
        permanent: true,
      },
      {
        source: '/auth/action',
        destination: '/xu-ly-xac-thuc',
        permanent: true,
      },
    ]
  },
}

export default nextConfig
