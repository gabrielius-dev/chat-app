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
  passwordConfirmation: string;
}

function SignUp() {
  const theme = useTheme();
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConfirmation, setShowPasswordConfirmation] =
    useState(false);

  const {
    setError,
    formState: { errors },
    handleSubmit,
    control,
    watch,
  } = useForm({
    defaultValues: {
      username: "",
      password: "",
      passwordConfirmation: "",
    },
  });

  const queryClient = useQueryClient();

  const signUpUser = async (data: IFormInput) => {
    const encodedData = Object.entries(data)
      .map(
        ([key, value]) =>
          `${encodeURIComponent(key)}=${encodeURIComponent(value as string)}`
      )
      .join("&");
    const response: AxiosResponse<UserResponse> = await axios.post(
      `${import.meta.env.VITE_BACK_END_URL}/sign-up`,
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
    if (formattedErrors.passwordConfirmation) {
      setError("passwordConfirmation", {
        type: "server",
        message: formattedErrors.passwordConfirmation[0],
      });
    }
  };

  const handleSuccess = (data: User) => {
    queryClient.setQueryData(["userData"], data);
  };

  const mutation = useMutation({
    mutationFn: signUpUser,
    onError: handleError,
    onSuccess: handleSuccess,
  });

  const onSubmit: SubmitHandler<IFormInput> = (data) => {
    mutation.mutate(data);
  };

  const handleClickShowPassword = () => setShowPassword((show) => !show);
  const handleClickShowPasswordConfirmation = () =>
    setShowPasswordConfirmation((show) => !show);

  const handleMouseDownPassword = (event: React.MouseEvent) => {
    event.preventDefault();
  };

  const handleMouseDownPasswordConfirmation = (event: React.MouseEvent) => {
    event.preventDefault();
  };

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
      >
        Sign up
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
            {...field}
            inputProps={{ maxLength: 25 }}
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

      <Controller
        name="passwordConfirmation"
        control={control}
        rules={{
          required: "Password confirmation must be specified",
          maxLength: {
            value: 100,
            message: "Password confirmation can't exceed 100 characters",
          },
          validate: (value) =>
            value === watch("password") || "Passwords don't match",
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
            error={errors.passwordConfirmation ? true : false}
          >
            <InputLabel htmlFor="passwordConfirmation">
              Confirm password
            </InputLabel>
            <OutlinedInput
              id="passwordConfirmation"
              type={showPasswordConfirmation ? "text" : "password"}
              inputProps={{ maxLength: 100 }}
              endAdornment={
                <InputAdornment position="end">
                  <IconButton
                    aria-label="toggle confirm password visibility"
                    onClick={handleClickShowPasswordConfirmation}
                    onMouseDown={handleMouseDownPasswordConfirmation}
                    edge="end"
                  >
                    {showPasswordConfirmation ? (
                      <VisibilityOff />
                    ) : (
                      <Visibility />
                    )}
                  </IconButton>
                </InputAdornment>
              }
              label="Confirm password"
            />
          </FormControl>
        )}
      />
      <Typography
        sx={{
          color: "#f44336",
          visibility: `${errors.passwordConfirmation ? "visible" : "hidden"}`,
          textAlign: "center",
        }}
        data-testid="passwordConfirmation-error-element"
      >
        <WarningRoundedIcon />
        {errors.passwordConfirmation?.message}
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
        Sign up
      </Button>
    </form>
  );
}

export default SignUp;
