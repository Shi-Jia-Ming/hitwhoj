import { ContestRegistrationType, ContestSystem } from "@prisma/client";
import type { ActionArgs, LoaderArgs, MetaFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Form, useLoaderData, useTransition } from "@remix-run/react";
import { db } from "~/utils/server/db.server";
import { invariant } from "~/utils/invariant";
import {
  datetimeStringScheme,
  descriptionScheme,
  idScheme,
  systemScheme,
  tagScheme,
  timezoneScheme,
  titleScheme,
  weakPasswordScheme,
} from "~/utils/scheme";
import {
  Button,
  Form as ArcoForm,
  Input,
  DatePicker,
  Select,
  Typography,
  Message,
  Alert,
  Checkbox,
  Space,
} from "@arco-design/web-react";
import { adjustTimezone, getDatetimeLocal } from "~/utils/time";
import { useEffect, useState } from "react";
import { TagEditor } from "~/src/TagEditor";
import { ProblemEditor } from "~/src/ProblemEditor";
import { selectProblemListData } from "~/utils/db/problem";
import { findRequestUser } from "~/utils/permission";
import { Privileges } from "~/utils/permission/privilege";
import { Permissions } from "~/utils/permission/permission";
import { findContestTeam } from "~/utils/db/contest";
import { z } from "zod";

const FormItem = ArcoForm.Item;
const TextArea = Input.TextArea;
const RangePicker = DatePicker.RangePicker;
const Option = Select.Option;

export async function loader({ request, params }: LoaderArgs) {
  const contestId = invariant(idScheme, params.contestId, { status: 404 });
  const self = await findRequestUser(request);
  await self.checkPrivilege(Privileges.PRIV_OPERATE);
  await self
    .team(await findContestTeam(contestId))
    .contest(contestId)
    .checkPermission(Permissions.PERM_EDIT_CONTEST);

  const contest = await db.contest.findUnique({
    where: { id: contestId },
    select: {
      id: true,
      title: true,
      description: true,
      beginTime: true,
      endTime: true,
      system: true,
      private: true,
      registrationType: true,
      registrationPassword: true,
      tags: { select: { name: true } },
      problems: {
        orderBy: { rank: "asc" },
        select: {
          problem: {
            select: {
              ...selectProblemListData,
            },
          },
        },
      },
    },
  });

  if (!contest) {
    throw new Response("Contest not found", { status: 404 });
  }

  return json({ contest });
}

enum ActionType {
  CreateTag = "CreateTag",
  DeleteTag = "DeleteTag",
  CreateProblem = "CreateProblem",
  DeleteProblem = "DeleteProblem",
  MoveProblemUp = "MoveProblemUp",
  MoveProblemDown = "MoveProblemDown",
  UpdateInformation = "UpdateInformation",
}

export async function action({ request, params }: ActionArgs) {
  const contestId = invariant(idScheme, params.contestId, { status: 404 });
  const self = await findRequestUser(request);
  await self.checkPrivilege(Privileges.PRIV_OPERATE);
  await self
    .team(await findContestTeam(contestId))
    .contest(contestId)
    .checkPermission(Permissions.PERM_EDIT_CONTEST);

  const form = await request.formData();
  const _action = form.get("_action");

  switch (_action) {
    // 创建题目
    case ActionType.CreateProblem: {
      const problemId = invariant(idScheme, form.get("pid"));

      await db.$transaction(async (db) => {
        const {
          _max: { rank },
        } = await db.contestProblem.aggregate({
          where: { contestId },
          _max: { rank: true },
        });

        await db.contestProblem.create({
          data: {
            contestId,
            problemId,
            rank: (rank ?? 0) + 1,
          },
        });
      });

      return null;
    }

    // 删除题目
    case ActionType.DeleteProblem: {
      const problemId = invariant(idScheme, form.get("pid"));

      await db.$transaction(async (db) => {
        const { rank } = await db.contestProblem.delete({
          where: {
            contestId_problemId: {
              contestId,
              problemId,
            },
          },
        });

        await db.contestProblem.updateMany({
          where: { contestId, rank: { gte: rank } },
          data: { rank: { decrement: 1 } },
        });
      });

      return null;
    }

    // 移动题目
    case ActionType.MoveProblemUp:
    case ActionType.MoveProblemDown: {
      const problemId = invariant(idScheme, form.get("pid"));

      await db.$transaction(async (db) => {
        const record = await db.contestProblem.findUnique({
          where: {
            contestId_problemId: {
              contestId,
              problemId,
            },
          },
        });

        if (!record) {
          throw new Response("Problem not found", { status: 400 });
        }

        // 获取交换的题目
        const target = await db.contestProblem.findUnique({
          where: {
            contestId_rank: {
              contestId,
              rank:
                _action === ActionType.MoveProblemUp
                  ? record.rank - 1
                  : record.rank + 1,
            },
          },
        });

        if (!target) {
          throw new Response("Cannot move problem", { status: 400 });
        }

        // 删除原来的排名
        await db.contestProblem.delete({
          where: { contestId_rank: { contestId, rank: record.rank } },
        });
        await db.contestProblem.delete({
          where: { contestId_rank: { contestId, rank: target.rank } },
        });

        // 添加新的排名
        await db.contestProblem.createMany({
          data: [
            { contestId, problemId: record.problemId, rank: target.rank },
            { contestId, problemId: target.problemId, rank: record.rank },
          ],
        });
      });

      return null;
    }

    // 创建标签
    case ActionType.CreateTag: {
      const tag = invariant(tagScheme, form.get("tag"));

      await db.contest.update({
        where: { id: contestId },
        data: {
          tags: {
            connectOrCreate: {
              where: { name: tag },
              create: { name: tag },
            },
          },
        },
      });

      return null;
    }

    // 删除标签
    case ActionType.DeleteTag: {
      const tag = invariant(tagScheme, form.get("tag"));

      await db.contest.update({
        where: { id: contestId },
        data: {
          tags: {
            disconnect: {
              name: tag,
            },
          },
        },
      });

      return null;
    }

    // 更新比赛信息
    case ActionType.UpdateInformation: {
      const title = invariant(titleScheme, form.get("title"));
      const description = invariant(descriptionScheme, form.get("description"));

      // 客户端所在的时区
      const timezone = invariant(timezoneScheme, form.get("timezone"));

      const beginTime = adjustTimezone(
        invariant(datetimeStringScheme, form.get("beginTime")),
        timezone
      );
      const endTime = adjustTimezone(
        invariant(datetimeStringScheme, form.get("endTime")),
        timezone
      );

      const system = invariant(systemScheme, form.get("system"));
      const priv = form.get("private") === "true";
      const registrationType = invariant(
        z.nativeEnum(ContestRegistrationType),
        form.get("registrationType")
      );
      const registrationPassword =
        registrationType === "Password"
          ? invariant(weakPasswordScheme, form.get("registrationPassword"))
          : "";

      await db.contest.update({
        where: { id: contestId },
        data: {
          title,
          description,
          beginTime,
          endTime,
          system,
          private: priv,
          registrationType,
          registrationPassword,
        },
      });

      return null;
    }
  }

  throw new Response("I'm a teapot", { status: 418 });
}

export const meta: MetaFunction<typeof loader> = ({ data }) => ({
  title: `编辑比赛: ${data?.contest.title} - HITwh OJ`,
});

export default function ContestEdit() {
  const { contest } = useLoaderData<typeof loader>();

  const [beginTime, setBeginTime] = useState(
    new Date(contest.beginTime).getTime()
  );
  const [endTime, setEndTime] = useState(new Date(contest.endTime).getTime());
  const [system, setSystem] = useState(contest.system);
  const [pub, setPub] = useState(!contest.private);
  const [registrationType, setRegistrationType] = useState(
    contest.registrationType
  );
  const [registrationPassword, setRegistrationPassword] = useState(
    contest.registrationPassword
  );

  const { state, type } = useTransition();
  const isActionSubmit = state === "submitting" && type === "actionSubmission";
  const isActionReload = state === "loading" && type === "actionReload";
  const isUpdating = isActionSubmit || isActionReload;
  useEffect(() => {
    if (isActionReload) {
      Message.success("更新成功");
    }
  }, [isActionReload]);

  return (
    <Typography>
      <Typography.Title heading={4}>修改比赛信息</Typography.Title>
      <Typography.Paragraph>
        <FormItem label="标签" layout="vertical">
          <TagEditor
            tags={contest.tags.map(({ name }) => name)}
            createAction={ActionType.CreateTag}
            deleteAction={ActionType.DeleteTag}
          />
        </FormItem>

        <Form method="post">
          <FormItem
            label="标题"
            required
            layout="vertical"
            disabled={isUpdating}
          >
            <Input name="title" defaultValue={contest.title} required />
          </FormItem>

          <FormItem label="描述" layout="vertical" disabled={isUpdating}>
            <TextArea
              name="description"
              defaultValue={contest.description}
              autoSize={{ minRows: 3 }}
            />
          </FormItem>

          <FormItem
            label="时间"
            required
            layout="vertical"
            disabled={isUpdating}
          >
            <input
              type="hidden"
              name="beginTime"
              value={getDatetimeLocal(beginTime)}
              required
            />
            <input
              type="hidden"
              name="endTime"
              value={getDatetimeLocal(endTime)}
              required
            />
            <input
              type="hidden"
              name="timezone"
              value={new Date().getTimezoneOffset()}
              required
            />
            <RangePicker
              defaultValue={[beginTime, endTime]}
              showTime={{ format: "HH:mm" }}
              format="YYYY-MM-DD HH:mm"
              allowClear={false}
              onChange={(dates) => {
                setBeginTime(new Date(dates[0]).getTime());
                setEndTime(new Date(dates[1]).getTime());
              }}
            />
          </FormItem>

          <FormItem
            label="赛制"
            required
            layout="vertical"
            disabled={isUpdating}
          >
            <input type="hidden" name="system" value={system} required />
            <Select
              value={system}
              onChange={(value) => setSystem(value as ContestSystem)}
              style={{ width: 150 }}
            >
              {Object.values(ContestSystem).map((system) => (
                <Option key={system} value={system} />
              ))}
            </Select>
          </FormItem>

          <FormItem disabled={isUpdating}>
            <input type="hidden" name="private" value={String(!pub)} />
            <Checkbox
              checked={pub}
              onChange={(checked) => setPub(checked)}
              disabled={isUpdating}
            >
              公开比赛（勾选后普通用户可以在网站首页查看到该比赛）
            </Checkbox>
          </FormItem>

          <FormItem label="报名方式" layout="vertical" required>
            <input
              type="hidden"
              name="registrationType"
              value={registrationType}
              required
            />
            <input
              type="hidden"
              name="registrationPassword"
              value={registrationPassword}
              required
            />
            <Space>
              <Select
                value={registrationType}
                onChange={(type) => setRegistrationType(type)}
                disabled={isUpdating}
                style={{ width: 150 }}
              >
                <Select.Option value="Disallow">不允许报名</Select.Option>
                <Select.Option value="Password">需要密码</Select.Option>
                <Select.Option value="Public">允许任何人</Select.Option>
              </Select>
              {registrationType === "Password" && (
                <Input
                  placeholder="报名密码"
                  value={registrationPassword}
                  onChange={(password) => setRegistrationPassword(password)}
                  disabled={isUpdating}
                  required
                />
              )}
            </Space>
          </FormItem>

          <FormItem>
            <Button
              type="primary"
              htmlType="submit"
              loading={isUpdating}
              name="_action"
              value={ActionType.UpdateInformation}
            >
              确认更新
            </Button>
          </FormItem>
        </Form>
      </Typography.Paragraph>

      <Typography.Title heading={4}>修改比赛题目</Typography.Title>
      {new Date() > new Date(contest.beginTime) && (
        <Typography.Paragraph>
          <Alert
            type="warning"
            content="如果您在比赛开始后修改题目，系统可能会出现一些奇妙的特性"
          />
        </Typography.Paragraph>
      )}
      <Typography.Paragraph>
        <ProblemEditor
          problems={contest.problems.map(({ problem }) => problem)}
          createAction={ActionType.CreateProblem}
          deleteAction={ActionType.DeleteProblem}
          moveUpAction={ActionType.MoveProblemUp}
          moveDownAction={ActionType.MoveProblemDown}
        />
      </Typography.Paragraph>
    </Typography>
  );
}

export { ErrorBoundary } from "~/src/ErrorBoundary";
export { CatchBoundary } from "~/src/CatchBoundary";
