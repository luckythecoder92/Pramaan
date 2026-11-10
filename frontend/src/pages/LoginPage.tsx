import { Link } from "react-router-dom";
import { LoginForm } from "../components/auth/LoginForm";
import { AuthLayout } from "../components/layout/AuthLayout";

export function LoginPage() {
  return (
    <AuthLayout
      footer={
        <>
          New to Pramaan?{" "}
          <Link
            to="/register"
            className="font-semibold text-primary underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            Create an account
          </Link>
        </>
      }
    >
      <LoginForm />
    </AuthLayout>
  );
}
