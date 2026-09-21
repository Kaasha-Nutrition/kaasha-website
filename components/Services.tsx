"use client";

import { useState } from "react";
import Image from "next/image";
import Reveal from "./Reveal";
import { ServiceIcon } from "./icons";
import { SERVICES, CAT_LABEL, type ServiceCategory } from "@/lib/data";
import { useBooking } from "@/lib/booking-context";

const FILTERS: { key: "all" | ServiceCategory; label: string }[] = [
  { key: "all", label: "All Services" },
  { key: "sports", label: "Sports & Performance" },
  { key: "clinical", label: "Clinical Nutrition" },
  { key: "lifestyle", label: "Lifestyle & Personal" },
  { key: "soon", label: "Coming Soon" }
];

export default function Services() {
  const [filter, setFilter] = useState<"all" | ServiceCategory>("all");
  const { presetService } = useBooking();

  const visible = SERVICES.filter((s) => filter === "all" || s.cat === filter);

  return (
    <section id="services">
      <div className="wrap">
        <Reveal className="sec-head">
          <span className="eyebrow">Services</span>
          <h2>Eleven ways to work together — one consultation at a time.</h2>
          <p>
            Every session is one-on-one with Vallari at her Porvorim practice, priced individually with no
            bundled packages. Please give at least 24 hours&apos; notice to reschedule or cancel.
          </p>
        </Reveal>

        <div className="filter-row" id="svcFilters">
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

        <div className="svc-grid" id="svcGrid">
          {visible.map((s) => {
            const soon = s.cat === "soon";
            return (
              <div className={`svc-card cat-${s.cat}`} key={s.name}>
                <div className="svc-thumb">
                  <Image src={`/images/${s.img}`} alt={s.name} fill sizes="(max-width: 640px) 100vw, (max-width: 960px) 50vw, 33vw" style={{ objectFit: "cover" }} loading="lazy" />
                  {soon && <span className="svc-thumb-badge">Coming soon</span>}
                </div>
                <div className="svc-accent" />
                <div className="svc-body">
                  <div className="svc-top">
                    <span className="svc-icon">
                      <ServiceIcon name={s.icon} />
                    </span>
                  </div>
                  <span className="svc-cat">{CAT_LABEL[s.cat]}</span>
                  <h3>{s.name}</h3>
                  {!soon && (
                    <div className="svc-meta">
                      <span>
                        <b>{s.duration}</b>
                      </span>
                    </div>
                  )}
                  <p className="svc-desc">{s.desc}</p>
                  <div className="svc-foot">
                    {soon ? (
                      <>
                        <span className="svc-soon">Coming soon</span>
                        <button className="btn btn-ghost btn-sm" disabled>
                          Book Now
                        </button>
                      </>
                    ) : (
                      <>
                        <span className="svc-price">₹{s.price!.toLocaleString("en-IN")}</span>
                        <button
                          className="btn btn-primary btn-sm"
                          onClick={() => presetService(s.name)}
                        >
                          Book Now
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
