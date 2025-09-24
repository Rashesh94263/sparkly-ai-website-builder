import dotenv from "dotenv";

// Init the evironment varibles from the .env file
dotenv.config();

// Ensure that the CLAUDE_API_KEY is set
if (!process.env.CLAUDE_API_KEY) {
  throw new Error(
    "CLAUDE_API_KEY is not defined in the environment variables."
  );
}

export default dotenv;
