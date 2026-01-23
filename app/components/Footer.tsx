export default function Footer() {
  const productLinks = [
    { label: "Home", href: "/" },
    { label: "Login", href: "/login" },
    { label: "Register", href: "/register" },
  ];

  const featureLinks = [
    { label: "Traffic", href: "#" },
    { label: "Contributions", href: "#" },
    { label: "Pull requests", href: "#" },
    { label: "Issues", href: "#" },
    { label: "Profiles", href: "#" },
  ];

  const companyLinks = [
    { label: "Contact", href: "#" },
    { label: "Blog", href: "#" },
    { label: "Privacy", href: "#" },
    { label: "Terms", href: "#" },
  ];

  const compareLinks = [
    { label: "GitHub Insights", href: "#" },
  ];

  return (
    <footer className="py-16 md:py-24 bg-background tracking-tight font-medium">
      <div className="w-full max-w-5xl mx-auto px-5">
        <div className="flex flex-col md:flex-row justify-between gap-12">
          {/* Left side - Description */}
          <div className="flex flex-col gap-6 max-w-sm">
            <p className="text-[#999] text-sm leading-relaxed">
              Your repos have a story. See it in traffic, stars, commits, and contributors, all in one place.
            </p>
            <span className="text-[#999] text-sm">© 2026</span>
          </div>

          {/* Right side - Link columns */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
            {/* Product */}
            <div className="flex flex-col gap-3">
              <span className="text-[#181925] font-medium text-sm">Product</span>
              {productLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  className="text-[#999] text-sm hover:text-[#181925] transition-colors duration-200"
                >
                  {link.label}
                </a>
              ))}
            </div>

            {/* Features */}
            <div className="flex flex-col gap-3">
              <span className="text-[#181925] font-medium text-sm">Features</span>
              {featureLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  className="text-[#999] text-sm hover:text-[#181925] transition-colors duration-200"
                >
                  {link.label}
                </a>
              ))}
            </div>

            {/* Company */}
            <div className="flex flex-col gap-3">
              <span className="text-[#181925] font-medium text-sm">Company</span>
              {companyLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  className="text-[#999] text-sm hover:text-[#181925] transition-colors duration-200"
                >
                  {link.label}
                </a>
              ))}
            </div>

            {/* Compare */}
            <div className="flex flex-col gap-3">
              <span className="text-[#181925] font-medium text-sm">Compare</span>
              {compareLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  className="text-[#999] text-sm hover:text-[#181925] transition-colors duration-200"
                >
                  {link.label}
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
