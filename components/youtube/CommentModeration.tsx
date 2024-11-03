'use client';

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { moderateComment, generateAIReply } from "@/lib/ai-utils";

import { LoadingSpinner } from '@/components/common/LoadingSpinner';

interface Comment {
  id: string;
  text: string;
  author: string;
  likeCount: number;
}

interface Video {
  title: string;
  videoId: string;
  comments: Comment[];
}

interface CommentModerationProps {
  comments: Array<{
    id: string;
    isSpam: boolean;
    author?: string;
    likeCount?: number;
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
  const [isDeleting, setIsDeleting] = useState(false);
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
    const commentKey = `${commentId}-${commentText}`;
    setIsGeneratingReply(commentKey);
    try {
      const aiReply = await generateAIReply(commentText);
      setAiReplies(prev => ({
        ...prev,
        [commentKey]: aiReply
      }));
      // Prompt user to post or regenerate
      const userChoice = confirm(`AI Suggested Reply: "${aiReply}". Do you want to post this reply?`);
      if (userChoice) {
        await handlePostReply(commentId, aiReply);
      } else {
        // Optionally, allow the user to regenerate
        const regenerate = confirm("Do you want to generate a new reply?");
        if (regenerate) {
          await handleGenerateReply(commentId, commentData);
        }
      }
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

  const handleSelectAllSpam = () => {
    const spamComments = comments.filter(comment => comment.isSpam);
    if (selectedComments.size === spamComments.length) {
      setSelectedComments(new Set());
    } else {
      setSelectedComments(new Set(spamComments.map(c => `${c.id}-${c.snippet?.topLevelComment?.snippet?.textDisplay}`)));
    }
  };

  const handleToggleComment = (commentId: string) => {
    const newSelected = new Set(selectedComments);
    if (newSelected.has(commentId)) {
      newSelected.delete(commentId);
    } else {
      newSelected.add(commentId);
    }
    setSelectedComments(newSelected);
  };

  const handleDeleteSelected = async () => {
    if (selectedComments.size === 0) return;

    setIsDeleting(true);
    try {
      const commentIdsToDelete = Array.from(selectedComments).map(commentKey => {
        const comment = comments.find(c => 
          `${c.id}-${c.snippet?.topLevelComment?.snippet?.textDisplay}` === commentKey
        );
        return comment?.id; // Ensure this returns the correct comment ID
      }).filter(Boolean); // Filter out any undefined values

      console.log('Comment IDs to delete:', commentIdsToDelete); // Log the IDs to be deleted

      const response = await fetch('/api/youtube/delete-comments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          commentIds: commentIdsToDelete,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to delete comments');
      }

      // Remove deleted comments from the state
      setSelectedComments(new Set());
      
      toast({
        title: "Success",
        description: `Successfully deleted ${commentIdsToDelete.length} comment(s)`,
      });
    } catch (error) {
      console.error('Error deleting comments:', error);
      toast({
        title: "Error",
        description: "Failed to delete comments. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      {type === 'spam' && (
        <Button
          onClick={handleDeleteSelected}
          disabled={selectedComments.size === 0 || isDeleting}
          variant="destructive"
          className="w-full"
        >
          {isDeleting ? <LoadingSpinner /> : `Delete Selected (${selectedComments.size})`}
        </Button>
      )}

      {comments.map((comment, index) => {
        const commentKey = `${comment.id}-${comment.snippet?.topLevelComment?.snippet?.textDisplay}`;
        const isSelected = selectedComments.has(commentKey);

        return (
          <div key={index} className={`border-l-4 ${comment.isSpam ? 'border-red-500' : 'border-primary'} pl-4`}>
            <div className="flex items-start gap-2">
              <Checkbox
                checked={isSelected}
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
                
                {aiReplies[commentKey] && (
                  <div className="mt-2 p-2 bg-muted rounded-md">
                    <p className="text-sm font-medium">AI Suggested Reply:</p>
                    <p className="text-sm">{aiReplies[commentKey]}</p>
                  </div>
                )}
                
                {type === 'legitimate' && (
                  <div className="mt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleGenerateReply(comment.id, comment)}
                      disabled={isGeneratingReply === commentKey}
                    >
                      {isGeneratingReply === commentKey ? "Generating..." : "Generate AI Reply"}
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
} 