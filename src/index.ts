import fs from 'fs';
import { lexerDriver } from './lexer';
import { A, pipe } from '@mobily/ts-belt';
import { MonitorToken } from './lexerUtil';
const schemaFile = './src/min.graphql';

const schemaFileContent = fs.readFileSync(schemaFile, 'utf8').toString();
const result = lexerDriver(schemaFileContent);

pipe(result, A.tap(MonitorToken));
