import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/lib/auth";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

interface RecommendedUser {
  id: number;
  name: string;
  avatarUrl: string | null;
  headline: string | null;
  userType: string;
}

export default function RecommendedConnections() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [connecting, setConnecting] = useState<number[]>([]);
  
  const { data: recommendedUsers, isLoading } = useQuery({
    queryKey: ["/api/users?limit=3"],
    enabled: !!user,
    select: (data) => {
      // Filter out current user and limit to 3 results
      return data.filter((u: RecommendedUser) => u.id !== user?.id).slice(0, 3);
    },
  });
  
  const handleConnect = async (userId: number) => {
    try {
      setConnecting((prev) => [...prev, userId]);
      
      await apiRequest("POST", "/api/connections", {
        recipientId: userId,
      });
      
      toast({
        title: "Connection request sent",
        description: "We'll notify you when they respond",
      });
      
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send connection request",
        variant: "destructive",
      });
    } finally {
      setConnecting((prev) => prev.filter((id) => id !== userId));
    }
  };

  return (
    <div className="bg-white shadow rounded-lg mb-6">
      <div className="p-5">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Recommended Connections</h3>
        {isLoading ? (
          <ul className="divide-y divide-gray-200">
            {[1, 2, 3].map((i) => (
              <li key={i} className="py-4">
                <div className="flex items-center space-x-4">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div className="flex-1 min-w-0">
                    <Skeleton className="h-4 w-24 mb-2" />
                    <Skeleton className="h-3 w-32" />
                  </div>
                  <Skeleton className="h-8 w-24 rounded-full" />
                </div>
              </li>
            ))}
          </ul>
        ) : recommendedUsers?.length ? (
          <ul className="divide-y divide-gray-200">
            {recommendedUsers.map((recommendedUser: RecommendedUser) => (
              <li key={recommendedUser.id} className="py-4">
                <div className="flex items-center space-x-4">
                  <Avatar>
                    <AvatarImage src={recommendedUser.avatarUrl || ""} alt={recommendedUser.name} />
                    <AvatarFallback>{recommendedUser.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{recommendedUser.name}</p>
                    <p className="text-sm text-gray-500 truncate">
                      {recommendedUser.userType === "entrepreneur" ? "Entrepreneur" : "Investor"}
                      {recommendedUser.headline && ` • ${recommendedUser.headline}`}
                    </p>
                  </div>
                  <Button
                    size="sm"
                    disabled={connecting.includes(recommendedUser.id)}
                    onClick={() => handleConnect(recommendedUser.id)}
                  >
                    Connect
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <div className="text-center py-6">
            <p className="text-gray-500">No recommendations available</p>
            <p className="text-sm text-gray-400">Try again later</p>
          </div>
        )}
        {recommendedUsers?.length > 0 && (
          <Button
            variant="outline"
            className="mt-4 w-full"
            onClick={() => window.location.href = "/network"}
          >
            View More
          </Button>
        )}
      </div>
    </div>
  );
}
