import type { PropsWithChildren } from "react";

export default function Modal({ title, close, children, className = "" }: PropsWithChildren<{ title: string; close: () => void; className?: string }>) {
  return (
    <div className="modal-backdrop" onMouseDown={(event) => event.target === event.currentTarget && close()}>
      <section className={`ui-modal ${className}`} role="dialog" aria-modal="true" aria-label={title}>{children}</section>
    </div>
  );
}
