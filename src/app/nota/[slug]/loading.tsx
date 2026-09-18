import SiteHeader from "@/components/SiteHeader";

export default function Loading() {
  return (
    <>
      <SiteHeader />
      <main>
        <article className="nota">
          <div className="wrap nota-wrap">
            <div className="skel skel-kicker" />
            <div className="skel skel-title" />
            <div className="skel skel-title skel-title-short" />
            <div className="skel skel-bajada" />
            <div className="skel skel-media" />
          </div>
        </article>
      </main>
    </>
  );
}
