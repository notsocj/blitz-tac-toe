import { describe, expect, it } from "vitest";
import { displayTenths, formatClock, stageOf } from "./clock";

const show = (ms: number) => formatClock(displayTenths(ms));
const stage = (ms: number) => stageOf(displayTenths(ms));

describe("clock display", () => {
  it("shows minutes and seconds above ten seconds", () => {
    expect(show(60_000)).toBe("1:00");
    expect(show(30_000)).toBe("0:30");
    expect(show(29_001)).toBe("0:30");
    expect(show(10_000)).toBe("0:10");
  });

  it("shows tenths under ten seconds and zero only at zero", () => {
    expect(show(9_400)).toBe("9.4");
    expect(show(1)).toBe("0.1");
    expect(show(0)).toBe("0.0");
  });

  it("moves through the tension stages", () => {
    expect(stage(10_001)).toBe("calm");
    expect(stage(10_000)).toBe("warn");
    expect(stage(5_001)).toBe("warn");
    expect(stage(5_000)).toBe("danger");
    expect(stage(1)).toBe("danger");
    expect(stage(0)).toBe("out");
  });
});
