export function WorkspaceLoading() {
  return (
    <div className="workspace-skeleton" role="status" aria-live="polite" aria-label="Loading workspace">
      <span className="sr-only">Loading workspace…</span>
      <div className="workspace-skeleton-hero">
        <div className="workspace-skeleton-copy">
          <span className="workspace-skeleton-line is-kicker" />
          <span className="workspace-skeleton-line is-title" />
          <span className="workspace-skeleton-line is-body" />
          <span className="workspace-skeleton-line is-body short" />
        </div>
        <span className="workspace-skeleton-image" />
      </div>
      <div className="workspace-skeleton-grid">
        <span /><span /><span />
      </div>
    </div>
  );
}
