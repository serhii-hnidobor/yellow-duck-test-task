import { build } from 'esbuild';
import path from 'node:path';
import { esbuildDecorators } from '@anatine/esbuild-decorators';

const cwd = process.cwd();
const outfile = path.resolve(cwd, 'dist/index.js');
const tsconfig = path.resolve(cwd, 'tsconfig.json');

const entryPoints = [path.resolve(cwd, 'src/main.ts')];
const config = {
  platform: 'node',
  target: ['node18', 'es2021'],
  format: 'cjs',
  bundle: true,
  keepNames: true,
  plugins: [
    esbuildDecorators({
      tsconfig,
      cwd,
    }),
  ],
  tsconfig,
  entryPoints,
  outfile,
  minify: true,
  external: [
    '@nestjs/microservice',
    '@nestjs/websockets/socket-module',
    '@nestjs/microservices/microservices-module',
    '@nestjs/microservices',
    '@nestjs/mongoose',
    '@nestjs/sequelize/dist/common/sequelize.utils',
    '@nestjs/sequelize',
    '@mikro-orm/core',
    'canvas',
  ],
};

await build(config);
