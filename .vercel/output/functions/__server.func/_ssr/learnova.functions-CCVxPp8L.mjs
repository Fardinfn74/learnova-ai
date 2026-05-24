import { c as createSsrRpc } from "./createSsrRpc-CbfToRDd.mjs";
import { r as requireSupabaseAuth } from "./auth-middleware-JBvrN22J.mjs";
import { a as createServerFn } from "./index.mjs";
import { m as objectType, t as stringType, k as numberType, y as unknownType, i as enumType } from "../_libs/zod.mjs";
const getProfile = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).handler(createSsrRpc("2cf72878db8e18ebacc3ab18eed1bef4cb3152fd8eaff5fedc805f882179fc75"));
createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  display_name: stringType().min(1).max(80).optional(),
  preferred_language: enumType(["english", "bangla", "banglish"]).optional()
}).parse(d)).handler(createSsrRpc("b7ff9bb7d762a81cb8704aba02fb217741ea3bc1d73535d2b4d0d4475b0ea5d8"));
const awardXp = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  amount: numberType().int().min(1).max(500),
  reason: stringType().min(1).max(120)
}).parse(d)).handler(createSsrRpc("0a8085101806ca5c704ccec4ec31b55b8d67cc3055a3d1cb34cce3511894f6df"));
const listThreads = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).handler(createSsrRpc("807b46fd34ccb53aee8d2323f2f49d06048a688cef95bded43d46e17a905e130"));
const createThread = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  title: stringType().max(120).optional(),
  subject: stringType().max(60).optional()
}).parse(d)).handler(createSsrRpc("c7bda1f65790bbfa3dd835523f816c6e03aeb264230f3f310a845e947ed9a0df"));
const deleteThread = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  id: stringType().uuid()
}).parse(d)).handler(createSsrRpc("d77a95895b0a42df2722c950307f63e14d619ba3f481a38e08c40b01d167dd32"));
const getThreadMessages = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  threadId: stringType().uuid()
}).parse(d)).handler(createSsrRpc("977a307db3b12d62b2b86e112fd47189f08ef3be335fe72593b0421de09a73d5"));
const saveMessage = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  thread_id: stringType().uuid(),
  role: enumType(["user", "assistant"]),
  content: stringType().min(1).max(5e4),
  parts: unknownType().optional()
}).parse(d)).handler(createSsrRpc("696da997bc432283232876748c665c27d205fec22d987ffc1b6948fb98061ff0"));
const listBadges = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).handler(createSsrRpc("8298200df457bf6c3defa152606ad9cf8e39c5b1fdfa069056490728ad0022e1"));
const xpHistory = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).handler(createSsrRpc("362c02b0a718f55c96672705bcf6d2b090915d42b9be5bdf464d5641b2123d53"));
export {
  awardXp as a,
  getThreadMessages as b,
  createThread as c,
  deleteThread as d,
  listThreads as e,
  getProfile as g,
  listBadges as l,
  saveMessage as s,
  xpHistory as x
};
