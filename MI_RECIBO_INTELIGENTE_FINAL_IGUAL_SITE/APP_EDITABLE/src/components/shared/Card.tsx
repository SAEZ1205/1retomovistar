import type { HTMLAttributes, PropsWithChildren } from "react";

export default function Card({ className = "", children, ...props }: PropsWithChildren<HTMLAttributes<HTMLElement>>) {
  return <section className={`ui-card ${className}`} {...props}>{children}</section>;
}
