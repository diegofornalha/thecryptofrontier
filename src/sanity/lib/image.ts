import createImageUrlBuilder from '@sanity/image-url'
import type { Image } from 'sanity'

import { dataset, projectId } from '../env'

const imageBuilder = createImageUrlBuilder({
  projectId: projectId || '',
  dataset: dataset || '',
})

export const urlForImage = (source: Image | undefined) => {
  // Verificar se source existe
  if (!source) {
    return null;
  }
  
  // Verificar se tem asset (pode ser _ref ou objeto expandido)
  if (!source.asset) {
    return null;
  }
  
  // Se asset é um objeto expandido com _id, criar a referência
  if (source.asset._id && !source.asset._ref) {
    source.asset._ref = source.asset._id;
  }
  
  // Se ainda não tem _ref, retornar null
  if (!source.asset._ref) {
    return null;
  }
  
  return imageBuilder.image(source)
} 