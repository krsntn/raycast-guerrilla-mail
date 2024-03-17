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
  getFrontmostApplication,
} from "@raycast/api";
import { usePromise } from "@raycast/utils";
import Inbox from "./inbox";
import AddNewEmail from "./add_new_email";
import { useEffect, useState } from "react";

export default function Command() {
  const { isLoading, data, revalidate } = usePromise(async () => {
    const emailStore = await LocalStorage.getItem<string>("emails");
    return emailStore ? JSON.parse(emailStore) : [];
  });

  const [currentApp, setCurrentApp] = useState<string | undefined>(undefined);
  useEffect(() => {
    getFrontmostApplication()
      .then((app) => setCurrentApp(app.name))
      .catch(() => setCurrentApp(undefined));
  }, []);

  return (
    <List isLoading={isLoading}>
      <List.Section title="Email Address" subtitle={data?.length.toString()}>
        {!isLoading &&
          data?.map((email: string, index: number) => (
            <List.Item
              key={index}
              icon={{ source: Icon.PersonCircle, tintColor: "#A9C939" }}
              title={email}
              actions={
                <ActionPanel>
                  <Action.Push title="Show Inbox" target={<Inbox email={email} />} />
                  <Action
                    title="Copy Email Address"
                    icon={{ source: Icon.CopyClipboard }}
                    shortcut={{ modifiers: ["cmd", "shift"], key: "c" }}
                    onAction={async () => {
                      await Clipboard.copy(email);
                      await showHUD("✅ Copied email address");
                    }}
                  />
                  {currentApp && (
                    <Action
                      title={`Paste Email Address Into ${currentApp}`}
                      icon={{ source: Icon.Window }}
                      shortcut={{ modifiers: ["cmd", "shift"], key: "enter" }}
                      onAction={async () => {
                        await Clipboard.paste(email);
                      }}
                    />
                  )}
                  <Action
                    title="Delete Email Address"
                    icon={{ source: Icon.Trash }}
                    shortcut={{ modifiers: ["ctrl"], key: "x" }}
                    onAction={async () => {
                      const emailStore = await LocalStorage.getItem<string>("emails");
                      const emails = emailStore ? JSON.parse(emailStore) : [];
                      emails.splice(emails.indexOf(email), 1);
                      LocalStorage.setItem("emails", JSON.stringify(emails));
                      await showToast(Toast.Style.Success, "Deleted email address", email);
                      revalidate();
                    }}
                  />
                  <Action.Push
                    title="Add Email Address"
                    icon={{ source: Icon.PlusCircle }}
                    shortcut={{ modifiers: ["cmd"], key: "n" }}
                    target={<AddNewEmail revalidate={revalidate} />}
                  />
                </ActionPanel>
              }
            />
          ))}
      </List.Section>
    </List>
  );
}
