import { ActionFunction, Form, MetaFunction, redirect } from "remix";
import { db } from "~/utils/db.server";
import { ensureNotEmptyString, invariant } from "~/utils/invariant";

export const action: ActionFunction = async ({ request }) => {
  const form = await request.formData();

  const title = invariant(
    ensureNotEmptyString(form.get("title")),
    "Title is required"
  );
  const description = invariant(
    ensureNotEmptyString(form.get("description")),
    "Description is required"
  );

  if (!title || !description) {
    throw new Response("Title or description is required", { status: 400 });
  }

  const { sid } = await db.problemSet.create({
    data: {
      title,
      description,
    },
  });

  return redirect(`/problemset/${sid}`);
};

export const meta: MetaFunction = () => ({
  title: "Create: Problem Set - HITwh OJ",
});

export default function ProblemSetNew() {
  return (
    <>
      <h1>创建题单</h1>
      <Form method="post">
        <label htmlFor="title">标题</label>
        <input type="text" name="title" id="title" />
        <br />
        <label htmlFor="description">描述</label>
        <input type="text" name="description" id="description" />
        <br />
        <button type="submit">创建</button>
      </Form>
    </>
  );
}
