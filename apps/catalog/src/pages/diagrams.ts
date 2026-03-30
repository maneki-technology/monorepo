import { registerPage } from "../registry.js";
import "@maneki/diagrams/components/diagram-canvas.js";
import "@maneki/diagrams/components/diagram-person.js";
import "@maneki/diagrams/components/diagram-system.js";
import "@maneki/diagrams/components/diagram-container.js";
import "@maneki/diagrams/components/diagram-component.js";
import "@maneki/diagrams/components/diagram-external.js";
import "@maneki/diagrams/components/diagram-arrow.js";

registerPage("diagrams", {
  title: "Diagrams",
  section: "Diagrams",
  render: () => `
    <h3>C4 Container Diagram</h3>
    <diagram-canvas columns="3" rows="3" title="Maneki Blog — Container View">
      <diagram-person box-id="author" row="1" col="2" label="Author" description="Writes and publishes blog posts"></diagram-person>

      <diagram-container box-id="editor" row="2" col="1" label="Editor" tech="Web Components" description="Blog editor UI"></diagram-container>
      <diagram-container box-id="api" row="2" col="2" label="API" tech="Hono" description="Posts CRUD + deploy"></diagram-container>
      <diagram-container box-id="blog" row="2" col="3" label="Blog" tech="Static HTML" description="Prerendered pages"></diagram-container>

      <diagram-external box-id="turso" row="3" col="1" label="Turso" tech="libSQL" description="Posts + UI state"></diagram-external>
      <diagram-external box-id="github" row="3" col="2" label="GitHub Actions" description="Build + deploy"></diagram-external>
      <diagram-external box-id="cf" row="3" col="3" label="Cloudflare Pages" description="CDN + hosting"></diagram-external>

      <diagram-arrow from="author" to="editor" label="writes posts"></diagram-arrow>
      <diagram-arrow from="editor" to="api" label="RPC calls"></diagram-arrow>
      <diagram-arrow from="api" to="turso" label="read/write"></diagram-arrow>
      <diagram-arrow from="api" to="github" label="triggers deploy"></diagram-arrow>
      <diagram-arrow from="github" to="cf" label="deploys to"></diagram-arrow>
      <diagram-arrow from="cf" to="blog" label="serves"></diagram-arrow>
    </diagram-canvas>

    <h3>All Shapes</h3>
    <diagram-canvas columns="5" rows="1">
      <diagram-person box-id="v1" row="1" col="1" label="Person" description="A user or actor"></diagram-person>
      <diagram-system box-id="v2" row="1" col="2" label="System" description="Top-level system"></diagram-system>
      <diagram-container box-id="v3" row="1" col="3" label="Container" tech="TypeScript" description="An application or service"></diagram-container>
      <diagram-component box-id="v4" row="1" col="4" label="Component" description="A module within a container"></diagram-component>
      <diagram-external box-id="v5" row="1" col="5" label="External" description="Third-party system"></diagram-external>
    </diagram-canvas>

    <h3>Simple Flow</h3>
    <diagram-canvas columns="4" rows="1">
      <diagram-container box-id="f1" row="1" col="1" label="Foundation" tech="Tokens"></diagram-container>
      <diagram-container box-id="f2" row="1" col="2" label="Components" tech="Web Components"></diagram-container>
      <diagram-container box-id="f3" row="1" col="3" label="Catalog" tech="Vite"></diagram-container>
      <diagram-container box-id="f4" row="1" col="4" label="Blog" tech="Hono + Turso"></diagram-container>

      <diagram-arrow from="f1" to="f2" label="tokens"></diagram-arrow>
      <diagram-arrow from="f2" to="f3" label="components"></diagram-arrow>
      <diagram-arrow from="f2" to="f4" label="components"></diagram-arrow>
    </diagram-canvas>
  `,
});
