import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import userEvent from "@testing-library/user-event";
import { MockedFunction, expect, test, vi } from "vitest";
import axios from "axios";
import { QueryClientProvider } from "@tanstack/react-query";
import Login from "../../GuestComponents/Login";
import Header from "../Header";
import { createTestQueryClient } from "../../utils/tests-utils";
import { MemoryRouter } from "react-router-dom";
vi.mock("axios");

const queryClient = createTestQueryClient();
const userMock = { _id: "ID", username: "Username", password: "Password" };
queryClient.setQueryData(["userData"], userMock);

afterEach(() => {
  queryClient.clear();
});

test("Logs out successfully", async () => {
  render(
    <MemoryRouter>
      <QueryClientProvider client={queryClient}>
        <Login />
        <Header />
      </QueryClientProvider>
    </MemoryRouter>
  );

  const usernameInput = screen.getByLabelText("Username");
  await userEvent.type(usernameInput, "test");
  expect(usernameInput).toHaveValue("test");

  const passwordInput = screen.getByLabelText("Password");
  await userEvent.type(passwordInput, "test");
  expect(passwordInput).toHaveValue("test");

  await userEvent.click(screen.getByRole("button", { name: "Login" }));

  const userData = await queryClient.getQueryData(["userData"]);
  expect(userData).toEqual(userMock);

  (axios.post as MockedFunction<typeof axios.post>).mockResolvedValueOnce({
    data: { success: true, message: "Log out successful" },
  });
  await userEvent.click(screen.getByTestId("popup-open"));

  const logoutButton = screen.getByText("Logout");
  expect(logoutButton).toBeInTheDocument();
  await userEvent.click(logoutButton);
  const emptyUser = queryClient.getQueryData(["userData"]);
  expect(emptyUser).toEqual(null);
});
