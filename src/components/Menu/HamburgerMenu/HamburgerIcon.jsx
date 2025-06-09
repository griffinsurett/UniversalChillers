// src/components/Menu/HamburgerMenu/HamburgerIcon.jsx
export default function HamburgerIcon() {
  return (
    <div className="relative w-6 h-6">
      <span className="absolute left-0 top-1/4 block h-0.5 w-full bg-current" />
      <span className="absolute left-0 top-1/2 block h-0.5 w-full bg-current" />
      <span className="absolute left-0 top-3/4 block h-0.5 w-full bg-current" />
    </div>
  );
}
