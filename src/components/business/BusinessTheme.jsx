// Business mode used to get its own gold accent here. Lago is now one
// system, not two — business shares the exact tokens personal mode uses
// from index.css :root, so this component is a deliberate no-op kept as
// the single place to reintroduce a business-specific override later
// if that's ever wanted again.
export default function BusinessTheme() {
  return null;
}