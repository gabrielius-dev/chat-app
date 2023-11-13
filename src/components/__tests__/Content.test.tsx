import { act, render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import Content from "../Content";
import { MockedFunction, test, vi } from "vitest";
import axios from "axios";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { createTestQueryClient } from "../utils/tests-utils";
import { QueryClientProvider } from "@tanstack/react-query";

vi.mock("axios");

const queryClient = createTestQueryClient();

afterEach(() => {
  queryClient.clear();
});

test("Change from Login to SignUp component", async () => {
  (axios.get as MockedFunction<typeof axios.get>).mockResolvedValue({
    data: { user: null },
  });

  render(
    <MemoryRouter>
      <QueryClientProvider client={queryClient}>
        <Content />
      </QueryClientProvider>
    </MemoryRouter>
  );

  expect(
    screen.getByRole("heading", { level: 4, name: "Login" })
  ).toBeInTheDocument();

  await act(async () => {
    await new Promise((resolve) => setTimeout(resolve, 0));
  });

  expect(
    screen.getByRole("heading", { level: 4, name: "Login" })
  ).toBeInTheDocument();

  await userEvent.click(screen.getByRole("link", { name: "Sign up" }));

  expect(screen.getByText("Already have an account?")).toBeInTheDocument();
});

test("Change from SignUp to Login component", async () => {
  (axios.get as MockedFunction<typeof axios.get>).mockResolvedValue({
    data: { user: null },
  });

  render(
    <MemoryRouter>
      <QueryClientProvider client={queryClient}>
        <Content />
      </QueryClientProvider>
    </MemoryRouter>
  );

  expect(
    screen.getByRole("heading", { level: 4, name: "Login" })
  ).toBeInTheDocument();

  await act(async () => {
    await new Promise((resolve) => setTimeout(resolve, 0));
  });

  expect(
    screen.getByRole("heading", { level: 4, name: "Login" })
  ).toBeInTheDocument();

  await userEvent.click(screen.getByRole("link", { name: "Sign up" }));

  expect(screen.getByText("Already have an account?")).toBeInTheDocument();

  await userEvent.click(screen.getByRole("link", { name: "Login" }));

  expect(screen.getByText("Don't have an account?")).toBeInTheDocument();
});
