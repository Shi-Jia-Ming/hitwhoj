import { Problem } from "@prisma/client";
import { LoaderFunction, json, useLoaderData, MetaFunction } from "remix";
import { db } from "~/utils/db.server";

export const loader: LoaderFunction = async ({ params }) => {
  if (!params.pid || !/^[1-9]\d*$/.test(params.pid)) {
    throw new Response("Invalid problem id", { status: 404 });
  }

  const pid = Number(params.pid);

  const problem = await db.problem.findUnique({
    where: { pid },
  });

  if (!problem) {
    throw new Response("Problem not found", { status: 404 });
  }

  return json(problem);
};

export const meta: MetaFunction = ({ data }: { data: Problem }) => ({
  title: data.title,
  description: data.description,
});

export default function Problem() {
  const problem = useLoaderData<Problem>();

  return (
    <div>
      <header>
        <h1>
          <span style={{ color: "grey", marginRight: "20px" }}>
            P{problem.pid}
          </span>
          {problem.title}
        </h1>
      </header>
      <div style={{ margin: "20px 0" }}>{problem.description}</div>
    </div>
  );
}