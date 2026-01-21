export function Logo({
  size = 32,
  className = "",
}: {
  size?: number;
  className?: string;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 537 542"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <circle cx="287" cy="292" r="250" fill="#191A26" />
      <ellipse
        cx="239.774"
        cy="243.5"
        rx="145.224"
        ry="196.947"
        transform="rotate(42.08 239.774 243.5)"
        fill="#fafafa"
      />
    </svg>
  );
}
