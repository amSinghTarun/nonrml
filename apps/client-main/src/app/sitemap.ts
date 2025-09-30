// app/sitemap.ts
import { MetadataRoute } from 'next';
import { serverClient } from "@/app/_trpc/serverClient";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://www.nonrml.co.in';
  const trpcClient = await serverClient();
  
  // 1. Static Routes - all public content pages
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date().toISOString(),
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: new Date().toISOString(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/contact-us`,
      lastModified: new Date().toISOString(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/shipping`,
      lastModified: new Date().toISOString(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/returns`,
      lastModified: new Date().toISOString(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/policies`,
      lastModified: new Date().toISOString(), 
      changeFrequency: 'yearly',
      priority: 0.5,
    },
    {
      url: `${baseUrl}/track-order`,
      lastModified: new Date().toISOString(),
      changeFrequency: 'monthly',
      priority: 0.6,
    },
  ];
  
  // 2. Product Pages - all public product pages
  const productsResponse = await trpcClient.viewer.product.getProducts({});
  const productRoutes = productsResponse.data.map((product) => ({
    url: `${baseUrl}/products/${product.sku}`,
    lastModified: new Date(product.updatedAt).toISOString(),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }));
  
  // 3. Collection Pages - all public collection pages
  const collectionsResponse = await trpcClient.viewer.productCategories.getProductCategories({});
  const collectionRoutes = collectionsResponse.data.categoryNameArray.map((collection) => ({
    url: `${baseUrl}/collections/${collection}`,
    lastModified: new Date().toISOString(),
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }));
  
  // Collections index page
  staticRoutes.push({
    url: `${baseUrl}/collections`,
    lastModified: new Date().toISOString(),
    changeFrequency: 'daily' as const,
    priority: 0.9,
  });
  
  // Combine all routes
  return [
    ...staticRoutes,
    ...productRoutes,
    ...collectionRoutes,
  ];
}