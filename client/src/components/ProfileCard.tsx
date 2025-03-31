import { Link } from "wouter";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Briefcase, MapPin } from "lucide-react";
import { User } from "@shared/schema";

interface ProfileCardProps {
  user: User;
}

export default function ProfileCard({ user }: ProfileCardProps) {
  const initials = user.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();

  return (
    <div className="bg-white overflow-hidden shadow rounded-lg mb-6">
      <div className="h-32 bg-gradient-to-r from-primary-600 to-secondary-500"></div>
      <div className="px-4 pb-5 relative">
        <div className="absolute -top-14 left-4">
          <Avatar className="h-28 w-28 border-4 border-white">
            <AvatarImage src={user.avatarUrl || ""} alt={user.name} />
            <AvatarFallback className="text-xl">{initials}</AvatarFallback>
          </Avatar>
        </div>
        <div className="pt-16">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold text-gray-900">{user.name}</h2>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
              {user.userType === "entrepreneur" ? "Entrepreneur" : "Investor"}
            </span>
          </div>
          <p className="text-sm text-gray-500 mt-1">{user.headline}</p>
          <div className="mt-4">
            {user.company && (
              <div className="flex items-center text-sm text-gray-500">
                <Briefcase className="h-5 w-5 text-gray-400 mr-2" />
                <span>{user.company}</span>
              </div>
            )}
            {user.location && (
              <div className="flex items-center text-sm text-gray-500 mt-1">
                <MapPin className="h-5 w-5 text-gray-400 mr-2" />
                <span>{user.location}</span>
              </div>
            )}
          </div>
          
          {/* Profile Completion */}
          <div className="mt-5">
            <div className="flex justify-between items-center mb-1">
              <span className="text-sm font-medium text-gray-700">Profile Completion</span>
              <span className="text-sm font-medium text-gray-700">{user.profileCompletion}%</span>
            </div>
            <Progress value={user.profileCompletion} className="h-2.5" />
            <Link href={`/profile/${user.id}`}>
              <Button className="mt-3 w-full">
                Complete Your Profile
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
