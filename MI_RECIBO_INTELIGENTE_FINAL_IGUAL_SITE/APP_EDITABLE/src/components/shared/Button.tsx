import type { ButtonHTMLAttributes, PropsWithChildren } from "react";

type Props = PropsWithChildren<ButtonHTMLAttributes<HTMLButtonElement>> & {
  variant?: "primary" | "secondary" | "ghost";
};

export default function Button({ variant = "primary", className = "", children, ...props }: Props) {
  return <button className={`ui-button ${variant} ${className}`} {...props}>{children}</button>;
}
