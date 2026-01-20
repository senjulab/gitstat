import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function UserHeader() {
  return (
    <header className="w-full border-b border-neutral-200 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <svg
              width="32"
              height="32"
              viewBox="0 0 32 32"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <rect width="32" height="32" rx="8" fill="#6366F1" />
              <path d="M16 8L20 12L16 16L12 12L16 8Z" fill="white" />
              <path
                d="M16 16L20 20L16 24L12 20L16 16Z"
                fill="white"
                opacity="0.7"
              />
            </svg>
            <span className="text-lg font-semibold text-neutral-900">
              GitStat
            </span>
          </div>

          {/* User Avatar */}
          <Avatar className="h-9 w-9 cursor-pointer hover:ring-2 hover:ring-indigo-400 transition-all">
            <AvatarImage src="" alt="User" />
            <AvatarFallback className="bg-indigo-100 text-indigo-600 font-medium">
              U
            </AvatarFallback>
          </Avatar>
        </div>
      </div>
    </header>
  );
}
