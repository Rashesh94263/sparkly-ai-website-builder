import Anthropic from "@anthropic-ai/sdk";

// Init the Anthropic API Key from the Anthropic dashboard
const anthropic = new Anthropic({
  apiKey: process.env.CLAUDE_API_KEY!,
});

export default anthropic;
