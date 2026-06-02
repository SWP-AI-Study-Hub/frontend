import { ProtectedRoute } from '../../../features/auth/ProtectedRoute'
import { AppLayout } from '../../../layouts/AppLayout'
import { AdminUsersPage } from '../../../views/AdminUsersPage'

export default function Page() {
  return (
    <ProtectedRoute allowedRoles={['ADMIN']}>
      <AppLayout>
        <AdminUsersPage />
      </AppLayout>
    </ProtectedRoute>
  )
}
