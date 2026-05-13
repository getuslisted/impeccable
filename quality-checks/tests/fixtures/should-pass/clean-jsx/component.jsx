export function Card({ onSelect, title, body }) {
  return (
    <article className="card">
      <button type="button" onClick={onSelect}>
        <h3>{title}</h3>
      </button>
      <p>{body}</p>
    </article>
  );
}
