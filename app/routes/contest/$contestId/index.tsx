import { Contest, ContestTag, Problem } from "@prisma/client";
import { json, Link, LoaderFunction, MetaFunction, useLoaderData } from "remix";
import { db } from "~/utils/db.server";
import { invariant } from "~/utils/invariant";
import { idScheme } from "~/utils/scheme";

type LoaderData = {
  contest: Contest & {
    tags: ContestTag[];
    problems: Pick<Problem, "pid" | "title">[];
  };
};

export const loader: LoaderFunction = async ({ params }) => {
  const cid = invariant(idScheme.safeParse(params.contestId), { status: 404 });

  const contest = await db.contest.findUnique({
    where: { cid },
    include: {
      tags: true,
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

export const meta: MetaFunction = ({ data }: { data: LoaderData }) => ({
  title: `Contest: ${data.contest.title} - HITwh OJ`,
  description: data.contest.description,
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
    <ul>
      {tags.map((tag) => (
        <li key={tag.name}>
          <Link to={`/contest/tag/${tag.name}`}>#{tag.name}</Link>
        </li>
      ))}
    </ul>
  ) : (
    <div>没有标签捏</div>
  );
}

function ContestProblemList({
  problems,
}: {
  problems: Pick<Problem, "pid" | "title">[];
}) {
  return problems.length ? (
    <ol>
      {problems.map((problem) => (
        <li key={problem.pid}>
          <Link to={`/problem/${problem.pid}`}>{problem.title}</Link>
        </li>
      ))}
    </ol>
  ) : (
    <div>没有题目捏</div>
  );
}

export default function contestIndex() {
  const { contest } = useLoaderData<LoaderData>();

  return (
    <>
      <Time contest={contest} />
      <p>{contest.description}</p>
      <h2>标签</h2>
      <ContestTags tags={contest.tags} />
      <h2>题目</h2>
      <ContestProblemList problems={contest.problems} />
    </>
  );
}