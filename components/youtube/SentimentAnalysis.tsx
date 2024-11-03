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
  const sentimentData = useMemo(() => {
    const counts = comments.reduce((acc, comment) => {
      acc[comment.sentiment] = (acc[comment.sentiment] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return [
      { name: 'Positive', value: counts.positive || 0 },
      { name: 'Neutral', value: counts.neutral || 0 },
      { name: 'Negative', value: counts.negative || 0 },
    ];
  }, [comments]);

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
          {comments.length > 0 ? (
            <ul className="space-y-2">
              {comments.map(comment => (
                <li key={comment.id} className="text-sm">
                  <strong>Author:</strong> {comment.author || 'Unknown'} <br />
                  <strong>Sentiment:</strong> {comment.sentiment}
                  {comment.isSpam && <span className="ml-2 text-red-500">(Spam)</span>}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm italic">No comments available for sentiment analysis.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default SentimentAnalysis;