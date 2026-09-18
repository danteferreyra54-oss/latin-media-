import SiteHeader from "@/components/SiteHeader";

export default function Loading() {
  return (
    <>
      <SiteHeader />
      <main>
        <section className="hero">
          <div className="wrap">
            <article className="lead-text">
              <div className="skel skel-kicker" />
              <div className="skel skel-title" />
              <div className="skel skel-title skel-title-short" />
              <div className="skel skel-bajada" />
            </article>
            <div className="lead-media-col">
              <div className="skel skel-media" style={{ height: "100%" }} />
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
