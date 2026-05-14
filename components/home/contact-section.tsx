export default function ContactSection() {
  return (
    <section className="w-full py-20 px-6 sm:px-10 md:px-16 bg-background">
      <div className="max-w-3xl mx-auto text-center flex flex-col items-center gap-6">
        {/* Small Title */}
        <span className="uppercase font-medium text-[13px] tracking-[3px] text-accent-gold">
          STAY CONNECTED{" "}
        </span>

        {/* Big Title */}
        <h2 className="font-bold text-[45px] sm:text-[80px] max-w-[600px] leading-[100%] text-foreground font-playfair">
          JOIN THE OWAY CIRCLE
        </h2>

        {/* Paragraph */}
        <p className="font-newsreader font-regular text-[17px] leading-[150%] sm:leading-[170%] text-foreground-secondary max-w-xl">
          Receive exclusive previews of new collections, stories from our
          artisans, and invitations to private viewings.
        </p>

        {/* Form */}
        <div className="w-full max-w-md mt-4">
          <div className="flex items-center border border-foreground-muted overflow-hidden">
            <input
              type="email"
              placeholder="Enter your email address"
              className="flex-1 px-5 py-3 bg-transparent text-foreground outline-none text-[13px] placeholder:font-funnel-sans"
            />
            <button
              type="submit"
              className="px-6 py-3 uppercase font-medium hover:bg-foreground-secondary hover:cursor-pointer text-[13px] text-white bg-foreground tracking-[2px]"
            >
              Subscribe
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
