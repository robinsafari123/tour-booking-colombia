"use client";
import React from "react";
import { motion } from "motion/react";

export type Testimonial = {
  text: string;
  image: string;
  name: string;
  role: string;
};

export const TestimonialsColumn = (props: {
  className?: string;
  testimonials: Testimonial[];
  duration?: number;
}) => {
  return (
    <div className={props.className}>
      <motion.div
        animate={{ translateY: "-50%" }}
        transition={{
          duration: props.duration || 10,
          repeat: Infinity,
          ease: "linear",
          repeatType: "loop",
        }}
        className="flex flex-col gap-6 pb-6"
      >
        {[...new Array(2).fill(0).map((_, index) => (
          <React.Fragment key={index}>
            {props.testimonials.map(({ text, image, name, role }, i) => (
              <div
                key={i}
                className="p-8 rounded-3xl border border-white/20 bg-white/10 backdrop-blur-sm shadow-lg shadow-black/10 max-w-xs w-full"
              >
                <p className="text-white/90 text-sm leading-relaxed">"{text}"</p>
                <div className="flex items-center gap-3 mt-5">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    width={40}
                    height={40}
                    src={image}
                    alt={name}
                    className="h-10 w-10 rounded-full object-cover ring-2 ring-emerald-400"
                  />
                  <div className="flex flex-col">
                    <div className="font-semibold text-white text-sm leading-5">{name}</div>
                    <div className="text-emerald-300 text-xs leading-5">{role}</div>
                  </div>
                </div>
              </div>
            ))}
          </React.Fragment>
        ))]}
      </motion.div>
    </div>
  );
};
