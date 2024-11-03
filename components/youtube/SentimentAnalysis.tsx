import React from "react";

interface SentimentAnalysisProps {
  comments: Array<{
    id: string;
    sentiment: string;
    author?: string;
  }>;
}

const SentimentAnalysis: React.FC<SentimentAnalysisProps> = ({ comments }) => {
  return (
    <div className="mt-8 p-4 bg-secondary/50 rounded-lg shadow-md">
      <h3 className="text-lg font-bold mb-2">Sentiment Analysis & Insights</h3>
      {comments.length > 0 ? (
        <ul>
          {comments.map(comment => (
            <li key={comment.id} className="text-sm mb-2">
              <strong>Author:</strong> {comment.author || 'Unknown'} <br />
              <strong>Sentiment:</strong> {comment.sentiment}
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm italic">No comments available for sentiment analysis.</p>
      )}
    </div>
  );
};

export default SentimentAnalysis;
