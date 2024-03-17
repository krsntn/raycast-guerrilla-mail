import { Action, ActionPanel, Form, LocalStorage, Toast, showToast, useNavigation } from "@raycast/api";

export default function AddNewEmail({ revalidate }: { revalidate: () => void }) {
  const { pop } = useNavigation();

  return (
    <Form
      actions={
        <ActionPanel>
          <Action.SubmitForm
            title="Add"
            onSubmit={async (values) => {
              const emailStore = await LocalStorage.getItem<string>("emails");
              const emails = emailStore ? JSON.parse(emailStore) : [];
              const newEmail =
                values.email.indexOf("@") >= 0
                  ? values.email.slice(0, values.email.indexOf("@")).concat("@guerrillamailblock.com")
                  : values.email.concat("@guerrillamailblock.com");
              await LocalStorage.setItem("emails", JSON.stringify(Array.from(new Set([newEmail, ...emails]))));
              await showToast(Toast.Style.Success, "✅ Added new email address");
              revalidate();
              pop();
            }}
          />
        </ActionPanel>
      }
    >
      <Form.TextField id="email" title="Username" placeholder="Enter username" />
    </Form>
  );
}
