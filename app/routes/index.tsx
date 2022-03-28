import { Link, MetaFunction } from "remix";

export const meta: MetaFunction = () => ({
  title: "首页 - HITwh OJ",
});

export default function Index() {
  return (
    <div style={{ fontFamily: "system-ui, sans-serif", lineHeight: "1.4" }}>
      <h1>Welcome to Remix</h1>
      <ul>
        <li>
          <Link to="/docs">Documents</Link>
        </li>
        <li>
          <Link to="/login">Sign in</Link>
        </li>
        <li>
          <Link to="/register">Sign up</Link>
        </li>
      </ul>
    </div>
  );
}
