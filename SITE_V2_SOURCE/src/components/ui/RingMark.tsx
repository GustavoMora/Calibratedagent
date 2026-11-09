/** Marca: anillo dorado con un punto (el pedido) sobre la órbita. */
export function RingMark({ size = 22 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="12" r="8.5" fill="none" stroke="#D4AF63" strokeWidth="1.6" />
      <circle cx="12" cy="12" r="3" fill="#ECE6D8" opacity="0.9" />
      <circle cx="18.6" cy="6.6" r="1.9" fill="#F0D48F" />
    </svg>
  );
}
