import { NextResponse } from "next/server";
import { getAuthenticatedClient } from "@/lib/google-auth";

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { commentIds } = body;
        const youtube = await getAuthenticatedClient();

        // Log the comment IDs being processed
        console.log('Deleting comments with IDs:', commentIds);

        // Delete each comment directly using their IDs
        await Promise.all(commentIds.map(async (commentId: string) => {
            console.log(`Attempting to delete comment ID: ${commentId}`); // Log each ID
            await youtube.comments.delete({
                id: commentId
            });
        }));

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error deleting comments:', error);
        return NextResponse.json({ error: "Failed to delete comments" }, { status: 500 });
    }
} 