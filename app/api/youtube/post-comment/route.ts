import { google } from 'googleapis';
import { NextResponse } from 'next/server';
import { getAuthenticatedClient } from '@/lib/google-auth';

export async function POST(request: Request) {
    try {
        const { commentText, videoId, parentId } = await request.json();
        const youtube = await getAuthenticatedClient();

        const response = await youtube.commentThreads.insert({
            part: ['snippet'],
            requestBody: {
                snippet: {
                    videoId: videoId,
                    topLevelComment: {
                        snippet: {
                            textOriginal: commentText
                        }
                    }
                }
            }
        });

        return NextResponse.json({ success: true, data: response.data });
    } catch (error) {
        console.error('Error posting comment:', error);
        return NextResponse.json({ success: false, error: 'Failed to post comment' }, { status: 500 });
    }
} 