import { Link, NavLink } from "@remix-run/react";
import { useContext } from "react";
import {
  Grid,
  Avatar,
  Space,
  Switch,
  Dropdown,
  Menu,
  Button,
  Divider,
} from "@arco-design/web-react";
import { IconUser, IconSun, IconMoon } from "@arco-design/web-react/icon";
import { ThemeContext } from "~/utils/context/theme";
import { UserInfoContext } from "~/utils/context/user";
import { LoginModalContext } from "~/utils/context/modal";

const Row = Grid.Row;
const MenuItem = Menu.Item;

export default function NavbarTop() {
  const { theme, setTheme } = useContext(ThemeContext);
  const user = useContext(UserInfoContext);

  const setLoginVisible = useContext(LoginModalContext);

  return (
    <Row
      justify="end"
      align="center"
      style={{
        height: "4rem",
        padding: "0 5% 0 40px",
        backgroundColor: "var(--color-bg-2)",
        justifyContent: "space-between",
      }}
    >
      <div
        style={{ textAlign: "center", fontSize: "1.5rem", margin: "10px 0" }}
      >
        <NavLink to="/">HITwh OJ</NavLink>
      </div>
      <Space size="large">
        <Switch
          checked={theme !== "dark"}
          onChange={() => setTheme(theme === "dark" ? "light" : "dark")}
          checkedIcon={<IconSun />}
          uncheckedIcon={<IconMoon />}
        />
        {user ? (
          <Link to={`/user/${user.id}`}>
            <Dropdown
              position="bottom"
              droplist={
                <Menu>
                  <NavLink to={`/user/${user.id}`}>
                    <MenuItem key="user">
                      {user.nickname && <b>{user.nickname} </b>}
                      <span>@{user.username}</span>
                    </MenuItem>
                  </NavLink>
                  <Divider style={{ margin: "5px 0" }} />
                  <NavLink to={`/user/${user.id}`}>
                    <MenuItem key="profile">资料</MenuItem>
                  </NavLink>
                  <NavLink to={`/user/${user.id}/edit`}>
                    <MenuItem key="settings">设置</MenuItem>
                  </NavLink>
                  <NavLink to="/logout">
                    <MenuItem
                      key="logout"
                      style={{ color: "rgb(var(--danger-6))" }}
                    >
                      登出
                    </MenuItem>
                  </NavLink>
                </Menu>
              }
            >
              <Avatar style={{ backgroundColor: "#00d0b6" }}>
                {user.avatar ? (
                  <img alt="avatar" src={user.avatar} />
                ) : (
                  <IconUser />
                )}
              </Avatar>
            </Dropdown>
          </Link>
        ) : (
          <Space size="medium">
            <Button onClick={() => setLoginVisible(true)}>登录</Button>
            <Button type="primary">注册</Button>
          </Space>
        )}
      </Space>
    </Row>
  );
}
