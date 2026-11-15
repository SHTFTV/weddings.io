import { createFileRoute, redirect } from "@tanstack/react-router";

const validCultures = new Set([
  "chinese",
  "jewish",
  "mexican",
  "nordic",
  "persian",
  "south-asian",
  "southeast-asian",
  "traditional",
  "western",
]);

export const Route = createFileRoute("/tools/$culture")({
  beforeLoad: ({ params }) => {
    const culture = params.culture;
    if (validCultures.has(culture)) {
      throw redirect({ href: `/tools/${culture}/index.html`, reloadDocument: true });
    }
    throw redirect({ href: "/tools" });
  },
});
