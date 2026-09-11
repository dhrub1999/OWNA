"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Section 8: "Straight answers." — FAQ.
 *
 * Single-open accordion: opening a row closes whichever one was open, and
 * clicking the open row closes it with nothing left open. The first row is
 * open on first paint, per the design handoff — not a default that came from
 * this component guessing at one.
 */
const FAQ_ITEMS = [
  {
    question: "Do I need an account to start?",
    answer:
      "No. Build the whole page first — every block, every theme. Signing up is what puts it online, not what lets you begin.",
  },
  {
    question: "What do I actually get?",
    answer:
      "One page at owna.online/yourname, built from nine kinds of block, on any of ten themes. That is the product — not a page tree, not a plugin marketplace, not hosting config.",
  },
  {
    question: "Can I use my own domain?",
    answer:
      "Not yet. Custom domains and more than one page are the two things a paid tier is being held for — we would rather say that plainly than list a feature that doesn't ship.",
  },
  {
    question: "What happens when you start charging?",
    answer:
      "What exists today stays free. A paid tier would cover new things — extra pages, a domain of your own — not put a lock on the page you already built.",
  },
  {
    question: "How long does publishing take?",
    answer:
      "About a second. Publishing replaces the page behind your URL — there is no build to wait on and no hosting dashboard to open.",
  },
  {
    question: "Do I need to know how to design?",
    answer:
      "No. Ten themes set colour, type, spacing and shape for you, and each one is contrast-checked so the text stays readable. If you do want to sweat the corner radius, every value is still there.",
  },
  {
    question: "Can I take the page down?",
    answer:
      "Any time, and put it back just as easily. Unpublished pages are private drafts — only you can see them.",
  },
  {
    question: "Is this a website builder?",
    answer:
      "No, and that is deliberate. One page, one person, one link — which is why there is nothing to configure before you start.",
  },
] as const;

export function Faq() {
  const [openIndex, setOpenIndex] = useState(0);

  return (
    <section id="faq" className="scroll-mt-20 border-t border-border py-[clamp(64px,8vw,112px)]">
      <div className="mx-auto max-w-7xl px-[clamp(16px,4vw,48px)]">
        <div className="flex flex-wrap items-start gap-[clamp(28px,4vw,64px)]">
          <h2 className="font-display flex-[1_1_260px] text-[clamp(27px,4vw,52px)] leading-[1.05] font-extrabold tracking-[-0.035em]">
            Straight answers.
          </h2>

          <div className="min-w-0 flex-[2_1_480px] border-t border-border">
            {FAQ_ITEMS.map((item, index) => {
              const isOpen = openIndex === index;
              return (
                <div key={item.question} className="border-b border-border">
                  <button
                    type="button"
                    aria-expanded={isOpen}
                    onClick={() => setOpenIndex(isOpen ? -1 : index)}
                    className="flex w-full cursor-pointer items-center justify-between gap-5 py-5.5 text-left text-lg font-semibold"
                  >
                    {item.question}
                    <ChevronDown
                      aria-hidden="true"
                      className={cn(
                        "size-4.5 shrink-0 text-muted-foreground transition-transform duration-200",
                        isOpen && "rotate-180",
                      )}
                    />
                  </button>
                  {isOpen ? (
                    <p className="max-w-[68ch] pb-5.5 text-base leading-[1.65] text-muted-foreground">
                      {item.answer}
                    </p>
                  ) : null}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
