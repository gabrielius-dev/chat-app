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
} from "@mui/material";
import WarningRoundedIcon from "@mui/icons-material/WarningRounded";
import { useForm, Controller, SubmitHandler } from "react-hook-form";
import axios, { AxiosResponse, AxiosError } from "axios";
import { GroupChatResponse } from "../../types/Chat";
import { ErrorInterface, ErrorResponse } from "../../types/Error";
import { transformError } from "../../utils/transformError";
import UserList from "./UserList";
import { useEffect, useState, memo, useRef } from "react";
import CloseIcon from "@mui/icons-material/Close";
import AvatarEditor from "react-avatar-editor";
import { MuiFileInput } from "mui-file-input";
import AddPhotoAlternateRoundedIcon from "@mui/icons-material/AddPhotoAlternateRounded";
import LoadingScreen from "../LoadingScreen";

interface IFormInput {
  name: string;
}

type setShowGroupFormType = React.Dispatch<React.SetStateAction<boolean>>;

const CreateGroupForm = memo(function CreateGroupForm({
  setShowGroupForm,
}: {
  setShowGroupForm: setShowGroupFormType;
}) {
  const theme = useTheme();
  const [selectedUserList, setSelectedUserList] = useState<string[]>([]);
  const [errorMessage, setErrorMessage] = useState("");
  const [scale, setScale] = useState(1);
  const imageEditor = useRef<AvatarEditor | null>(null);
  const [image, setImage] = useState<File | null>(null);
  const [imageErrorMessage, setImageErrorMessage] = useState("");
  const [isCreatingGroup, setIsCreatingGroup] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  const {
    setError,
    formState: { errors },
    handleSubmit,
    control,
  } = useForm({
    defaultValues: {
      name: "",
    },
  });

  const createGroupChat = async (data: IFormInput, image: File | null) => {
    try {
      const formData = new FormData();
      formData.append("name", data.name);
      formData.append("users", JSON.stringify(selectedUserList));
      if (image) {
        formData.append("image", image);
      }

      const response: AxiosResponse<GroupChatResponse> = await axios.post(
        "http://localhost:8000/group-chat",
        formData,
        { withCredentials: true }
      );
      setShowGroupForm(false);
      return response.data;
    } catch (err) {
      console.clear();
      const error = err as AxiosError;
      const result = error.response?.data as ErrorResponse;
      const errors: ErrorInterface[] = result.errors ?? [];
      const formattedErrors = transformError(errors);

      setTimeout(() => {
        formRef.current?.scrollIntoView({
          behavior: "smooth",
        });
      }, 0);

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
      setIsCreatingGroup(false);
    }
  };

  useEffect(() => {
    if (selectedUserList.length > 0) setErrorMessage("");
  }, [selectedUserList]);

  const onSubmit: SubmitHandler<IFormInput> = async (data) => {
    let image1: File | null = null;

    if (selectedUserList.length === 0) {
      setErrorMessage("At least one user must be specified");
      return;
    }

    setIsCreatingGroup(true);
    if (imageEditor.current) {
      const canvas: HTMLCanvasElement = imageEditor.current.getImage();
      const dataURL: string | null = canvas.toDataURL();

      if (dataURL) {
        const res = await fetch(dataURL);
        const blob = await res.blob();
        const originalFileName = image?.name ?? "image.png";

        image1 = new File([blob], originalFileName, { type: blob.type });
      }
    }

    await createGroupChat(data, image1);
  };

  const handleImageChange = (image: File | null) => {
    setImage(image);
  };

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
        Create group chat
      </DialogTitle>
      <DialogContent
        sx={{
          p: 2,
          width: "100%",
          visibility: !isCreatingGroup ? "visible" : "hidden",
        }}
      >
        <form className="flex flex-col items-center pt-2" ref={formRef}>
          <Controller
            name="name"
            control={control}
            rules={{
              required: "Name must be specified",
              maxLength: {
                value: 100,
                message: "Name can't exceed 100 characters",
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
                  inputProps={{ "aria-label": "name", maxLength: 100 }}
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
            sx={{ width: "100%" }}
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

          <UserList
            setSelectedUserList={setSelectedUserList}
            errorMessage={errorMessage}
            selectedUserList={selectedUserList}
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
          disabled={isCreatingGroup}
        >
          Create
        </Button>
      </DialogActions>
      {isCreatingGroup && <LoadingScreen />}
    </Dialog>
  );
});

export default CreateGroupForm;
