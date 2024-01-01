import { useQueryClient, useQuery } from "@tanstack/react-query";
import { DatabaseUserResponse, User as UserInterface } from "../types/User";
import {
  useEffect,
  useState,
  useContext,
  Dispatch,
  SetStateAction,
} from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios, { AxiosResponse } from "axios";
import WindowFocusContext from "../../context/WindowsFocusContext";
import EditUserProfileForm from "./EditUserProfileForm";
import {
  Avatar,
  Box,
  Button,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import ProfileDetailsSvg from "../UtilityComponents/ProfileDetailsSvg";

type setOpenType = Dispatch<SetStateAction<boolean>>;

export default function User({
  open,
  setOpen,
}: {
  open: boolean;
  setOpen: setOpenType;
}) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const currentUser: UserInterface = queryClient.getQueryData(["userData"])!;
  const { id } = useParams();
  const isWindowFocused = useContext(WindowFocusContext);
  const [showEditUserProfileForm, setShowEditUserProfileForm] = useState(false);
  const [canEditUserProfile, setCanEditUserProfile] = useState(false);

  async function getUserProfile() {
    const response: AxiosResponse<DatabaseUserResponse> = await axios.get(
      `http://localhost:8000/user/${id}`,
      { withCredentials: true }
    );

    return response.data.user;
  }

  const { data: user, isLoading: isLoadingUser } = useQuery<
    UserInterface | undefined,
    Error
  >({
    queryKey: ["userProfileData", id],
    queryFn: getUserProfile,
    retry: false,
    refetchInterval: isWindowFocused ? 1000 * 60 : false,
  });

  useEffect(() => {
    if (user?._id === currentUser._id) {
      setCanEditUserProfile(true);
    }
  }, [currentUser._id, user?._id]);

  useEffect(() => {
    if (!user && !isLoadingUser) {
      navigate("/user-not-found");
    }
  }, [isLoadingUser, navigate, user]);

  const theme = useTheme();

  const isSmallScreen = useMediaQuery(theme.breakpoints.up("sm"));
  useEffect(() => {
    setOpen(isSmallScreen);
  }, [isSmallScreen, setOpen]);

  return (
    <>
      {user && (
        <Box
          sx={{
            display: open && !isSmallScreen ? "none" : "flex",
            width: "100%",
            overflow: "auto",
            p: 1,
            flexDirection: "column",
            alignItems: "center",
            gap: 2,
          }}
        >
          <Typography
            variant="h3"
            sx={{
              fontFamily: "Montserrat",
              textAlign: "center",
              mb: 3,
              color: theme.midnightNavy,
            }}
          >
            {currentUser._id === user._id ? "My Profile" : "User Profile"}
          </Typography>
          <Box
            sx={{
              display: "flex",
              width: "100%",
              flexDirection: "column",
              alignItems: "center",
              gap: 1,
            }}
          >
            <Avatar
              alt="Profile picture"
              src={user?.img ?? undefined}
              sx={{
                width: 100,
                height: 100,
                bgcolor: theme.midnightNavy,
                fontSize: "64px",
              }}
            >
              {!user?.img ? user?.username[0].toUpperCase() : null}
            </Avatar>

            <Typography variant="h5" sx={{ wordBreak: "break-all" }}>
              {user.username}
            </Typography>
            {user.bio && (
              <Typography variant="subtitle1" sx={{ wordBreak: "break-all" }}>
                {user.bio}
              </Typography>
            )}
          </Box>
          {canEditUserProfile && (
            <Button
              onClick={() => setShowEditUserProfileForm(true)}
              variant="outlined"
              sx={{
                bgcolor: theme.deepBlue,
                color: theme.creamy,
                fontWeight: "bold",
                "&:hover": {
                  bgcolor: "#155e75",
                },
                textTransform: "none",
                borderRadius: 50,
              }}
            >
              Edit Profile
            </Button>
          )}
          <Box
            sx={{
              width: "100%",
              display: "flex",
              mt: "auto",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <ProfileDetailsSvg />
          </Box>
          {showEditUserProfileForm && (
            <EditUserProfileForm
              setShowEditUserProfileForm={setShowEditUserProfileForm}
            />
          )}
        </Box>
      )}
    </>
  );
}
