import axios from "axios";

export const verifySession = async () => {
  try {
    const response = await axios.get("http://localhost:3000/api/session", {
      withCredentials: true, // important to send the httpOnly JWT cookie
      headers: { "Content-Type": "application/json" },
    });
    return response.data.user; // returns { userId: "anonymous", iat, exp }
  } catch (err) {
    console.error("Session invalid or expired", err);
    return null;
  }
};
