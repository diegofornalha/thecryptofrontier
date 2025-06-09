import React from 'react'

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
      <div style={{ padding: '16px', backgroundColor: '#fef3c7', borderRadius: '4px' }}>
        <p style={{ margin: 0, fontSize: '14px' }}>
          Por favor, adicione um slug para visualizar o preview
        </p>
      </div>
    )
  }

  const previewUrl = getPreviewUrl(_type, slug.current)
  
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ padding: '8px', borderBottom: '1px solid #e5e7eb', backgroundColor: '#f9fafb' }}>
        <p style={{ margin: 0, fontSize: '12px', color: '#6b7280' }}>
          Preview: {previewUrl}
        </p>
      </div>
      <div style={{ flex: 1, overflow: 'hidden' }}>
        <iframe
          src={previewUrl}
          style={{
            width: '100%',
            height: '100%',
            border: 'none',
          }}
          title="Preview"
        />
      </div>
    </div>
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