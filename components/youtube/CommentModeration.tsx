'use client';

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { moderateComment, generateAIReply } from "@/lib/ai-utils";
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet"; // Import ShadCN modal components
import { VisuallyHidden } from "@radix-ui/react-visually-hidden"; // Import VisuallyHidden for accessibility

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
  const [selectedComments, setSelectedComments] = useState<Set<string>>(new Set());
  const [aiReplies, setAiReplies] = useState<Record<string, string>>({});
  const [isGeneratingReply, setIsGeneratingReply] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [currentReply, setCurrentReply] = useState('');
  const [currentCommentId, setCurrentCommentId] = useState<string | null>(null);
  const { toast } = useToast();

  const handlePostReply = async (commentId: string, replyText: string) => {
    try {
      const response = await fetch('/api/youtube/post-reply', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ commentId, replyText }),
      });

      if (!response.ok) {
        throw new Error('Failed to post reply');
      }
    } catch (error) {
      console.error('Error posting reply:', error);
      toast({
        title: "Error",
        description: "Failed to post reply. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleGenerateReply = async (commentId: string, commentData: CommentModerationProps['comments'][0]) => {
    const commentText = commentData.snippet?.topLevelComment?.snippet?.textDisplay || '';
    setIsGeneratingReply(commentId);
    try {
      const aiReply = await generateAIReply(commentText);
      setAiReplies(prev => ({
        ...prev,
        [commentId]: aiReply
      }));
      setCurrentReply(aiReply);
      setCurrentCommentId(commentId);
      setModalOpen(true); // Open the modal with the AI reply
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate AI reply. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGeneratingReply(null);
    }
  };

  return (
    <div className="space-y-6">
      {comments.map((comment) => {
        const commentKey = comment.id;
        return (
          <div key={commentKey} className={`border-l-4 ${comment.isSpam ? 'border-red-500' : 'border-primary'} pl-4`}>
            <div className="flex items-start gap-2">
              <Checkbox
                checked={selectedComments.has(commentKey)}
                onCheckedChange={(checked) => {
                  setSelectedComments(prev => {
                    const newSet = new Set(prev);
                    checked ? newSet.add(commentKey) : newSet.delete(commentKey);
                    return newSet;
                  });
                }}
              />
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <p className="text-sm text-muted-foreground">
                    By: {comment.snippet?.topLevelComment?.snippet?.authorDisplayName || 'Unknown'} • 
                    {comment.snippet?.topLevelComment?.snippet?.likeCount || 0} likes
                  </p>
                  {comment.isSpam && (
                    <Badge variant="destructive">Spam</Badge>
                  )}
                </div>
                <p className="text-foreground">
                  {comment.snippet?.topLevelComment?.snippet?.textDisplay}
                </p>
                <div className="mt-2">
                  {!comment.isSpam && ( // Disable AI Reply for spam comments
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleGenerateReply(comment.id, comment)}
                      disabled={isGeneratingReply === commentKey}
                    >
                      {isGeneratingReply === commentKey ? "Generating..." : "Generate AI Reply"}
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>
        );
      })}

      {/* Modal for AI Reply */}
      <Sheet open={modalOpen} onOpenChange={setModalOpen}>
        <SheetTrigger asChild>
          <Button variant="outline" className="hidden" />
        </SheetTrigger>
        <SheetContent>
          <SheetTitle>
            <VisuallyHidden>AI Suggested Reply</VisuallyHidden>
            AI Suggested Reply
          </SheetTitle>
          <textarea
            className="w-full h-24 p-2 border rounded text-black" // Ensure text is dark for readability
            value={currentReply}
            onChange={(e) => setCurrentReply(e.target.value)}
          />
          <div className="flex justify-end mt-4">
            <Button
              variant="outline"
              onClick={() => {
                handlePostReply(currentCommentId!, currentReply);
                setModalOpen(false);
              }}
            >
              Post Reply
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                setModalOpen(false);
                handleGenerateReply(currentCommentId!, comments.find(c => c.id === currentCommentId)!);
              }}
              className="ml-2"
            >
              Regenerate Reply
            </Button>
            <Button
              variant="destructive"
              onClick={() => setModalOpen(false)}
              className="ml-2"
            >
              Cancel
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
} 