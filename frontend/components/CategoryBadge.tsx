export default function CategoryBadge({ name }: { name: string }) {
  return (
    <span className="inline-block bg-accent/10 text-accent text-xs font-semibold px-2 py-0.5 rounded">
      {name}
    </span>
  )
}
