# Creature artwork

Asset: `public/art/creatures.png` (1536 × 1024 PNG).
Generated with built-in ImageGen, not the CLI. Original artwork inspired by dramatic fantasy trading cards; no existing franchise characters or logos.

Exact generation prompt:

> Landscape 3:2 triptych sprite sheet for three fantasy card illustrations on a black and plum planning poker website. Three equal vertical panels edge to edge, exactly one original fantasy creature per panel. Left: emerald spectral horned dragon with moss armored scales and swirling green magical smoke. Center: majestic violet arcane winged dragon with angular ivory armor and lavender lightning. Right: fiery amber phoenix with glowing orange feathers. Original anime fantasy trading card creature art evoking dramatic painted illustration of 1990s Japanese duel cards, highly detailed with luminous magical accents and strong readable silhouettes. Each complete head and torso centered within its own panel, comfortably within central area for card cropping. Dark inky backgrounds with magical effects. Dramatic colored rim lighting. No gaps, text, frames, borders, logos, watermarks, UI, or actual card frames.

## Expanded nine-card deck

The original panels now belong exclusively to 0,5 (Verdant Guardian), 1 (Astral Dragon), and 2 (Ember Phoenix). Six new original creatures were generated with built-in ImageGen using the original sheet as a style/composition reference. Each new sheet is 1536 × 1024 with three equal vertical panels.

- `public/art/creatures-elements.png`: 3 — Frostfang Wolf; 5 — Solar Sovereign; 8 — Abyssal Kraken.
- `public/art/creatures-titans.png`: 13 — Obsidian Colossus; 20 — Tempest Griffin; 40 — Cosmic Hydra.

Exact prompts consist of this shared prefix followed by the respective suffix below:

> Use case: stylized-concept. Asset type: landscape 3:2 triptych sprite sheet for fantasy trading card art. Create a NEW image. The supplied image is a STYLE AND COMPOSITION REFERENCE ONLY, not an edit target. Match its original dark highly detailed Japanese fantasy trading-card painted art, dramatic glowing colored rim lights, inky shadows, intricate material texture, rich luminous magical effects and strong silhouettes. Exactly three equal-width vertical panels edge-to-edge with no gaps, no frames, no borders, no text, no numbers, no logos or watermarks. Each creature has a clearly distinct silhouette, centered readable complete head and torso in the central area of its own panel for card cropping. Creature body and effects do not cross panel boundaries.

Elements suffix:

> Sheet A subjects: LEFT a frost spectral wolf, distinctly canine pointed ears and long muzzle, white-blue fur, cyan ice crystals and drifting frost; CENTER a majestic golden sun-armored lion, distinctly feline broad face and full radiant mane, ornate gold armor and amber radiance; RIGHT an oceanic kraken, distinctly cephalopod mantle head and curling tentacles, teal bioluminescence and deep underwater shadows. Each a single imposing magical creature.

Titans suffix:

> Sheet B subjects: LEFT a massive obsidian volcanic golem, broad blocky humanoid head and torso made of jagged black rock with glowing red lava cracks and embers; CENTER a majestic storm griffin with distinctly eagle beak and feathered head, lion torso and cobalt lightning wings; RIGHT a cosmic THREE-HEADED hydra, three distinct serpentine heads on three curving necks rising from one torso, magenta starlight and nebula sparks. All THREE hydra heads fully contained within the rightmost panel, arranged close together vertically and diagonally so every head is visible. Each panel has a clearly distinct silhouette.

## Power progression

The low-card artwork is replaced by `public/art/creatures-starters.png`. The original `creatures.png` is retained as an earlier design and style reference.

| Points | Creature | Strength stars |
| --- | --- | --- |
| 0,5 | Mossling — tiny forest sprite | 1 |
| 1 | Astral Hatchling — baby dragon | 1 |
| 2 | Ember Newt — young fire salamander | 2 |
| 3 | Frostfang Wolf | 2 |
| 5 | Solar Sovereign | 3 |
| 8 | Abyssal Kraken | 3 |
| 13 | Obsidian Colossus | 4 |
| 20 | Tempest Griffin | 4 |
| 40 | Cosmic Hydra | 5 |

Starter sheet generated with built-in ImageGen, using the original sheet as a style reference. Exact prompt:

```text
Use case: stylized-concept.
Asset type: fantasy trading card illustration sprite sheet, landscape 1536x1024, 3:2.
Input image role: STYLE REFERENCE ONLY for finely detailed painted Japanese fantasy trading-card illustration, rich material texture and dark atmospheric backgrounds. Create an entirely NEW image with smaller gentler starter creatures. Do not reuse the reference's powerful creatures, extreme closeups, armor or epic effects.
Composition: EXACTLY THREE equal vertical 512x1024 panels edge-to-edge, no frames, gaps, borders, text, numbers or watermarks. In every panel keep the creature's WHOLE SMALL BODY, including ears, wings, feet and tail, inside the CENTRAL VERTICAL 50 PERCENT of the image, approximately y250 to y750. Center each creature around y500, with modest surrounding space above and below and visible ordinary natural objects indicating small scale. Full-body environmental illustration, no extreme closeup.
LEFT: tiny moss and leaf forest sprite perched on a mushroom. Round small body, two leaf ears, tiny limbs, subtle green glow. Gentle humble starter creature among normal mushrooms and moss.
CENTER: small young lavender winged dragon hatchling, stubby horns, stubby wings, clearly a baby and non-threatening. Perched on a palm-sized stone, one tiny magical spark nearby. Entire curled tail and small body visible.
RIGHT: fox-sized young ember salamander, agile modest creature with reddish scales and one small flame-tipped tail. Entire body and tail visible on forest ground among small stones and twigs.
Lighting/mood: dark painted fantasy with softly glowing green, lavender and amber accents respectively; restrained small magic and quiet intimate surroundings.
Avoid: colossal size, mature powerful beasts, armor, lightning, flame storms, dramatic battle poses, cropped body parts, text, frames.
```
