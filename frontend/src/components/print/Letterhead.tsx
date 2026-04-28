/**
 * Letterhead — reusable header for every printed page.
 * Renders the AnyFeast logo, tagline, contact info, and red rule
 * exactly as they currently appear on page 1 of the diet plan PDF.
 */
export function Letterhead() {
  return (
    <div className="pv-letterhead">
      <div className="pv-letterhead__inner">
        <div className="pv-letterhead__logo-row">
          <img src="/logo.png" alt="AnyFeast" className="pv-letterhead__logo" />
          <h1 className="pv-letterhead__wordmark">AnyFeast</h1>
        </div>
        <p className="pv-letterhead__tagline">Healthy sustainable cooking powered by AI</p>
        <p className="pv-letterhead__contact">
          www.anyfeast.com &nbsp;|&nbsp; pankaj@anyfeast.com &nbsp;|&nbsp; +44 9116 76 9116
        </p>
      </div>
    </div>
  );
}
