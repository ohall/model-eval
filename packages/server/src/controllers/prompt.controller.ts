import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import { PromptModel } from '../models';
import { Prompt } from '@model-eval/shared';
import logger from '../utils/logger';

// Get all prompts
export const getPrompts = asyncHandler(async (req: Request, res: Response) => {
  const prompts = await PromptModel.find().sort({ createdAt: -1 });
  
  // Transform MongoDB _id to id for client consumption
  const transformedPrompts = prompts.map(prompt => {
    const promptObj = prompt.toObject();
    promptObj.id = promptObj._id.toString();
    return promptObj;
  });
  
  res.json(transformedPrompts);
});

// Get prompt by ID
export const getPromptById = asyncHandler(async (req: Request, res: Response) => {
  const prompt = await PromptModel.findById(req.params.id);
  
  if (!prompt) {
    res.status(404);
    throw new Error('Prompt not found');
  }
  
  // Transform MongoDB _id to id for client consumption
  const promptObj = prompt.toObject();
  promptObj.id = promptObj._id.toString();
  
  res.json(promptObj);
});

// Create a new prompt
export const createPrompt = asyncHandler(async (req: Request, res: Response) => {
  const { title, content, tags } = req.body;
  
  if (!title || !content) {
    res.status(400);
    throw new Error('Title and content are required');
  }
  
  const prompt = await PromptModel.create({
    title,
    content,
    tags: tags || [],
  });
  
  // Transform MongoDB _id to id for client consumption
  const promptObj = prompt.toObject();
  promptObj.id = promptObj._id.toString();
  
  res.status(201).json(promptObj);
});

// Update a prompt
export const updatePrompt = asyncHandler(async (req: Request, res: Response) => {
  const { title, content, tags } = req.body;
  const prompt = await PromptModel.findById(req.params.id);
  
  if (!prompt) {
    res.status(404);
    throw new Error('Prompt not found');
  }
  
  prompt.title = title || prompt.title;
  prompt.content = content || prompt.content;
  prompt.tags = tags || prompt.tags;
  
  const updatedPrompt = await prompt.save();
  
  // Transform MongoDB _id to id for client consumption
  const promptObj = updatedPrompt.toObject();
  promptObj.id = promptObj._id.toString();
  
  res.json(promptObj);
});

// Delete a prompt
export const deletePrompt = asyncHandler(async (req: Request, res: Response) => {
  const prompt = await PromptModel.findById(req.params.id);
  
  if (!prompt) {
    res.status(404);
    throw new Error('Prompt not found');
  }
  
  await PromptModel.deleteOne({ _id: req.params.id });
  res.json({ message: 'Prompt removed' });
});
