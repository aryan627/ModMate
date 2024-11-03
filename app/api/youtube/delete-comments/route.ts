import { NextResponse } from "next/server";
import { getAuthenticatedClient } from "@/lib/google-auth";

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { commentIds } = body;

        // Validate input
        if (!Array.isArray(commentIds) || commentIds.length === 0) {
            return NextResponse.json(
                { error: "Invalid or empty commentIds array" },
                { status: 400 }
            );
        }

        const youtube = await getAuthenticatedClient();
        console.log(`Attempting to delete ${commentIds.length} comments`);

        // First verify the comments exist
        const verificationResults = await Promise.allSettled(
            commentIds.map(async (commentId: string) => {
                try {
                    const response = await youtube.comments.list({
                        id: [commentId.trim()],
                        part: ['id', 'snippet']
                    });
                    return response.data.items && response.data.items.length > 0;
                } catch (error) {
                    console.error(`Failed to verify comment ${commentId}:`, error);
                    return false;
                }
            })
        );

        // Filter out invalid comments
        const validCommentIds = commentIds.filter((_, index) => {
            const result = verificationResults[index];
            return result.status === 'fulfilled' && result.value === true;
        });

        if (validCommentIds.length === 0) {
            return NextResponse.json({
                error: "No valid comments found to delete",
                details: "The provided comment IDs could not be verified"
            }, { status: 400 });
        }

        // Process deletions
        const deletionResults = await Promise.allSettled(
            validCommentIds.map(async (commentId: string) => {
                const cleanCommentId = commentId.trim();
                console.log(`Processing deletion for comment ID: ${cleanCommentId}`);

                try {
                    await youtube.comments.delete({
                        id: cleanCommentId,
                    });

                    console.log(`Successfully deleted comment ID: ${cleanCommentId}`);
                    return {
                        id: cleanCommentId,
                        success: true
                    };
                } catch (error: any) {
                    const errorDetails = {
                        message: error.message,
                        code: error.response?.status || error.code,
                        details: error.response?.data?.error?.message || 'Unknown error'
                    };

                    console.error(`Failed to delete comment ${cleanCommentId}:`, errorDetails);
                    return {
                        id: cleanCommentId,
                        success: false,
                        error: errorDetails
                    };
                }
            })
        );

        // Process results
        const results = {
            successful: [] as string[],
            failed: [] as any[],
            total: validCommentIds.length
        };

        deletionResults.forEach((result) => {
            if (result.status === 'fulfilled') {
                const value = result.value as any;
                if (value.success) {
                    results.successful.push(value.id);
                } else {
                    results.failed.push(value);
                }
            }
        });

        console.log('Deletion operation completed:', {
            totalAttempted: validCommentIds.length,
            successfulCount: results.successful.length,
            failedCount: results.failed.length
        });

        return NextResponse.json({
            success: results.successful.length > 0,
            results: {
                successful: results.successful,
                failed: results.failed,
                totalProcessed: validCommentIds.length
            }
        });

    } catch (error: any) {
        console.error('Fatal error in comment deletion:', {
            message: error.message,
            stack: error.stack
        });

        return NextResponse.json(
            { 
                error: "Failed to process comment deletions",
                details: error.message 
            }, 
            { status: 500 }
        );
    }
}