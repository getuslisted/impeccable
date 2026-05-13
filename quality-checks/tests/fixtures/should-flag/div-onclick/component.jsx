export function Card({ onSelect }) {
  return (
    <div onClick={onSelect} className="card">
      <h3>Title</h3>
    </div>
  );
}
