
function Loader() {
  return (
    <div className="loader-wrap" role="status" aria-live="polite">
      <div className="loader-orbit">
        <span />
        <span />
      </div>
      <p>Fetching fresh headlines...</p>
    </div>
  );
}

export default Loader;
