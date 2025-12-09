import { writeFile } from 'fs/promises'

// Minimal GraphQL query to inspect media sizes for posts.
// We request the list of sizes with name to avoid schema guessing.
const query = `
  {
    posts(first: 5) {
      nodes {
        postId
        slug
        title
        featuredImage {
          node {
            sourceUrl
            altText
            mediaDetails {
              width
              height
              sizes {
                name
                sourceUrl
                width
                height
              }
            }
          }
        }
      }
    }
  }
`

async function main() {
  const endpoint = process.env.GRAPHQL_ENDPOINT
  if (!endpoint) {
    throw new Error('GRAPHQL_ENDPOINT env var is required')
  }

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query }),
  })

  if (!response.ok) {
    const text = await response.text()
    throw new Error(`GraphQL request failed: ${response.status} ${text}`)
  }

  const result = await response.json()

  // Save full result (data + errors) for debugging.
  const outputPath = './data/json/graphql-sample.json'

  const sample = (result?.data?.posts?.nodes || []).map((post: any) => ({
    id: post.postId,
    slug: post.slug,
    title: post.title,
    featuredImage: {
      sourceUrl: post.featuredImage?.node?.sourceUrl,
      sizes: post.featuredImage?.node?.mediaDetails?.sizes,
    },
  }))

  await writeFile(outputPath, JSON.stringify({ sample, errors: result?.errors, raw: result }, null, 2), 'utf8')
  console.log(`Saved media sizes sample to ${outputPath}`)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})

