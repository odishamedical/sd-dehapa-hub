# UI/UX New Success Protocol

When building or updating user interfaces based on mockups (especially for the Shyam Dash ecosystem), agents MUST adhere to the following rules to guarantee visual accuracy and prevent generic layouts:

1. **Deep Visual Dissection (No Rushing)**: Before writing any UI code, dissect the mockup into its core components (exact colors, gradients, padding, typography, border radii, shadows). Do not jump straight to functional logic at the expense of aesthetic fidelity.
2. **Component-by-Component Matching**: Do not build entire pages from memory. Build one section (e.g., Hero), make it pixel-perfect by cross-referencing the mockup, and then move to the next.
3. **The "No Compromise" Rule (Exact Values)**: Never default to generic Tailwind utility classes (like `bg-cyan-50`, `shadow-sm`) if they do not perfectly capture the premium depth and vibrancy of the design. Use exact, custom values (e.g., `shadow-[0_10px_30px_rgba(0,0,0,0.1)]`, custom gradients `bg-gradient-to-br`) to match the mockup exactly.
4. **Preserve Premium Aesthetics in Empty States**: When implementing conditional rendering, empty states, or dummy data, ensure that the UI still reflects the premium design. Do not fallback to boring placeholders (e.g. flat gray buttons) that contradict the mockup's vibrant aesthetics.
