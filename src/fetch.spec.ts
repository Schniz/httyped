import { fetcher } from "./fetch";
import { RouteDefiner } from "./RouteDefiner";
import * as t from "io-ts";
import { Server, createServer } from "http";
import { AddressInfo } from "net";

let server: Server | null = null;

afterEach(() => {
  if (server) {
    server.close();
    server = null;
  }
});

test("Calls the right place", async () => {
  const server = createServer((req, res) => {
    res.writeHead(200, { "Content-Type": "application/json" });
    const result: t.TypeOf<typeof ResponseResult> = {
      url: req.url
    };
    res.end(JSON.stringify(result));
  });

  const host = getHost(server);

  const ResponseResult = t.type({ url: t.string });
  const fetch = fetcher(
    RouteDefiner.get
      .returns(ResponseResult)
      .fixed("hello")
      .param("name"),
    host
  );
  const r2 = RouteDefiner.get.returns(ResponseResult).fixed("hello");
  const fetch2 = fetcher(r2, host);

  await fetch2({ params: {} });

  const response = await fetch({
    params: { name: "Gal" }
  });

  expect(response.status).toBe(200);
  expect(response.data.url).toBe("/hello/Gal");
});

function getHost(app: Server) {
  server = app.listen(0);
  const port = (server.address() as AddressInfo).port;
  return `http://localhost:${port}`;
}
