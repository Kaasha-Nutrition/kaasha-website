"use client";

import Image from "next/image";
import Reveal from "./Reveal";
import { useBooking } from "@/lib/booking-context";

const DISCIPLINES = ["Triathlon", "Marathon running", "Rowing", "Rugby", "Swimming", "Sailing", "Basketball", "Endurance training"];

export default function Sports() {
  const { presetService } = useBooking();

  return (
    <section id="sports" className="sports">
      <div className="sports-bg">
        <Image src="/images/topic-runner.jpg" alt="Runner training outdoors near the Golden Gate Bridge" fill sizes="100vw" style={{ objectFit: "cover" }} />
      </div>
      <div className="wrap">
        <Reveal className="sports-content">
          <span className="eyebrow">A major pillar of Kaasha</span>
          <h2>
            Fuel training.
            <br />
            Fuel recovery.
            <br />
            Fuel race day.
          </h2>
          <p style={{ marginTop: 18, fontSize: 16 }}>
            Today&apos;s athletes need to address every area of sports science to maximise training and
            competition performance. Vallari builds plans around bulk-up and body-fat goals, training-day
            diets, hydration strategy and fatigue reduction — with dedicated competition-prep nutrition
            for:
          </p>
          <ul className="sports-list">
            {DISCIPLINES.map((d) => (
              <li key={d}>{d}</li>
            ))}
          </ul>
          <div className="sports-cards">
            <div className="sports-card">
              <div className="name">Sports Nutrition</div>
              <div className="sub">1 hour · in-person, Vadodara</div>
              <div className="price">₹4,500</div>
              <button className="btn btn-primary btn-sm" onClick={() => presetService("Sports Nutrition")}>
                Book Now
              </button>
            </div>
            <div className="sports-card">
              <div className="name">Train to Run, Eat to Perform</div>
              <div className="sub">Marathon runners&apos; diet · 1 hour</div>
              <div className="price">₹4,500</div>
              <button className="btn btn-primary btn-sm" onClick={() => presetService("Train to Run, Eat to Perform")}>
                Book Now
              </button>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
