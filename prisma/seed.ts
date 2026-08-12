import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // 1. Create a main author user
  const author = await prisma.user.upsert({
    where: { email: 'admin@codeblog.pro' },
    update: {},
    create: {
      email: 'admin@codeblog.pro',
      name: 'CodeBlog Author',
      role: 'ADMIN',
      image: 'https://avatars.githubusercontent.com/u/1024025?v=4', // random avatar
    },
  })

  // 2. Create Categories
  const categoriesData = [
    { name: 'React', slug: 'react', description: 'Everything about React and its ecosystem' },
    { name: 'Node.js', slug: 'nodejs', description: 'Backend development with Node.js' },
    { name: 'Architecture', slug: 'architecture', description: 'Software design and system architecture' },
    { name: 'CSS', slug: 'css', description: 'Modern styling techniques' }
  ]

  const categories: any[] = []
  for (const cat of categoriesData) {
    const createdCat = await prisma.category.upsert({
      where: { slug: cat.slug },
      update: {},
      create: cat,
    })
    categories.push(createdCat)
  }

  // Helper to find category id by slug
  const getCatId = (slug: string) => categories.find(c => c.slug === slug)?.id

  // 3. Create 6 high-quality Posts
  const postsData = [
    {
      title: 'Mastering React Server Components in Next.js 14',
      slug: 'mastering-react-server-components-nextjs-14',
      excerpt: 'A deep dive into how Server Components change the way we build React applications, focusing on performance and data fetching.',
      content: '# Mastering React Server Components\n\nReact Server Components (RSC) represent a fundamental shift in how we architect React applications. By running on the server and emitting a serialized representation of the UI, they allow us to keep heavy dependencies away from the client bundle.\n\n## Why RSC?\n\n1. **Zero Bundle Size:** Components rendered exclusively on the server do not add to the JavaScript bundle size downloaded by the client.\n2. **Direct Backend Access:** You can securely access your database directly from a React component without creating an intermediary API route.\n\n```tsx\n// page.tsx\nimport { db } from "@/lib/db"\n\nexport default async function Page() {\n  const data = await db.query.users.findMany();\n  return <div>{JSON.stringify(data)}</div>\n}\n```\n\nThis paradigm simplifies data fetching and dramatically improves initial page load times.',
      coverImage: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&q=80&w=2070&ixlib=rb-4.0.3',
      authorId: author.id,
      categoryId: getCatId('react'),
      status: 'PUBLISHED',
      featured: true,
      readingTime: 6,
    },
    {
      title: 'Building Scalable APIs with Node.js and TypeScript',
      slug: 'building-scalable-apis-nodejs-typescript',
      excerpt: 'Learn the best practices for structuring Node.js applications for scale, maintainability, and developer experience.',
      content: '# Building Scalable APIs\n\nNode.js remains a powerhouse for API development. When paired with TypeScript, it provides a robust environment for building enterprise-grade backend systems.\n\n## Structure Matters\n\nA common mistake in Node.js development is putting all business logic inside route handlers. A layered architecture is crucial for testability and scaling.\n\n- **Controllers:** Handle HTTP requests and responses.\n- **Services:** Contain the core business logic.\n- **Data Access:** Interact with the database (e.g., using Prisma).',
      coverImage: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&q=80&w=2070&ixlib=rb-4.0.3',
      authorId: author.id,
      categoryId: getCatId('nodejs'),
      status: 'PUBLISHED',
      featured: false,
      readingTime: 8,
    },
    {
      title: 'Event-Driven Architecture: A Practical Guide',
      slug: 'event-driven-architecture-practical-guide',
      excerpt: 'Understand how decoupling your microservices with event-driven patterns can make your system more resilient.',
      content: '# Event-Driven Architecture\n\nIn modern distributed systems, synchronous communication between services can lead to tight coupling and cascading failures. Event-Driven Architecture (EDA) solves this by communicating via asynchronous events.',
      coverImage: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80&w=2072&ixlib=rb-4.0.3',
      authorId: author.id,
      categoryId: getCatId('architecture'),
      status: 'PUBLISHED',
      featured: true,
      readingTime: 12,
    },
    {
      title: 'Advanced Tailwind CSS Techniques for UI Designers',
      slug: 'advanced-tailwind-css-techniques',
      excerpt: 'Take your Tailwind CSS skills to the next level with custom plugins, arbitrary values, and complex responsive layouts.',
      content: '# Advanced Tailwind CSS\n\nTailwind is more than just utility classes. By diving into the `tailwind.config.ts`, you can create a highly customized design system tailored to your application needs.',
      coverImage: 'https://images.unsplash.com/photo-1507721999472-8ed4421c4af2?auto=format&fit=crop&q=80&w=2070&ixlib=rb-4.0.3',
      authorId: author.id,
      categoryId: getCatId('css'),
      status: 'PUBLISHED',
      featured: false,
      readingTime: 5,
    },
    {
      title: 'Understanding PostgreSQL Indexing Strategies',
      slug: 'understanding-postgresql-indexing-strategies',
      excerpt: 'Optimize your database queries by mastering B-Trees, Hash indexes, and multi-column indexing in PostgreSQL.',
      content: '# PostgreSQL Indexing\n\nAn index makes querying a database much faster, but choosing the right type of index is an art. B-Tree is the default, but GIN and GiST indexes are incredibly powerful for specific data types.',
      coverImage: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&q=80&w=2034&ixlib=rb-4.0.3',
      authorId: author.id,
      categoryId: getCatId('architecture'),
      status: 'PUBLISHED',
      featured: false,
      readingTime: 10,
    },
    {
      title: 'React Suspense and Data Fetching in 2024',
      slug: 'react-suspense-data-fetching-2024',
      excerpt: 'Explore how React Suspense integrates seamlessly with Next.js App Router for elegant loading states and error handling.',
      content: '# React Suspense\n\nReact Suspense allows you to declaratively specify a loading state while your component is waiting for data to resolve. With Next.js 14, this is built directly into the routing paradigm via `loading.tsx`.',
      coverImage: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?auto=format&fit=crop&q=80&w=2070&ixlib=rb-4.0.3',
      authorId: author.id,
      categoryId: getCatId('react'),
      status: 'PUBLISHED',
      featured: false,
      readingTime: 7,
    }
  ]

  for (const post of postsData) {
    // @ts-ignore
    await prisma.post.upsert({
      where: { slug: post.slug },
      update: post as any,
      create: post as any,
    })
  }

  console.log('Seeding completed successfully.')
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
