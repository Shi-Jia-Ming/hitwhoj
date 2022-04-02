import { Space, Table, Tag } from "@arco-design/web-react";
import { Contest, ContestTag, Problem, Team } from "@prisma/client";
import { json, Link, LoaderFunction, MetaFunction, useLoaderData } from "remix";
import { db } from "~/utils/db.server";
import { invariant } from "~/utils/invariant";
import { idScheme } from "~/utils/scheme";

type LoaderData = {
  contest: Contest & {
    tags: ContestTag[];
    problems: Pick<Problem, "pid" | "title">[];
    team: Pick<Team, "tid">;
  };
};

export const loader: LoaderFunction = async ({ params }) => {
  const cid = invariant(idScheme.safeParse(params.contestId), { status: 404 });

  const contest = await db.contest.findUnique({
    where: { cid },
    include: {
      tags: true,
      team: {
        select: {
          tid: true,
        },
      },
      problems: {
        select: {
          pid: true,
          title: true,
        },
      },
    },
  });

  if (!contest) {
    throw new Response("Contest not found", { status: 404 });
  }

  return json({
    contest,
  });
};

export const meta: MetaFunction = ({ data }: { data?: LoaderData }) => ({
  title: `比赛: ${data?.contest.title} - HITwh OJ`,
  description: data?.contest.description,
});

function Time({ contest }: { contest: Contest }) {
  const begin = new Date(contest.beginTime);
  const end = new Date(contest.endTime);
  return (
    <p>
      起止时间：{" "}
      <time dateTime={begin.toISOString()}>{begin.toLocaleString()}</time>
      {" ~ "}
      <time dateTime={end.toISOString()}>{end.toLocaleString()}</time>
    </p>
  );
}

function ContestTags({ tags }: { tags: ContestTag[] }) {
  return tags.length ? (
    <Space size="medium">
      {tags.map((tag) => (
        <Link to={`/contest/tag/${tag.name}`} key={tag.name}>
          <Tag>#{tag.name}</Tag>
        </Link>
      ))}
    </Space>
  ) : (
    <div>没有标签捏</div>
  );
}

function ContestProblemList({
  problems,
}: {
  problems: Pick<Problem, "pid" | "title">[];
}) {
  const tableColumns = [
    {
      title: "PID",
      dataIndex: "pid",
      render: (pid: string) => <Link to={`${pid}`}>{pid}</Link>,
    },
    {
      title: "Title",
      dataIndex: "title",
      render: (title: string, problem: Pick<Problem, "pid" | "title">) => (
        <Link to={`${problem.pid}`}>{title}</Link>
      ),
    },
  ];
  return <Table columns={tableColumns} data={problems} pagination={false} />;
}

export default function ContestIndex() {
  const { contest } = useLoaderData<LoaderData>();

  return (
    <>
      <Time contest={contest} />
      <p>{contest.description}</p>
      <p>Belong To Team:{contest.team.tid ? contest.team.tid : ""}</p>
      <h2>标签</h2>
      <ContestTags tags={contest.tags} />
      <h2>题目</h2>
      <ContestProblemList problems={contest.problems} />
    </>
  );
}

export { ErrorBoundary } from "~/src/ErrorBoundary";
export { CatchBoundary } from "~/src/CatchBoundary";
