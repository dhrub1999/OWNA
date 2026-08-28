"use client";

import { useEffect } from "react";
import { driver } from "driver.js";
import "driver.js/dist/driver.css";

export function DashboardTour() {
  useEffect(() => {
    const hasSeenTour = localStorage.getItem("dashboard-tour-seen");

    if (!hasSeenTour) {
      const driverObj = driver({
        showProgress: true,
        animate: true,
        popoverClass: "driverjs-theme",
        steps: [
          {
            element: "#tour-activation",
            popover: {
              title: "Complete your setup",
              description: "Follow these steps to fully set up your profile. You can always come back to this checklist.",
              side: "right",
              align: "start"
            }
          },
          {
            element: "#tour-preview",
            popover: {
              title: "Live Preview",
              description: "See exactly how your profile looks to visitors. This updates in real-time as you make changes.",
              side: "bottom",
              align: "start"
            }
          },
          {
            element: "#tour-actions",
            popover: {
              title: "Edit & Customize",
              description: "Click 'Edit profile' to manage your content blocks, or 'Customize' to change themes, colors, and layout.",
              side: "left",
              align: "start"
            }
          },
          {
            element: "#tour-publish",
            popover: {
              title: "Publish to the world",
              description: "Once you are happy with how things look, hit publish to make your profile live!",
              side: "right",
              align: "start"
            }
          }
        ],
        onDestroyStarted: () => {
          if (!driverObj.hasNextStep() || confirm("Are you sure you want to skip the tour?")) {
            localStorage.setItem("dashboard-tour-seen", "true");
            driverObj.destroy();
          }
        },
      });

      // Give the dashboard a moment to render
      setTimeout(() => {
        driverObj.drive();
      }, 500);
    }
  }, []);

  return null;
}
