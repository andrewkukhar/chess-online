// src/contexts/NotificationContext.js
import React, { createContext, useState, useCallback } from "react";
import { Snackbar, Alert, useMediaQuery } from "@mui/material";

export const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const isSmallScreen = useMediaQuery("(max-width:600px)");
  // console.log("NotificationProvider DEBUG: init: notifications", notifications);
  const addNotification = useCallback(
    (message, severity = "info", duration = 2500) => {
      const id = new Date().getTime();
      const autoHideDuration =
        typeof duration === "number" && duration > 0 ? duration : 2500;

      setNotifications((prevNotifications) => {
        const lastNotification =
          prevNotifications[prevNotifications.length - 1];
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
          { id, message, severity, autoHideDuration, open: true },
        ];
      });
    },
    [isSmallScreen]
  );
  // console.log(
  //   "NotificationProvider DEBUG: first chnages: notifications",
  //   notifications
  // );

  const handleCloseNotification = (id, reason) => {
    if (reason === "clickaway") {
      return;
    }

    setNotifications((prevNotifications) =>
      prevNotifications.map((notification) =>
        notification.id === id ? { ...notification, open: false } : notification
      )
    );
  };

  const handleExitedNotification = (id) => {
    setNotifications((prevNotifications) =>
      prevNotifications.filter((notification) => notification.id !== id)
    );
  };

  const clearNotifications = useCallback(() => {
    setNotifications([]);
  }, []);
  // console.log(
  //   "NotificationProvider DEBUG: last chnages: notifications",
  //   notifications
  // );

  return (
    <NotificationContext.Provider
      value={{ addNotification, clearNotifications }}
    >
      {children}
      {notifications?.map((notification, index) => (
        <Snackbar
          key={notification?.id}
          open={notification.open}
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
            handleCloseNotification(notification.id, reason);
          }}
          TransitionProps={{
            onExited: () => {
              handleExitedNotification(notification.id);
            },
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
