export const apiVersion =
  process.env.NEXT_PUBLIC_SANITY_API_VERSION || '2023-05-03'

export const dataset = 
  process.env.NEXT_PUBLIC_SANITY_DATASET || 'production'

export const projectId = 
  process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || 'brby2yrg'

function assertValue<T>(v: T | undefined, errorMessage: string): T {
  if (v === undefined) {
    throw new Error(errorMessage)
  }

  return v
}
