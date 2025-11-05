import React from "react";
import ViewInfo from "../../components/layout/ViewInfo";
import TableTitle from "../../components/table/TableTitle";
import { Divider } from "antd";
import { PiFilesFill } from "react-icons/pi";

export default function ViewInvestor() {
  return (
    <div>
      <TableTitle
        title={"View Purchase Order Details – PO-50032"}
        subtitle={"View and download orders from your suppliers/SMEs."}
        showIcon={<PiFilesFill size={40} className="text-primary" />}
      />
      <Divider variant="dashed" className="my-2" />
      <ViewInfo info={{ name: "Hello", email: "Hello" }} />
    </div>
  );
}
