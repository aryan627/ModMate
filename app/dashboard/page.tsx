import React from "react";
import { getAuthenticatedClient } from '@/lib/google-auth';
import CommentModeration from "@/components/youtube/CommentModeration";
import SentimentAnalysis from "@/components/youtube/SentimentAnalysis";
import { detectSpam, containsSpamIndicators, analyzeSentiment } from '@/lib/ai-utils';

export default async function DashboardPage() {
  const youtube = await getAuthenticatedClient();

  try {
    const channelResponse = await youtube.channels.list({
      part: ['id'],
      mine: true,
    });

    const channelId = channelResponse.data.items?.[0]?.id;

    if (!channelId) {
      throw new Error('Could not find channel ID');
    }

    const response = await youtube.commentThreads.list({
      part: ['snippet'],
      allThreadsRelatedToChannelId: channelId,
      maxResults: 100,
    });

    const comments = (await Promise.all(
      response.data.items?.map(async (comment) => {
        if (!comment.snippet?.topLevelComment?.snippet?.textDisplay) {
          return null;
        }

        const textDisplay = comment.snippet.topLevelComment.snippet.textDisplay;
        const preliminarySpamCheck = containsSpamIndicators(textDisplay);
        const isSpam = preliminarySpamCheck || await detectSpam([textDisplay]).then(results => results[0]);
        const sentiment = await analyzeSentiment(textDisplay);

        return {
          id: comment.id || '',
          isSpam,
          sentiment,
          author: comment.snippet?.topLevelComment?.snippet?.authorDisplayName ?? undefined,
          likeCount: comment.snippet?.topLevelComment?.snippet?.likeCount ?? undefined,
          snippet: comment.snippet,
        };
      }) || []
    )).filter((comment): comment is NonNullable<typeof comment> => comment !== null);

    const legitimateComments = comments.filter(comment => !comment.isSpam);
    const spamComments = comments.filter(comment => comment.isSpam);

    return (
      <div className="container mx-auto p-4 grid grid-cols-1 md:grid-cols-3 gap-6 bg-gray-900 text-white">
        <div className="space-y-4 bg-gray-800 p-4 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Legitimate Comments</h2>
          <CommentModeration comments={legitimateComments} type="legitimate" />
        </div>
        <div className="space-y-4 bg-gray-800 p-4 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Spam Comments</h2>
          <CommentModeration comments={spamComments} type="spam" />
        </div>
        <div className="space-y-4 bg-gray-800 p-4 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Sentiment Analysis</h2>
          <SentimentAnalysis comments={comments} />
        </div>
      </div>
    );
  } catch (error) {
    console.error('Error fetching comments:', error);
    return (
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-6">Error</h1>
        <p className="text-red-500">Failed to load comments. Please make sure you have granted the necessary permissions.</p>
      </div>
    );
  }
}
