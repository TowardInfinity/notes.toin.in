import { defaultSchema } from "rehype-sanitize";
import type { Schema } from "hast-util-sanitize";

/**
 * Minimal extension of the default sanitize schema for math rendering.
 *
 * Allows ONLY the three wrapper classNames that remark-math emits
 * ('math', 'math-inline', 'math-display') anywhere. The KaTeX output
 * itself is generated AFTER sanitization (rehypeKatex runs after
 * rehypeSanitize), so it needs no further allowlists; arbitrary
 * attacker-supplied classes stay blocked.
 */
export const mdSanitizeSchema: Schema = {
    ...defaultSchema,
    attributes: {
        ...defaultSchema.attributes,
        "*": [
            ...(defaultSchema.attributes?.["*"] ?? []),
            ["className", "math", "math-inline", "math-display"],
        ],
    },
};
