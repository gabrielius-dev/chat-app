import {
  Button,
  FormControl,
  IconButton,
  InputAdornment,
  InputLabel,
  OutlinedInput,
  Typography,
  useTheme,
} from "@mui/material";
import WarningRoundedIcon from "@mui/icons-material/WarningRounded";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import { useForm, Controller, SubmitHandler } from "react-hook-form";
import { useState } from "react";
import axios, { AxiosResponse, AxiosError } from "axios";
import { ErrorInterface, ErrorResponse } from "../types/Error";
import { User, UserResponse } from "../types/User";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { transformError } from "../utils/transformError";
import CustomTextField from "../UtilityComponents/CustomTextField";

interface IFormInput {
  username: string;
  password: string;
}

function Login() {
  const theme = useTheme();
  const [showPassword, setShowPassword] = useState(false);
  const {
    setError,
    formState: { errors },
    handleSubmit,
    control,
  } = useForm({
    defaultValues: {
      username: "",
      password: "",
    },
  });

  const queryClient = useQueryClient();

  const loginUser = async (data: IFormInput) => {
    const encodedData = Object.entries(data)
      .map(
        ([key, value]) =>
          `${encodeURIComponent(key)}=${encodeURIComponent(value as string)}`
      )
      .join("&");
    const response: AxiosResponse<UserResponse> = await axios.post(
      `${import.meta.env.VITE_BACK_END_URL}/login`,
      encodedData,
      {
        withCredentials: true,
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );
    return response.data.user;
  };

  const handleError = (err: unknown) => {
    const error = err as AxiosError;
    const result = error.response?.data as ErrorResponse;
    const errors: ErrorInterface[] = result.errors ?? [];
    const formattedErrors = transformError(errors);
    if (formattedErrors.password) {
      setError("password", {
        type: "server",
        message: formattedErrors.password[0],
      });
    }
    if (formattedErrors.username) {
      setError("username", {
        type: "server",
        message: formattedErrors.username[0],
      });
    }
  };

  const handleSuccess = (data: User) => {
    queryClient.setQueryData(["userData"], data);
  };

  const mutation = useMutation({
    mutationFn: loginUser,
    onError: handleError,
    onSuccess: handleSuccess,
  });

  const onSubmit: SubmitHandler<IFormInput> = (data) => {
    mutation.mutate(data);
  };

  const handleClickShowPassword = () => setShowPassword((show) => !show);

  const handleMouseDownPassword = (event: React.MouseEvent) => {
    event.preventDefault();
  };

  async function handleGuestLogin() {
    const data = { username: "Guest User", password: "guest" };
    const encodedData = Object.entries(data)
      .map(
        ([key, value]) =>
          `${encodeURIComponent(key)}=${encodeURIComponent(value)}`
      )
      .join("&");
    const response: AxiosResponse<UserResponse> = await axios.post(
      `${import.meta.env.VITE_BACK_END_URL}/login`,
      encodedData,
      {
        withCredentials: true,
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );
    queryClient.setQueryData(["userData"], response.data.user);
  }

  return (
    <form
      className="flex flex-col items-center mb-8"
      // eslint-disable-next-line @typescript-eslint/no-misused-promises
      onSubmit={handleSubmit(onSubmit)}
    >
      <Typography
        variant="h4"
        sx={{
          mb: 2,
          color: theme.deepBlue,
          fontWeight: "bold",
        }}
        data-testid="login-heading"
      >
        Login
      </Typography>
      <Controller
        name="username"
        control={control}
        rules={{
          required: "Username must be specified",
          maxLength: {
            value: 25,
            message: "Username can't exceed 25 characters",
          },
        }}
        render={({ field }) => (
          <CustomTextField
            inputProps={{ maxLength: 25 }}
            {...field}
            label="Username"
            variant="outlined"
            error={errors.username ? true : false}
          />
        )}
      />
      <Typography
        sx={{
          color: "#f44336",
          visibility: `${errors.username ? "visible" : "hidden"}`,
          textAlign: "center",
        }}
        data-testid="username-error-element"
      >
        <WarningRoundedIcon />
        {errors.username?.message}
      </Typography>

      <Controller
        name="password"
        control={control}
        rules={{
          required: "Password must be specified",
          maxLength: {
            value: 100,
            message: "Password can't exceed 100 characters",
          },
        }}
        render={({ field }) => (
          <FormControl
            sx={{
              m: 1,
              width: "25ch",
              "& label.Mui-focused": {
                color: theme.deepBlue,
              },
              "& .MuiInput-underline:after": {
                borderBottomColor: theme.deepBlue,
              },
              "& .MuiInputLabel-root": {
                color: theme.deepBlue,
              },
              "& .MuiInputLabel-root.Mui-error": {
                color: "#f44336",
              },
              "& .MuiInputLabel-root.Mui-focused": {
                color: theme.deepBlue,
              },

              "&:hover .MuiInputLabel-root": {
                color: theme.deepBlue,
              },
              "& .MuiOutlinedInput-root": {
                "& fieldset": {
                  borderColor: theme.deepBlue,
                },
                "&:hover fieldset": {
                  borderColor: theme.deepBlue,
                },
                "&.Mui-focused fieldset": {
                  borderColor: theme.deepBlue,
                },
              },
            }}
            variant="outlined"
            {...field}
            error={errors.password ? true : false}
          >
            <InputLabel htmlFor="password">Password</InputLabel>
            <OutlinedInput
              id="password"
              type={showPassword ? "text" : "password"}
              inputProps={{ maxLength: 100 }}
              endAdornment={
                <InputAdornment position="end">
                  <IconButton
                    aria-label="toggle password visibility"
                    onClick={handleClickShowPassword}
                    onMouseDown={handleMouseDownPassword}
                    edge="end"
                  >
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              }
              label="Password"
            />
          </FormControl>
        )}
      />
      <Typography
        sx={{
          color: "#f44336",
          visibility: `${errors.password ? "visible" : "hidden"}`,
          textAlign: "center",
        }}
        data-testid="password-error-element"
      >
        <WarningRoundedIcon />
        {errors.password?.message}
      </Typography>

      <Button
        type="submit"
        variant="outlined"
        sx={{
          bgcolor: theme.deepBlue,
          color: theme.creamy,
          fontWeight: "500",
          "&:hover": {
            bgcolor: "#155e75",
          },
          borderRadius: 1,
        }}
      >
        Login
      </Button>
      <Button
        variant="outlined"
        sx={{
          bgcolor: theme.deepBlue,
          color: theme.creamy,
          fontWeight: "500",
          "&:hover": {
            bgcolor: "#155e75",
          },
          borderRadius: 1,
          mt: 2,
        }}
        onClick={() => void handleGuestLogin()}
      >
        Guest Login
      </Button>
    </form>
  );
}

export default Login;
