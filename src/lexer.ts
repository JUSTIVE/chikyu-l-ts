import { R } from '@mobily/ts-belt';
import { match } from 'ts-pattern';
import chalk from 'chalk';
import { MonitorChar } from './lexerUtil';

type LR<T extends string> = `L${T}` | `R${T}`;

type SingleCharToken =
  | 'EOF'
  | 'ILLEGAL'
  | 'COMMA'
  | 'COLON'
  | LR<'PAREN'>
  | LR<'BRACE'>
  | LR<'BRACKET'>
  | 'EQUALS'
  | 'BANG'
  | 'DOLLAR'
  | 'AT'
  | 'PIPE';

type AlphaNumericToken =
  | 'IDENTIFIER'
  | 'SUBSCRIPTION'
  | 'TYPE'
  | 'UNION'
  | 'EXTEND'
  | 'ENUM'
  | 'FRAGMENT'
  | 'INPUT'
  | 'INTERFACE'
  | 'QUERY'
  | 'MUTATION'
  | 'SCALAR'
  | 'SCHEMA'
  | 'DIRECTIVE'
  | 'ON';

type LiteralToken = 'INT' | 'STRING' | 'FLOAT';
export type TokenType =
  | SingleCharToken
  | AlphaNumericToken
  | LiteralToken
  | 'SPREAD'
  | 'BLOCKSTRING';

export type Token = {
  type: TokenType;
  value: string;
  line: number;
  column: number;
};

type Cursor = {
  line: number;
  offset: number;
};

const BASE_CURSOR: Cursor = { line: 1, offset: 0 };
const Token = (type: TokenType, value: string, cursor: Cursor): Token => ({
  type,
  value,
  line: cursor.line,
  column: cursor.offset,
});

function lexer(input: string, cursor: Cursor, state: Token[]): Token[] {
  if (input.length === cursor.offset) return [...state, Token('EOF', '', cursor)];

  let char = input[cursor.offset];

  if (char === '\n') {
    // MonitorChar(chalk.yellow(`char: newline`));
    return lexer(input, { line: cursor.line + 1, offset: cursor.offset + 1 }, state);
  }
  if (char === '{') {
    MonitorChar(chalk.yellow(`char: ${char}`));
    return lexer(input, { line: cursor.line, offset: cursor.offset + 1 }, [
      ...state,
      Token('LBRACE', '{', cursor),
    ]);
  }
  if (char === '}') {
    MonitorChar(chalk.yellow(`char: ${char}`));
    return lexer(input, { line: cursor.line, offset: cursor.offset + 1 }, [
      ...state,
      Token('RBRACE', '}', cursor),
    ]);
  }
  if (char === '[') {
    MonitorChar(chalk.yellow(`char: ${char}`));
    return lexer(input, { line: cursor.line, offset: cursor.offset + 1 }, [
      ...state,
      Token('LBRACKET', '[', cursor),
    ]);
  }
  if (char === ']') {
    MonitorChar(chalk.yellow(`char: ${char}`));
    return lexer(input, { line: cursor.line, offset: cursor.offset + 1 }, [
      ...state,
      Token('RBRACKET', ']', cursor),
    ]);
  }
  if (char === '(') {
    MonitorChar(chalk.yellow(`char: ${char}`));
    return lexer(input, { line: cursor.line, offset: cursor.offset + 1 }, [
      ...state,
      Token('LPAREN', '(', cursor),
    ]);
  }
  if (char === ')') {
    MonitorChar(chalk.yellow(`char: ${char}`));
    return lexer(input, { line: cursor.line, offset: cursor.offset + 1 }, [
      ...state,
      Token('RPAREN', ')', cursor),
    ]);
  }
  if (char === ',') {
    MonitorChar(chalk.yellow(`char: ${char}`));
    return lexer(input, { line: cursor.line, offset: cursor.offset + 1 }, [
      ...state,
      Token('COMMA', ',', cursor),
    ]);
  }
  if (char === ':') {
    MonitorChar(chalk.yellow(`char: ${char}`));
    return lexer(input, { line: cursor.line, offset: cursor.offset + 1 }, [
      ...state,
      Token('COLON', ':', cursor),
    ]);
  }
  if (char === '=') {
    MonitorChar(chalk.yellow(`char: ${char}`));
    return lexer(input, { line: cursor.line, offset: cursor.offset + 1 }, [
      ...state,
      Token('EQUALS', '=', cursor),
    ]);
  }
  if (char === '!') {
    MonitorChar(chalk.yellow(`char: ${char}`));
    return lexer(input, { line: cursor.line, offset: cursor.offset + 1 }, [
      ...state,
      Token('BANG', '!', cursor),
    ]);
  }
  if (char === '$') {
    MonitorChar(chalk.yellow(`char: ${char}`));
    return lexer(input, { line: cursor.line, offset: cursor.offset + 1 }, [
      ...state,
      Token('DOLLAR', '$', cursor),
    ]);
  }
  if (char === '|') {
    MonitorChar(chalk.yellow(`char: ${char}`));
    return lexer(input, { line: cursor.line, offset: cursor.offset + 1 }, [
      ...state,
      Token('PIPE', '|', cursor),
    ]);
  }
  if (char === ' ') {
    // MonitorChar(chalk.yellow(`char: ${char}`));
    return lexer(input, { line: cursor.line, offset: cursor.offset + 1 }, state);
  }
  if (char === '"' && input[cursor.offset + 1] === '"' && input[cursor.offset + 2] === '"') {
    MonitorChar(chalk.yellow(`char: ${char}`));
    return lexer(input, { line: cursor.line, offset: cursor.offset + 3 }, [
      ...state,
      Token('BLOCKSTRING', '"""', cursor),
    ]);
  }

  if (char.match(/[a-zA-Z0-9_@ㄱ-ㅎㅏ-ㅣ가-힣\/\-'?`\."#]/)) {
    let value = '';
    let char = input[cursor.offset];

    while (cursor.offset < input.length && char.match(/[a-zA-Z0-9_@.!ㄱ-ㅎㅏ-ㅣ가-힣\/\-'?`"#]/)) {
      value += char;
      char = input[++cursor.offset];
    }

    const tokenType = match(value)
      .returnType<TokenType>()
      .with('type', () => 'TYPE')
      .with('interface', () => 'INTERFACE')
      .with('enum', () => 'ENUM')
      .with('union', () => 'UNION')
      .with('input', () => 'INPUT')
      .with('scalar', () => 'SCALAR')
      .with('@extends', () => 'EXTEND')
      .with('directive', () => 'DIRECTIVE')
      .with('on', () => 'ON')
      .otherwise(() => 'IDENTIFIER');

    MonitorChar(chalk.green(`value: \"${value}\", length : ${value.length}`));
    // tokens.push({ type, value, line: currentLine });
    return lexer(input, { line: cursor.line, offset: cursor.offset }, [
      ...state,
      Token(tokenType, value, cursor),
    ]);
  } else {
    throw new Error(
      `Unexpected character ${chalk.red(char)} at line ${cursor.line} column ${cursor.offset}`,
    );
  }
}

export const lexerDriver = (input: string) => lexer(input, BASE_CURSOR, []);
