import { type SchemaTypeDefinition } from 'sanity'
import post from './documents/post'
import author from './documents/author'
import siteSettings from './documents/siteSettings'
import codeBlock from './objects/codeBlock'

export const schema: { types: SchemaTypeDefinition[] } = {
  types: [
    post,
    author,
    siteSettings,
    codeBlock
  ],
}
