import React from "react";
import SettingsButton from "../SettingsButton";
import { isMobile } from "react-device-detect";

export default function Footer() {
  return (
    <div className="flex justify-center mb-2">
      <div className="flex space-x-4">
        {!isMobile && <SettingsButton />}
      </div>
    </div>
  );
}
