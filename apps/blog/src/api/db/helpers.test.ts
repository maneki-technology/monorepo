import { describe, it, expect } from "vitest";
import { buildSetClauses, toBool, toJson } from "./helpers.js";

describe("buildSetClauses", () => {
  it("returns empty clauses/args when no fields match", () => {
    const result = buildSetClauses({}, { title: "title" });
    expect(result.clauses).toEqual([]);
    expect(result.args).toEqual([]);
  });

  it("skips undefined values", () => {
    const result = buildSetClauses(
      { title: "hello", body: undefined },
      { title: "title", body: "body_md" },
    );
    expect(result.clauses).toEqual(["title = ?"]);
    expect(result.args).toEqual(["hello"]);
  });

  it("includes null values (not undefined)", () => {
    const result = buildSetClauses(
      { album_id: null },
      { album_id: "album_id" },
    );
    expect(result.clauses).toEqual(["album_id = ?"]);
    expect(result.args).toEqual([null]);
  });

  it("uses string spec as column name directly", () => {
    const result = buildSetClauses(
      { title: "Test", status: "published" },
      { title: "title", status: "status" },
    );
    expect(result.clauses).toEqual(["title = ?", "status = ?"]);
    expect(result.args).toEqual(["Test", "published"]);
  });

  it("uses FieldMapping.column when provided", () => {
    const result = buildSetClauses(
      { date: "2025-01-01" },
      { date: { column: "created_at" } },
    );
    expect(result.clauses).toEqual(["created_at = ?"]);
    expect(result.args).toEqual(["2025-01-01"]);
  });

  it("defaults column to key name when FieldMapping.column is omitted", () => {
    const result = buildSetClauses(
      { title: "hi" },
      { title: { transform: undefined } },
    );
    expect(result.clauses).toEqual(["title = ?"]);
    expect(result.args).toEqual(["hi"]);
  });

  it("applies toBool transform", () => {
    const result = buildSetClauses(
      { featured: true, pinned: false },
      {
        featured: { column: "featured", transform: toBool },
        pinned: { column: "pinned", transform: toBool },
      },
    );
    expect(result.clauses).toEqual(["featured = ?", "pinned = ?"]);
    expect(result.args).toEqual([1, 0]);
  });

  it("applies toJson transform", () => {
    const result = buildSetClauses(
      { tags: ["rust", "wasm"] },
      { tags: { column: "tags", transform: toJson } },
    );
    expect(result.clauses).toEqual(["tags = ?"]);
    expect(result.args).toEqual(['["rust","wasm"]']);
  });

  it("handles mixed string specs and FieldMappings", () => {
    const result = buildSetClauses(
      { title: "Post", tags: ["a", "b"], featured: true, status: "draft" },
      {
        title: "title",
        tags: { column: "tags", transform: toJson },
        featured: { column: "featured", transform: toBool },
        status: "status",
      },
    );
    expect(result.clauses).toEqual([
      "title = ?",
      "tags = ?",
      "featured = ?",
      "status = ?",
    ]);
    expect(result.args).toEqual(["Post", '["a","b"]', 1, "draft"]);
  });

  it("preserves field order from spec", () => {
    const result = buildSetClauses(
      { z: "last", a: "first", m: "middle" },
      { a: "a", m: "m", z: "z" },
    );
    expect(result.clauses).toEqual(["a = ?", "m = ?", "z = ?"]);
    expect(result.args).toEqual(["first", "middle", "last"]);
  });

  it("handles numeric values", () => {
    const result = buildSetClauses(
      { width: 1920, height: 1080, sort_order: 0 },
      { width: "width", height: "height", sort_order: "sort_order" },
    );
    expect(result.args).toEqual([1920, 1080, 0]);
  });
});
