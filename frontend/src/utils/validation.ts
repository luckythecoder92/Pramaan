export const MAX_PDF_BYTES = 10 * 1024 * 1024;

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateEmail(email: string): string | null {
  if (!email.trim()) {
    return "Email is required.";
  }

  if (!EMAIL_PATTERN.test(email.trim())) {
    return "Enter a valid email address.";
  }

  return null;
}

export function validatePassword(
  password: string,
  mode: "login" | "register",
): string | null {
  if (!password) {
    return "Password is required.";
  }

  if (mode === "register" && password.length < 12) {
    return "Password must be at least 12 characters.";
  }

  if (password.length > 128) {
    return "Password must be 128 characters or fewer.";
  }

  return null;
}

export function validateConfirmPassword(
  password: string,
  confirmPassword: string,
): string | null {
  if (!confirmPassword) {
    return "Please confirm your password.";
  }

  if (password !== confirmPassword) {
    return "Passwords do not match.";
  }

  return null;
}

export function validatePdfFile(file: File): string | null {
  const hasPdfExtension = file.name.toLowerCase().endsWith(".pdf");
  const hasPdfType = file.type === "application/pdf";

  if (!hasPdfExtension && !hasPdfType) {
    return "Only PDF files are supported.";
  }

  if (file.size === 0) {
    return "The selected file is empty.";
  }

  if (file.size > MAX_PDF_BYTES) {
    return "The PDF must be 10 MB or smaller.";
  }

  return null;
}
