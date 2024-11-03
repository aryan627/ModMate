import { google } from "googleapis";
import { cookies } from "next/headers";

const oauth2Client = new google.auth.OAuth2(
    process.env.CLIENT_ID,
    process.env.CLIENT_SECRET,
    process.env.REDIRECT_URI
);

const SCOPES = [
    'https://www.googleapis.com/auth/youtube.force-ssl',
    'https://www.googleapis.com/auth/youtube'  // Added full YouTube scope
];

export function getAuthUrl() {
    return oauth2Client.generateAuthUrl({
        access_type: 'offline',
        prompt: 'consent', // Force prompt to ensure refresh token
        scope: SCOPES
    });
}

export async function getAuthenticatedClient() {
    const cookieStore = await cookies(); // Await the cookies to get the resolved value
    const accessToken = cookieStore.get('google_access_token')?.value;
    const refreshToken = cookieStore.get('google_refresh_token')?.value;

    if (!accessToken) {
        throw new Error('No access token found');
    }

    // Set both access and refresh tokens
    oauth2Client.setCredentials({
        access_token: accessToken,
        refresh_token: refreshToken,
        expiry_date: parseInt(cookieStore.get('token_expiry')?.value || '0')
    });

    // Enable automatic token refresh
    oauth2Client.on('tokens', async (tokens) => {
        const cookieStore = await cookies(); // Await the cookies to get the resolved value
        if (tokens.access_token) {
            // Update cookies with new tokens
            cookieStore.set('google_access_token', tokens.access_token, {
                secure: true,
                httpOnly: true,
                sameSite: 'lax',
                expires: new Date(Date.now() + 3600 * 1000) // 1 hour
            });
        }
        if (tokens.refresh_token) {
            cookieStore.set('google_refresh_token', tokens.refresh_token, {
                secure: true,
                httpOnly: true,
                sameSite: 'lax',
                expires: new Date(Date.now() + 7 * 24 * 3600 * 1000) // 7 days
            });
        }
        if (tokens.expiry_date) {
            cookieStore.set('token_expiry', tokens.expiry_date.toString(), {
                secure: true,
                httpOnly: true,
                sameSite: 'lax',
                expires: new Date(tokens.expiry_date)
            });
        }
    });

    try {
        // Verify the client is properly authenticated
        const youtube = google.youtube({
            version: 'v3',
            auth: oauth2Client
        });

        // Test the authentication with a simple API call
        await youtube.channels.list({
            part: ['snippet'],
            mine: true
        });

        return youtube;
    } catch (error: any) {
        console.error('Authentication error:', error);
        if (error.message.includes('invalid_grant') || error.message.includes('Invalid Credentials')) {
            // Clear invalid tokens
            const cookieStore = await cookies(); // Await the cookies to get the resolved value
            cookieStore.delete('google_access_token');
            cookieStore.delete('google_refresh_token');
            cookieStore.delete('token_expiry');
            throw new Error('Authentication expired. Please login again.');
        }
        throw error;
    }
}

export { oauth2Client };