import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import { PromptModel } from '../models';
import { Prompt } from '@model-eval/shared';
import logger from '../utils/logger';

// Get all prompts for the current user
export const getPrompts = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    res.status(401);
    throw new Error('Not authorized');
  }

  logger.debug({ userId: req.user.id }, 'Fetching prompts for user');
  const prompts = await PromptModel.find({ userId: req.user.id }).sort({ createdAt: -1 });
  
  // Transform MongoDB _id to id for client consumption
  const transformedPrompts = prompts.map(prompt => {
    const promptObj = prompt.toObject();
    promptObj.id = promptObj._id.toString();
    return promptObj;
  });
  
  res.json(transformedPrompts);
});

// Get prompt by ID for the current user
export const getPromptById = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    res.status(401);
    throw new Error('Not authorized');
  }

  logger.debug({ userId: req.user.id, promptId: req.params.id }, 'Fetching prompt by ID');
  const prompt = await PromptModel.findOne({ 
    _id: req.params.id, 
    userId: req.user.id 
  });
  
  if (!prompt) {
    res.status(404);
    throw new Error('Prompt not found');
  }
  
  // Transform MongoDB _id to id for client consumption
  const promptObj = prompt.toObject();
  promptObj.id = promptObj._id.toString();
  
  res.json(promptObj);
});

// Create a new prompt for the current user
export const createPrompt = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    res.status(401);
    throw new Error('Not authorized');
  }

  const { title, content, tags } = req.body;
  
  if (!title || !content) {
    res.status(400);
    throw new Error('Title and content are required');
  }
  
  logger.info({ userId: req.user.id, title, contentLength: content.length, tags }, 'Creating new prompt');
  const prompt = await PromptModel.create({
    title,
    content,
    tags: tags || [],
    userId: req.user.id,
  });
  
  // Transform MongoDB _id to id for client consumption
  const promptObj = prompt.toObject();
  promptObj.id = promptObj._id.toString();
  
  res.status(201).json(promptObj);
});

// Update a prompt for the current user
export const updatePrompt = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    res.status(401);
    throw new Error('Not authorized');
  }

  const { title, content, tags } = req.body;
  const prompt = await PromptModel.findOne({ 
    _id: req.params.id, 
    userId: req.user.id 
  });
  
  if (!prompt) {
    res.status(404);
    throw new Error('Prompt not found');
  }
  
  prompt.title = title || prompt.title;
  prompt.content = content || prompt.content;
  prompt.tags = tags || prompt.tags;
  
  logger.info({ userId: req.user.id, promptId: req.params.id, title: prompt.title, contentLength: prompt.content.length, tags: prompt.tags }, 'Updating prompt');
  const updatedPrompt = await prompt.save();
  
  // Transform MongoDB _id to id for client consumption
  const promptObj = updatedPrompt.toObject();
  promptObj.id = promptObj._id.toString();
  
  res.json(promptObj);
});

// Delete a prompt for the current user
export const deletePrompt = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    res.status(401);
    throw new Error('Not authorized');
  }

  const prompt = await PromptModel.findOne({ 
    _id: req.params.id, 
    userId: req.user.id 
  });
  
  if (!prompt) {
    res.status(404);
    throw new Error('Prompt not found');
  }
  
  logger.info({ userId: req.user.id, promptId: req.params.id }, 'Deleting prompt');
  await PromptModel.deleteOne({ _id: req.params.id, userId: req.user.id });
  res.json({ message: 'Prompt removed' });
});
