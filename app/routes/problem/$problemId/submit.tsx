import type {
  ActionFunction,
  LoaderFunction,
  MetaFunction,
} from "@remix-run/node";
import { redirect } from "@remix-run/node";
import { Form } from "@remix-run/react";
import { db } from "~/utils/server/db.server";
import { s3 } from "~/utils/server/s3.server";
import { invariant } from "~/utils/invariant";
import { codeScheme, idScheme, languageScheme } from "~/utils/scheme";
import { Button, Input, Space, Select } from "@arco-design/web-react";
import { useState } from "react";
import type { Problem } from "@prisma/client";
import { judge } from "~/utils/server/judge.server";
import { findRequestUser } from "~/utils/permission";
import { Privileges } from "~/utils/permission/privilege";
import { Permissions } from "~/utils/permission/permission";
import { findProblemPrivacy, findProblemTeam } from "~/utils/db/problem";

const TextArea = Input.TextArea;

type LoaderData = {
  problem: Pick<Problem, "title">;
};

export const loader: LoaderFunction<LoaderData> = async ({
  request,
  params,
}) => {
  const problemId = invariant(idScheme, params.problemId, { status: 404 });
  const self = await findRequestUser(request);
  await self.checkPrivilege(Privileges.PRIV_OPERATE);
  await self
    .team(await findProblemTeam(problemId))
    .checkPermission(
      (await findProblemPrivacy(problemId))
        ? Permissions.PERM_VIEW_PROBLEM
        : Permissions.PERM_VIEW_PROBLEM_PUBLIC
    );

  const problem = await db.problem.findUnique({
    where: { id: problemId },
    select: { title: true, allowSubmit: true },
  });

  if (!problem) {
    throw new Response("Problem not found", { status: 404 });
  }

  if (!problem.allowSubmit) {
    throw new Response("Problem not allow submit", { status: 403 });
  }

  return { problem };
};

export const meta: MetaFunction<LoaderData> = ({ data }) => ({
  title: `提交题目: ${data?.problem.title} - HITwh OJ`,
});

export const action: ActionFunction<Response> = async ({ request, params }) => {
  const problemId = invariant(idScheme, params.problemId, { status: 404 });
  const self = await findRequestUser(request);
  await self.checkPrivilege(Privileges.PRIV_OPERATE);
  await self
    .team(await findProblemTeam(problemId))
    .checkPermission(
      (await findProblemPrivacy(problemId))
        ? Permissions.PERM_VIEW_PROBLEM
        : Permissions.PERM_VIEW_PROBLEM_PUBLIC
    );

  const problem = await db.problem.findUnique({
    where: { id: problemId },
    select: { allowSubmit: true },
  });

  if (!problem) {
    throw new Response("Problem not found", { status: 404 });
  }

  if (!problem.allowSubmit) {
    throw new Response("Problem not allow submit", { status: 403 });
  }

  const form = await request.formData();
  const code = invariant(codeScheme, form.get("code"));
  const language = invariant(languageScheme, form.get("language"));

  const { id: recordId } = await db.record.create({
    data: {
      language,
      problemId,
      submitterId: self.userId!,
    },
    select: { id: true },
  });

  await s3.writeFile(`/record/${recordId}`, Buffer.from(code));
  judge.push(recordId);

  return redirect(`/record/${recordId}`);
};

export default function ProblemSubmit() {
  const [language, setLanguage] = useState("");

  return (
    <Form method="post" style={{ marginTop: "25px" }}>
      <Space
        direction="vertical"
        size="medium"
        style={{ display: "flex", marginTop: "10px" }}
      >
        <Space direction="horizontal" size="medium" style={{ display: "flex" }}>
          <Select
            placeholder="Select a language"
            style={{ width: "10rem" }}
            options={[
              { value: "c", label: "C" },
              { value: "cpp", label: "C++" },
              { value: "java", label: "Java" },
            ]}
            onChange={(value) => setLanguage(value)}
          />
          <Button type="primary" htmlType="submit">
            提交捏
          </Button>
          <input type="hidden" name="language" value={language} />
        </Space>
        <TextArea
          name="code"
          placeholder="Paste your code here desu~"
          required
          autoSize={{
            minRows: 10,
            maxRows: 20,
          }}
        />
      </Space>
    </Form>
  );
}

export { ErrorBoundary } from "~/src/ErrorBoundary";
export { CatchBoundary } from "~/src/CatchBoundary";
