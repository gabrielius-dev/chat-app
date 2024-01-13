import AvatarEditor from "react-avatar-editor";
import {
  Avatar,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  InputBase,
  Slider,
  Typography,
  useTheme,
} from "@mui/material";
import {
  Dispatch,
  SetStateAction,
  useRef,
  memo,
  useState,
  useEffect,
} from "react";
import { Controller, SubmitHandler, useForm } from "react-hook-form";
import axios, { AxiosError, AxiosResponse } from "axios";
import { User, UserResponse } from "../types/User";
import { transformError } from "../utils/transformError";
import { ErrorInterface, ErrorResponse } from "../types/Error";
import { useQueryClient } from "@tanstack/react-query";
import CloseIcon from "@mui/icons-material/Close";
import WarningRoundedIcon from "@mui/icons-material/WarningRounded";
import { MuiFileInput } from "mui-file-input";
import AddPhotoAlternateRoundedIcon from "@mui/icons-material/AddPhotoAlternateRounded";
import LoadingScreen from "../UtilityComponents/LoadingScreen";
import { useParams } from "react-router-dom";
import getPublicIdFromUrl from "../utils/getPublicIdFromUrl";
import convertCanvasToImageBlob from "../utils/convertCanvasToImageBlob";

interface IFormInput {
  username: string;
  bio: string;
}

type setShowEditUserProfileFormType = Dispatch<SetStateAction<boolean>>;

const EditUserProfileForm = memo(function EditUserProfileForm({
  setShowEditUserProfileForm,
}: {
  setShowEditUserProfileForm: setShowEditUserProfileFormType;
}) {
  const theme = useTheme();
  const [scale, setScale] = useState(1);
  const imageEditor = useRef<AvatarEditor>(null!);
  const queryClient = useQueryClient();
  const user: User = queryClient.getQueryData(["userData"])!;
  const [image, setImage] = useState<File | null>(null);
  const [imageErrorMessage, setImageErrorMessage] = useState("");
  const formRef = useRef<HTMLFormElement>(null);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const { id } = useParams();

  const {
    setError,
    formState: { errors },
    handleSubmit,
    control,
  } = useForm({
    defaultValues: {
      username: user.username,
      bio: user?.bio ?? "",
    },
  });

  const editUserProfile = async (data: IFormInput, image: Blob | null) => {
    try {
      const formData = new FormData();
      formData.append("username", data.username);
      formData.append("bio", data.bio);
      if (user.img) {
        formData.append("prevImageId", getPublicIdFromUrl(user.img));
      }
      if (image) {
        formData.append("image", image);
      }

      const response: AxiosResponse<UserResponse> = await axios.put(
        `http://localhost:8000/user/${user._id}`,
        formData,
        {
          withCredentials: true,
        }
      );
      const editedUser = response.data.user;

      if (editedUser) {
        queryClient.setQueryData(["userData"], editedUser);
        queryClient.setQueryData(["userProfileData", id], editedUser);
        setShowEditUserProfileForm(false);
      }
    } catch (err) {
      console.clear();
      const error = err as AxiosError;
      const result = error.response?.data as ErrorResponse;
      const errors: ErrorInterface[] = result.errors ?? [];
      const formattedErrors = transformError(errors);

      if (formattedErrors.username) {
        setError("username", {
          type: "server",
          message: formattedErrors.username[0],
        });
      }
      if (formattedErrors.bio) {
        setError("bio", {
          type: "server",
          message: formattedErrors.bio[0],
        });
      }
      if (formattedErrors.img) {
        setImageErrorMessage(formattedErrors.img[0]);
      }
    } finally {
      setIsEditingProfile(false);
    }
  };

  const onSubmit: SubmitHandler<IFormInput> = async (data) => {
    let image1: Blob | null = null;

    setIsEditingProfile(true);
    if (imageEditor.current)
      image1 = await convertCanvasToImageBlob(imageEditor);

    await editUserProfile(data, image1);
  };

  const handleImageChange = (image: File | null) => {
    setImageErrorMessage("");
    if (image) {
      const fileSizeInBytes = image.size;
      const fileSizeInMB = fileSizeInBytes / (1024 * 1024);
      if (fileSizeInMB > 10) {
        setImageErrorMessage("Image size must be under 10MB.");
        setImage(null);
      } else setImage(image);
    } else setImage(null);
  };

  useEffect(() => {
    if (errors)
      setTimeout(() => {
        formRef.current?.scrollIntoView({
          behavior: "smooth",
        });
      }, 0);
  }, [errors]);

  return (
    <Dialog
      open={true}
      onClose={() => setShowEditUserProfileForm(false)}
      fullWidth={true}
    >
      <IconButton
        aria-label="close"
        onClick={() => setShowEditUserProfileForm(false)}
        sx={{
          position: "absolute",
          right: 8,
          top: 8,
          color: (theme) => theme.palette.grey[500],
        }}
      >
        <CloseIcon />
      </IconButton>
      <DialogTitle sx={{ borderBottom: `1px solid ${theme.lightGray}` }}>
        Edit user profile
      </DialogTitle>
      <DialogContent
        sx={{
          p: 2,
          width: "100%",
          visibility: !isEditingProfile ? "visible" : "hidden",
        }}
      >
        <form className="flex flex-col items-center pt-2" ref={formRef}>
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
              <Box
                sx={{
                  display: "flex",
                  width: "100%",
                  border: `1px solid rgba(0, 0, 0, 0.23)`,
                  borderRadius: 10,
                  mb: 1,
                  p: 1,
                }}
              >
                <InputBase
                  sx={{
                    ml: 1,
                    flex: 1,
                  }}
                  placeholder="Username"
                  inputProps={{ "aria-label": "username", maxLength: 25 }}
                  {...field}
                  error={errors.username ? true : false}
                  title={
                    user.username === "Guest User"
                      ? "Guest User username cannot be changed."
                      : undefined
                  }
                  disabled={user.username === "Guest User"}
                />
              </Box>
            )}
          />
          <Typography
            sx={{
              color: "#f44336",
              visibility: `${errors.username ? "visible" : "hidden"}`,
              textAlign: "center",
            }}
          >
            <WarningRoundedIcon />
            {errors.username?.message}
          </Typography>

          <Controller
            name="bio"
            control={control}
            rules={{
              maxLength: {
                value: 100,
                message: "Bio can't exceed 100 characters",
              },
            }}
            render={({ field }) => (
              <Box
                sx={{
                  display: "flex",
                  width: "100%",
                  border: `1px solid rgba(0, 0, 0, 0.23)`,
                  borderRadius: 10,
                  mb: 1,
                  p: 1,
                }}
              >
                <InputBase
                  sx={{
                    ml: 1,
                    flex: 1,
                  }}
                  placeholder="Bio (optional)"
                  inputProps={{ "aria-label": "bio", maxLength: 100 }}
                  {...field}
                  error={errors.bio ? true : false}
                />
              </Box>
            )}
          />
          <Typography
            sx={{
              color: "#f44336",
              visibility: `${errors.bio ? "visible" : "hidden"}`,
              textAlign: "center",
            }}
          >
            <WarningRoundedIcon />
            {errors.bio?.message}
          </Typography>

          <MuiFileInput
            placeholder="Upload image (optional)"
            value={image}
            InputProps={{
              inputProps: {
                accept: "image/*",
              },
              startAdornment: (
                <AddPhotoAlternateRoundedIcon sx={{ color: theme.deepBlue }} />
              ),
            }}
            onChange={handleImageChange}
            hideSizeText
            clearIconButtonProps={{
              title: "Remove",
              children: <CloseIcon fontSize="small" />,
            }}
            sx={{
              width: "100%",
              display: !isEditingProfile ? "inline-flex" : "none",
              "& .MuiOutlinedInput-root": {
                "& fieldset": {
                  borderColor: "rgba(0, 0, 0, 0.23)",
                },
                "&:hover fieldset": {
                  borderColor: "rgba(0, 0, 0, 0.23)",
                },
                "&.Mui-focused fieldset": {
                  borderColor: "rgba(0, 0, 0, 0.23)",
                },
              },
            }}
          />
          <Typography
            sx={{
              color: "#f44336",
              visibility: `${imageErrorMessage ? "visible" : "hidden"}`,
              textAlign: "center",
            }}
          >
            <WarningRoundedIcon />
            {imageErrorMessage}
          </Typography>

          {image && (
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                mb: 2,
                gap: 2,
              }}
            >
              <AvatarEditor
                ref={imageEditor}
                image={image}
                width={150}
                height={150}
                border={50}
                borderRadius={1000}
                color={[255, 255, 255, 0.6]}
                scale={scale}
                rotate={0}
                backgroundColor="#d3d3d3"
                style={{ backgroundColor: "#d3d3d3" }}
              />
              <Slider
                aria-label="scale"
                value={scale}
                min={1}
                max={5}
                step={0.01}
                sx={{ color: theme.deepBlue }}
                onChange={(_, newValue: number | number[]) => {
                  setScale(newValue as number);
                }}
              />
            </Box>
          )}
          {user.img && (
            <Box
              sx={{
                display: "flex",
                mr: "auto",
                gap: 2,
                alignItems: "center",
                mb: 2,
              }}
            >
              <Typography variant="h6">Current user profile image:</Typography>
              <Avatar src={user.img} sx={{ width: 50, height: 50 }} />
            </Box>
          )}
        </form>
      </DialogContent>
      <DialogActions>
        <Button
          variant="outlined"
          // eslint-disable-next-line @typescript-eslint/no-misused-promises
          onClick={handleSubmit(onSubmit)}
          sx={{
            bgcolor: theme.deepBlue,
            color: theme.creamy,
            fontWeight: "500",
            "&:hover": {
              bgcolor: "#155e75",
            },
            borderRadius: 1,
            width: "100%",
          }}
          disabled={isEditingProfile}
        >
          Edit
        </Button>
      </DialogActions>
      {isEditingProfile && <LoadingScreen />}
    </Dialog>
  );
});

export default EditUserProfileForm;
