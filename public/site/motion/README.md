# Homepage motion assets

These assets are derived from the two Higgsfield videos supplied for this redesign. No additional generation was purchased.

- `night-sky.mp4`: 1280×720, 24 fps, H.264, no audio. Derived from `Photorealistic-night-sky-in-the-same-sty.mp4`. The final 0.8 seconds overlap the first 0.8 seconds, then the loop begins at that same offset. This preserves forward travel and avoids a hard cut or a reversing camera. Encoded with CRF 23, yuv420p and faststart. The loop is approximately 4.29 seconds and 651 KiB.
- `night-sky.webp`: the first frame of that loop, used as a first-paint poster and for reduced motion or Data Saver.
- `horizon.webp`: a frame at 2 seconds from `hf_20261101_185828_f391e7a5-52ac-423c-9843-5cfca35cbbbd.mp4`, softly masked into the recipient section. The 15-second source video is not downloaded by the homepage.

The originals remain separate from these optimized web assets. The envelope, seal, orbit and letter in the hero are editable CSS and SVG; the craft demonstration uses the existing app components. Attribution for existing Wikimedia photographs remains in the site footer and `public/site/credits.json`.
