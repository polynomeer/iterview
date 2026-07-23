import type { SkillRadarModel } from "../../entities/skill-intelligence/model";

type SkillRadarChartProps = {
  radar: SkillRadarModel;
};

function polarToCartesian(angle: number, radius: number) {
  const x = 50 + Math.cos(angle) * radius;
  const y = 50 + Math.sin(angle) * radius;
  return { x, y };
}

export function SkillRadarChart({ radar }: SkillRadarChartProps) {
  const categories = radar.categories.slice(0, 6);
  const pointCount = categories.length;

  if (pointCount < 3) {
    return (
      <section className="page-card">
        <span className="page-card__label">Radar chart</span>
        <h2 className="page-card__title">Not enough radar dimensions yet</h2>
        <p className="page-card__body">
          At least three category scores are needed before the chart becomes useful.
        </p>
      </section>
    );
  }

  const polygon = categories
    .map((category, index) => {
      const angle = (-Math.PI / 2) + (index / pointCount) * Math.PI * 2;
      const radius = Math.max(12, (category.score / 100) * 34);
      const point = polarToCartesian(angle, radius);
      return `${point.x},${point.y}`;
    })
    .join(" ");

  return (
    <section className="page-card">
      <div className="section-heading">
        <div>
          <p className="section-heading__eyebrow">Radar chart</p>
          <h2 className="page-card__title">Current skill profile</h2>
        </div>
      </div>
      <div className="skill-radar-chart">
        <svg className="skill-radar-chart__svg" viewBox="-12 -12 124 124">
          {[12, 22, 32, 42].map((radius) => (
            <circle
              className="skill-radar-chart__ring"
              cx="50"
              cy="50"
              key={radius}
              r={radius}
            />
          ))}
          {categories.map((category, index) => {
            const angle = (-Math.PI / 2) + (index / pointCount) * Math.PI * 2;
            const outerPoint = polarToCartesian(angle, 42);
            const labelPoint = polarToCartesian(angle, 51);
            return (
              <g key={category.id}>
                <line
                  className="skill-radar-chart__axis"
                  x1="50"
                  x2={outerPoint.x}
                  y1="50"
                  y2={outerPoint.y}
                />
                <text
                  className="skill-radar-chart__label"
                  textAnchor={
                    labelPoint.x > 58 ? "start" : labelPoint.x < 42 ? "end" : "middle"
                  }
                  x={labelPoint.x}
                  y={labelPoint.y}
                >
                  {category.label}
                </text>
              </g>
            );
          })}
          <polygon className="skill-radar-chart__shape" points={polygon} />
        </svg>
        <div className="skill-radar-chart__legend">
          {categories.map((category) => (
            <div className="skill-radar-chart__legend-item" key={category.id}>
              <strong>{category.label}</strong>
              <span>{category.scoreLabel}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
