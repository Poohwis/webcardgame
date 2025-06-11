import { forwardRef } from "react";

const isThai = (text: string) => /[\u0E00-\u0E7F]/.test(text);

export const AutoLangInput = forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement>
>((props, ref) => {
  // Use value from props, default to empty string if undefined
  const value = props.value ?? "";
  // If Thai characters detected, use Thai font, else English font
  const inputClass = isThai(String(value)) ? "font-kanit" : "font-nippo";
  const { className, ...restProps } = props;

  return (
    <input
      ref={ref}
      className={`${inputClass} ${className ?? ""}`}
      {...restProps}
    />
  );
});
