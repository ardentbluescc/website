# Product

## Register

brand

## Users

Two equal audiences:

1. **Potential new members** — adults and families in Belfast exploring cricket for the first time or looking to join an active club. They arrive with no prior context; the site needs to earn trust, convey ambition, and make joining feel easy.
2. **Existing members** — players, parents, and supporters checking fixtures, results, news, and gallery updates. They need quick access to live information without hunting.

## Product Purpose

Ardent Blues Cricket Club (est. 2023, Belfast) is a growing club competing in the Northern Cricket Union. The website serves as the public face of the club — replacing a WordPress site — built on Next.js 15 + Payload CMS v3. It must:

- Attract and convert prospective members
- Keep existing members informed (fixtures, news, gallery)
- Reflect the club's ambition and modern identity
- Grow alongside the club (admin-editable content, no developer needed for updates)

## Brand Personality

Modern, Ambitious, Sharp.

The club is young (est. 2023), hungry, and building toward something. The brand should feel like a challenger — not the establishment. Voice is confident without arrogance, welcoming but not soft. Tone: direct, energetic, community-proud.

## Anti-references

- **Generic sports templates** — cookie-cutter club sites with stock photos, default WordPress themes, rainbow badge logos on white backgrounds, and "Welcome to our club" copy. The design should feel built, not assembled.
- **Overly corporate / SaaS aesthetic** — sterile metric dashboards, cream backgrounds, hero-metric cards. This is a people's club, not a growth-hacking startup.
- **Stuffy institutional cricket** — ECB / county board sites, dense text, dated layouts, no visual ambition.

## Design Principles

1. **Challenger, not establishment.** The club is young and building. Every design choice should signal forward momentum, not heritage comfort.
2. **Information earns its place.** No section exists without a job. Fixtures show match days. Gallery shows club life. News shows momentum. Nothing decorative that doesn't convert.
3. **Dark means serious, not gloomy.** The dark navy palette is chosen for gravitas and visual impact — keep it rich, not flat. Blue accents punch; they don't decorate.
4. **Speed over spectacle.** Interactions should feel instant and purposeful. Motion is used to orient (scramble decode on hero) or confirm (hover states), never to entertain.
5. **One club, many players.** Design must work for a 55-year-old senior joining for the first time and a 16-year-old junior checking Saturday's fixture. Clarity and legibility are non-negotiable.

## Accessibility & Inclusion

- Target WCAG 2.1 AA minimum
- Dark backgrounds require careful contrast checking — body text must hit ≥4.5:1
- All interactive elements need focus-visible states
- Reduced motion: the hero scramble effect should respect `prefers-reduced-motion` (show text immediately, skip the decode animation)
