import Container from "@/components/common/Container";
import Section from "@/components/common/Section";
import type { AnswerProps } from "@/types/sections";

/**
 * Answer-first block (AEO).
 *
 * The question is the heading and the answer follows immediately, kept short and
 * factual. This is the shape answer engines quote, so nothing should sit between
 * the question and its answer.
 */
export default function Answer({ question, answer }: AnswerProps) {
  return (
    <Section id="answer" className="bg-white">
      <Container>
        <div className="max-w-3xl rounded-3xl border border-slate-200 bg-slate-50 p-8 sm:p-10">
          <h2 className="text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
            {question}
          </h2>
          <p className="mt-4 text-lg leading-8 text-slate-700">{answer}</p>
        </div>
      </Container>
    </Section>
  );
}
