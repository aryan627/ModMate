'use client';

import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { generateAIReply } from "@/lib/ai-utils";
import { Sheet, SheetContent, SheetTrigger, SheetTitle, SheetDescription, SheetHeader, SheetFooter } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface CommentModerationProps {
  comments: Array<{
    id: string;
    isSpam: boolean;
    sentiment?: 'positive' | 'neutral' | 'negative';
    snippet?: {
      topLevelComment?: {
        snippet?: {
          textDisplay?: string;
          authorDisplayName?: string;
          likeCount?: number;
          authorProfileImageUrl?: string;
        };
      };
    };
  }>;
  type: 'legitimate' | 'spam';
}

export default function CommentModeration({ comments, type }: CommentModerationProps) {
  const [currentReply, setCurrentReply] = useState('');
  const [currentCommentId, setCurrentCommentId] = useState<string | null>(null);
  const [selectedComments, setSelectedComments] = useState<Set<string>>(new Set());
  const { toast } = useToast();

  useEffect(() => {
    // Effect hook if needed for additional logic
  }, [comments]);

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
          setCurrentReply('');
          setCurrentCommentId(null);
        } else {
          throw new Error(data.error);
        }
      } catch (error) {
        toast({ title: "Error", description: "Failed to post comment. Please try again.", variant: "destructive" });
      }
    }
  };

  const handleDeleteComments = async () => {
    if (selectedComments.size > 0 && confirm("Are you sure you want to delete the selected comments?")) {
      try {
        const response = await fetch('/api/youtube/delete-comments', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ commentIds: Array.from(selectedComments) }),
        });
        const data = await response.json();
        if (data.success) {
          toast({ title: "Success", description: "Selected comments deleted successfully.", variant: "default" });
          setSelectedComments(new Set());
          window.location.reload(); // Refresh the page after deletion
        } else {
          throw new Error(data.error);
        }
      } catch (error) {
        toast({ title: "Error", description: "Failed to delete comments. Please try again.", variant: "destructive" });
      }
    }
  };

  const regenerateReply = async () => {
    if (currentCommentId) {
      const commentText = comments.find(comment => comment.id === currentCommentId)?.snippet?.topLevelComment?.snippet?.textDisplay || '';
      const aiReply = await generateAIReply(commentText);
      setCurrentReply(aiReply);
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      const allCommentIds = comments.filter(comment => comment.isSpam).map(comment => comment.id);
      setSelectedComments(new Set(allCommentIds));
    } else {
      setSelectedComments(new Set());
    }
  };

  return (
    <div className="flex-1 space-y-6">
      {type === 'spam' && (
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="select-all"
                onCheckedChange={handleSelectAll}
                className="rounded-full"
              />
              <label
                htmlFor="select-all"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Select All Spam Comments
              </label>
            </div>
          </CardHeader>
          <CardFooter>
            <Button
              onClick={handleDeleteComments}
              variant="destructive"
              className="w-full"
              disabled={selectedComments.size === 0}
            >
              Delete Selected Comments ({selectedComments.size})
            </Button>
          </CardFooter>
        </Card>
      )}
      <ScrollArea className="h-[calc(100vh-200px)] rounded-md border p-4">
        {comments.map((comment) => (
          <Card key={comment.id} className={`mb-4 ${comment.isSpam ? 'border-red-500' : 'border-primary'}`}>
            <CardHeader className="pb-2">
              <div className="flex items-center space-x-4">
                <Avatar>
                  <AvatarImage src={comment.snippet?.topLevelComment?.snippet?.authorProfileImageUrl} />
                  <AvatarFallback>{comment.snippet?.topLevelComment?.snippet?.authorDisplayName?.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-medium">{comment.snippet?.topLevelComment?.snippet?.authorDisplayName || 'Unknown'}</p>
                  <p className="text-xs text-muted-foreground">{comment.snippet?.topLevelComment?.snippet?.likeCount || 0} likes</p>
                </div>
                {comment.isSpam && <Badge variant="destructive">Spam</Badge>}
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm">{comment.snippet?.topLevelComment?.snippet?.textDisplay}</p>
            </CardContent>
            <CardFooter className="flex justify-between">
              {type === 'spam' && (
                <Checkbox
                  checked={selectedComments.has(comment.id)}
                  onCheckedChange={(checked) => {
                    const newSelected = new Set(selectedComments);
                    if (checked) {
                      newSelected.add(comment.id);
                    } else {
                      newSelected.delete(comment.id);
                    }
                    setSelectedComments(newSelected);
                  }}
                  className="rounded-full"
                />
              )}
              {!comment.isSpam && (
                <Button
                  variant="default"
                  size="sm"
                  onClick={() => {
                    setCurrentCommentId(comment.id);
                    regenerateReply();
                  }}
                  className="bg-purple-600 hover:bg-purple-700 text-white"
                >
                  Generate AI Reply
                </Button>
              )}
            </CardFooter>
          </Card>
        ))}
      </ScrollArea>
      <Sheet open={!!currentCommentId} onOpenChange={() => setCurrentCommentId(null)}>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>AI Suggested Reply</SheetTitle>
            <SheetDescription>Edit the generated reply before posting</SheetDescription>
          </SheetHeader>
          <div className="py-4">
            <Textarea
              className="min-h-[100px]"
              value={currentReply}
              onChange={(e) => setCurrentReply(e.target.value)}
              placeholder="AI generated reply will appear here..."
            />
          </div>
          <SheetFooter>
            <Button variant="outline" onClick={() => setCurrentCommentId(null)}>Cancel</Button>
            <Button variant="default" onClick={regenerateReply}>Regenerate</Button>
            <Button variant="default" onClick={handlePostReply}>Post Reply</Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </div>
  );
}
