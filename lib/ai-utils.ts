import OpenAI from 'openai';

const openai = new OpenAI({
  dangerouslyAllowBrowser: true
});


export async function moderateComment(text: string): Promise<{ isFlagged: boolean; reason?: string }> {
  try {
    const response = await openai.moderations.create({
      input: text,
    });

    return {
      isFlagged: response.results[0].flagged,
      reason: Object.entries(response.results[0].categories)
        .filter(([_, value]) => value)
        .map(([key]) => key)
        .join(', '),
    };
  } catch (error) {
    console.error('Error moderating comment:', error);
    throw error;
  }
}

export async function generateAIReply(comment: string): Promise<string> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "You are a helpful YouTube content creator assistant. Generate a professional, friendly, and engaging reply to the following comment.",
        },
        {
          role: "user",
          content: `Please generate a reply to this YouTube comment: "${comment}"`,
        },
      ],
      max_tokens: 150,
    });

    return response.choices[0].message.content || "Sorry, I couldn't generate a reply.";
  } catch (error) {
    console.error('Error generating AI reply:', error);
    throw error;
  }
}

const spamIndicators = [
  /phone\s*number/i,
  /contact my financial advisor/i,
  /investment expert/i,
  /bitcoin/i,
  /crypto/i,
  /cryptocurrency/i,
  /ethereum/i,
  /blockchain/i,
  /altcoin/i,
  /free money/i,
  /easy cash/i,
  /quick investment/i,
  /guaranteed returns/i,
  /risk-free investment/i,
  /whatsapp me/i,
  /reach me on telegram/i,
  /dm me/i,
  /http[s]?:\/\/[^\s]+/i, // URL pattern
  /[!]{2,}/, // repeated characters
  /^[A-Z\s]+$/, // all caps
  /\b\w+@\w+\.\w+\b/ // email addresses
];

export function containsSpamIndicators(text: string): boolean {
  return spamIndicators.some(indicator => indicator.test(text));
}

export async function detectSpam(comments: string[]): Promise<boolean[]> {
  const results: boolean[] = [];

  for (const text of comments) {
    if (containsSpamIndicators(text)) {
      results.push(true);
    } else {
      try {
        const response = await openai.chat.completions.create({
          model: "gpt-3.5-turbo",
          messages: [
            {
              role: "system",
              content: `You are an AI model specialized in identifying spam comments and scams. Your task is to analyze comments and determine if they are spam. Look for the following detailed patterns and indicators:
              
              1. **Phone Numbers**: Comments containing phone numbers in various formats (e.g., with country codes, dashes, spaces, or dots).
              2. **References to Financial Advisors or Investment Scams**: Phrases like "contact my financial advisor," "investment expert," or any mention of guaranteed investment returns.
              3. **Cryptocurrency and High-Risk Financial Promotions**: Words or phrases such as "Bitcoin," "crypto," "cryptocurrency," "Ethereum," "blockchain," "altcoin," or mentions of get-rich-quick schemes.
              4. **Scam Phrases and Suspicious Offers**: Common spam phrases such as "free money," "easy cash," "quick investment," "guaranteed returns," or "risk-free investment."
              5. **External Contact Prompts**: Phrases urging users to contact the commenter outside of the platform, like "WhatsApp me," "reach me on Telegram," or "DM me."
              6. **Suspicious Links**: Comments that include URLs or links that may lead to phishing sites or promotional scams.
              7. **Repeated Characters and Symbols**: Comments with repeated characters (e.g., "!!!!!" or "aaaaa") that may indicate bot-like behavior or spam emphasis.
              8. **All Caps or Shouting**: Comments written in all capital letters, suggesting aggressive or spammy promotion.
              9. **Email Addresses**: Comments that include email addresses promoting financial services or personal contact.
          
              Your job is to analyze each comment for these patterns and determine if it is spam. Respond with 'Yes' if it is spam, followed by a brief explanation highlighting which patterns were identified. Respond with 'No' if it is not spam.`
            },
            {
              role: "user",
              content: `Is the following comment spam? Reply with 'Yes' or 'No' and a brief explanation.\n\nComment: "${text}"`
            }
          ],
          max_tokens: 100,
        });

        const aiReply = response.choices[0].message.content?.trim().toLowerCase() ?? '';
        results.push(aiReply.includes('yes'));
      } catch (error) {
        console.error('Error detecting spam:', error);
        results.push(false); // or handle the error as needed
      }
    }
  }

  return results;
}
