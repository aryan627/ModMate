import { NextResponse } from "next/server";
import { getAuthenticatedClient } from '@/lib/google-auth';

export async function POST(request: Request) {
  try {
    const { commentId, replyText } = await request.json();
    const youtube = await getAuthenticatedClient();

    const response = await youtube.comments.insert({
      part: ['snippet'],
      requestBody: {
        snippet: {
          parentId: commentId,
          textOriginal: replyText
        }
      }
    });

    return NextResponse.json({ success: true, data: response.data });
  } catch (error) {
    console.error('Error posting reply:', error);
    return NextResponse.json({ error: 'Failed to post reply' }, { status: 500 });
  }
} 