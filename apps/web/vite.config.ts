import { loadEnv } from "vite";
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, ".", "");
  const apiProxyTarget = env.API_PROXY_TARGET || "http://localhost:8080";

  return {
    plugins: [react()],
    build: {
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (id.indexOf("node_modules") !== -1) {
              if (id.indexOf("@tanstack/react-query") !== -1) {
                return "react-query";
              }

              if (id.indexOf("react") !== -1 || id.indexOf("scheduler") !== -1) {
                return "react-vendor";
              }
            }

            if (
              id.indexOf("/src/pages/resume-editor/") !== -1 ||
              id.indexOf("/src/widgets/resume-editor/") !== -1
            ) {
              return "resume-editor";
            }

            if (id.indexOf("/src/pages/practical-interviews/") !== -1) {
              return "practical-interviews";
            }

            if (id.indexOf("/src/pages/resume-tailor/") !== -1) {
              return "resume-tailor";
            }

            return undefined;
          },
        },
      },
    },
    server: {
      proxy: {
        "/api": {
          target: apiProxyTarget,
          changeOrigin: true,
        },
        "/v3/api-docs": {
          target: apiProxyTarget,
          changeOrigin: true,
        },
        "/swagger-ui.html": {
          target: apiProxyTarget,
          changeOrigin: true,
        },
        "/uploads": {
          target: apiProxyTarget,
          changeOrigin: true,
        },
      },
    },
    test: {
      environment: "jsdom",
      setupFiles: "./src/test/setup.ts",
      // Browser journeys under e2e/ run with Playwright, not Vitest.
      include: ["src/**/*.{test,spec}.{ts,tsx}"],
    },
  };
});
