import React from 'react'
import {Card, Flex, Text, Box} from '@sanity/ui'

interface PostPreviewProps {
  document: {
    displayed: {
      slug?: {
        current?: string
      }
      _type?: string
    }
  }
}

export function PostPreview(props: PostPreviewProps) {
  const {document} = props
  const {slug, _type} = document.displayed || {}
  
  if (!slug?.current) {
    return (
      <Card padding={4} tone="caution">
        <Text size={2}>
          Por favor, adicione um slug para visualizar o preview
        </Text>
      </Card>
    )
  }

  const previewUrl = getPreviewUrl(_type, slug.current)
  
  return (
    <Flex direction="column" height="fill">
      <Card padding={2} borderBottom>
        <Text size={1} muted>
          Preview: {previewUrl}
        </Text>
      </Card>
      <Box flex={1} overflow="hidden">
        <iframe
          src={previewUrl}
          style={{
            width: '100%',
            height: '100%',
            border: 'none',
          }}
          title="Preview"
        />
      </Box>
    </Flex>
  )
}

function getPreviewUrl(type: string | undefined, slug: string): string {
  const baseUrl = process.env.SANITY_STUDIO_PREVIEW_URL || 'http://localhost:3000'
  
  switch (type) {
    case 'post':
      return `${baseUrl}/post/${slug}?preview=true`
    case 'page':
      return slug === 'home' ? `${baseUrl}?preview=true` : `${baseUrl}/${slug}?preview=true`
    default:
      return baseUrl
  }
}