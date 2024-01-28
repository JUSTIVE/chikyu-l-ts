import chalk from 'chalk';
import type { Token } from './lexer';

export const MonitorChar = (string: string) => {
  if (process.env.DEBUG === 'true') console.log(chalk.yellow(`char: ${string}`));
};

export const MonitorToken = (token: Token) => {
  if (process.env.DEBUG === 'true')
    console.log(`${chalk.green('token')}: ${chalk.magenta(token.type).padEnd(20)}\t${token.value}`);
};
