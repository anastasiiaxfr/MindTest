export default {
  async headers() {
    return [{
      source: "/",
      has: [{ type: "query", key: "result" }],
      headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow, noarchive" }],
    }];
  },
  async rewrites() {
    return [{ source: "/og-img", destination: "/og-image.png" }];
  },
};
