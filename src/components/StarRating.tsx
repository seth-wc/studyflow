// Half-star rating widget (0-5, in 0.5 steps). Ported from the design of
// Off the Clock's rate.html: each star is a background glyph plus a
// clipped foreground glyph, with two invisible click targets (left half /
// right half) so a single star can register a half or full click.
const STAR_POSITIONS = [1, 2, 3, 4, 5];

export default function StarRating({
  value,
  onChange,
  disabled,
  size = 22,
}: {
  value: number;
  onChange: (value: number) => void;
  disabled?: boolean;
  size?: number;
}) {
  return (
    <div
      className={"otc-stars" + (disabled ? " otc-stars-disabled" : "")}
      role="group"
      aria-label={`Rating: ${value} out of 5 stars`}
    >
      {STAR_POSITIONS.map((i) => {
        const pct = value >= i ? 100 : value >= i - 0.5 ? 50 : 0;
        return (
          <span className="otc-star" key={i} style={{ width: size, height: size }}>
            <span className="otc-star-glyph otc-star-bg" style={{ fontSize: size - 2, lineHeight: `${size}px` }} aria-hidden="true">
              ★
            </span>
            <span
              className="otc-star-glyph otc-star-fg"
              style={{ width: `${pct}%`, fontSize: size - 2, lineHeight: `${size}px` }}
              aria-hidden="true"
            >
              <span className="otc-star-fg-inner" style={{ width: size }}>
                ★
              </span>
            </span>
            {!disabled && (
              <>
                <button
                  type="button"
                  className="otc-star-hit otc-star-hit-half"
                  aria-label={`Rate ${i - 0.5} stars`}
                  onClick={() => onChange(i - 0.5)}
                />
                <button
                  type="button"
                  className="otc-star-hit otc-star-hit-full"
                  aria-label={`Rate ${i} stars`}
                  onClick={() => onChange(i)}
                />
              </>
            )}
          </span>
        );
      })}
    </div>
  );
}
