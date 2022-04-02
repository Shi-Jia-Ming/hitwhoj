import React from "react";
import { Layout } from "@arco-design/web-react";
import NavbarLeft from "./components/NavbarLeft";
import NavbarTop from "./components/NavbarTop";

const Sider = Layout.Sider;
const Header = Layout.Header;
const Content = Layout.Content;
const Footer = Layout.Footer;

type LayoutProps = {
  children: React.ReactNode;
};

export default function MainLayout({ children }: LayoutProps) {
  return (
    <Layout
      style={{
        height: "100vh",
        flexDirection: "row",
        overflow: "hidden",
      }}
    >
      <Sider breakpoint="lg" width="12rem" collapsible>
        <NavbarLeft />
      </Sider>
      <Layout style={{ height: "100%" }}>
        <Header>
          <NavbarTop />
        </Header>
        <Layout
          style={{
            backgroundColor: "var(--color-bg-3)",
            padding: "0 5%",
            boxShadow: "0 0 10px #0000001b inset",
            overflow: "auto",
          }}
        >
          <Content style={{ marginTop: "1rem" }}>{children}</Content>
          <Footer>Footer</Footer>
        </Layout>
      </Layout>
    </Layout>
  );
}
