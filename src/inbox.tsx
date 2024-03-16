import { Icon, ActionPanel, List, Action, Color, showToast, Toast } from "@raycast/api";
import { useFetch } from "@raycast/utils";
import { BASE_URL, GET_EMAIL_LIST, SET_EMAIL_ADDRESS } from "./utils/endPoints";
import Mail from "./mail";

type EmailAccountDataType = {
  alias_error: string;
  alias: string;
  email_addr: string;
  email_timestamp: number;
  site_id: number;
  sid_token: string;
  site: string;
  auth: {
    success: boolean;
    error_codes: string[];
  };
};

type EmailDataType = {
  mail_id: string;
  mail_from: string;
  mail_subject: string;
  mail_excerpt: string;
  mail_timestamp: string;
  mail_read: string;
  mail_date: string;
  att: string;
  mail_size: string;
};

type EmailListDataType = {
  list: EmailDataType[];
  sid_token: string;
};

export default function Inbox({ email }: { email: string }) {
  const url = `${BASE_URL}${SET_EMAIL_ADDRESS}&email_user=${email.slice(0, email.indexOf("@"))}`;
  const { isLoading: isEmailAccountLoading, data: emailAccountData } = useFetch<EmailAccountDataType>(url);

  const checkEmailUrl = `${BASE_URL}${GET_EMAIL_LIST}&offset=0`;
  const {
    isLoading: isEmailListLoading,
    data: emailListData,
    revalidate,
  }: { isLoading: boolean; data: EmailListDataType } = useFetch(checkEmailUrl, {
    headers: {
      Cookie: "PHPSESSID=" + emailAccountData?.sid_token,
    },
    execute: !!emailAccountData?.email_addr,
  });

  return (
    <List isLoading={isEmailAccountLoading || isEmailListLoading}>
      <List.Section title="Email">
        {!isEmailAccountLoading &&
          !isEmailListLoading &&
          emailListData?.list.map((email: EmailDataType, index: number) => (
            <List.Item
              key={index}
              icon={{ source: Icon.Bubble, tintColor: "#A9C939" }}
              title={email.mail_from}
              subtitle={email.mail_subject !== "" ? email.mail_subject : "No Subject"}
              accessories={[
                {
                  text: email.mail_date,
                  icon: Icon.Clock,
                },
              ]}
              actions={
                <ActionPanel>
                  <Action.Push
                    title="Display Email"
                    target={<Mail email_id={email.mail_id} sid_token={emailListData.sid_token} />}
                  />
                  <Action
                    title="Refresh"
                    icon={{ source: Icon.Trash, tintColor: Color.Green }}
                    shortcut={{ modifiers: ["cmd"], key: "r" }}
                    onAction={async () => {
                      await showToast(Toast.Style.Animated, "Refreshing...");
                      await revalidate();
                      await showToast(Toast.Style.Success, "Refreshed");
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
