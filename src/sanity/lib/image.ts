import createImageUrlBuilder from '@sanity/image-url'
import type { Image } from 'sanity'

import { dataset, projectId } from '../env'

const imageBuilder = createImageUrlBuilder({
  projectId: projectId || '',
  dataset: dataset || '',
})

export const urlForImage = (source: Image | undefined) => {
  if (!source || !source.asset?._ref) {
    return {
      url: () => '',
      width: () => 0,
      height: () => 0,
      format: () => ''
    }
  }
  
  return imageBuilder.image(source)
} 