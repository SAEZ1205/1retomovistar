import type { ReactNode } from "react";

export type IconName =
  | "arrow-left" | "arrow-right" | "bell" | "chart" | "chat" | "check"
  | "chevron-down" | "close" | "data" | "download" | "gift" | "globe"
  | "headset" | "home" | "menu" | "phone" | "receipt" | "refresh"
  | "send" | "shop" | "sparkles" | "support" | "wifi" | "device";

function glyph(name: IconName): ReactNode {
  switch (name) {
    case "home": return <><path d="m3 11 9-8 9 8" /><path d="M5 10v10h14V10M9 20v-6h6v6" /></>;
    case "receipt": return <><path d="M6 3h12v18l-3-2-3 2-3-2-3 2V3Z" /><path d="M9 8h6M9 12h6M9 16h4" /></>;
    case "gift": return <><rect x="3" y="9" width="18" height="12" rx="2" /><path d="M12 9v12M3 13h18M12 9H8.5A2.5 2.5 0 1 1 12 5.5V9Zm0 0h3.5A2.5 2.5 0 1 0 12 5.5V9Z" /></>;
    case "shop": return <><path d="m3 5 2 12h13l2-8H6" /><circle cx="8" cy="20" r="1" /><circle cx="17" cy="20" r="1" /></>;
    case "support": return <><path d="M14.5 6.5a4 4 0 0 0-5 5L3 18l3 3 6.5-6.5a4 4 0 0 0 5-5l-3 3-3-3 3-3Z" /><path d="m5 5 4 4" /></>;
    case "menu": return <path d="M4 6h16M4 12h16M4 18h16" />;
    case "refresh": return <><path d="M20 11a8 8 0 1 0-2 5.5" /><path d="M20 4v7h-7" /></>;
    case "phone": return <><rect x="7" y="2" width="10" height="20" rx="2" /><path d="M10 5h4M11 19h2" /></>;
    case "globe": return <><circle cx="12" cy="12" r="9" /><path d="M3 12h18M12 3a15 15 0 0 1 0 18M12 3a15 15 0 0 0 0 18" /></>;
    case "device": return <><rect x="3" y="5" width="11" height="15" rx="2" /><rect x="15" y="2" width="6" height="11" rx="1" /><path d="M7 17h3" /></>;
    case "arrow-left": return <path d="m15 18-6-6 6-6" />;
    case "arrow-right": return <path d="m9 18 6-6-6-6" />;
    case "chevron-down": return <path d="m6 9 6 6 6-6" />;
    case "check": return <><circle cx="12" cy="12" r="9" /><path d="m8 12 2.5 2.5L16 9" /></>;
    case "chat": return <><path d="M20 15a4 4 0 0 1-4 4H8l-5 3 1.5-5A7 7 0 0 1 4 14V8a4 4 0 0 1 4-4h8a4 4 0 0 1 4 4v7Z" /><path d="M8 9h8M8 13h5" /></>;
    case "bell": return <><path d="M18 9a6 6 0 0 0-12 0c0 7-3 7-3 7h18s-3 0-3-7" /><path d="M10 20h4" /></>;
    case "download": return <><path d="M12 3v12m0 0 5-5m-5 5-5-5" /><path d="M4 19h16" /></>;
    case "chart": return <><path d="M4 20V10M10 20V4M16 20v-7M22 20H2" /></>;
    case "data": return <><path d="M4 17a10 10 0 0 1 16 0" /><path d="M7 14a7 7 0 0 1 10 0M10 11a4 4 0 0 1 4 0" /><circle cx="12" cy="18" r="1" /></>;
    case "wifi": return <><path d="M4 9a12 12 0 0 1 16 0M7 12a8 8 0 0 1 10 0M10 15a4 4 0 0 1 4 0" /><circle cx="12" cy="19" r="1" /></>;
    case "headset": return <><path d="M4 13v-2a8 8 0 0 1 16 0v2" /><path d="M4 13h3v6H5a1 1 0 0 1-1-1v-5Zm16 0h-3v6h2a1 1 0 0 0 1-1v-5ZM17 19c-1 2-3 2-5 2" /></>;
    case "sparkles": return <><path d="m12 3 1.2 3.8L17 8l-3.8 1.2L12 13l-1.2-3.8L7 8l3.8-1.2L12 3Z" /><path d="m5 14 .8 2.2L8 17l-2.2.8L5 20l-.8-2.2L2 17l2.2-.8L5 14Zm14-2 .8 2.2 2.2.8-2.2.8L19 18l-.8-2.2L16 15l2.2-.8L19 12Z" /></>;
    case "send": return <><path d="m3 3 18 9-18 9 4-9-4-9Z" /><path d="M7 12h14" /></>;
    case "close": return <path d="m6 6 12 12M18 6 6 18" />;
  }
}

export default function Icon({ name, size = 24, className = "" }: { name: IconName; size?: number; className?: string }) {
  return (
    <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {glyph(name)}
    </svg>
  );
}
