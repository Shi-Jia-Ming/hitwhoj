import { Button, Typography } from "@arco-design/web-react";
import { IconCloud } from "@arco-design/web-react/icon";
import { ActionArgs, json, LoaderArgs } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import { Form, useLoaderData } from "@remix-run/react";
import { invariant } from "~/utils/invariant";
import { idScheme } from "~/utils/scheme";
import { db } from "~/utils/server/db.server";
import { findSessionUser } from "~/utils/sessions";

export async function loader({ request, params }: LoaderArgs) {
  const roomId = invariant(idScheme, params.roomId, { status: 404 });
  const self = await findSessionUser(request);

  const userInChatRoom = await db.userInChatRoom.findUnique({
    where: {
      roomId_userId: {
        roomId: roomId,
        userId: self.id,
      },
    },
    select: {
      role: true,
      room: {
        select: {
          id: true,
          name: true,
          description: true,
          private: true,
        },
      },
    },
  });

  if (!userInChatRoom) {
    throw redirect(`/chat/room/${roomId}/enter`);
  }

  return json({ room: userInChatRoom.room });
}

export default function ExitRoom() {
  const { room } = useLoaderData<typeof loader>();

  return (
    <Typography>
      <Typography.Title heading={3}>{room.name}</Typography.Title>
      <Typography.Paragraph>{room.description}</Typography.Paragraph>
      <Typography.Paragraph>
        <Form method="post">
          <Button
            type="primary"
            status="danger"
            htmlType="submit"
            icon={<IconCloud />}
          >
            退出房间
          </Button>
        </Form>
      </Typography.Paragraph>
    </Typography>
  );
}

export async function action({ request, params }: ActionArgs) {
  const roomId = invariant(idScheme, params.roomId, { status: 404 });
  const self = await findSessionUser(request);

  await db.userInChatRoom.delete({
    where: {
      roomId_userId: {
        roomId: roomId,
        userId: self.id,
      },
    },
  });

  return redirect(`/chat/room/${roomId}`);
}

export { CatchBoundary } from "~/src/CatchBoundary";
export { ErrorBoundary } from "~/src/ErrorBoundary";
