import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/lib/auth";
import { User } from "@shared/schema";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Search } from "lucide-react";

export default function Network() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  
  const { data: users, isLoading: isUsersLoading } = useQuery({
    queryKey: [`/api/users?q=${searchQuery}`],
    enabled: !!user,
  });
  
  const { data: connections, isLoading: isConnectionsLoading } = useQuery({
    queryKey: ["/api/connections"],
    enabled: !!user,
  });
  
  const { data: pendingConnections, isLoading: isPendingLoading } = useQuery({
    queryKey: ["/api/connections/pending"],
    enabled: !!user,
  });
  
  const handleConnect = async (userId: number) => {
    try {
      await apiRequest("POST", "/api/connections", {
        recipientId: userId,
      });
      
      queryClient.invalidateQueries({ queryKey: ["/api/connections"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard"] });
      
      toast({
        title: "Connection request sent",
        description: "We'll notify you when they respond",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Could not send connection request",
        variant: "destructive",
      });
    }
  };
  
  const handleAcceptConnection = async (connectionId: number) => {
    try {
      await apiRequest("PUT", `/api/connections/${connectionId}`, {
        status: "accepted",
      });
      
      queryClient.invalidateQueries({ queryKey: ["/api/connections"] });
      queryClient.invalidateQueries({ queryKey: ["/api/connections/pending"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard"] });
      
      toast({
        title: "Connection accepted",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Could not accept connection",
        variant: "destructive",
      });
    }
  };
  
  const handleDeclineConnection = async (connectionId: number) => {
    try {
      await apiRequest("PUT", `/api/connections/${connectionId}`, {
        status: "rejected",
      });
      
      queryClient.invalidateQueries({ queryKey: ["/api/connections/pending"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard"] });
      
      toast({
        title: "Connection declined",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Could not decline connection",
        variant: "destructive",
      });
    }
  };
  
  const isConnected = (userId: number) => {
    if (!connections) return false;
    return connections.some(conn => conn.user.id === userId);
  };
  
  const isPending = (userId: number) => {
    if (!pendingConnections) return false;
    return pendingConnections.some(conn => conn.user.id === userId);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Card>
        <CardHeader>
          <CardTitle>Your Network</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative w-full mb-6">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <Input
              className="pl-10"
              placeholder="Search users by name, skills or company..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <Tabs defaultValue="all">
            <TabsList className="mb-6">
              <TabsTrigger value="all">All Users</TabsTrigger>
              <TabsTrigger value="connected">Connected</TabsTrigger>
              <TabsTrigger value="pending">Pending Requests 
                {pendingConnections && pendingConnections.length > 0 && (
                  <Badge variant="destructive" className="ml-2">
                    {pendingConnections.length}
                  </Badge>
                )}
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="all">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {isUsersLoading ? (
                  Array(6).fill(0).map((_, i) => (
                    <Card key={i} className="animate-pulse">
                      <CardContent className="pt-6">
                        <div className="flex items-center mb-4">
                          <div className="h-10 w-10 rounded-full bg-gray-200 mr-3"></div>
                          <div>
                            <div className="h-4 w-24 bg-gray-200 mb-2"></div>
                            <div className="h-3 w-32 bg-gray-200"></div>
                          </div>
                        </div>
                        <div className="h-4 w-full bg-gray-200 mb-4"></div>
                        <div className="h-8 w-full bg-gray-200 rounded"></div>
                      </CardContent>
                    </Card>
                  ))
                ) : users?.filter(u => u.id !== user?.id).map((userData: User) => (
                  <Card key={userData.id}>
                    <CardContent className="pt-6">
                      <div className="flex items-center mb-4">
                        <Avatar className="mr-3">
                          <AvatarImage src={userData.avatarUrl || ''} alt={userData.name} />
                          <AvatarFallback>{userData.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <div>
                          <h4 className="font-medium">{userData.name}</h4>
                          <p className="text-sm text-gray-500">{userData.headline}</p>
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 mb-4 line-clamp-2">{userData.bio}</p>
                      <Badge className="mb-3">{userData.userType}</Badge>
                      {isConnected(userData.id) ? (
                        <Button variant="outline" className="w-full" disabled>
                          Connected
                        </Button>
                      ) : isPending(userData.id) ? (
                        <Button variant="outline" className="w-full" disabled>
                          Request Pending
                        </Button>
                      ) : (
                        <Button 
                          className="w-full" 
                          onClick={() => handleConnect(userData.id)}
                        >
                          Connect
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
            
            <TabsContent value="connected">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {isConnectionsLoading ? (
                  Array(3).fill(0).map((_, i) => (
                    <Card key={i} className="animate-pulse">
                      <CardContent className="pt-6">
                        <div className="flex items-center mb-4">
                          <div className="h-10 w-10 rounded-full bg-gray-200 mr-3"></div>
                          <div>
                            <div className="h-4 w-24 bg-gray-200 mb-2"></div>
                            <div className="h-3 w-32 bg-gray-200"></div>
                          </div>
                        </div>
                        <div className="h-4 w-full bg-gray-200 mb-4"></div>
                        <div className="h-8 w-full bg-gray-200 rounded"></div>
                      </CardContent>
                    </Card>
                  ))
                ) : connections?.length === 0 ? (
                  <div className="col-span-full text-center py-10">
                    <h3 className="text-lg font-medium text-gray-900 mb-1">No connections yet</h3>
                    <p className="text-gray-500">Start connecting with entrepreneurs and investors</p>
                  </div>
                ) : connections?.map(({ user: connectedUser, connection }) => (
                  <Card key={connection.id}>
                    <CardContent className="pt-6">
                      <div className="flex items-center mb-4">
                        <Avatar className="mr-3">
                          <AvatarImage src={connectedUser.avatarUrl || ''} alt={connectedUser.name} />
                          <AvatarFallback>{connectedUser.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <div>
                          <h4 className="font-medium">{connectedUser.name}</h4>
                          <p className="text-sm text-gray-500">{connectedUser.headline}</p>
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 mb-4 line-clamp-2">{connectedUser.bio}</p>
                      <Badge className="mb-3">{connectedUser.userType}</Badge>
                      <div className="flex gap-2">
                        <Button variant="outline" className="w-full">
                          Message
                        </Button>
                        <Button variant="outline" className="w-full">
                          View Profile
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
            
            <TabsContent value="pending">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {isPendingLoading ? (
                  Array(2).fill(0).map((_, i) => (
                    <Card key={i} className="animate-pulse">
                      <CardContent className="pt-6">
                        <div className="flex items-center mb-4">
                          <div className="h-10 w-10 rounded-full bg-gray-200 mr-3"></div>
                          <div>
                            <div className="h-4 w-24 bg-gray-200 mb-2"></div>
                            <div className="h-3 w-32 bg-gray-200"></div>
                          </div>
                        </div>
                        <div className="h-4 w-full bg-gray-200 mb-4"></div>
                        <div className="flex gap-2">
                          <div className="h-8 w-full bg-gray-200 rounded"></div>
                          <div className="h-8 w-full bg-gray-200 rounded"></div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                ) : pendingConnections?.length === 0 ? (
                  <div className="col-span-full text-center py-10">
                    <h3 className="text-lg font-medium text-gray-900 mb-1">No pending requests</h3>
                    <p className="text-gray-500">You don't have any pending connection requests</p>
                  </div>
                ) : pendingConnections?.map(({ user: requester, connection }) => (
                  <Card key={connection.id}>
                    <CardContent className="pt-6">
                      <div className="flex items-center mb-4">
                        <Avatar className="mr-3">
                          <AvatarImage src={requester.avatarUrl || ''} alt={requester.name} />
                          <AvatarFallback>{requester.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <div>
                          <h4 className="font-medium">{requester.name}</h4>
                          <p className="text-sm text-gray-500">{requester.headline}</p>
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 mb-4 line-clamp-2">{requester.bio}</p>
                      <Badge className="mb-3">{requester.userType}</Badge>
                      <div className="flex gap-2">
                        <Button 
                          variant="outline" 
                          className="w-full"
                          onClick={() => handleDeclineConnection(connection.id)}
                        >
                          Decline
                        </Button>
                        <Button 
                          className="w-full"
                          onClick={() => handleAcceptConnection(connection.id)}
                        >
                          Accept
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
