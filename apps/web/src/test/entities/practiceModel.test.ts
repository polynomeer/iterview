import { describe, expect, it } from "vitest";
import { mapPracticeListResponseDtoToModel } from "../../entities/practice/model";

describe("mapPracticeListResponseDtoToModel", () => {
  it("reads the fields GET /api/questions actually returns and derives filter options", () => {
    const model = mapPracticeListResponseDtoToModel([
      { id: 1, title: "Idempotent consumers", difficulty: "MEDIUM", categoryId: 2, categoryName: "System Design", companies: [{ id: 5, name: "Toss" }] },
      { id: 2, title: "Poison messages", difficulty: "HARD", categoryId: 2, categoryName: "System Design", companies: [] },
      { id: 3, title: "Transaction propagation", difficulty: "MEDIUM", categoryId: 4, categoryName: "Spring", companies: null },
    ]);

    expect(model.items[0]).toMatchObject({ id: "1", categoryId: "2", categoryLabel: "System Design", companyLabel: "Toss", difficulty: "MEDIUM" });
    expect(model.filters.categories).toEqual([
      { id: "2", label: "System Design" },
      { id: "4", label: "Spring" },
    ]);
    expect(model.filters.difficulties.map((option) => option.id)).toEqual(["MEDIUM", "HARD"]);
  });

  it("keeps server-provided filters when present", () => {
    const model = mapPracticeListResponseDtoToModel({
      items: [{ id: "q1", title: "Legacy item", prompt: "p", category: "Backend" }],
      filters: { categories: [{ id: "backend", label: "Backend" }] },
    });

    expect(model.items[0].categoryLabel).toBe("Backend");
    expect(model.filters.categories).toEqual([{ id: "backend", label: "Backend" }]);
  });
});
