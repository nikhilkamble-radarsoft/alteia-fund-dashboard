import { Typography } from "antd";
import CustomButton from "../components/form/CustomButton";
import { useState } from "react";
import ThemedModal from "../components/modal/ThemedModal";

const { Title } = Typography;

export default function Dashboard() {
  const [modal, setModal] = useState({ visible: false, title: "", content: "", buttons: [] });

  return (
    <>
      <ThemedModal
        visible={modal.visible}
        title={modal.title}
        content={modal.content}
        buttons={modal.buttons}
        onClose={() => setModal({ ...modal, visible: false })}
      />
    </>
  );
}
