import type { Contest } from "@prisma/client";
import type { LoaderFunction } from "@remix-run/node";
import { Link, useLoaderData } from "@remix-run/react";
import { invariant } from "~/utils/invariant";
import { idScheme } from "~/utils/scheme";
import { db } from "~/utils/server/db.server";
import { checkUserReadPermission } from "~/utils/permission/user";
import {
  Typography,
  Link as ArcoLink,
  Statistic,
  Space,
} from "@arco-design/web-react";

type LoaderData = {
  user: {
    attendedContests: Pick<Contest, "id" | "title">[];
    _count: {
      createdRecords: number;
      createdComments: number;
      createdReplies: number;
    };
  };
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
      attendedContests: {
        select: {
          id: true,
          title: true,
        },
      },
      _count: {
        select: {
          createdRecords: true,
          createdComments: true,
          createdReplies: true,
        },
      },
    },
  });

  if (!user) {
    throw new Response("User not found", { status: 404 });
  }

  return { user };
};

export default function UserStatistics() {
  const { user } = useLoaderData<LoaderData>();

  return (
    <Typography>
      <Typography.Paragraph>
        <Space size="large">
          <Statistic title="提交" value={user._count.createdRecords} />
          <Statistic title="评论" value={user._count.createdComments} />
          <Statistic title="回复" value={user._count.createdReplies} />
        </Space>
      </Typography.Paragraph>

      <Typography.Title heading={4}>参与的比赛</Typography.Title>
      <Typography.Paragraph>
        {user.attendedContests.length ? (
          <ul>
            {user.attendedContests.map((contest) => (
              <li key={contest.id}>
                <ArcoLink>
                  <Link to={`/contest/${contest.id}`}>{contest.title}</Link>
                </ArcoLink>
              </li>
            ))}
          </ul>
        ) : (
          <div>没有喵</div>
        )}
      </Typography.Paragraph>
    </Typography>
  );
}
