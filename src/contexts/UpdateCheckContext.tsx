import React, { createContext, useContext, useState } from "react";

interface UpdateCheckContextType {
  isChecking: boolean;
  setIsChecking: (checking: boolean) => void;
}

const UpdateCheckContext = createContext<UpdateCheckContextType | undefined>(
  undefined
);

export const UpdateCheckProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [isChecking, setIsChecking] = useState(true);

  return (
    <UpdateCheckContext.Provider value={{ isChecking, setIsChecking }}>
      {children}
    </UpdateCheckContext.Provider>
  );
};

export const useUpdateCheck = () => {
  const context = useContext(UpdateCheckContext);
  if (!context) {
    throw new Error("useUpdateCheck must be used within UpdateCheckProvider");
  }
  return context;
};
