'use client';

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { moderateComment, generateAIReply } from "@/lib/ai-utils";
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet"; 
import { VisuallyHidden } from "@radix-ui/react-visually-hidden"; 

interface CommentModerationProps {
  comments: Array<{
    id: string;
    isSpam: boolean;
    snippet?: {
      topLevelComment?: {
        snippet?: {
          textDisplay?: string;
          authorDisplayName?: string;
          likeCount?: number;
        };
      };
    };
  }>;
  type: 'legitimate' | 'spam';
}

export default function CommentModeration({ comments, type }: CommentModerationProps) {
  const [currentReply, setCurrentReply] = useState('');
  const [currentCommentId, setCurrentCommentId] = useState<string | null>(null);
  const { toast } = useToast();

  const handlePostReply = async () => {
    if (currentCommentId && currentReply) {
      try {
        const response = await fetch('/api/youtube/post-comment', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ commentText: currentReply, parentId: currentCommentId }),
        });
        const data = await response.json();
        if (data.success) {
          toast({ title: "Success", description: "Comment posted successfully.", variant: "default" });
        } else {
          throw new Error(data.error);
        }
      } catch (error) {
        toast({ title: "Error", description: "Failed to post comment. Please try again.", variant: "destructive" });
      }
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    if (confirm("Are you sure you want to delete this comment?")) {
      try {
        const response = await fetch('/api/youtube/delete-comments', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ commentIds: [commentId] }),
        });
        const data = await response.json();
        if (data.success) {
          toast({ title: "Success", description: "Comment deleted successfully.", variant: "default" });
        } else {
          throw new Error(data.error);
        }
      } catch (error) {
        toast({ title: "Error", description: "Failed to delete comment. Please try again.", variant: "destructive" });
      }
    }
  };

  const regenerateReply = async () => {
    if (currentCommentId) {
      const aiReply = await generateAIReply(currentReply);
      setCurrentReply(aiReply);
    }
  };

  return (
    <div className="space-y-6">
      {comments.map((comment) => (
        <div key={comment.id} className={`border-l-4 ${comment.isSpam ? 'border-red-500' : 'border-primary'} pl-4 bg-gray-800`}>
          <div className="flex items-start gap-4">
            <div className="flex-1">
              <p className="text-sm text-muted-foreground">
                By: {comment.snippet?.topLevelComment?.snippet?.authorDisplayName || 'Unknown'} • 
                {comment.snippet?.topLevelComment?.snippet?.likeCount || 0} likes
              </p>
              <p className="text-foreground">{comment.snippet?.topLevelComment?.snippet?.textDisplay}</p>
              <div className="mt-2">
                {comment.isSpam ? (
                  <Button variant="destructive" size="sm" onClick={() => handleDeleteComment(comment.id)}>Delete</Button>
                ) : (
                  <Button variant="outline" size="sm" onClick={() => {
                    setCurrentCommentId(comment.id);
                    setCurrentReply(comment.snippet?.topLevelComment?.snippet?.textDisplay || '');
                  }}>
                    Generate AI Reply
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      ))}
      <Sheet open={!!currentCommentId} onOpenChange={() => setCurrentCommentId(null)}>
        <SheetTrigger asChild>
          <Button variant="outline" className="hidden" />
        </SheetTrigger>
        <SheetContent>
          <SheetTitle>AI Suggested Reply</SheetTitle>
          <textarea
            className="w-full h-24 p-2 border rounded text-white bg-gray-800"
            value={currentReply}
            onChange={(e) => setCurrentReply(e.target.value)}
          />
          <div className="flex justify-end mt-4">
            <Button variant="outline" onClick={() => setCurrentCommentId(null)}>Close</Button>
            <Button variant="default" onClick={handlePostReply} className="ml-2">Post Reply</Button>
            <Button variant="default" onClick={regenerateReply} className="ml-2">Regenerate Reply</Button>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
