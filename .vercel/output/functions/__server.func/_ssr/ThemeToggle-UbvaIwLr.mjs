import { j as jsxRuntimeExports } from "../_libs/react.mjs";
import { a as useTheme } from "./router-BWQ2rPTY.mjs";
import { c as cn } from "./utils-H80jjgLf.mjs";
import { s as Sun, k as Moon } from "../_libs/lucide-react.mjs";
function ThemeToggle({ className }) {
  const { theme, toggle } = useTheme();
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    "button",
    {
      onClick: toggle,
      "aria-label": "Toggle theme",
      title: theme === "dark" ? "Switch to light mode" : "Switch to dark mode",
      className: cn(
        "relative inline-flex h-9 w-9 items-center justify-center rounded-full glass hover:scale-110 transition shadow-soft",
        className
      ),
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Sun, { className: cn("h-4 w-4 absolute transition-all", theme === "dark" ? "opacity-0 rotate-90 scale-50" : "opacity-100 rotate-0 scale-100") }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Moon, { className: cn("h-4 w-4 absolute transition-all", theme === "dark" ? "opacity-100 rotate-0 scale-100" : "opacity-0 -rotate-90 scale-50") })
      ]
    }
  );
}
export {
  ThemeToggle as T
};
