import React, { useEffect, useContext } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { AuthContext } from "../../contexts/AuthContext";
import { useLoginViaTokenMutation } from "../../services/api-services/auth";
import { CircularProgress } from "@mui/material";

const LoginViaToken = () => {
  const { handleLogin } = useContext(AuthContext);
  const location = useLocation();
  const navigate = useNavigate();
  const [loginViaToken, { isLoading }] = useLoginViaTokenMutation();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const token = params.get("token");
    const link = params.get("link");

    if (token) {
      loginViaToken({ token })
        .then((response) => {
          // console.log("response", response);
          if (response?.data?.token && response?.data?.user) {
            handleLogin({
              token: response.data.token,
              userId: response.data.user.userId,
              username: response.data.user.username,
              userrole: response.data.user.userrole,
            });
            setTimeout(() => {
              navigate(link || "/");
            }, 1000);
          }
        })
        .catch(() => {
          navigate("/login");
        });
    }
  }, [location, loginViaToken, navigate, handleLogin]);

  if (isLoading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
        }}
      >
        <CircularProgress />
      </div>
    );
  }

  return null;
};

export default LoginViaToken;
