import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function UserHeader() {
  return (
    <header className="w-full ">
      <div className="max-w-4xl mx-auto px-6">
        <div className="flex items-center justify-between py-4">
          {/* Logo - Simple Circle */}
          <div className="w-8 h-8 bg-black rounded-full flex items-center justify-center">
            <div className="w-4 h-4 border-2  rounded-full"></div>
          </div>

          {/* User Avatar - Small and minimal */}
          <Avatar className="h-8 w-8 cursor-pointer">
            <AvatarImage src="" alt="User" />
            <AvatarFallback className="bg-neutral-100 text-neutral-600 text-xs font-medium">
              U
            </AvatarFallback>
          </Avatar>
        </div>
      </div>
    </header>
  );
}
