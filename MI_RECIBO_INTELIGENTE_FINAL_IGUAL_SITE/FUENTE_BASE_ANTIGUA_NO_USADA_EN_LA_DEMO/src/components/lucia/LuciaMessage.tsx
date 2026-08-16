import type { ChatMessage } from "@/src/types/lucia";
import LuciaImage from "./LuciaImage";

export default function LuciaMessage({ message, onHuman }: { message: ChatMessage; onHuman: () => void }) {
  return (
    <div className={`chat-message ${message.role}`}>
      {message.role === "bot" && <LuciaImage compact />}
      <div><p>{message.text}</p>{message.source && <small>✓ {message.source}</small>}{message.suggestHuman && <button onClick={onHuman}>Hablar con un asesor</button>}</div>
    </div>
  );
}
