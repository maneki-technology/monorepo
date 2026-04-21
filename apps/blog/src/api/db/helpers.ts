/**
 * Shared SQL helpers for building dynamic UPDATE queries.
 * Eliminates repetitive `if (updates.X !== undefined)` blocks.
 */

type FieldTransform = (value: unknown) => string | number | null;

interface FieldMapping {
  /** SQL column name (defaults to the key name) */
  column?: string;
  /** Transform value before binding (e.g., JSON.stringify, boolean → 0/1) */
  transform?: FieldTransform;
}

/** Shorthand: string = column name, FieldMapping = full config */
type FieldSpec = string | FieldMapping;

const toBool: FieldTransform = (v) => (v ? 1 : 0);
const toJson: FieldTransform = (v) => JSON.stringify(v);

export { toBool, toJson };

/**
 * Build SET clauses + args from an updates object and a field spec.
 *
 * @example
 * ```ts
 * const { clauses, args } = buildSetClauses(updates, {
 *   title: "title",
 *   body_md: "body_md",
 *   tags: { column: "tags", transform: toJson },
 *   featured: { column: "featured", transform: toBool },
 * });
 * ```
 */
export function buildSetClauses(
  updates: Record<string, unknown>,
  fields: Record<string, FieldSpec>,
): { clauses: string[]; args: (string | number | null)[] } {
  const clauses: string[] = [];
  const args: (string | number | null)[] = [];

  for (const [key, spec] of Object.entries(fields)) {
    const value = updates[key];
    if (value === undefined) continue;

    const column = typeof spec === "string" ? spec : (spec.column ?? key);
    const transform = typeof spec === "string" ? undefined : spec.transform;
    const bound = transform ? transform(value) : (value as string | number | null);

    clauses.push(`${column} = ?`);
    args.push(bound);
  }

  return { clauses, args };
}
