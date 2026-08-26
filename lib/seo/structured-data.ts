import { parseBlockProps } from "@/lib/blocks/definitions";
import { resolveSocialHref } from "@/lib/blocks/social-links";
import { type ProfileSnapshot, snapshotSeo } from "@/lib/blocks/snapshot";
import { profileUrl } from "@/lib/site";

/**
 * schema.org Person/ProfilePage markup for a published profile.
 *
 * Derived entirely from the snapshot, mirroring snapshotSeo(): the public
 * page, the OG image, the sitemap and this all agree because they all read
 * the same object.
 *
 * Always Person, never Organization — nothing in the block/theme data
 * reliably distinguishes a business from an individual maker, and the
 * product's own framing ("your own corner of the internet") is personal.
 */
export function profileJsonLd(snapshot: ProfileSnapshot) {
  const { name, description } = snapshotSeo(snapshot);
  const url = profileUrl(snapshot.profile.username);

  const socialBlock = snapshot.blocks.find((block) => block.type === "social");
  const sameAs = socialBlock
    ? parseBlockProps("social", socialBlock.props)
        .links.map((link) => resolveSocialHref(link.platform, link.url))
        .filter((href): href is string => Boolean(href))
    : [];

  return {
    "@context": "https://schema.org",
    "@type": "ProfilePage",
    url,
    mainEntity: {
      "@type": "Person",
      name,
      alternateName: snapshot.profile.username,
      description,
      url,
      ...(snapshot.profile.avatarUrl.trim()
        ? { image: snapshot.profile.avatarUrl }
        : {}),
      ...(snapshot.profile.location.trim()
        ? { homeLocation: { "@type": "Place", name: snapshot.profile.location } }
        : {}),
      ...(sameAs.length ? { sameAs } : {}),
    },
  };
}

/** Serialize a JSON-LD object for a <script> tag, safe against `</script>` injection. */
export function jsonLdScript(data: unknown): string {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}
