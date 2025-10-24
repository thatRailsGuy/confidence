/**
 * Smoke tests to verify testing infrastructure works
 */

describe("Testing Infrastructure", () => {
  test("Jest is working correctly", () => {
    expect(true).toBe(true);
  });

  test("DOM environment is available", () => {
    const div = document.createElement("div");
    div.textContent = "Test";
    expect(div.textContent).toBe("Test");
  });

  test("localStorage mock is working", () => {
    localStorage.setItem("test", "value");
    expect(localStorage.getItem("test")).toBe("value");
  });

  test("can create and manipulate DOM elements", () => {
    document.body.innerHTML = '<div id="test">Hello</div>';
    const element = document.getElementById("test");
    expect(element).toBeTruthy();
    expect(element.textContent).toBe("Hello");
  });

  test("can test CSS classes", () => {
    const div = document.createElement("div");
    div.className = "test-class another-class";

    expect(div.classList.contains("test-class")).toBe(true);
    expect(div.classList.contains("another-class")).toBe(true);
    expect(div.classList.contains("non-existent")).toBe(false);
  });

  test("can mock async functions", async () => {
    const mockFn = jest.fn().mockResolvedValue("success");
    const result = await mockFn();

    expect(result).toBe("success");
    expect(mockFn).toHaveBeenCalledTimes(1);
  });
});
