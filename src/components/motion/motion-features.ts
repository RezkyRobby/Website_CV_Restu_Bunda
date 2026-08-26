import { domAnimation } from "motion/react";

// Ekspor fitur DOM saja (tanpa SVG 3D) agar bundle minimal — PRD §6.1 target ≤ 5 kb
export default domAnimation;
