import { j as jsxRuntimeExports } from "../_libs/react.mjs";
import { c as cn } from "./utils-H80jjgLf.mjs";
const novaImg = "/assets/nova-mascot-B6t1xEBv.png";
function Nova({
  size = 120,
  float = true,
  glow = true,
  priority = false,
  className
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    "div",
    {
      className: cn(
        "relative inline-block",
        float && "animate-float",
        glow && "animate-pulse-glow",
        className
      ),
      style: { width: size, height: size },
      children: /* @__PURE__ */ jsxRuntimeExports.jsx(
        "img",
        {
          src: novaImg,
          alt: "Nova, your AI tutor mascot",
          width: size,
          height: size,
          className: "select-none pointer-events-none drop-shadow-2xl",
          draggable: false,
          loading: priority ? "eager" : "lazy",
          decoding: priority ? "sync" : "async",
          fetchPriority: priority ? "high" : "auto"
        }
      )
    }
  );
}
export {
  Nova as N
};
