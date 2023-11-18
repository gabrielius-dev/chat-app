import { render, screen, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import Main from "../Main";
import { MockedFunction, test, vi } from "vitest";
import axios from "axios";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { QueryClientProvider } from "@tanstack/react-query";
import { createTestQueryClient } from "../../utils/tests-utils";

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
        <Main />
      </QueryClientProvider>
    </MemoryRouter>
  );

  await waitFor(() => {
    expect(
      screen.getByRole("heading", { level: 4, name: "Login" })
    ).toBeInTheDocument();
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
        <Main />
      </QueryClientProvider>
    </MemoryRouter>
  );

  await waitFor(() => {
    expect(
      screen.getByRole("heading", { level: 4, name: "Login" })
    ).toBeInTheDocument();
  });

  expect(
    screen.getByRole("heading", { level: 4, name: "Login" })
  ).toBeInTheDocument();

  await userEvent.click(screen.getByRole("link", { name: "Sign up" }));

  expect(screen.getByText("Already have an account?")).toBeInTheDocument();

  await userEvent.click(screen.getByRole("link", { name: "Login" }));

  expect(screen.getByText("Don't have an account?")).toBeInTheDocument();
});
