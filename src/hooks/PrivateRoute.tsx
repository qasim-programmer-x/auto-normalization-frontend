import { useContext } from "react";
import { AuthContext } from "./Context";
import { Navigate } from "react-router-dom";

export const PrivateRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const authContext = useContext(AuthContext);

  if (!authContext) {
    throw new Error("PrivateRoute must be used within an AuthProvider");
  }

  const { token, user } = authContext;

  console.log(`User in pr = ${user}`);

  return token ? <>{children}</> : <Navigate to="/login" />;
};
