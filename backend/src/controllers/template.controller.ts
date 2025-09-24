import { Request, Response } from "express";
import anthropic from "../config/anthropic";
import { BASE_PROMPT, getSystemPrompt } from "../prompts/basePrompts";
import { basePrompt as reactBasePrompt } from "../prompts/reactPrompts";
import { basePrompt as nodeBasePrompt } from "../prompts/nodePrompts";
import { TextBlock } from "@anthropic-ai/sdk/resources";
import loggers from "../logs/loggers";

export const handleTemplate = async (req: Request, res: Response) => {
  const prompt = req.body.prompt;

  // Validate the input prompt empty or missing
  if (!prompt || typeof prompt !== "string" || prompt.trim().length === 0) {
    return res.status(400).json({ error: "Invalid or empty prompt." });
  }

  try {
    const response = await anthropic.messages.create({
      model: "claude-3-7-sonnet-20250219",
      max_tokens: 100,
      temperature: 0,
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
      system:
        "Return either node or react based on what do yo think this project should be. If you don't see 'backend' or 'node' keyword on the prompt return react. Only return a single response word either 'node' or 'react'. Do not return anything extra",
    });

    const answer = (response.content[0] as TextBlock)?.text
      .trim()
      .toLowerCase();

    if (answer == "react") {
      res.json({
        prompts: [
          BASE_PROMPT,
          `Here is an artifact that contains all files of the project visible to you.\nConsider the contents of ALL files in the project.\n\n${reactBasePrompt}\n\nHere is a list of files that exist on the file system but are not being shown to you:\n\n  - .gitignore\n  - package-lock.json\n`,
        ],
        uiPrompts: [reactBasePrompt],
      });
      return;
    } else if (answer == "node") {
      res.json({
        prompts: [
          `Here is an artifact that contains all files of the project visible to you.\nConsider the contents of ALL files in the project.\n\n${nodeBasePrompt}\n\nHere is a list of files that exist on the file system but are not being shown to you:\n\n  - .gitignore\n  - package-lock.json\n`,
        ],
        uiPrompts: [nodeBasePrompt],
      });
    } else {
      res.status(403).json({ message: "you cannot access this..." });
    }
  } catch (error: any) {
    console.error("Claude API error on /Template end point:: ", error.message);
    return res.status(500).json({
      error: error.message || "Internal server error.",
    });
  }
};
