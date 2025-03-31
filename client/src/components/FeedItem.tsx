import { useState } from "react";
import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ThumbsUp, MessageSquare, Share } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { Post } from "@/lib/types";

interface FeedItemProps {
  post: Post;
}

export default function FeedItem({ post }: FeedItemProps) {
  const [liked, setLiked] = useState(false);
  
  const formatDate = (dateString: string) => {
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true });
    } catch (e) {
      return "recently";
    }
  };
  
  const getPostTypeLabel = (type: string) => {
    switch (type) {
      case "update":
        return "shared an update";
      case "project":
        return "shared a project";
      case "opportunity":
        return "shared an opportunity";
      default:
        return "posted";
    }
  };

  return (
    <Card className="mb-6 overflow-hidden">
      <CardContent className="p-5">
        <div className="flex space-x-3">
          <div className="flex-shrink-0">
            <Avatar>
              <AvatarImage src={post.user.avatarUrl || ""} alt={post.user.name} />
              <AvatarFallback>{post.user.name.substring(0, 2).toUpperCase()}</AvatarFallback>
            </Avatar>
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-gray-900">
              <Link href={`/profile/${post.user.id}`}>
                <a className="hover:underline">{post.user.name}</a>
              </Link>
              <span className="text-gray-500 font-normal"> {getPostTypeLabel(post.type)}</span>
            </p>
            <p className="text-sm text-gray-500">
              <time>{formatDate(post.createdAt.toString())}</time>
            </p>
          </div>
        </div>
        <div className="mt-4">
          <p className="text-sm text-gray-800">
            {post.content}
          </p>
        </div>
        {post.tags && post.tags.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {post.tags.map((tag, index) => (
              <Badge key={index} variant="secondary">
                {tag}
              </Badge>
            ))}
          </div>
        )}
        <div className="mt-4 flex items-center space-x-4">
          <Button 
            variant="ghost" 
            size="sm" 
            className={`text-sm ${liked ? 'text-primary-600' : 'text-gray-500 hover:text-gray-900'}`}
            onClick={() => setLiked(!liked)}
          >
            <ThumbsUp className="h-5 w-5 mr-1.5" />
            <span>Like</span>
          </Button>
          <Button 
            variant="ghost" 
            size="sm"
            className="text-sm text-gray-500 hover:text-gray-900"
          >
            <MessageSquare className="h-5 w-5 mr-1.5" />
            <span>Comment</span>
          </Button>
          <Button 
            variant="ghost" 
            size="sm"
            className="text-sm text-gray-500 hover:text-gray-900"
          >
            <Share className="h-5 w-5 mr-1.5" />
            <span>Share</span>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
