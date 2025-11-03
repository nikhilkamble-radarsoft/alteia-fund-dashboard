import { Typography } from "antd";
import CustomButton from "../components/form/CustomButton";
import { useState } from "react";
import ThemedModal from "../components/modal/ThemedModal";

const { Title } = Typography;

export default function MultiModalSample() {
  const [modal, setModal] = useState({
    visible: false,
    title: "",
    content: null,
    buttons: [],
  });

  const openDeleteModal = () => {
    setModal({
      visible: true,
      title: "Delete Item",
      content: "Are you sure you want to delete this item?",
      buttons: [
        {
          text: "Cancel",
          type: "secondary",
          onClick: () => setModal({ ...modal, visible: false }),
        },
        {
          text: "Delete",
          type: "primary",
          onClick: () => {
            console.log("Deleted!");
            setModal({ ...modal, visible: false });
          },
          bgColor: "red",
        },
      ],
    });
  };

  const openSaveModal = () => {
    setModal({
      visible: true,
      title: "Save Changes",
      content: "Do you want to save changes?",
      buttons: [
        {
          text: "Cancel",
          type: "secondary",
          onClick: () => setModal({ ...modal, visible: false }),
        },
        {
          children: "Save",
          type: "primary",
          onClick: () => {
            console.log("Saved!");
            setModal({ ...modal, visible: false });
          },
          bgColor: "green",
          showIcon: true,
        },
      ],
    });
  };

  return (
    <div>
      <Title level={2} className="!text-primary">
        Dashboard
      </Title>
      <p>Welcome to the Ballot System Dashboard</p>

      <div className="flex gap-3">
        <CustomButton onClick={openDeleteModal}>Open Delete Modal</CustomButton>
        <CustomButton onClick={openSaveModal}>Open Save Modal</CustomButton>
      </div>
      <ThemedModal
        visible={modal.visible}
        title={modal.title}
        content={modal.content}
        buttons={modal.buttons}
        onClose={() => setModal({ ...modal, visible: false })}
      />
    </div>
  );
}
