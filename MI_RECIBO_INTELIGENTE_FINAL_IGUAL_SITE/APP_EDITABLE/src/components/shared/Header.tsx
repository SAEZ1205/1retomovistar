import Icon, { type IconName } from "./Icon";
import MobileStatusBar from "./MobileStatusBar";

export default function Header({ title, onBack, icon }: { title: string; onBack?: () => void; icon?: IconName }) {
  return (
    <header className="screen-header">
      <MobileStatusBar />
      <div className="screen-toolbar">
        <button onClick={onBack} aria-label="Volver"><Icon name="arrow-left" size={36} /></button>
        <h1>{icon && <Icon name={icon} size={30} />}{title}</h1>
        <span aria-hidden="true" />
      </div>
    </header>
  );
}
