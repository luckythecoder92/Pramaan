import { Link } from "react-router-dom";
import { RegisterForm } from "../components/auth/RegisterForm";
import { AuthLayout } from "../components/layout/AuthLayout";

export function RegisterPage() {
  return (
    <AuthLayout
      footer={
        <>
          Already have an account?{" "}
          <Link
            to="/login"
            className="font-semibold text-primary underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            Sign in
          </Link>
        </>
      }
    >
      <RegisterForm />
    </AuthLayout>
  );
}
