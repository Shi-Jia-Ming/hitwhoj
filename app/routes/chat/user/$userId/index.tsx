import { ActionFunction, json, LoaderArgs } from "@remix-run/node";
import { redirect, Response } from "@remix-run/node";
import { Button, Empty, Input } from "@arco-design/web-react";
import { findSessionUid } from "~/utils/sessions";
import { invariant } from "~/utils/invariant";
import { contentScheme, idScheme } from "~/utils/scheme";
import { db } from "~/utils/server/db.server";
import { Form, useLoaderData, useTransition } from "@remix-run/react";
import { useEffect, useState, useRef } from "react";
import { UserAvatar } from "~/src/user/UserAvatar";
import { serverSubject } from "~/utils/serverEvents";
import type { MessageType } from "./events";
import { MetaArgs } from "@remix-run/react/dist/routeModules";
import { fromEventSource } from "~/utils/eventSource";

export function meta({ data }: MetaArgs<typeof loader>) {
  return {
    title: `聊天: ${data?.target.nickname || data?.target.username} - HITwh OJ`,
  };
}

export async function loader({ request, params }: LoaderArgs) {
  const selfId = await findSessionUid(request);
  if (!selfId) {
    throw redirect("/login");
  }
  const self = await db.user.findUnique({
    where: { id: selfId },
    select: { id: true, nickname: true, username: true, avatar: true },
  });
  if (!self) {
    throw redirect("/register");
  }

  const toUserId = invariant(idScheme, params.userId, { status: 404 });
  const target = await db.user.findUnique({
    where: { id: toUserId },
    select: { id: true, nickname: true, avatar: true, username: true },
  });

  if (!target) {
    throw new Response("User not found", { status: 404 });
  }

  const msgs = await db.privateMessage.findMany({
    where: {
      OR: [
        { fromId: self?.id, toId: target.id },
        { fromId: target.id, toId: self?.id },
      ],
    },
    orderBy: {
      sentAt: "asc",
    },
  });

  return json({ self, target, msgs });
}

export const action: ActionFunction = async ({ request }) => {
  const self = await findSessionUid(request);
  if (!self) {
    throw redirect("/login");
  }

  const form = await request.formData();
  const to = invariant(idScheme, form.get("to"));
  const content = invariant(contentScheme, form.get("content"));

  const message = await db.privateMessage.create({
    data: {
      from: { connect: { id: self } },
      to: { connect: { id: to } },
      content: content,
    },
    include: {
      from: {
        select: {
          id: true,
          username: true,
          nickname: true,
          avatar: true,
        },
      },
      to: {
        select: {
          id: true,
          username: true,
          nickname: true,
          avatar: true,
        },
      },
    },
  });

  serverSubject.next({
    type: "PrivateMessage",
    message,
  });
};

export default function ChatIndex() {
  const { self, target, msgs } = useLoaderData<typeof loader>();
  const [messages, setMessages] = useState(msgs);

  useEffect(() => {
    setMessages(msgs);
  }, [msgs]);

  useEffect(() => {
    const subscription = fromEventSource<MessageType>(
      `./${target.id}/events`
    ).subscribe((message) => {
      setMessages((messages) => [...messages, message]);
    });

    return () => subscription.unsubscribe();
  }, [target.id]);

  const formRef = useRef<HTMLFormElement>(null);
  const submitRef = useRef<HTMLButtonElement>(null);
  const { state } = useTransition();
  const isFetching = state !== "idle";

  const [message, setMessage] = useState("");
  useEffect(() => {
    if (!isFetching) {
      setMessage("");
    }
  }, [isFetching]);

  return (
    <div className="chat-content-container">
      <header style={{ fontSize: "1.5em" }}>
        用户：{target.nickname || target.username}
      </header>
      <div className="chat-content-main">
        {messages.length > 0 ? (
          messages.map((message, index, array) => {
            const user = message.fromId === self.id ? self : target;
            const date = new Date(message.sentAt);
            const time = [
              date.getHours().toString().padStart(2, "0"),
              date.getMinutes().toString().padStart(2, "0"),
              date.getSeconds().toString().padStart(2, "0"),
            ].join(":");

            // 是否是连续同一个人发送的最后一条消息
            const isLast =
              index === array.length - 1 ||
              array[index + 1].fromId !== message.fromId;

            return (
              <div
                key={message.id}
                className={`chat-content-message ${
                  user === self ? "right" : "left"
                }`}
              >
                <div className="chat-content-message-avatar">
                  {isLast && <UserAvatar user={user} />}
                </div>
                <div className="chat-content-message-bubble">
                  <span>{message.content}</span>
                  <time title={date.toLocaleString()}>{time}</time>
                </div>
              </div>
            );
          })
        ) : (
          <Empty description="快来跟 TA 打个招呼吧" />
        )}
      </div>
      <footer>
        <Form
          method="post"
          ref={formRef}
          style={{ display: "flex", gap: "10px", alignItems: "end" }}
        >
          <input type="hidden" name="to" value={target.id} />
          <Input.TextArea
            placeholder="输入消息..."
            name="content"
            maxLength={255}
            showWordLimit
            autoSize={{ minRows: 1, maxRows: 5 }}
            value={message}
            onChange={(msg) => setMessage(msg)}
            style={{ flex: 1, height: "32px" }}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                if (!e.ctrlKey) submitRef.current?.click();
                else setMessage((message) => message + "\n");
              }
            }}
            disabled={isFetching}
            required
          />
          <Button
            type="primary"
            htmlType="submit"
            size="large"
            ref={submitRef}
            style={{ height: "32px" }}
            loading={isFetching}
          >
            发送
          </Button>
        </Form>
      </footer>
    </div>
  );
}

export { CatchBoundary } from "~/src/CatchBoundary";
export { ErrorBoundary } from "~/src/ErrorBoundary";
