import { ProtectedRoute } from '../../../../features/auth/ProtectedRoute'
import { AppLayout } from '../../../../layouts/AppLayout'
import { AdminUserDetailPage } from '../../../../views/AdminUserDetailPage'

type PageProps = {
  params: Promise<{
    id: string
  }>
}

export default async function Page({ params }: PageProps) {
  const { id } = await params

  return (
    <ProtectedRoute allowedRoles={['ADMIN']}>
      <AppLayout>
        <AdminUserDetailPage id={id} />
      </AppLayout>
    </ProtectedRoute>
  )
}
