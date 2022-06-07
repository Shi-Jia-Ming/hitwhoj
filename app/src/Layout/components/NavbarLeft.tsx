import { NavLink } from "@remix-run/react";
import { Menu } from "@arco-design/web-react";
import {
  IconArchive,
  IconBook,
  IconHistory,
  IconMessage,
  IconQuestionCircle,
  IconTrophy,
  IconUserGroup,
} from "@arco-design/web-react/icon";

// 左侧导航栏列表
type Route = {
  name: string;
  href: string;
  icon?: React.ReactNode;
};

const navBarRoutes: Route[] = [
  {
    name: "题目",
    href: "/problem",
    icon: <IconBook />,
  },
  {
    name: "题单",
    href: "/problemset",
    icon: <IconArchive />,
  },
  {
    name: "比赛",
    href: "/contest",
    icon: <IconTrophy />,
  },
  {
    name: "团队",
    href: "/team",
    icon: <IconUserGroup />,
  },
  {
    name: "评测",
    href: "/record",
    icon: <IconHistory />,
  },
  {
    name: "讨论",
    href: "/comment",
    icon: <IconMessage />,
  },
  {
    name: "文档",
    href: "/docs",
    icon: <IconQuestionCircle />,
  },
];

export default function NavbarLeft() {
  return (
    <div>
      <NavLink to="/">
        <div
          style={{
            height: "4rem",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <h1 style={{ color: "var(--color-text-1)" }}>HITwh OJ</h1>
        </div>
      </NavLink>
      <Menu>
        {navBarRoutes.map((route) => (
          <NavLink prefetch="intent" to={route.href} key={route.href}>
            <Menu.Item key={route.href}>
              {route.icon}
              {route.name}
            </Menu.Item>
          </NavLink>
        ))}
      </Menu>
    </div>
  );
}
