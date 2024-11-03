'use client';

import React, { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

interface SentimentAnalysisProps {
  comments: Array<{
    id: string;
    sentiment: 'positive' | 'neutral' | 'negative';
    author?: string;
    isSpam: boolean;
  }>;
}

const SentimentAnalysis: React.FC<SentimentAnalysisProps> = ({ comments }) => {
  const nonSpamComments = comments.filter(comment => !comment.isSpam);

  const sentimentData = useMemo(() => {
    const counts = nonSpamComments.reduce((acc, comment) => {
      acc[comment.sentiment] = (acc[comment.sentiment] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return [
      { name: 'Positive', value: counts.positive || 0 },
      { name: 'Neutral', value: counts.neutral || 0 },
      { name: 'Negative', value: counts.negative || 0 },
    ];
  }, [nonSpamComments]);

  const spamLegitimateData = useMemo(() => {
    const spamCount = comments.filter(comment => comment.isSpam).length;
    const legitimateCount = comments.length - spamCount;

    return [
      { name: 'Spam', value: spamCount },
      { name: 'Legitimate', value: legitimateCount },
    ];
  }, [comments]);

  const SENTIMENT_COLORS = ['#8b5cf6', '#94a3b8', '#ef4444'];
  const SPAM_LEGITIMATE_COLORS = ['#ef4444', '#22c55e'];

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background border rounded-lg shadow-lg p-3">
          <p className="font-medium">{payload[0].name}</p>
          <p className="text-sm text-muted-foreground">
            {payload[0].value} comments ({((payload[0].value / comments.length) * 100).toFixed(1)}%)
          </p>
        </div>
      );
    }
    return null;
  };

  const overallSentimentInsight = useMemo(() => {
    if (nonSpamComments.length === 0) {
      return "No comments available for analysis.";
    }

    const positivePercentage = ((sentimentData.find(s => s.name === 'Positive')?.value || 0) / nonSpamComments.length) * 100;
    const negativePercentage = ((sentimentData.find(s => s.name === 'Negative')?.value || 0) / nonSpamComments.length) * 100;

    if (positivePercentage > 60) {
      return "Overall, the comments section is highly positive, indicating strong approval from the audience.";
    } else if (negativePercentage > 40) {
      return "There is a significant amount of negative sentiment in the comments, suggesting dissatisfaction or concern among viewers.";
    } else {
      return "The comments section shows a mix of sentiments, reflecting diverse opinions and reactions.";
    }
  }, [nonSpamComments, sentimentData]);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Sentiment Analysis</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64" role="img" aria-label="Sentiment analysis pie chart">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={sentimentData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {sentimentData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={SENTIMENT_COLORS[index % SENTIMENT_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Spam vs Legitimate Comments</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64" role="img" aria-label="Spam vs Legitimate comments pie chart">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={spamLegitimateData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {spamLegitimateData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={SPAM_LEGITIMATE_COLORS[index % SPAM_LEGITIMATE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Detailed Sentiment Analysis</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm mb-4">{overallSentimentInsight}</p>
          {nonSpamComments.length > 0 ? (
            <ul className="space-y-4">
              {nonSpamComments.map(comment => (
                <li key={comment.id} className="text-sm border-b border-muted-foreground pb-2">
                  <div className="mb-1">
                    <strong>Author:</strong> <span className="text-primary">{comment.author || 'Unknown'}</span>
                  </div>
                  <div>
                    <strong>Comment Insight:</strong>{' '}
                    {comment.sentiment === 'positive'
                      ? "This comment contributes positively to the discussion."
                      : comment.sentiment === 'neutral'
                      ? "This comment offers a balanced or neutral view."
                      : "This comment may indicate criticism or a negative reaction."}
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm italic">No non-spam comments available for detailed sentiment analysis.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default SentimentAnalysis;
