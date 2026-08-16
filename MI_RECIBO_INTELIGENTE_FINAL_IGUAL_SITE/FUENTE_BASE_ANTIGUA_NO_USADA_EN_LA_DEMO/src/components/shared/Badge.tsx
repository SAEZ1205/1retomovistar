import type { PropsWithChildren } from "react";

export default function Badge({ tone = "blue", children }: PropsWithChildren<{ tone?: "blue" | "green" | "gold" | "purple" }>) {
  return <span className={`ui-badge ${tone}`}>{children}</span>;
}
