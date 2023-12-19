import { cn } from "@pachi/utils";

type FieldErrorProps = {
  error: boolean;
  message?: string;
};

const FieldError = ({ error, message }: FieldErrorProps) => {
  if (!error) {
    return null;
  }

  return (
    <div className={cn("inter-small-regular mt-2 text-rose-50")}>
      <p>{message}</p>
    </div>
  );
};

export default FieldError;
