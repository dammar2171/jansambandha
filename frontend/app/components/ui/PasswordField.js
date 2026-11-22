"use client";
import { useState } from "react";
import Field from "./Field";

export default function PasswordField(props) {
  const [show, setShow] = useState(false);
  return (
    <Field
      {...props}
      type={show ? "text" : "password"}
      trailing={
        <button
          type="button"
          onClick={() => setShow((s) => !s)}
          className="rounded px-1 text-xs font-medium text-brand hover:underline focus-visible:outline-2 focus-visible:outline-brand"
        >
          {show ? "Hide" : "Show"}
        </button>
      }
    />
  );
}