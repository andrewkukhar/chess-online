// src/contexts/NotificationContext.js
import React, { createContext, useState } from "react";
import { Snackbar, Alert, useMediaQuery } from "@mui/material";

export const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const isSmallScreen = useMediaQuery("(max-width:600px)");

  const addNotification = (message, severity = "info", duration = 2500) => {
    const id = new Date().getTime();
    const autoHideDuration =
      typeof duration === "number" && duration > 0 ? duration : 2500;

    setNotifications((prevNotifications) => {
      const lastNotification = prevNotifications[prevNotifications.length - 1];
      if (
        lastNotification &&
        lastNotification.message === message &&
        lastNotification.severity === severity &&
        id - lastNotification.id < 2000
      ) {
        return prevNotifications;
      }

      if (prevNotifications.length >= 3) {
        prevNotifications.shift();
      } else if (isSmallScreen && prevNotifications.length >= 2) {
        prevNotifications.shift();
      }
      return [
        ...prevNotifications,
        { id, message, severity, autoHideDuration },
      ];
    });
  };

  const removeNotification = (id) => {
    setNotifications((prevNotifications) =>
      prevNotifications.filter((notification) => notification.id !== id)
    );
  };

  return (
    <NotificationContext.Provider value={{ addNotification }}>
      {children}
      {notifications?.map((notification, index) => (
        <Snackbar
          key={notification?.id}
          open={true}
          autoHideDuration={notification?.autoHideDuration}
          anchorOrigin={{ vertical: "top", horizontal: "center" }}
          className={`notification-snackbar notification-snackbar-${
            index === 0
              ? "0"
              : index === 1
              ? "1"
              : index === 2
              ? "2"
              : index === 3
              ? "3"
              : index === 4
              ? "4"
              : index === 5
              ? "5"
              : ""
          }`}
          onClose={(event, reason) => {
            if (reason === "clickaway") {
              return;
            }
            removeNotification(notification.id);
          }}
        >
          <Alert
            severity={notification?.severity}
            className="notification-alert"
          >
            {notification?.message}
          </Alert>
        </Snackbar>
      ))}
    </NotificationContext.Provider>
  );
};
