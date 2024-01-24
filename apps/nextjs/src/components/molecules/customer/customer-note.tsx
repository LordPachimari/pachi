import React from "react";

import InputField from "~/components/molecules/input-field";
import { Card, CardContent, CardHeader } from "~/components/ui/card";

type CustomerNoteProps = {
  customer_id: string;
};

const CustomerNote: React.FC<CustomerNoteProps> = ({ customer_id }) => {
  return (
    <Card className="w-full rounded-xl ">
      <CardHeader>Note to customer</CardHeader>
      <CardContent className="mt-6">
        <InputField placeholder="Write a note..." />
      </CardContent>
    </Card>
  );
};

export default CustomerNote;
