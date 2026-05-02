import type { OnboardingSlide } from '../api/onboarding.api';
import { OnboardingIllustration } from './illustrations';

/**
 * Renders one onboarding slide. Title + optional highlight (italic accent)
 * + optional second-line subtitle, then body. Mirrors the supplied mocks.
 */
export function OnboardingSlideContent({ slide }: { slide: OnboardingSlide }) {
  return (
    <div className="flex flex-1 flex-col items-center px-6 pt-6">
      <div className="flex flex-1 items-center justify-center">
        <OnboardingIllustration iconKey={slide.iconKey} />
      </div>
      <div className="mt-8 w-full text-start">
        <h2 className="text-3xl font-bold leading-tight text-text-primary">
          {renderTitle(slide.title, slide.highlight)}
          {slide.subtitle ? (
            <span className="block">{renderTitle(slide.subtitle, null, true)}</span>
          ) : null}
        </h2>
        <p className="mt-3 text-sm text-text-secondary leading-relaxed">{slide.body}</p>
      </div>
    </div>
  );
}

function renderTitle(title: string, highlight: string | null, italicAll = false) {
  if (italicAll) {
    return <em className="italic font-semibold gradient-text">{title}</em>;
  }
  if (!highlight) return title;
  const idx = title.indexOf(highlight);
  if (idx === -1) return title;
  const before = title.slice(0, idx);
  const after = title.slice(idx + highlight.length);
  return (
    <>
      {before}
      <em className="italic font-semibold gradient-text">{highlight}</em>
      {after}
    </>
  );
}
