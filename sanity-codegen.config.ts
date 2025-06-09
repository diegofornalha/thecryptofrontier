import {SanityCodegenConfig} from 'sanity-codegen'

const config: SanityCodegenConfig = {
  schemaPath: './sanity.config.ts',
  outputPath: './src/types/sanity.generated.ts',
  babelOptions: {
    // Required for TypeScript files
    presets: [
      ['@babel/preset-env', {targets: {node: 'current'}}],
      '@babel/preset-typescript',
    ],
    plugins: [
      ['@babel/plugin-proposal-decorators', {legacy: true}],
      '@babel/plugin-proposal-class-properties',
    ]
  },
  // Generate schema types from your Sanity schemas
  generateSchemaTypes: true,
}

export default config