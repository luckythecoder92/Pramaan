import type { AnchorHTMLAttributes, ReactNode } from "react";
import { Link } from "react-router-dom";
import {
  buttonClasses,
  type ButtonSize,
  type ButtonVariant,
} from "./ui/Button";

type ButtonLinkProps = Omit<
  AnchorHTMLAttributes<HTMLAnchorElement>,
  "href" | "className"
> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
  href?: string;
  to?: string;
  className?: string;
  children: ReactNode;
};

export function ButtonLink({
  variant = "primary",
  size = "md",
  href,
  to,
  className,
  children,
  ...props
}: ButtonLinkProps) {
  const classes = buttonClasses(variant, size, className);

  if (to) {
    return (
      <Link to={to} className={classes} {...props}>
        {children}
      </Link>
    );
  }

  return (
    <a href={href} className={classes} {...props}>
      {children}
    </a>
  );
}
