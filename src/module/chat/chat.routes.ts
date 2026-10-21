
import { Router } from "express";

import {
  createChat,
  getChats,
  getChatById,
  updateChat,
  deleteChat,
} from "./chat.controller.js";

const chatRouter = Router();

chatRouter.post("/", createChat);
chatRouter.get("/", getChats);
chatRouter.get("/:id", getChatById);
 
chatRouter.put("/:id", updateChat);
chatRouter.delete("/:id", deleteChat);
export default chatRouter;
