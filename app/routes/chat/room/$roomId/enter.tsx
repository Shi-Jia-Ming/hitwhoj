import { Button, Input, Space, Typography } from "@arco-design/web-react";
import { IconLock, IconUnlock } from "@arco-design/web-react/icon";
import type { ActionArgs, LoaderArgs, MetaFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import { Form, useLoaderData, useTransition } from "@remix-run/react";
import { invariant } from "~/utils/invariant";
import { findRequestUser } from "~/utils/permission";
import { idScheme, roomPasswordScheme } from "~/utils/scheme";
import { db } from "~/utils/server/db.server";

export async function loader({ request, params }: LoaderArgs) {
  const roomId = invariant(idScheme, params.roomId, { status: 404 });
  const self = await findRequestUser(request);
  if (!self.userId) throw new Response("Unauthorized", { status: 401 });

  const room = await db.chatRoom.findUnique({
    where: { id: roomId },
    select: {
      id: true,
      name: true,
      description: true,
      private: true,
      userInChatRoom: {
        where: { userId: self.userId },
        select: { role: true },
      },
    },
  });

  if (!room) {
    throw new Response("Room not found", { status: 404 });
  }

  // 如果已经加入，则跳转到聊天室
  if (room.userInChatRoom.length > 0) {
    throw redirect(`/chat/room/${room.id}`);
  }

  return json({ room });
}

export const meta: MetaFunction<typeof loader> = ({ data }) => ({
  title: `加入聊天室: ${data?.room.name} - HITwh OJ`,
  description: data?.room.description,
});

export default function EnterRoom() {
  const { room } = useLoaderData<typeof loader>();
  const { state } = useTransition();
  const isSubmitting = state !== "idle";

  return (
    <Typography>
      <Typography.Title heading={3}>
        <Space>
          {room.private && <IconLock />}
          {room.name}
        </Space>
      </Typography.Title>
      <Typography.Paragraph>{room.description}</Typography.Paragraph>
      <Typography.Paragraph>
        <Form method="post">
          {room.private ? (
            <Space>
              <Input.Password
                name="password"
                placeholder="请输入房间密码"
                disabled={isSubmitting}
              />
              <Button
                type="primary"
                htmlType="submit"
                icon={<IconUnlock />}
                loading={isSubmitting}
              >
                加入房间
              </Button>
            </Space>
          ) : (
            <Button type="primary" htmlType="submit" loading={isSubmitting}>
              加入房间
            </Button>
          )}
        </Form>
      </Typography.Paragraph>
    </Typography>
  );
}

export async function action({ request, params }: ActionArgs) {
  const roomId = invariant(idScheme, params.roomId, { status: 404 });
  const self = await findRequestUser(request);
  if (!self.userId) throw new Response("Unauthorized", { status: 401 });

  await db.$transaction(async (db) => {
    const room = await db.chatRoom.findUnique({
      where: { id: roomId },
      select: {
        id: true,
        private: true,
        password: true,
        userInChatRoom: {
          where: { userId: self.userId! },
          select: { role: true },
        },
      },
    });

    if (!room) {
      throw new Response("讨论组不存在", { status: 404 });
    }

    if (room.userInChatRoom.length > 0) {
      throw new Response("您已经在讨论组中", { status: 400 });
    }

    if (room.private) {
      const form = await request.formData();
      const password = invariant(roomPasswordScheme, form.get("password"));

      if (password !== room.password) {
        throw new Response("密码错误", { status: 400 });
      }
    }

    await db.userInChatRoom.create({
      data: {
        userId: self.userId!,
        roomId: room.id,
      },
    });
  });

  // 加入成功，跳转到聊天室
  return redirect(`/chat/room/${roomId}`);
}

export { CatchBoundary } from "~/src/CatchBoundary";
export { ErrorBoundary } from "~/src/ErrorBoundary";
