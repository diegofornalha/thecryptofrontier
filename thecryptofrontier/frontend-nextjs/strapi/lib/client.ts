// Client para draft mode e preview
export const strapiClient = {
  async getPreviewData(token: string) {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_STRAPI_URL}/api/preview`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (!response.ok) {
        throw new Error('Preview data not found');
      }
      
      return response.json();
    } catch (error) {
      console.error('Error fetching preview data:', error);
      return null;
    }
  },

  async validatePreviewToken(token: string) {
    return token === process.env.PREVIEW_SECRET;
  }
};

export default strapiClient;
export { strapiClient as client };
