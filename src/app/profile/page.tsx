import { ProtectedRoute } from '../../features/auth/ProtectedRoute'
import { AppLayout } from '../../layouts/AppLayout'
import { ProfilePage } from '../../views/ProfilePage'

export default function Page() {
  return (
    <ProtectedRoute>
      <AppLayout>
        <ProfilePage />
      </AppLayout>
    </ProtectedRoute>
  )
}
