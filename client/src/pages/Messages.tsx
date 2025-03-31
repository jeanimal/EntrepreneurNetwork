import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/lib/auth";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { Send } from "lucide-react";

export default function Messages() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [messageText, setMessageText] = useState("");
  
  const { data: conversations, isLoading: isConversationsLoading } = useQuery({
    queryKey: ["/api/messages"],
    enabled: !!user,
  });
  
  const { data: messages, isLoading: isMessagesLoading } = useQuery({
    queryKey: [`/api/messages/${selectedUserId}`],
    enabled: !!selectedUserId,
    refetchInterval: 5000,
  });
  
  // Auto-select first conversation if none selected
  useEffect(() => {
    if (conversations?.length > 0 && !selectedUserId) {
      setSelectedUserId(conversations[0].user.id);
    }
  }, [conversations, selectedUserId]);
  
  const handleSendMessage = async () => {
    if (!messageText.trim() || !selectedUserId) return;
    
    try {
      await apiRequest("POST", "/api/messages", {
        recipientId: selectedUserId,
        content: messageText,
      });
      
      queryClient.invalidateQueries({ queryKey: [`/api/messages/${selectedUserId}`] });
      queryClient.invalidateQueries({ queryKey: ["/api/messages"] });
      setMessageText("");
      
    } catch (error) {
      toast({
        title: "Error",
        description: "Could not send message",
        variant: "destructive",
      });
    }
  };
  
  const getSelectedUser = () => {
    if (!conversations || !selectedUserId) return null;
    return conversations.find(conv => conv.user.id === selectedUserId)?.user;
  };
  
  const formatMessageTime = (dateString: string) => {
    const date = new Date(dateString);
    return format(date, "h:mm a");
  };
  
  const selectedUser = getSelectedUser();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="grid grid-cols-12 gap-6 h-[calc(100vh-12rem)]">
        {/* Conversation list */}
        <div className="col-span-12 md:col-span-4 lg:col-span-3 h-full">
          <Card className="h-full flex flex-col">
            <CardContent className="p-4 flex-grow overflow-hidden">
              <h2 className="text-lg font-semibold mb-4">Messages</h2>
              
              {isConversationsLoading ? (
                <div className="space-y-3">
                  {Array(5).fill(0).map((_, i) => (
                    <div key={i} className="flex items-center p-2 animate-pulse">
                      <div className="h-10 w-10 rounded-full bg-gray-200 mr-3"></div>
                      <div className="flex-1">
                        <div className="h-4 w-24 bg-gray-200 mb-2"></div>
                        <div className="h-3 w-32 bg-gray-200"></div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : conversations?.length === 0 ? (
                <div className="text-center py-10">
                  <p className="text-gray-500">No messages yet</p>
                  <p className="text-sm text-gray-400">Connect with others to start messaging</p>
                </div>
              ) : (
                <ScrollArea className="h-full pr-3">
                  <div className="space-y-1">
                    {conversations?.map((conversation) => (
                      <div
                        key={conversation.user.id}
                        className={cn(
                          "flex items-center p-2 rounded-md cursor-pointer hover:bg-gray-100",
                          selectedUserId === conversation.user.id && "bg-gray-100"
                        )}
                        onClick={() => setSelectedUserId(conversation.user.id)}
                      >
                        <Avatar className="mr-3">
                          <AvatarImage src={conversation.user.avatarUrl || ''} alt={conversation.user.name} />
                          <AvatarFallback>{conversation.user.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-center">
                            <p className="font-medium truncate">{conversation.user.name}</p>
                            <span className="text-xs text-gray-500">
                              {format(new Date(conversation.lastMessage.createdAt), "MMM d")}
                            </span>
                          </div>
                          <p className="text-sm text-gray-500 truncate">
                            {conversation.lastMessage.content}
                          </p>
                        </div>
                        {conversation.unreadCount > 0 && (
                          <Badge className="ml-2">{conversation.unreadCount}</Badge>
                        )}
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              )}
            </CardContent>
          </Card>
        </div>
        
        {/* Message thread */}
        <div className="col-span-12 md:col-span-8 lg:col-span-9 h-full">
          <Card className="h-full flex flex-col">
            {selectedUser ? (
              <>
                {/* Header */}
                <div className="p-4 border-b flex items-center">
                  <Avatar className="mr-3">
                    <AvatarImage src={selectedUser.avatarUrl || ''} alt={selectedUser.name} />
                    <AvatarFallback>{selectedUser.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-medium">{selectedUser.name}</h3>
                    <p className="text-xs text-gray-500">{selectedUser.headline}</p>
                  </div>
                </div>
                
                {/* Messages */}
                <ScrollArea className="flex-grow p-4">
                  {isMessagesLoading ? (
                    <div className="space-y-4">
                      {Array(5).fill(0).map((_, i) => (
                        <div key={i} className={`flex ${i % 2 === 0 ? 'justify-start' : 'justify-end'}`}>
                          <div className={`max-w-[70%] p-3 rounded-lg ${i % 2 === 0 ? 'bg-gray-100' : 'bg-primary-100'} animate-pulse`}>
                            <div className="h-4 w-32 bg-gray-200 mb-1"></div>
                            <div className="h-3 w-16 bg-gray-200"></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : messages?.length === 0 ? (
                    <div className="h-full flex items-center justify-center">
                      <div className="text-center">
                        <p className="text-gray-500">No messages yet</p>
                        <p className="text-sm text-gray-400">Start the conversation!</p>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {messages?.map((message) => {
                        const isSender = message.senderId === user?.id;
                        return (
                          <div key={message.id} className={`flex ${isSender ? 'justify-end' : 'justify-start'}`}>
                            <div
                              className={cn(
                                "max-w-[70%] p-3 rounded-lg",
                                isSender
                                  ? "bg-primary-600 text-white"
                                  : "bg-gray-100 text-gray-800"
                              )}
                            >
                              <p>{message.content}</p>
                              <p className={cn(
                                "text-xs mt-1 text-right",
                                isSender ? "text-primary-100" : "text-gray-500"
                              )}>
                                {formatMessageTime(message.createdAt)}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </ScrollArea>
                
                {/* Input */}
                <div className="p-4 border-t mt-auto">
                  <div className="flex gap-2">
                    <Input
                      placeholder="Type a message..."
                      value={messageText}
                      onChange={(e) => setMessageText(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleSendMessage();
                        }
                      }}
                    />
                    <Button onClick={handleSendMessage} disabled={!messageText.trim()}>
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </>
            ) : (
              <div className="h-full flex items-center justify-center">
                <div className="text-center">
                  <h3 className="text-lg font-medium text-gray-900 mb-1">No conversation selected</h3>
                  <p className="text-gray-500">Select a conversation to start messaging</p>
                </div>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
