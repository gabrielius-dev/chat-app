import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import Main from "../Main";
import { test, vi } from "vitest";
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
  render(
    <MemoryRouter>
      <QueryClientProvider client={queryClient}>
        <Main />
      </QueryClientProvider>
    </MemoryRouter>
  );

  const loginHeading = screen.getByTestId("login-heading");
  expect(loginHeading).toBeInTheDocument();

  await userEvent.click(screen.getByTestId("sign-up-login-link"));

  expect(screen.getByText("Already have an account?")).toBeInTheDocument();
});

test("Change from SignUp to Login component", async () => {
  render(
    <MemoryRouter>
      <QueryClientProvider client={queryClient}>
        <Main />
      </QueryClientProvider>
    </MemoryRouter>
  );

  const loginHeading = screen.getByTestId("login-heading");
  expect(loginHeading).toBeInTheDocument();

  await userEvent.click(screen.getByTestId("sign-up-login-link"));

  expect(screen.getByText("Already have an account?")).toBeInTheDocument();

  await userEvent.click(screen.getByTestId("sign-up-login-link"));

  expect(screen.getByText("Don't have an account?")).toBeInTheDocument();
});
