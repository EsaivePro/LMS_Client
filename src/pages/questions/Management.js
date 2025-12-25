import React from "react";
import Card from "../../components/common/Card";
import Button from "../../components/common/Button";
import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { setContainerTitle } from "../../redux/slices/uiSlice";
export default function Management() {
  const dispatch = useDispatch();
  React.useEffect(() => {
    dispatch(setContainerTitle("Question Management"));
  }, [dispatch]);
  return (
    <main>

    </main>
  );
}