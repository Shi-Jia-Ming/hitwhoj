import { Avatar, Space, Typography } from "@arco-design/web-react";
import { IconUser } from "@arco-design/web-react/icon";
import type { User } from "@prisma/client";
import type { LoaderFunction, MetaFunction } from "@remix-run/node";
import { Outlet, useLoaderData } from "@remix-run/react";
import { useContext } from "react";
import { UserInfoContext } from "~/utils/context/user";
import { db } from "~/utils/server/db.server";
import { invariant } from "~/utils/invariant";
import { idScheme } from "~/utils/scheme";
import { checkUserReadPermission } from "~/utils/permission/user";
import { Navigator } from "~/src/Navigator";
import { isAdmin, isUser } from "~/utils/permission";

type LoaderData = {
  user: Pick<User, "nickname" | "username" | "avatar" | "bio" | "id">;
};

export const loader: LoaderFunction<LoaderData> = async ({
  request,
  params,
}) => {
  const userId = invariant(idScheme, params.userId, { status: 404 });

  await checkUserReadPermission(request, userId);

  const user = await db.user.findUnique({
    where: { id: userId },
    select: {
      nickname: true,
      username: true,
      avatar: true,
      bio: true,
      id: true,
    },
  });

  if (!user) {
    throw new Response("User not found", { status: 404 });
  }

  return { user };
};

export const meta: MetaFunction<LoaderData> = ({ data }) => ({
  title: `用户: ${data?.user.nickname || data?.user.username} - HITwh OJ`,
});

export default function UserProfile() {
  const { user } = useLoaderData<LoaderData>();
  const self = useContext(UserInfoContext);

  return (
    <Typography>
      <Typography.Paragraph>
        <Space size="large" align="center">
          <Avatar size={60}>
            {user.avatar ? (
              <img src={user.avatar} alt={user.nickname || user.username} />
            ) : (
              <IconUser />
            )}
          </Avatar>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <span style={{ fontSize: "2em" }}>
              {user.nickname
                ? `${user.nickname} (${user.username})`
                : user.username}
            </span>
            {user.bio && <span>{user.bio}</span>}
          </div>
        </Space>
      </Typography.Paragraph>

      <Typography.Paragraph>
        <Navigator
          routes={[
            { title: "资料", key: "." },
            { title: "统计", key: "statistics" },
            ...(self &&
            (isAdmin(self.role) || (isUser(self.role) && self.id === user.id))
              ? [
                  { title: "文件", key: "files" },
                  { title: "编辑", key: "edit" },
                ]
              : []),
          ]}
        />
      </Typography.Paragraph>

      <Typography.Paragraph>
        <Outlet />
      </Typography.Paragraph>
    </Typography>
  );
}

export { ErrorBoundary } from "~/src/ErrorBoundary";
export { CatchBoundary } from "~/src/CatchBoundary";
