import { Problem, ProblemSet, ProblemSetTag } from "@prisma/client";
import { json, Link, LoaderFunction, useLoaderData } from "remix";
import { db } from "~/utils/db.server";
import { invariant } from "~/utils/invariant";
import { idScheme } from "~/utils/scheme";

type LoaderData = {
  problemSet: ProblemSet & {
    tags: ProblemSetTag[];
    problems: Pick<Problem, "pid" | "title">[];
  };
};

export const loader: LoaderFunction = async ({ params }) => {
  const sid = invariant(idScheme.safeParse(params.sid), { status: 404 });

  const problemSet = await db.problemSet.findUnique({
    where: { sid },
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

  if (!problemSet) {
    throw new Response("Problem Set not found", { status: 404 });
  }

  return json({
    problemSet,
  });
};

export default function ProblemSetIndex() {
  const { problemSet } = useLoaderData<LoaderData>();

  return (
    <>
      <p>{problemSet.description}</p>
      <h2>标签</h2>
      {problemSet.tags.length ? (
        <ul>
          {problemSet.tags.map((tag) => (
            <li key={tag.name}>
              <Link to={`/problemset/tag/${tag.name}`}>#{tag.name}</Link>
            </li>
          ))}
        </ul>
      ) : (
        <div>没有标签捏</div>
      )}
      <h2>题目</h2>
      {problemSet.problems.length ? (
        <ol>
          {problemSet.problems.map((problem) => (
            <li key={problem.pid}>
              <Link to={`/problem/${problem.pid}`}>{problem.title}</Link>
            </li>
          ))}
        </ol>
      ) : (
        <div>没有题目捏</div>
      )}
    </>
  );
}
