export function Logo({
  size = 32,
  className = "",
  variant = "dark",
}: {
  size?: number;
  className?: string;
  variant?: "dark" | "light";
}) {
  // dark variant = for light backgrounds (dark logo)
  // light variant = for dark backgrounds (light logo)

  if (variant === "light") {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 500 500"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={className}
      >
        <circle cx="250" cy="250" r="250" fill="#fafafa" />
        <path
          d="M357.544 347.827C284.649 428.558 177.299 450.429 117.77 396.678C58.2411 342.927 69.0762 233.909 141.971 153.178C214.865 72.4477 322.216 50.5762 381.745 104.327C441.273 158.078 430.438 267.096 357.544 347.827Z"
          fill="#191A26"
        />
      </svg>
    );
  }

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 500 500"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <circle cx="250" cy="250" r="250" fill="#191A26" />
      <path
        d="M357.544 347.827C284.649 428.558 177.299 450.429 117.77 396.678C58.2411 342.927 69.0762 233.909 141.971 153.178C214.865 72.4477 322.216 50.5762 381.745 104.327C441.273 158.078 430.438 267.096 357.544 347.827Z"
        fill="#fafafa"
      />
    </svg>
  );
}
