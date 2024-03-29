import { useQueryClient } from "@tanstack/react-query";
import { GroupMessageInterface } from "../types/Message";
import { User } from "../types/User";
import {
  Box,
  useTheme,
  Typography,
  Avatar,
  IconButton,
  Skeleton,
} from "@mui/material";
import formatCustomDate from "../utils/formatDate";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import axios, { AxiosResponse } from "axios";
import DeleteRoundedIcon from "@mui/icons-material/DeleteRounded";
import AlertNotification from "../UtilityComponents/AlertNotification";
import Lightbox from "yet-another-react-lightbox";
import "yet-another-react-lightbox/styles.css";

function Message({ message }: { message: GroupMessageInterface }) {
  const queryClient = useQueryClient();
  const theme = useTheme();
  const user: User = queryClient.getQueryData(["userData"])!;
  const [isHovered, setIsHovered] = useState(false);
  const [open, setOpen] = useState(false);
  const [isDeletingMessage, setIsDeletingMessage] = useState(false);
  const [index, setIndex] = useState(1);
  const [openImage, setOpenImage] = useState(false);
  const updateIndex = ({ index: current }: { index: number }) =>
    setIndex(current);
  const [loadingImages, setLoadingImages] = useState<number[]>([]);
  const slides = message.images?.map(({ url, width, height }) => ({
    src: url,
    width,
    height,
  }));

  useEffect(() => {
    if (message.images?.length !== undefined) {
      setLoadingImages(
        Array.from({ length: message.images.length }, (_, i) => i)
      );
    }
  }, [message.images?.length]);

  async function deleteMessage() {
    try {
      setIsDeletingMessage(true);

      const res: AxiosResponse = await axios.delete(
        `${import.meta.env.VITE_BACK_END_URL}/group-message/${message._id}`,
        { withCredentials: true }
      );
      if (res.status !== 204) setOpen(true);
    } catch (err) {
      setOpen(true);
    } finally {
      setIsDeletingMessage(false);
    }
  }

  const handleImageLoad = (index: number) => {
    setLoadingImages((prevLoadingImages) =>
      prevLoadingImages.filter((item) => item !== index)
    );
  };

  return (
    <>
      {open && (
        <AlertNotification
          message="An error occurred during while deleting message. Please try again
          later."
          type="error"
          open={open}
          setOpen={setOpen}
        />
      )}
      <Box
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        sx={{
          maxWidth: "70%",
          mb: 2,
          display: "flex",
          alignItems: "flex-end",
          ml: `${message.sender._id === user._id ? "auto" : "0"}`,
          mr: `${message.sender._id !== user._id ? "auto" : "0"}`,
          gap: 1,
        }}
      >
        <Box sx={{ alignSelf: "flex-start" }}>
          {message.sender._id !== user._id && (
            <Link to={`/user/${message.sender._id}`}>
              <Avatar
                alt="Profile picture"
                src={message.sender?.img}
                sx={{
                  width: 50,
                  height: 50,
                  bgcolor: theme.midnightNavy,
                }}
              >
                {!message.sender?.img
                  ? message.sender.username[0].toUpperCase()
                  : null}
              </Avatar>
            </Link>
          )}
        </Box>
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
          }}
        >
          {message.content && (
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1,
                ml: `${message.sender._id === user._id ? "auto" : "0"}`,
                mr: `${message.sender._id !== user._id ? "auto" : "0"}`,
              }}
            >
              {message.sender._id === user._id && (
                <IconButton
                  sx={{
                    visibility: isHovered ? "visible" : "hidden",
                    transition: "opacity 0.5s",
                    opacity: isHovered ? 1 : 0,
                  }}
                  onClick={() => void deleteMessage()}
                  disabled={isDeletingMessage}
                >
                  <DeleteRoundedIcon />
                </IconButton>
              )}

              <Box
                sx={{
                  borderRadius: 7,
                  backgroundColor: `${
                    message.sender._id === user._id ? theme.deepBlue : "white"
                  }`,
                  color: `${
                    message.sender._id === user._id ? "white" : "black"
                  }`,
                  py: 2,
                  px: 3,
                  boxShadow: 5,
                  maxWidth: "max-content",
                }}
              >
                <Typography
                  variant="body1"
                  sx={{
                    wordBreak: "break-word",
                    overflowWrap: "break-word",
                    whiteSpace: "pre-line",
                  }}
                >
                  {message.content}
                </Typography>
              </Box>
            </Box>
          )}
          {message.images && message.images.length > 0 && (
            <>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                  ml: `${message.sender._id === user._id ? "auto" : "0"}`,
                  mr: `${message.sender._id !== user._id ? "auto" : "0"}`,
                }}
              >
                {message.sender._id === user._id && (
                  <IconButton
                    sx={{
                      visibility: isHovered ? "visible" : "hidden",
                      transition: "opacity 0.5s",
                      opacity: isHovered ? 1 : 0,
                    }}
                    onClick={() => void deleteMessage()}
                    disabled={isDeletingMessage}
                  >
                    <DeleteRoundedIcon />
                  </IconButton>
                )}
                <Box
                  sx={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: "16px",
                    justifyContent: "space-between",
                  }}
                >
                  {message.images.map((image, index) => (
                    <Box
                      key={index}
                      sx={{
                        flex: "1 1 calc(25% - 16px)",
                        minWidth: "100px",
                        maxWidth: "150px",
                        maxHeight: "150px",
                        position: "relative",
                        overflow: "hidden",
                        borderRadius: "8px",
                        cursor: "pointer",
                      }}
                      onClick={() => {
                        updateIndex({ index });
                        setOpenImage(true);
                      }}
                    >
                      {loadingImages.includes(index) && (
                        <Skeleton
                          variant="rectangular"
                          animation="wave"
                          style={{
                            width: "clamp(80px,150px,36vw)",
                            height: "clamp(80px,150px,36vw)",
                            maxWidth: "100%",
                            maxHeight: "100%",
                          }}
                        />
                      )}
                      <img
                        src={image.url}
                        alt={`Image ${index}`}
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                        }}
                        onLoad={() => handleImageLoad(index)}
                      />
                    </Box>
                  ))}
                </Box>
              </Box>
              <Lightbox
                slides={slides}
                open={openImage}
                index={index}
                close={() => setOpenImage(false)}
                on={{ view: updateIndex }}
                styles={{
                  container: {
                    backgroundColor: "rgba(0, 0, 0, 0.9)",
                  },
                }}
                controller={{
                  closeOnPullDown: true,
                  closeOnBackdropClick: true,
                }}
              />
            </>
          )}
          <Typography
            sx={{
              color: "rgba(0, 0, 0, 0.6)",
              ml: `${message.sender._id === user._id ? "auto" : "0"}`,
              mr: `${message.sender._id !== user._id ? "auto" : "0"}`,
            }}
          >
            {formatCustomDate(message.createdAt)}
          </Typography>
        </Box>
      </Box>
    </>
  );
}

export default Message;
