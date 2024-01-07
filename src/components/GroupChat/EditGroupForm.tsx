import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  InputBase,
  Typography,
  useTheme,
  Slider,
  Avatar,
} from "@mui/material";
import WarningRoundedIcon from "@mui/icons-material/WarningRounded";
import { useForm, Controller, SubmitHandler } from "react-hook-form";
import axios, { AxiosError, AxiosResponse } from "axios";
import { useEffect, useState, memo, useRef, useMemo } from "react";
import CloseIcon from "@mui/icons-material/Close";
import AvatarEditor from "react-avatar-editor";
import { MuiFileInput } from "mui-file-input";
import AddPhotoAlternateRoundedIcon from "@mui/icons-material/AddPhotoAlternateRounded";
import { ErrorInterface, ErrorResponse } from "../types/Error";
import { transformError } from "../utils/transformError";
import UserList from "../UtilityComponents/UserList";
import LoadingScreen from "../UtilityComponents/LoadingScreen";
import {
  GroupChatResponse,
  GroupChatWithoutLatestMessage,
} from "../types/Chat";
import { useQueryClient } from "@tanstack/react-query";
import { User } from "../types/User";
import getPublicIdFromUrl from "../utils/getPublicIdFromUrl";
import convertCanvasToImageBlob from "../utils/convertCanvasToImageBlob";

interface IFormInput {
  name: string;
}

type setShowGroupFormType = React.Dispatch<React.SetStateAction<boolean>>;

const EditGroupForm = memo(function EditGroupForm({
  setShowGroupForm,
  groupChat,
}: {
  setShowGroupForm: setShowGroupFormType;
  groupChat: GroupChatWithoutLatestMessage;
}) {
  const memoizedGroupChat = useMemo(() => groupChat, [groupChat]);
  const queryClient = useQueryClient();
  const user: User = queryClient.getQueryData(["userData"])!;
  const alreadySelectedUserList = useMemo(
    () =>
      memoizedGroupChat.users.filter(
        (groupChatUser) => groupChatUser !== user._id
      ),
    [memoizedGroupChat.users, user._id]
  );
  const theme = useTheme();
  const [selectedUserList, setSelectedUserList] = useState<string[]>(
    alreadySelectedUserList
  );
  const [errorMessage, setErrorMessage] = useState("");
  const [scale, setScale] = useState(1);
  const imageEditor = useRef<AvatarEditor>(null!);
  const [image, setImage] = useState<File | null>(null);
  const [imageErrorMessage, setImageErrorMessage] = useState("");
  const [isEditingGroup, setIsEditingGroup] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  const {
    setError,
    formState: { errors },
    handleSubmit,
    control,
  } = useForm({
    defaultValues: {
      name: memoizedGroupChat.name,
    },
  });

  const editGroupChat = async (data: IFormInput, image: Blob | null) => {
    try {
      const formData = new FormData();
      formData.append("name", data.name);
      formData.append("_id", memoizedGroupChat._id);
      formData.append("users", JSON.stringify(selectedUserList));
      if (memoizedGroupChat.image !== null)
        formData.append(
          "prevImageId",
          getPublicIdFromUrl(memoizedGroupChat.image)
        );
      if (image) {
        formData.append("image", image);
      }

      const response: AxiosResponse<GroupChatResponse> = await axios.put(
        "http://localhost:8000/group-chat",
        formData,
        {
          withCredentials: true,
        }
      );
      const groupChat = response.data.groupChat;
      if (groupChat) {
        setShowGroupForm(false);
      }
    } catch (err) {
      const error = err as AxiosError;
      const result = error.response?.data as ErrorResponse;
      const errors: ErrorInterface[] = result.errors ?? [];
      const formattedErrors = transformError(errors);

      if (formattedErrors.users) {
        setErrorMessage(formattedErrors.users[0]);
      }
      if (formattedErrors.name) {
        setError("name", {
          type: "server",
          message: formattedErrors.name[0],
        });
      }
      if (formattedErrors.image) {
        setImageErrorMessage(formattedErrors.image[0]);
      }
    } finally {
      setIsEditingGroup(false);
    }
  };

  useEffect(() => {
    if (selectedUserList.length > 0) setErrorMessage("");
  }, [selectedUserList]);

  const onSubmit: SubmitHandler<IFormInput> = async (data) => {
    let image1: Blob | null = null;
    if (selectedUserList.length === 0) {
      setErrorMessage("At least one user must be specified");
      setTimeout(() => {
        formRef.current?.scrollIntoView({
          behavior: "smooth",
        });
      }, 0);

      return;
    }

    setIsEditingGroup(true);
    if (imageEditor.current)
      image1 = await convertCanvasToImageBlob(imageEditor);

    await editGroupChat(data, image1);
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
      onClose={() => setShowGroupForm(false)}
      fullWidth={true}
    >
      <IconButton
        aria-label="close"
        onClick={() => setShowGroupForm(false)}
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
        Edit group chat
      </DialogTitle>
      <DialogContent
        sx={{
          p: 2,
          width: "100%",
          visibility: !isEditingGroup ? "visible" : "hidden",
        }}
      >
        <form className="flex flex-col items-center pt-2" ref={formRef}>
          <Controller
            name="name"
            control={control}
            rules={{
              required: "Name must be specified",
              maxLength: {
                value: 25,
                message: "Name can't exceed 25 characters",
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
                  placeholder="Name"
                  inputProps={{ "aria-label": "name", maxLength: 25 }}
                  {...field}
                  error={errors.name ? true : false}
                />
              </Box>
            )}
          />
          <Typography
            sx={{
              color: "#f44336",
              visibility: `${errors.name ? "visible" : "hidden"}`,
              textAlign: "center",
            }}
          >
            <WarningRoundedIcon />
            {errors.name?.message}
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
              display: !isEditingGroup ? "inline-flex" : "none",
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
          {memoizedGroupChat.image && (
            <Box
              sx={{
                display: "flex",
                mr: "auto",
                gap: 2,
                alignItems: "center",
                mb: 2,
              }}
            >
              <Typography variant="h6">Current group image:</Typography>
              <Avatar
                src={memoizedGroupChat.image}
                sx={{ width: 50, height: 50 }}
              />
            </Box>
          )}

          <UserList
            setSelectedUserList={setSelectedUserList}
            errorMessage={errorMessage}
            selectedUserList={selectedUserList}
            prevSelectedUserList={alreadySelectedUserList}
            excludeUser={memoizedGroupChat.creator}
          />
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
          disabled={isEditingGroup}
        >
          Edit
        </Button>
      </DialogActions>
      {isEditingGroup && <LoadingScreen />}
    </Dialog>
  );
});

export default EditGroupForm;
