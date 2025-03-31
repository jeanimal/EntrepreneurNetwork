import { useState } from "react";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Image, Paperclip, MapPin } from "lucide-react";

export default function PostCreator() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!content.trim()) return;
    
    try {
      setIsSubmitting(true);
      await apiRequest("POST", "/api/posts", {
        content: content,
        type: "update",
        tags: [],
      });
      
      setContent("");
      queryClient.invalidateQueries({ queryKey: ["/api/feed"] });
      
      toast({
        title: "Post created",
        description: "Your update has been shared",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create post",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!user) return null;

  return (
    <div className="bg-white shadow rounded-lg mb-6">
      <div className="p-4">
        <div className="flex items-start space-x-4">
          <div className="flex-shrink-0">
            <Avatar>
              <AvatarImage src={user.avatarUrl || ""} alt={user.name} />
              <AvatarFallback>{user.name.substring(0, 2).toUpperCase()}</AvatarFallback>
            </Avatar>
          </div>
          <div className="min-w-0 flex-1">
            <div className="border border-gray-300 rounded-lg shadow-sm overflow-hidden focus-within:border-primary-500 focus-within:ring-1 focus-within:ring-primary-500">
              <Textarea 
                rows={3} 
                className="block w-full border-0 py-3 resize-none focus:ring-0 sm:text-sm" 
                placeholder="Share an update, project, or opportunity..." 
                value={content}
                onChange={(e) => setContent(e.target.value)}
              />
              <div className="py-2 px-3 bg-gray-50 flex items-center justify-between">
                <div className="flex space-x-2">
                  <Button variant="ghost" size="icon" className="rounded-full text-gray-500 hover:text-gray-900 hover:bg-gray-100">
                    <Image className="h-5 w-5" />
                  </Button>
                  <Button variant="ghost" size="icon" className="rounded-full text-gray-500 hover:text-gray-900 hover:bg-gray-100">
                    <Paperclip className="h-5 w-5" />
                  </Button>
                  <Button variant="ghost" size="icon" className="rounded-full text-gray-500 hover:text-gray-900 hover:bg-gray-100">
                    <MapPin className="h-5 w-5" />
                  </Button>
                </div>
                <Button 
                  type="submit" 
                  disabled={!content.trim() || isSubmitting}
                  onClick={handleSubmit}
                >
                  Post
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
