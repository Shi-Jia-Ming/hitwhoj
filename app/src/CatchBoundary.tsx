import { Button, Result } from "@arco-design/web-react";
import { Link, useCatch, useLocation, useNavigate } from "@remix-run/react";
import type { AllThrownResponse } from "~/utils/invariant";

export function CatchBoundary() {
  const caught = useCatch<AllThrownResponse>();
  const navigate = useNavigate();
  const location = useLocation();

  const login = (
    <Link to={`/login?redirect=${location.pathname}`}>
      <Button type="outline">登录</Button>
    </Link>
  );

  const goback = (
    <Button type="primary" onClick={() => navigate(-1)}>
      返回
    </Button>
  );

  const diana = (
    <a
      target="_blank"
      rel="noreferrer"
      href="https://www.bilibili.com/s/video/BV1FX4y1g7u8?t=42.3"
    >
      <Button type="outline">关注嘉然（不推荐）</Button>
    </a>
  );

  switch (caught.status) {
    case 400:
      return (
        <Result
          status="error"
          title="请求参数错误"
          subTitle={
            <ol
              style={{
                display: "inline-block",
                textAlign: "left",
              }}
            >
              {caught.data.map((data, index) => (
                <li key={index}>{data}</li>
              ))}
            </ol>
          }
          extra={[goback]}
        />
      );
    case 401:
      return (
        <Result
          status="error"
          title="请先登录"
          subTitle="该页面不对访客开放"
          extra={[goback, login]}
        />
      );
    case 403:
      return (
        <Result
          status="403"
          title="权限不足"
          subTitle="您没有访问该页面的权限"
          extra={[goback]}
        />
      );
    case 404:
      return (
        <Result
          status="404"
          title="未找到"
          subTitle="您访问的页面不存在"
          extra={[goback, diana]}
        />
      );
  }
}
