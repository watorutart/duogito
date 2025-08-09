#!/usr/bin/env node

/* eslint-disable no-console */

import { Command } from 'commander';
import chalk from 'chalk';
import { version } from './index.js';

const program = new Command();

program
  .name('duogito')
  .description('A CLI tool to check GitHub contribution streaks and motivate daily coding')
  .version(version, '-v, --version', 'display version number');

program
  .command('check <username>')
  .description('Check GitHub contribution streak for a user')
  .option('-f, --format <type>', 'output format (text|json)', 'text')
  .action((username: string, options: { format: string }) => {
    console.log(chalk.blue(`🔍 Checking contribution streak for: ${username}`));
    console.log(chalk.yellow(`📊 Output format: ${options.format}`));
    console.log(chalk.gray('🚧 This feature is not implemented yet.'));
  });

program
  .command('config')
  .description('Manage duogito configuration')
  .action(() => {
    console.log(chalk.blue('⚙️  Configuration management'));
    console.log(chalk.gray('🚧 This feature is not implemented yet.'));
  });

// Default action when no command is provided
program.action(() => {
  console.log(chalk.blue('🎯 Welcome to Duogito!'));
  console.log(
    chalk.white('A CLI tool to check GitHub contribution streaks and motivate daily coding.')
  );
  console.log('');
  console.log(chalk.yellow('Usage:'));
  console.log('  duogito check <username>  Check contribution streak for a user');
  console.log('  duogito config           Manage configuration settings');
  console.log('  duogito --help           Show help information');
  console.log('  duogito --version        Show version number');
  console.log('');
  console.log(chalk.green('Example:'));
  console.log('  duogito check octocat');
});

// Parse command line arguments
program.parse();
