// src/contexts/NotificationContext.js
import React, { createContext, useState, useRef, useEffect } from "react";
import { Snackbar, Alert } from "@mui/material";

export const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const timeoutRefs = useRef([]);

  const addNotification = (message, severity = "info") => {
    const id = new Date().getTime();
    const autoHideDuration = message.toLowerCase().includes("check")
      ? 5000
      : 3000;

    setNotifications((prevNotifications) => {
      if (prevNotifications.length >= 5) {
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

  useEffect(() => {
    notifications.forEach((notification) => {
      const timeoutId = setTimeout(() => {
        removeNotification(notification.id);
      }, 5000);

      timeoutRefs.current.push(timeoutId);
    });

    const currentTimeouts = [...timeoutRefs.current];

    return () => {
      currentTimeouts.forEach((id) => clearTimeout(id));
    };
  }, [notifications]);

  return (
    <NotificationContext.Provider value={{ addNotification }}>
      {children}
      {notifications.map((notification, index) => (
        <Snackbar
          key={notification.id}
          open={true}
          autoHideDuration={notification.autoHideDuration}
          anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
          style={{ bottom: `${index * 60}px` }}
        >
          <Alert severity={notification.severity} sx={{ width: "100%" }}>
            {notification.message}
          </Alert>
        </Snackbar>
      ))}
    </NotificationContext.Provider>
  );
};
