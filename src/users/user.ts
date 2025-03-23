import bodyParser from "body-parser";
import express from "express";
import { BASE_USER_PORT } from "../config";

export type SendMessageBody = {
  message: string;
  destinationUserId: number;
};

export async function user(userId: number) {
  const _user = express();

  // Use express built-in middleware for JSON parsing
  _user.use(express.json());

  // Implement the /status route
  _user.get("/status", (req, res) => {
    res.send("live");
  });

  // Start the server on the port determined by BASE_USER_PORT + userId
  const server = _user.listen(BASE_USER_PORT + userId, () => {
    console.log(
      `User ${userId} is listening on port ${BASE_USER_PORT + userId}`
    );
  });

  return server;
}

