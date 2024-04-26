import type { Config } from 'jest';

const config: Config = {
  verbose: true,
  transformIgnorePatterns: ['<rootDir>/node_modules/'],
  testEnvironment: 'jsdom',
};

export default config;
