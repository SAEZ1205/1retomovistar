export default function MobileStatusBar() {
  return (
    <div className="mobile-status-bar" aria-hidden="true">
      <strong>11:18</strong>
      <span className="status-icons">
        <i className="status-bluetooth">ᛒ</i>
        <i className="status-wifi" />
        <small>VoLTE</small>
        <i className="status-signal"><b /><b /><b /><b /></i>
        <i className="status-battery"><b /></i>
      </span>
    </div>
  );
}
