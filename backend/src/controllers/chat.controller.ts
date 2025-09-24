import { Request, Response } from "express";
import anthropic from "../config/anthropic";
import { BASE_PROMPT, getSystemPrompt } from "../prompts/basePrompts";
import { TextBlock } from "@anthropic-ai/sdk/resources";
import loggers from "../logs/loggers";

export const handleChat = async (req: Request, res: Response) => {
  // Extract ChatBot messages from the request body
  const messages = req.body.messages;

  try {
    const response = await anthropic.messages.create({
      messages: messages,
      model: "claude-3-7-sonnet-20250219",
      max_tokens: 12000,
      system: getSystemPrompt(),
    });

    res.json({
      response: (response.content[0] as TextBlock),
    });
    //return;
  } catch (error:unknown) {
    //loggers.error("Error interacting with the Claude API:: ", error);
    return res.status(500).json({ error: "Internal server error." });
  }

};
