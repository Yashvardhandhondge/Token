import React from "react";

export const LandingPageFooter = () => {
  const images = [
    { src: "/backgrounds/mail.svg", alt: "Mail" },
    { src: "/backgrounds/telegram.svg", alt: "Telegram" },
    { src: "/backgrounds/discord.svg", alt: "Discord" },
    { src: "/backgrounds/twitter.svg", alt: "Twitter" },
  ];

  return (
    <section className="flex h-[70vh] w-full flex-col items-center px-4 md:px-24 bg-[#121212]">
      <div className="flex w-full justify-end">
        <p className="text-[20px] uppercase text-[#38F68F] md:text-[40px] lg:text-[64px]">
          Join our community
        </p>
      </div>
      <div className="flex w-full flex-wrap justify-center gap-8 py-16 sm:gap-16 md:flex-row md:justify-start">
        {images.map(({ src, alt }, index) => (
          <span className="box h-24 w-24 p-2 md:h-44 md:w-44" key={index}>
            <span
              key={index}
              className="flex h-20 w-20 cursor-pointer items-center justify-center bg-[#1a1b19] md:h-40 md:w-40 hover:scale-105 transition-transform duration-200"
            >
              <img src={src} alt={alt} />
            </span>
          </span>
        ))}
      </div>
    </section>
  );
};
