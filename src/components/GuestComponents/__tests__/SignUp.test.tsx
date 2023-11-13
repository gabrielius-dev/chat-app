import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import userEvent from "@testing-library/user-event";
import SignUp from "../SignUp";
import { MockedFunction, expect, test, vi } from "vitest";
import axios from "axios";
import { QueryClientProvider } from "@tanstack/react-query";
import { createTestQueryClient } from "../../utils/tests-utils";

vi.mock("axios");

const queryClient = createTestQueryClient();

afterEach(() => {
  queryClient.clear();
});

test("Submit function gets called", async () => {
  render(
    <QueryClientProvider client={queryClient}>
      <SignUp />
    </QueryClientProvider>
  );

  const userMock = { _id: "ID", username: "Username", password: "Password" };

  const usernameInput = screen.getByLabelText("Username");
  await userEvent.type(usernameInput, "test");
  expect(usernameInput).toHaveValue("test");

  const passwordInput = screen.getByLabelText("Password");
  await userEvent.type(passwordInput, "test");
  expect(passwordInput).toHaveValue("test");

  const passwordConfirmationInput = screen.getByLabelText("Confirm password");
  await userEvent.type(passwordConfirmationInput, "test");
  expect(passwordConfirmationInput).toHaveValue("test");

  (axios.post as MockedFunction<typeof axios.post>).mockResolvedValue({
    data: { user: userMock },
  });

  await userEvent.click(screen.getByRole("button", { name: "Sign up" }));

  const userData = await queryClient.getQueryData(["userData"]);
  expect(userData).toEqual(userMock);
});

test("Empty form submission", async () => {
  render(
    <QueryClientProvider client={queryClient}>
      <SignUp />
    </QueryClientProvider>
  );
  await userEvent.click(screen.getByRole("button", { name: "Sign up" }));
  const usernameError = screen.getByTestId("username-error-element");
  expect(usernameError).toHaveTextContent("Username must be specified");
  const passwordError = screen.getByTestId("password-error-element");
  expect(passwordError).toHaveTextContent("Password must be specified");
  const passwordConfirmationError = screen.getByTestId(
    "passwordConfirmation-error-element"
  );
  expect(passwordConfirmationError).toHaveTextContent(
    "Password confirmation must be specified"
  );
});

test("Display server errors", async () => {
  render(
    <QueryClientProvider client={queryClient}>
      <SignUp />
    </QueryClientProvider>
  );
  const errorMock = [
    { path: "username", message: "SERVER_ERROR" },
    { path: "password", message: "SERVER_ERROR" },
    { path: "passwordConfirmation", message: "SERVER_ERROR" },
  ];

  const usernameInput = screen.getByLabelText("Username");
  await userEvent.type(usernameInput, "test");
  expect(usernameInput).toHaveValue("test");

  const passwordInput = screen.getByLabelText("Password");
  await userEvent.type(passwordInput, "test");
  expect(passwordInput).toHaveValue("test");

  const passwordConfirmationInput = screen.getByLabelText("Confirm password");
  await userEvent.type(passwordConfirmationInput, "test");
  expect(passwordConfirmationInput).toHaveValue("test");

  (axios.post as MockedFunction<typeof axios.post>).mockRejectedValue({
    response: {
      data: { errors: errorMock },
    },
  });

  await userEvent.click(screen.getByRole("button", { name: "Sign up" }));
  const usernameError = screen.getByTestId("username-error-element");
  expect(usernameError).toHaveTextContent("SERVER_ERROR");
  const passwordError = screen.getByTestId("password-error-element");
  expect(passwordError).toHaveTextContent("SERVER_ERROR");
  const passwordConfirmationError = screen.getByTestId(
    "passwordConfirmation-error-element"
  );
  expect(passwordConfirmationError).toHaveTextContent("SERVER_ERROR");
});

test("Password visibility toggle", async () => {
  render(
    <QueryClientProvider client={queryClient}>
      <SignUp />
    </QueryClientProvider>
  );
  const togglePasswordButton = screen.getByLabelText(
    "toggle password visibility"
  );
  await userEvent.click(togglePasswordButton);

  const passwordInput = screen.getByLabelText("Password");
  expect(passwordInput).toHaveAttribute("type", "text");

  await userEvent.click(togglePasswordButton);
  expect(passwordInput).toHaveAttribute("type", "password");
});

test("Confirm password visibility toggle", async () => {
  render(
    <QueryClientProvider client={queryClient}>
      <SignUp />
    </QueryClientProvider>
  );
  const toggleConfirmPasswordButton = screen.getByLabelText(
    "toggle confirm password visibility"
  );
  await userEvent.click(toggleConfirmPasswordButton);

  const passwordInput = screen.getByLabelText("Confirm password");
  expect(passwordInput).toHaveAttribute("type", "text");

  await userEvent.click(toggleConfirmPasswordButton);
  expect(passwordInput).toHaveAttribute("type", "password");
});
