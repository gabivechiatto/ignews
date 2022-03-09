import Head from 'next/head'
import { getPrismicClient } from '../../services/prismic';
import styles from './styles.module.scss'
import Prismic from '@prismicio/client'
import { GetStaticProps } from 'next';
import { RichText } from 'prismic-dom'

type Post = {
  slug: string,
  title: string,
  excerpt: string,
  updatedAt: string
}

interface PostsProps {
  posts: Post[]
}

export default function Posts({ posts }){
    return (
      <>
        <Head>Posts | IgNews</Head>
        <main className={styles.container}>
          <div className={styles.posts}>
            {posts.map(post => (
              <a key={post.slug} href='#'>
                <time>{post.updatedAt}</time>
                <strong>{post.title}</strong>
                <p>{post.excerpt}</p>
              </a>
            ))}            
          </div>
        </main>
      </>
    );
}

export const getStaticProps: GetStaticProps = async () => {
    const prismic = getPrismicClient()

    const response = await prismic.query<any>([
      Prismic.predicates.at('document.type', 'post'),
    ], {
      fetch: ['publication.title', 'publication.content'],
      pageSize: 100,
    })

    const posts = response.results.map(post => {
      return {
        slug: post.uid,
        title: RichText.asText(post.data.title),
        excerpt: post.data.content.find(content => content.type === 'paragraph')?.text ?? '',
        updatedAt: new Date(post.last_publication_date).toLocaleDateString('pt-BR', {
          day: '2-digit',
          month: 'long',
          year: 'numeric',
        }),

      }
    })

    return{
        props: {
          posts
        }
    }
}