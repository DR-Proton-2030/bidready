import { act, render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import Home from "@/components/home/Home";

beforeAll(() => {
  jest.useFakeTimers();
  jest.setSystemTime(new Date("2025-08-31T23:59:50")); 
});

afterAll(() => {
  jest.useRealTimers(); 
});

describe("Countdown Timer in Home Page", () => {
  it("renders countdown with initial values", () => {
    render(<Home />);

    const days = screen.getByText(/Days/i).previousSibling;
    const hours = screen.getByText(/Hours/i).previousSibling;
    const minutes = screen.getByText(/Minutes/i).previousSibling;
    const seconds = screen.getByText(/Seconds/i).previousSibling;

    expect(days?.textContent).toBe("0");
    expect(hours?.textContent).toBe("00");
    expect(minutes?.textContent).toBe("00");
    expect(seconds?.textContent).toBe("10");
  });

  it("updates countdown after 2 seconds", () => {
    render(<Home />);

    act(() => {
      jest.advanceTimersByTime(2000); 
    });

    const seconds = screen.getByText(/Seconds/i).previousSibling;
    expect(seconds?.textContent).toBe("08");
  });
});
