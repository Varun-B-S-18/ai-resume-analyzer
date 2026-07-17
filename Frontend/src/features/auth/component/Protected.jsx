import { useAuth } from "../hooks/useAuth";
import React from "react";
import { Navigate } from "react-router";

const Protected = (props) => {
  const { loading, user } = useAuth();

  if (loading) {
    return (
      <main>
        <h1>Loading......</h1>
      </main>
    );
  }

  if (!user) {
    return <Navigate to={"/login"} />;
  }
  return props.children;
};

export default Protected;
