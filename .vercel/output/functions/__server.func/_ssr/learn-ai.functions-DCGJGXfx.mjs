import { c as createSsrRpc } from "./createSsrRpc-CbfToRDd.mjs";
import { r as requireSupabaseAuth } from "./auth-middleware-JBvrN22J.mjs";
import { a as createServerFn } from "./index.mjs";
import { m as objectType, i as enumType, k as numberType, t as stringType, e as arrayType } from "../_libs/zod.mjs";
const generateQuiz = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  topic: stringType().min(2).max(200),
  difficulty: enumType(["easy", "medium", "hard"]).default("medium"),
  count: numberType().int().min(3).max(10).default(5),
  language: enumType(["english", "bangla", "banglish"]).default("english")
}).parse(d)).handler(createSsrRpc("bdae223da88f48a2748f77243bd92b86bdbdee720498aef131ffbd6f795c85b7"));
createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  id: stringType().uuid()
}).parse(d)).handler(createSsrRpc("8633c3504b8395fb6f321efe7c6b82121f8635edb929510ee62f65a6a0b3d097"));
createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).handler(createSsrRpc("1b2b7191b91c3ff789bd5a616b7e024a46aeaff6d0658c1531356036b7b09f53"));
const submitQuiz = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  quiz_id: stringType().uuid(),
  answers: arrayType(numberType().int().min(0).max(3))
}).parse(d)).handler(createSsrRpc("ea84f326f490e76c4a356ae32318f7662447176cdaa95486e841462d0382705b"));
const summarizeNote = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  text: stringType().min(50).max(2e4),
  language: enumType(["english", "bangla", "banglish"]).default("english")
}).parse(d)).handler(createSsrRpc("75329c7c4ff75e07d1d0909733fee351e9eb0d4cdb102b525bf105748123298f"));
const listNotes = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).handler(createSsrRpc("5a1ebc07180d8b151113c01624cc0dcef24d1cd78c558785d46e545bcf84c640"));
const getNote = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  id: stringType().uuid()
}).parse(d)).handler(createSsrRpc("473c9cddf91b27ff2460c184dffca1676fad003867f4633c5b577f33e3952999"));
const analyzeDrawing = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  image: stringType(),
  prompt: stringType().optional(),
  language: enumType(["english", "bangla", "banglish"]).default("english")
}).parse(d)).handler(createSsrRpc("65750bfb5c27df3558a9c4f33ff513fb15364ec4647ca3e23b63df3037bfb15c"));
const generatePodcast = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  text: stringType().min(50).max(3e4),
  language: enumType(["english", "bangla", "banglish"]).default("english")
}).parse(d)).handler(createSsrRpc("25f70043a9c51486d23c5082abc8d71fd8cb4f7fcab680b9388e48a2b95c8f9c"));
const triggerNovaInRoom = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  roomId: stringType().uuid()
}).parse(d)).handler(createSsrRpc("f0a5ad3ea41e0981f2316f12f6513cbc0fdddd4dde839319874118bd8f02f913"));
const createBattleQuestions = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  topic: stringType().min(2).max(100)
}).parse(d)).handler(createSsrRpc("e35bddc95802986bc149006002b212091611bf1e7f9de561056e931f56864d9e"));
export {
  analyzeDrawing as a,
  generateQuiz as b,
  createBattleQuestions as c,
  getNote as d,
  summarizeNote as e,
  generatePodcast as g,
  listNotes as l,
  submitQuiz as s,
  triggerNovaInRoom as t
};
