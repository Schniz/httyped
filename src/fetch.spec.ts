import { fetcher } from "./fetch";
import { RouteDefiner, Meta } from "./RouteDefiner";
import * as t from "io-ts";
import { Server, createServer } from "http";
import { AddressInfo } from "net";
import { ENGINE_METHOD_ALL } from "constants";

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
    res.end(
      JSON.stringify({
        success: true,
        data: { url: req.url }
      })
    );
  });

  const host = getHost(server);

  const Result = t.type({ url: t.string });
  const fetch = fetcher(
    RouteDefiner.get
      .returns(Result)
      .fixed("hello")
      .param("name"),
    host
  );
  const r2 = RouteDefiner.get.returns(Result).fixed("hello");
  const fetch2 = fetcher(r2, host);

  await fetch2({ params: {} });

  const response = await fetch({
    params: { name: "Gal" }
  });

  expect(response.success).toBe(true);
  if (response.success) {
    expect(response.data.url).toBe("/hello/Gal");
  }
});

function getHost(app: Server) {
  server = app.listen(0);
  const port = (server.address() as AddressInfo).port;
  return `http://localhost:${port}`;
}
