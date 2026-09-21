"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import Reveal from "./Reveal";
import { ArrowUpRightIcon } from "./icons";
import { POSTS, CAT_CLASS, type PostCategory } from "@/lib/data";

const FILTERS: { key: "all" | PostCategory; label: string }[] = [
  { key: "all", label: "All Posts" },
  { key: "Healthy Tips", label: "Healthy Tips" },
  { key: "Living Well", label: "Living Well" },
  { key: "Recipes", label: "Recipes" }
];

export default function Blog() {
  const [filter, setFilter] = useState<"all" | PostCategory>("all");
  const visible = POSTS.filter((p) => filter === "all" || p.cat === filter);

  return (
    <section id="blog" className="blog">
      <div className="wrap">
        <Reveal className="sec-head">
          <span className="eyebrow">Blog &amp; Recipes</span>
          <h2>Tips, tricks and personal stories from Vallari&apos;s own kitchen.</h2>
          <p>Twenty articles migrated from the original Kaasha blog, filterable by category.</p>
        </Reveal>

        <div className="filter-row" id="blogFilters">
          {FILTERS.map((f) => (
            <button
              key={f.key}
              className={`filter-btn${filter === f.key ? " active" : ""}`}
              onClick={() => setFilter(f.key)}
            >
              {f.label}
            </button>
          ))}
        </div>

        <div className="blog-grid" id="blogGrid">
          {visible.map((p) => (
            <Link key={p.t} className={`post-card${p.featured ? " featured" : ""}`} href={`/blog/${p.slug}`}>
              <div className="post-thumb">
                <Image
                  src={`/images/${p.img}`}
                  alt={p.t}
                  fill
                  sizes={p.featured ? "(max-width: 760px) 100vw, 50vw" : "(max-width: 480px) 100vw, (max-width: 1040px) 33vw, 25vw"}
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
    </section>
  );
}
