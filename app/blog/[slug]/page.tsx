import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import WhatsAppFloat from "@/components/WhatsAppFloat";
import Reveal from "@/components/Reveal";
import { ArrowUpRightIcon } from "@/components/icons";
import { POSTS, CAT_CLASS } from "@/lib/data";
import { BLOG_CONTENT } from "@/lib/blog-content";

export function generateStaticParams() {
  return POSTS.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const post = POSTS.find((p) => p.slug === slug);
  if (!post) return {};
  const blocks = BLOG_CONTENT[post.slug] ?? [];
  const firstPara = blocks.find((b) => b.type === "p" || b.type === "quote");
  const description = firstPara && "text" in firstPara ? firstPara.text.slice(0, 155) : undefined;
  return {
    title: `${post.t} — Kaasha by Vallari Shah`,
    description
  };
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const index = POSTS.findIndex((p) => p.slug === slug);
  if (index === -1) notFound();
  const post = POSTS[index];
  const blocks = BLOG_CONTENT[post.slug];
  if (!blocks) notFound();

  const related = POSTS.filter((p) => p.slug !== post.slug && p.cat === post.cat).slice(0, 3);
  const fallback = POSTS.filter((p) => p.slug !== post.slug && !related.includes(p)).slice(0, 3 - related.length);
  const more = [...related, ...fallback];

  return (
    <>
      <Header />
      <main id="top">
        <article className="post-article">
          <div className="wrap post-article-head">
            <Reveal as="div">
              <Link href="/#blog" className="post-back">
                ← Back to Blog
              </Link>
              <span className={`post-cat ${CAT_CLASS[post.cat]}`}>{post.cat}</span>
              <h1>{post.t}</h1>
              <div className="post-byline">
                <Image src="/images/vallari-headshot.jpg" alt="Vallari Shah" width={40} height={40} className="post-byline-avatar" />
                <div>
                  <span className="post-byline-name">Vallari Shah</span>
                  <span className="post-byline-meta">
                    {post.date} · {post.read} read
                  </span>
                </div>
              </div>
            </Reveal>
          </div>

          <Reveal as="div" className="post-article-media">
            <Image
              src={`/images/${post.img}`}
              alt={post.t}
              fill
              sizes="(max-width: 900px) 100vw, 900px"
              style={{ objectFit: "cover" }}
              priority
            />
          </Reveal>

          <Reveal as="div" className="wrap post-article-body">
            {blocks.map((b, i) => {
              if (b.type === "p") return <p key={i}>{b.text}</p>;
              if (b.type === "h3") return <h3 key={i}>{b.text}</h3>;
              if (b.type === "quote") return <blockquote key={i}>{b.text}</blockquote>;
              if (b.type === "ul")
                return (
                  <ul key={i}>
                    {b.items.map((item, j) => (
                      <li key={j}>{item}</li>
                    ))}
                  </ul>
                );
              return (
                <ol key={i}>
                  {b.items.map((item, j) => (
                    <li key={j}>{item}</li>
                  ))}
                </ol>
              );
            })}
          </Reveal>

          <div className="wrap post-article-cta">
            <Reveal as="div" className="post-cta-band">
              <div>
                <span className="eyebrow">Have a question about this?</span>
                <h3>Book a one-on-one consultation with Vallari.</h3>
              </div>
              <Link className="btn btn-primary" href="/#contact">
                Book a Consultation
              </Link>
            </Reveal>
          </div>

          {more.length > 0 && (
            <div className="wrap post-related">
              <h3>More from the blog</h3>
              <div className="blog-grid">
                {more.map((p) => (
                  <Link key={p.slug} className="post-card" href={`/blog/${p.slug}`}>
                    <div className="post-thumb">
                      <Image
                        src={`/images/${p.img}`}
                        alt={p.t}
                        fill
                        sizes="(max-width: 480px) 100vw, (max-width: 1040px) 33vw, 25vw"
                        style={{ objectFit: "cover" }}
                        loading="lazy"
                      />
                      <span className="arrow">
                        <ArrowUpRightIcon />
                      </span>
                    </div>
                    <div className="post-body">
                      <span className={`post-cat ${CAT_CLASS[p.cat]}`}>{p.cat}</span>
                      <span className="post-title">{p.t}</span>
                      <span className="post-meta">
                        <span>{p.date}</span>
                        <span>·</span>
                        <span>{p.read} read</span>
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </article>
      </main>
      <Footer />
      <WhatsAppFloat />
    </>
  );
}
