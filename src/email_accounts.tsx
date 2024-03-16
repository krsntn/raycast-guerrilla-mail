import {
  LocalStorage,
  ActionPanel,
  List,
  Action,
  Icon,
  Color,
  showToast,
  Toast,
  Clipboard,
  showHUD,
} from "@raycast/api";
import { usePromise } from "@raycast/utils";
import Inbox from "./inbox";

export default function Command() {
  const { isLoading, data, revalidate } = usePromise(async () => {
    const emailStore = await LocalStorage.getItem("emails");
    return emailStore ? JSON.parse(emailStore as string) : [];
  });

  return (
    <List isLoading={isLoading}>
      <List.Section title="Email Address">
        {!isLoading &&
          data?.map((email: string, index: number) => (
            <List.Item
              key={index}
              icon={{ source: Icon.Envelope, tintColor: "#A9C939" }}
              title={email}
              actions={
                <ActionPanel>
                  <Action.Push title="Show Inbox" target={<Inbox email={email} />} />
                  <Action
                    title="Copy Email Address"
                    icon={{ source: Icon.Trash, tintColor: "#A9C939" }}
                    shortcut={{ modifiers: ["cmd", "shift"], key: "c" }}
                    onAction={async () => {
                      await Clipboard.copy(email);
                      await showHUD("✅ Copied email address");
                    }}
                  />
                  <Action
                    title="Delete Email Address"
                    icon={{ source: Icon.Trash, tintColor: Color.Red }}
                    shortcut={{ modifiers: ["ctrl"], key: "x" }}
                    onAction={async () => {
                      const emailStore = await LocalStorage.getItem("emails");
                      const emails = emailStore ? JSON.parse(emailStore as string) : [];
                      emails.splice(emails.indexOf(email), 1);
                      LocalStorage.setItem("emails", JSON.stringify(emails));
                      await showToast(Toast.Style.Success, "Deleted email address", email);
                      revalidate();
                    }}
                  />
                </ActionPanel>
              }
            />
          ))}
      </List.Section>
    </List>
  );
}
