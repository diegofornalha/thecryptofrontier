// Function to generate preview URL pathnames based on content type
const getPreviewPathname = (uid, { locale, document }): string => {
  const { slug } = document;
  
  // Handle different content types with their specific URL patterns
  switch (uid) {
    // Handle blog posts/articles
    case "api::post.post": {
      if (!slug) {
        return "/blog"; // Blog listing page
      }
      return `/blog/${slug}`; // Individual post page
    }
    // Handle articles (if exists)
    case "api::article.article": {
      if (!slug) {
        return "/articles"; // Articles listing page
      }
      return `/articles/${slug}`; // Individual article page
    }
    default: {
      return "/"; // Default to homepage
    }
  }
};

export default ({ env }) => ({
  auth: {
    secret: env('ADMIN_JWT_SECRET'),
  },
  apiToken: {
    salt: env('API_TOKEN_SALT'),
  },
  transfer: {
    token: {
      salt: env('TRANSFER_TOKEN_SALT'),
    },
  },
  secrets: {
    encryptionKey: env('ENCRYPTION_KEY'),
  },
  flags: {
    nps: env.bool('FLAG_NPS', true),
    promoteEE: env.bool('FLAG_PROMOTE_EE', true),
  },
  // URL configuration for admin access
  url: env('ADMIN_URL'),
  host: env('HOST', '0.0.0.0'),
  port: env.int('PORT', 1337),
  // Configure preview mode for Next.js integration
  preview: {
    enabled: true,
    config: {
      allowedOrigins: [
        'https://thecryptofrontier.agentesintegrados.com',
        'https://ale-blog-preview.agentesintegrados.com'
      ],
      async handler(uid, { documentId, locale, status }) {
        // Fetch the complete document from Strapi
        const document = await strapi.documents(uid).findOne({ documentId });
        
        // Generate the preview pathname based on content type and document
        const pathname = getPreviewPathname(uid, { locale, document });

        // Disable preview if the pathname is not found
        if (!pathname) {
          return null;
        }

        // Use Next.js draft mode passing it a secret key and the content-type status
        const urlSearchParams = new URLSearchParams({
          url: pathname,
          secret: env('PREVIEW_SECRET', 'preview-secret-key'),
          status,
        });
        return `${env('CLIENT_URL', 'https://ale-blog-preview.agentesintegrados.com')}/api/preview?${urlSearchParams}`;
      }
    }
  }
});
