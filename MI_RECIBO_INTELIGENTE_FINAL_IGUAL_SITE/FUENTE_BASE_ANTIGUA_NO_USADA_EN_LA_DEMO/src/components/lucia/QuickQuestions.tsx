export default function QuickQuestions({ questions, onAsk }: { questions: string[]; onAsk: (question: string) => void }) {
  return <div className="quick-questions">{questions.map((question) => <button key={question} onClick={() => onAsk(question)}>{question}</button>)}</div>;
}
