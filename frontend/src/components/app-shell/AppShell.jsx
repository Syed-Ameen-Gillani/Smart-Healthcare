import React, { useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { App } from "@capacitor/app";
import { Capacitor } from "@capacitor/core";
import { toast } from "react-toastify";
import { useAuth } from "../../context/AuthContext";
import NavBar from "../NavBar";
import BottomNavigation from "./BottomNavigation";
import MobileTopBar from "./MobileTopBar";
import { IS_NATIVE } from "../../utils/runtime";

const publicRoutes = new Set(["/", "/login", "/signup"]);
const primaryRoutes = new Set(["/dashboard", "/profile", "/doctors", "/medicine-store", "/more"]);

export default function AppShell({ children }) {
  const { loggedIn } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const lastBackPress = useRef(0);
  const showAppChrome = loggedIn && !publicRoutes.has(location.pathname);
  const hideNativePublicHeader = IS_NATIVE && publicRoutes.has(location.pathname);

  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return undefined;
    let listener;
    App.addListener("backButton", ({ canGoBack }) => {
      const overlayBackEvent = new Event("smarthealth:back", { cancelable: true });
      document.dispatchEvent(overlayBackEvent);
      if (overlayBackEvent.defaultPrevented) return;

      if (!primaryRoutes.has(location.pathname) && canGoBack) {
        navigate(-1);
        return;
      }

      const now = Date.now();
      if (now - lastBackPress.current < 2000) {
        App.exitApp();
      } else {
        lastBackPress.current = now;
        toast.info("Press Back again to exit");
      }
    }).then((handle) => { listener = handle; });
    return () => { listener?.remove(); };
  }, [location.pathname, navigate]);

  return (
    <div className={showAppChrome ? "app-shell app-shell--authenticated" : "app-shell"}>
      <div className={hideNativePublicHeader ? "hidden" : showAppChrome ? "hidden lg:block" : "block"}><NavBar /></div>
      {showAppChrome && <MobileTopBar />}
      <div className="app-shell__content">{children}</div>
      {showAppChrome && <BottomNavigation />}
    </div>
  );
}
