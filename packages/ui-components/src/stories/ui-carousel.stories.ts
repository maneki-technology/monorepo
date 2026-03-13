import type { Meta, StoryObj } from "@storybook/web-components";
import { html } from "lit";
import "../components/ui-carousel.js";
import "../components/ui-carousel-item.js";
import "../components/ui-image.js";
import "../components/ui-carousel-item.js";

const meta: Meta = {
  title: "Components/Carousel",
  component: "ui-carousel",
  argTypes: {
    gap: { control: { type: "number" } },
    loop: { control: "boolean" },
    autoPlay: { control: "boolean" },
    autoPlayInterval: { control: { type: "number" } },
    hideArrows: { control: "boolean" },
    hideIndicators: { control: "boolean" },
  },
  parameters: {
    a11y: {
      config: {
        rules: [{ id: "color-contrast", enabled: false }],
      },
    },
  },
  args: {
    gap: 16,
    loop: false,
    autoPlay: false,
    autoPlayInterval: 5000,
    hideArrows: false,
    hideIndicators: false,
  },
  render: (args) => html`
    <div style="max-width: 900px;">
      <ui-carousel
        gap=${args.gap}
        ?loop=${args.loop}
        ?auto-play=${args.autoPlay}
        auto-play-interval=${args.autoPlayInterval}
        ?hide-arrows=${args.hideArrows}
        ?hide-indicators=${args.hideIndicators}
      >
        <ui-carousel-item style="width: 280px;">
          <div style="height: 200px; background: #D4E4FA; border-radius: 2px; display: flex; align-items: center; justify-content: center; font-family: Inter, sans-serif; font-size: 18px; font-weight: 600; color: #1C2B36;">
            Slide 1
          </div>
        </ui-carousel-item>
        <ui-carousel-item style="width: 280px;">
          <div style="height: 200px; background: #DCE3E8; border-radius: 2px; display: flex; align-items: center; justify-content: center; font-family: Inter, sans-serif; font-size: 18px; font-weight: 600; color: #1C2B36;">
            Slide 2
          </div>
        </ui-carousel-item>
        <ui-carousel-item style="width: 280px;">
          <div style="height: 200px; background: #FDDDB3; border-radius: 2px; display: flex; align-items: center; justify-content: center; font-family: Inter, sans-serif; font-size: 18px; font-weight: 600; color: #1C2B36;">
            Slide 3
          </div>
        </ui-carousel-item>
        <ui-carousel-item style="width: 280px;">
          <div style="height: 200px; background: #C4DFD2; border-radius: 2px; display: flex; align-items: center; justify-content: center; font-family: Inter, sans-serif; font-size: 18px; font-weight: 600; color: #1C2B36;">
            Slide 4
          </div>
        </ui-carousel-item>
      </ui-carousel>
    </div>
  `,
};
export default meta;
type Story = StoryObj;

export const Default: Story = {};

// ─── Style 1: Testimonial (horizontal image + quote) ─────────────────────────
// Figma: 3:2 portrait image left (400px) + quote (Sabon 32/40) + author + "Read more"
// Width: 832px, gap: 32px between image and content

export const Style1Testimonial: Story = {
  render: () => html`
    <div style="max-width: 900px;">
      <ui-carousel gap="32">
        ${[
          {
            quote: "\u201CThrough One Million Black Women, the firm has committed to listening and learning from Black women to understand what is needed to make a difference in their lives.\u201D",
            name: "Waverly",
            dept: "Inclusive Growth, Sustainable Finance Group",
            location: "Executive Office Division, New York",
          },
          {
            quote: "\u201CWe believe that investing in communities is not just the right thing to do \u2014 it\u2019s also good business. When communities thrive, economies grow.\u201D",
            name: "Marcus",
            dept: "Global Investment Research",
            location: "Securities Division, London",
          },
          {
            quote: "\u201COur approach to sustainability is rooted in the belief that environmental and social factors are integral to long-term value creation.\u201D",
            name: "Elena",
            dept: "Asset Management Division",
            location: "Sustainable Investing, San Francisco",
          },
        ].map(
          (t) => html`
            <ui-carousel-item style="width: 832px;">
              <div style="display: flex; gap: 32px; align-items: stretch;">
                <ui-image ratio="3:2" style="width: 400px; flex-shrink: 0; border-radius: 2px;"></ui-image>
                <div style="display: flex; flex-direction: column; gap: 40px; flex: 1; padding: 24px 0;">
                  <p style="margin: 0; font-family: Georgia, 'Times New Roman', Times, serif; font-size: 32px; line-height: 40px; font-weight: 400; color: #1C2B36;">
                    ${t.quote}
                  </p>
                  <div style="display: flex; flex-direction: column; gap: 32px;">
                    <div style="display: flex; flex-direction: column; gap: 4px; font-size: 16px; line-height: 24px; color: #3E5463;">
                      <p style="margin: 0; font-weight: 500;">${t.name}</p>
                      <div style="font-weight: 300;">
                        <p style="margin: 0;">${t.dept}</p>
                        <p style="margin: 0;">${t.location}</p>
                      </div>
                    </div>
                    <a href="#" style="font-size: 14px; line-height: 20px; font-weight: 500; color: #186ADE; text-decoration: none;">Read more</a>
                  </div>
                </div>
              </div>
            </ui-carousel-item>
          `,
        )}
      </ui-carousel>
    </div>
  `,
};

// ─── Style 2: Article cards (vertical image + category + title + desc) ────────
// Figma: 16:9 image top + category (uppercase 12/16) + title (Sabon serif) + description
// Sizes: L(508px, title 32/40), M(431px, title 24/32), S(284px, title 24/32)

export const Style2ArticleLarge: Story = {
  render: () => html`
    <div style="max-width: 1100px;">
      <ui-carousel gap="24">
        ${[
          { category: "EXCHANGES AT GOLDMAN SACHS", title: "Whenever, Wherever: Seamless Commerce is the Future of Retail", desc: "Jennifer Davis and Vishaal Rana of the Investment Banking Division discuss the fate of brick-and-mortar retail locations and why the seamless omnichannel experience is the future of consumer retail." },
          { category: "BRIEFINGS", title: "The State of Global Markets in an Era of Uncertainty", desc: "A look at how geopolitical shifts and monetary policy changes are reshaping investment strategies across asset classes." },
          { category: "INSIGHTS", title: "AI and the Next Wave of Productivity", desc: "How artificial intelligence is transforming workflows across industries and what it means for the future of work." },
        ].map(
          (a) => html`
            <ui-carousel-item style="width: 508px;">
              <div style="display: flex; flex-direction: column; gap: 32px;">
                <ui-image ratio="16:9" style="width: 100%; border-radius: 2px;"></ui-image>
                <div style="display: flex; flex-direction: column; gap: 16px;">
                  <div style="display: flex; flex-direction: column; gap: 8px;">
                    <span style="font-family: Inter, sans-serif; font-size: 12px; line-height: 16px; font-weight: 400; color: #3E5463;">${a.category}</span>
                    <h3 style="margin: 0; font-family: Georgia, 'Times New Roman', Times, serif; font-size: 32px; line-height: 40px; font-weight: 400; color: #1C2B36;">${a.title}</h3>
                  </div>
                  <p style="margin: 0; font-family: Inter, sans-serif; font-size: 16px; line-height: 24px; font-weight: 300; color: #3E5463;">${a.desc}</p>
                </div>
              </div>
            </ui-carousel-item>
          `,
        )}
      </ui-carousel>
    </div>
  `,
};

export const Style2ArticleMedium: Story = {
  render: () => html`
    <div style="max-width: 900px;">
      <ui-carousel gap="24">
        ${[
          { category: "EXCHANGES AT GOLDMAN SACHS", title: "Whenever, Wherever: Seamless Commerce is the Future of Retail", desc: "Jennifer Davis and Vishaal Rana of the Investment Banking Division discuss the fate of brick-and-mortar retail locations and why the seamless omnichannel experience is the future of consumer retail." },
          { category: "BRIEFINGS", title: "The State of Global Markets in an Era of Uncertainty", desc: "A look at how geopolitical shifts and monetary policy changes are reshaping investment strategies across asset classes." },
          { category: "INSIGHTS", title: "AI and the Next Wave of Productivity", desc: "How artificial intelligence is transforming workflows across industries and what it means for the future of work." },
          { category: "RESEARCH", title: "Emerging Markets: Opportunities Ahead", desc: "Why developing economies present compelling investment opportunities despite near-term volatility." },
        ].map(
          (a) => html`
            <ui-carousel-item style="width: 431px;">
              <div style="display: flex; flex-direction: column; gap: 24px;">
                <ui-image ratio="16:9" style="width: 100%; border-radius: 2px;"></ui-image>
                <div style="display: flex; flex-direction: column; gap: 16px;">
                  <div style="display: flex; flex-direction: column; gap: 8px;">
                    <span style="font-family: Inter, sans-serif; font-size: 12px; line-height: 16px; font-weight: 400; color: #3E5463;">${a.category}</span>
                    <h3 style="margin: 0; font-family: Georgia, 'Times New Roman', Times, serif; font-size: 24px; line-height: 32px; font-weight: 400; color: #1C2B36;">${a.title}</h3>
                  </div>
                  <p style="margin: 0; font-family: Inter, sans-serif; font-size: 16px; line-height: 24px; font-weight: 300; color: #3E5463;">${a.desc}</p>
                </div>
              </div>
            </ui-carousel-item>
          `,
        )}
      </ui-carousel>
    </div>
  `,
};

export const Style2ArticleSmall: Story = {
  render: () => html`
    <div style="max-width: 900px;">
      <ui-carousel gap="24">
        ${[
          { category: "EXCHANGES AT GOLDMAN SACHS", title: "Whenever, Wherever: Seamless Commerce is the Future of Retail", desc: "Jennifer Davis and Vishaal Rana of the Investment Banking Division discuss the fate of brick-and-mortar retail locations." },
          { category: "BRIEFINGS", title: "The State of Global Markets in an Era of Uncertainty", desc: "A look at how geopolitical shifts and monetary policy changes are reshaping investment strategies." },
          { category: "INSIGHTS", title: "AI and the Next Wave of Productivity", desc: "How artificial intelligence is transforming workflows across industries." },
          { category: "RESEARCH", title: "Emerging Markets: Opportunities Ahead", desc: "Why developing economies present compelling investment opportunities." },
          { category: "CULTURE", title: "Building Inclusive Teams at Scale", desc: "Lessons from organizations leading the way in diversity and belonging." },
        ].map(
          (a) => html`
            <ui-carousel-item style="width: 284px;">
              <div style="display: flex; flex-direction: column; gap: 24px;">
                <ui-image ratio="16:9" style="width: 100%; border-radius: 2px;"></ui-image>
                <div style="display: flex; flex-direction: column; gap: 16px;">
                  <div style="display: flex; flex-direction: column; gap: 8px;">
                    <span style="font-family: Inter, sans-serif; font-size: 12px; line-height: 16px; font-weight: 400; color: #3E5463;">${a.category}</span>
                    <h3 style="margin: 0; font-family: Georgia, 'Times New Roman', Times, serif; font-size: 24px; line-height: 32px; font-weight: 400; color: #1C2B36;">${a.title}</h3>
                  </div>
                  <p style="margin: 0; font-family: Inter, sans-serif; font-size: 16px; line-height: 24px; font-weight: 300; color: #3E5463;">${a.desc}</p>
                </div>
              </div>
            </ui-carousel-item>
          `,
        )}
      </ui-carousel>
    </div>
  `,
};

// ─── Style 3: Article with image overlay block ────────────────────────────────
// Figma: 16:9 image with white block overlay at bottom-right + category + title + desc
// Sizes: L(808px, title 32/40), S(296px, title 24/32)

export const Style3OverlayLarge: Story = {
  render: () => html`
    <div style="max-width: 900px;">
      <ui-carousel gap="32">
        ${[
          { category: "EXCHANGES AT GOLDMAN SACHS", title: "Whenever, Wherever: Seamless Commerce is the Future of Retail", desc: "Jennifer Davis and Vishaal Rana of the Investment Banking Division discuss the fate of brick-and-mortar retail locations and why the seamless omnichannel experience is the future of consumer retail." },
          { category: "BRIEFINGS", title: "The State of Global Markets in an Era of Uncertainty", desc: "A look at how geopolitical shifts and monetary policy changes are reshaping investment strategies across asset classes." },
        ].map(
          (a) => html`
            <ui-carousel-item style="width: 808px;">
              <div style="display: flex; flex-direction: column; gap: 32px;">
                <div style="position: relative; width: 100%; overflow: hidden; border-radius: 2px;">
                  <ui-image ratio="16:9" style="width: 100%;"></ui-image>
                  <div style="position: absolute; bottom: 0; left: 0; right: 104px; height: 32px; background: #fff;"></div>
                </div>
                <div style="display: flex; flex-direction: column; gap: 16px; max-width: 599px;">
                  <div style="display: flex; flex-direction: column; gap: 8px;">
                    <span style="font-family: Inter, sans-serif; font-size: 12px; line-height: 16px; font-weight: 400; color: #3E5463;">${a.category}</span>
                    <h3 style="margin: 0; font-family: Georgia, 'Times New Roman', Times, serif; font-size: 32px; line-height: 40px; font-weight: 400; color: #1C2B36;">${a.title}</h3>
                  </div>
                  <p style="margin: 0; font-family: Inter, sans-serif; font-size: 16px; line-height: 24px; font-weight: 300; color: #3E5463;">${a.desc}</p>
                </div>
              </div>
            </ui-carousel-item>
          `,
        )}
      </ui-carousel>
    </div>
  `,
};

export const Style3OverlaySmall: Story = {
  render: () => html`
    <div style="max-width: 900px;">
      <ui-carousel gap="24">
        ${[
          { category: "EXCHANGES AT GOLDMAN SACHS", title: "Whenever, Wherever: Seamless Commerce is the Future of Retail", desc: "Jennifer Davis and Vishaal Rana of the Investment Banking Division discuss the fate of brick-and-mortar retail locations." },
          { category: "BRIEFINGS", title: "The State of Global Markets in an Era of Uncertainty", desc: "A look at how geopolitical shifts and monetary policy changes are reshaping investment strategies." },
          { category: "INSIGHTS", title: "AI and the Next Wave of Productivity", desc: "How artificial intelligence is transforming workflows across industries." },
          { category: "RESEARCH", title: "Emerging Markets: Opportunities Ahead", desc: "Why developing economies present compelling investment opportunities." },
        ].map(
          (a) => html`
            <ui-carousel-item style="width: 296px;">
              <div style="display: flex; flex-direction: column; gap: 24px;">
                <div style="position: relative; width: 100%; overflow: hidden; border-radius: 2px;">
                  <ui-image ratio="16:9" style="width: 100%;"></ui-image>
                  <div style="position: absolute; bottom: 0; left: 0; right: 65px; height: 16px; background: #fff;"></div>
                </div>
                <div style="display: flex; flex-direction: column; gap: 16px; max-width: 255px;">
                  <div style="display: flex; flex-direction: column; gap: 8px;">
                    <span style="font-family: Inter, sans-serif; font-size: 12px; line-height: 16px; font-weight: 400; color: #3E5463;">${a.category}</span>
                    <h3 style="margin: 0; font-family: Georgia, 'Times New Roman', Times, serif; font-size: 24px; line-height: 32px; font-weight: 400; color: #1C2B36;">${a.title}</h3>
                  </div>
                  <p style="margin: 0; font-family: Inter, sans-serif; font-size: 16px; line-height: 24px; font-weight: 300; color: #3E5463;">${a.desc}</p>
                </div>
              </div>
            </ui-carousel-item>
          `,
        )}
      </ui-carousel>
    </div>
  `,
};

// ─── Feature stories ──────────────────────────────────────────────────────────

export const WithLoop: Story = {
  args: { loop: true },
};

export const AutoPlay: Story = {
  args: { autoPlay: true, loop: true, autoPlayInterval: 3000 },
};

export const NoArrows: Story = {
  args: { hideArrows: true },
};

export const NoIndicators: Story = {
  args: { hideIndicators: true },
};

export const CustomGap: Story = {
  args: { gap: 32 },
};

export const SingleItem: Story = {
  render: () => html`
    <div style="max-width: 900px;">
      <ui-carousel>
        <ui-carousel-item style="width: 100%;">
          <div style="height: 240px; background: #D4E4FA; border-radius: 2px; display: flex; align-items: center; justify-content: center; font-family: Inter, sans-serif; font-size: 18px; font-weight: 600; color: #1C2B36;">
            Single Full-Width Slide
          </div>
        </ui-carousel-item>
      </ui-carousel>
    </div>
  `,
};
