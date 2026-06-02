import { AuthLayout } from '../../layouts/AuthLayout'
import { RegisterPage } from '../../views/RegisterPage'

export default function Page() {
  return (
    <AuthLayout>
      <RegisterPage />
    </AuthLayout>
  )
}
