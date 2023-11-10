import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import userEvent from "@testing-library/user-event";
import Login from "../Login";
import { MockedFunction, expect, test, vi } from "vitest";
import axios from "axios";

vi.mock("axios");

test("Submit function gets called", async () => {
  const setUserMock = vi.fn();
  render(<Login setUser={setUserMock} />);

  const userMock = { _id: "ID", username: "Username", password: "Password" };

  const usernameInput = screen.getByLabelText("Username");
  await userEvent.type(usernameInput, "test");
  expect(usernameInput).toHaveValue("test");

  const passwordInput = screen.getByLabelText("Password");
  await userEvent.type(passwordInput, "test");
  expect(passwordInput).toHaveValue("test");

  (axios.post as MockedFunction<typeof axios.post>).mockResolvedValue({
    data: { user: userMock },
  });

  await userEvent.click(screen.getByRole("button", { name: "Login" }));

  expect(setUserMock).toHaveBeenCalledWith(userMock);
});

test("Empty form submission", async () => {
  const setUserMock = vi.fn();
  render(<Login setUser={setUserMock} />);
  await userEvent.click(screen.getByRole("button", { name: "Login" }));
  const usernameError = screen.getByTestId("username-error-element");
  expect(usernameError).toHaveTextContent("Username must be specified");
  const passwordError = screen.getByTestId("password-error-element");
  expect(passwordError).toHaveTextContent("Password must be specified");
});

test("Display server errors", async () => {
  const setUserMock = vi.fn();
  render(<Login setUser={setUserMock} />);

  const errorMock = [
    { path: "username", message: "SERVER_ERROR" },
    { path: "password", message: "SERVER_ERROR" },
  ];

  const usernameInput = screen.getByLabelText("Username");
  await userEvent.type(usernameInput, "test");
  expect(usernameInput).toHaveValue("test");

  const passwordInput = screen.getByLabelText("Password");
  await userEvent.type(passwordInput, "test");
  expect(passwordInput).toHaveValue("test");

  (axios.post as MockedFunction<typeof axios.post>).mockRejectedValue({
    response: {
      data: { errors: errorMock },
    },
  });

  await userEvent.click(screen.getByRole("button", { name: "Login" }));
  const usernameError = screen.getByTestId("username-error-element");
  expect(usernameError).toHaveTextContent("SERVER_ERROR");
  const passwordError = screen.getByTestId("password-error-element");
  expect(passwordError).toHaveTextContent("SERVER_ERROR");
});

test("Password visibility toggle", async () => {
  const setUserMock = vi.fn();

  render(<Login setUser={setUserMock} />);

  const togglePasswordButton = screen.getByLabelText(
    "toggle password visibility"
  );
  await userEvent.click(togglePasswordButton);

  const passwordInput = screen.getByLabelText("Password");
  expect(passwordInput).toHaveAttribute("type", "text");

  await userEvent.click(togglePasswordButton);
  expect(passwordInput).toHaveAttribute("type", "password");
});
