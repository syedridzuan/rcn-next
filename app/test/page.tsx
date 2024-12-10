"use client";

import React from "react";
import { useForm } from "react-hook-form";

export default function TestForm() {
  const { register, handleSubmit } = useForm();

  const onSubmit = (data: any) => {
    console.log("Form submitted with:", data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input {...register("example")} placeholder="Test input" />
      <button type="submit">Submit</button>
    </form>
  );
}
