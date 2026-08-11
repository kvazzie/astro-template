/**
 * Optional MDX linting fragment.
 *
 * Import and spread this array from eslint.config.ts after running Astro's MDX
 * integration command. Keeping it separate lets the baseline lint configuration
 * stay valid before MDX is installed.
 */
import * as mdx from "eslint-plugin-mdx";

export const mdxConfig = [
  {
    ...mdx.flat,
    processor: mdx.createRemarkProcessor({
      ignoreRemarkConfig: true,
      languageMapper: {},
      lintCodeBlocks: false,
    }),
  },
  mdx.flatCodeBlocks,
];
