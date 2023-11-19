import React, { createContext, useEffect, useState } from "react";

const WindowFocusContext = createContext<boolean | null>(null);

export default WindowFocusContext;

export const WindowFocusProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [isWindowFocused, setWindowFocused] = useState(true);

  useEffect(() => {
    const handleFocus = () => setWindowFocused(true);
    const handleBlur = () => setWindowFocused(false);

    window.addEventListener("focus", handleFocus);
    window.addEventListener("blur", handleBlur);

    return () => {
      window.removeEventListener("focus", handleFocus);
      window.removeEventListener("blur", handleBlur);
    };
  }, []);

  return (
    <WindowFocusContext.Provider value={isWindowFocused}>
      {children}
    </WindowFocusContext.Provider>
  );
};
