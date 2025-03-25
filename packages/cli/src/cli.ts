#!/usr/bin/env node

import { Command } from 'commander';
import inquirer from 'inquirer';
import ora from 'ora';
import { ApiService } from './services/api';
import { AuthService } from './services/auth';

interface Prompt {
  id: string;
  name: string;
  content: string;
  description?: string;
}

const program = new Command();
const api = ApiService.getInstance();

program
  .name('model-eval')
  .description('CLI for Model Evaluation Platform')
  .version('0.1.0');

// Login command
program
  .command('login')
  .description('Login to the platform')
  .action(async () => {
    const spinner = ora('Logging in...').start();
    try {
      await AuthService.getAuthToken();
      spinner.succeed('Successfully logged in');
    } catch (error) {
      spinner.fail('Login failed');
      console.error(error);
      process.exit(1);
    }
  });

// Logout command
program
  .command('logout')
  .description('Logout from the platform')
  .action(async () => {
    await AuthService.logout();
    console.log('Successfully logged out');
  });

// List prompts
program
  .command('prompts')
  .description('List all prompts')
  .action(async () => {
    const spinner = ora('Fetching prompts...').start();
    try {
      const prompts = await api.getPrompts() as Prompt[];
      spinner.stop();
      console.table(prompts.map((p: Prompt) => ({
        ID: p.id,
        Name: p.name,
        Description: p.description || '-'
      })));
    } catch (error) {
      spinner.fail('Failed to fetch prompts');
      console.error(error);
      process.exit(1);
    }
  });

// Create prompt
program
  .command('create-prompt')
  .description('Create a new prompt')
  .action(async () => {
    try {
      const answers = await inquirer.prompt([
        {
          type: 'input',
          name: 'name',
          message: 'Enter prompt name:',
          validate: (input: string) => input.length > 0
        },
        {
          type: 'input',
          name: 'description',
          message: 'Enter prompt description (optional):'
        },
        {
          type: 'editor',
          name: 'content',
          message: 'Enter prompt content:',
          validate: (input: string) => input.length > 0
        }
      ]);

      const spinner = ora('Creating prompt...').start();
      const prompt = await api.createPrompt(answers);
      spinner.succeed(`Created prompt with ID: ${prompt.id}`);
    } catch (error) {
      console.error('Failed to create prompt:', error);
      process.exit(1);
    }
  });

// Create evaluation
program
  .command('evaluate')
  .description('Create a new evaluation')
  .action(async () => {
    try {
      // Get prompts for selection
      const spinner = ora('Fetching prompts...').start();
      const prompts = await api.getPrompts() as Prompt[];
      spinner.stop();

      const { promptId, modelId, parameters } = await inquirer.prompt([
        {
          type: 'list',
          name: 'promptId',
          message: 'Select a prompt:',
          choices: prompts.map((p: Prompt) => ({ name: p.name, value: p.id }))
        },
        {
          type: 'input',
          name: 'modelId',
          message: 'Enter model ID:',
          validate: (input: string) => input.length > 0
        },
        {
          type: 'editor',
          name: 'parameters',
          message: 'Enter evaluation parameters (JSON):',
          default: '{}',
          validate: (input: string) => {
            try {
              JSON.parse(input);
              return true;
            } catch (e) {
              return 'Please enter valid JSON';
            }
          },
          filter: (input: string) => JSON.parse(input)
        }
      ]);

      spinner.start('Creating evaluation...');
      const evaluation = await api.createEvaluation({ promptId, modelId, parameters });
      spinner.succeed(`Created evaluation with ID: ${evaluation.id}`);
    } catch (error) {
      console.error('Failed to create evaluation:', error);
      process.exit(1);
    }
  });

// Get evaluation results
program
  .command('results <evaluationId>')
  .description('Get evaluation results')
  .action(async (evaluationId: string) => {
    const spinner = ora('Fetching results...').start();
    try {
      const results = await api.getEvaluationResults(evaluationId);
      spinner.stop();
      console.log(JSON.stringify(results, null, 2));
    } catch (error) {
      spinner.fail('Failed to fetch results');
      console.error(error);
      process.exit(1);
    }
  });

program.parse(process.argv); 