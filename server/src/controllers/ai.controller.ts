import { Request, Response } from "express";
import { GoogleGenerativeAI } from "@google/generative-ai";
import AIReview from "../models/ai_review.model.js";
import Problem from "../models/problem.model.js";
import { ApiError } from "../utils/ApiError.js";
import { sendSuccess } from "../utils/helper.js";

// Initialize Gemini client
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY as string);

export const getAIReview = async (req: Request, res: Response) => {
  const { problemId, code, language } = req.body;
  const userId = (req.user as any)?.id;

  if (!problemId || !code) {
    throw new ApiError(400, "problemId and code are required");
  }

  // 1) Load problem for context
  const problem = await Problem.findByPk(problemId);
  if (!problem) {
    throw new ApiError(404, "Problem not found");
  }

  // 2) Build a prompt that forces the rating onto its own last line
  const prompt = `
You are a professional code reviewer. Analyze the following user‐submitted code for a programming problem titled "${problem.title}" with this description:

"${problem.description}"

Review the submitted ${language} code:

--- USER CODE START ---
${code}
--- USER CODE END ---

Provide a structured review with these clearly labeled sections:

1. **Code Correctness** – Does it solve the problem? Mention any bugs or missing logic.
2. **Code Style and Readability** – Is the code clean, well‐structured, and easy to read?
3. **Optimization** – Suggest how to improve time or memory complexity. State the current complexity.
4. **Edge Case Handling** – Does it handle all edge cases given the problem constraints?
5. **Suggestions for Improvement** – Summarize areas to improve (e.g., comments, function structure).
6. **Rating** – On its own line at the very end, output only an integer from 1 to 5 (no text around it).

IMPORTANT:  
• Do NOT output any extra text on the final line—only the integer.  
• Do NOT repeat “Rating:” or any label around that integer.  

Example last line:  
4`;
  try {
    // 3) Ask Gemini
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
    const generation = await model.generateContent(prompt);
    const fullResponse = (await generation.response.text()).trim();

    // fullResponse now looks something like:
    // “1. Code Correctness\n …\n 5. Rating\n\n4”

    // 4) Split into lines and pull off the last numeric rating
    const lines = fullResponse.split("\n").map((ln) => ln.trimEnd());
    const lastLine = lines[lines.length - 1].trim();
    const rating = /^[1-5]$/.test(lastLine) ? parseInt(lastLine) : 3;

    // 5) Drop that last line from the reviewText
    const reviewLinesWithoutRating = lines.slice(0, -2);
    const reviewText = reviewLinesWithoutRating.join("\n").trim();

    // 6) Upsert so there’s only ever one review per (userId, problemId)
    const [savedReview] = await AIReview.upsert({
      userId,
      problemId,
      reviewText,
      rating,
    });

    // 7) Return the saved instance
    return sendSuccess(res, 200, "AI review generated", savedReview);
  } catch (err: any) {
    console.error("AI Review Error:", err);
    throw new ApiError(500, "Failed to generate AI review");
  }
};