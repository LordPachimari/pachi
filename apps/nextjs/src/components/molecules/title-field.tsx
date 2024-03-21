import TextareaAutosize from "react-textarea-autosize";

import type { UpdateProduct } from "@pachi/validators";

import type { DebouncedFunc } from "~/types";

export interface TitleProps {
  onChange: DebouncedFunc<(props: UpdateProduct["updates"]) => Promise<void>>;
  value?: string;
  placeholder?: string;
}

const TitleField = ({ onChange, value, placeholder }: TitleProps) => {
  return (
    <div className=" mr-0 w-full border-red-100 ">
      <TextareaAutosize
        id="title"
        defaultValue={value}
        placeholder={placeholder ?? "Write title..."}
        onInput={async (e) => await onChange({ title: e.currentTarget.value })}
        className="w-full resize-none appearance-none overflow-hidden rounded-md bg-transparent text-2xl font-bold focus:outline-none"
      />
      {/* <FieldError error={error.error} message={error.message} /> */}
    </div>
  );
};

export default TitleField;
