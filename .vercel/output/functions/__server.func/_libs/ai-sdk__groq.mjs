import { c as InvalidResponseDataError, U as UnsupportedFunctionalityError, N as NoSuchModelError } from "./ai-sdk__provider.mjs";
import { N as withoutTrailingSlash, C as parseProviderOptions, F as postJsonToApi, c as combineHeaders, j as createJsonResponseHandler, o as generateId, g as createEventSourceResponseHandler, u as isParsableJson, M as withUserAgentSuffix, x as loadApiKey, e as convertToBase64, i as createJsonErrorResponseHandler, k as createProviderToolFactory, d as convertBase64ToUint8Array, z as mediaTypeToExtension, E as postFormDataToApi, w as lazySchema, O as zodSchema } from "./ai-sdk__provider-utils.mjs";
import { o as object, _ as _enum, f as boolean, q as string, n as number, d as array, j as literal, v as union } from "./zod.mjs";
function convertGroqUsage(usage) {
  var _a, _b, _c, _d;
  if (usage == null) {
    return {
      inputTokens: {
        total: void 0,
        noCache: void 0,
        cacheRead: void 0,
        cacheWrite: void 0
      },
      outputTokens: {
        total: void 0,
        text: void 0,
        reasoning: void 0
      },
      raw: void 0
    };
  }
  const promptTokens = (_a = usage.prompt_tokens) != null ? _a : 0;
  const completionTokens = (_b = usage.completion_tokens) != null ? _b : 0;
  const reasoningTokens = (_d = (_c = usage.completion_tokens_details) == null ? void 0 : _c.reasoning_tokens) != null ? _d : void 0;
  const textTokens = reasoningTokens != null ? completionTokens - reasoningTokens : completionTokens;
  return {
    inputTokens: {
      total: promptTokens,
      noCache: promptTokens,
      cacheRead: void 0,
      cacheWrite: void 0
    },
    outputTokens: {
      total: completionTokens,
      text: textTokens,
      reasoning: reasoningTokens
    },
    raw: usage
  };
}
function convertToGroqChatMessages(prompt) {
  var _a;
  const messages = [];
  for (const { role, content } of prompt) {
    switch (role) {
      case "system": {
        messages.push({ role: "system", content });
        break;
      }
      case "user": {
        if (content.length === 1 && content[0].type === "text") {
          messages.push({ role: "user", content: content[0].text });
          break;
        }
        messages.push({
          role: "user",
          content: content.map((part) => {
            switch (part.type) {
              case "text": {
                return { type: "text", text: part.text };
              }
              case "file": {
                if (!part.mediaType.startsWith("image/")) {
                  throw new UnsupportedFunctionalityError({
                    functionality: "Non-image file content parts"
                  });
                }
                const mediaType = part.mediaType === "image/*" ? "image/jpeg" : part.mediaType;
                return {
                  type: "image_url",
                  image_url: {
                    url: part.data instanceof URL ? part.data.toString() : `data:${mediaType};base64,${convertToBase64(part.data)}`
                  }
                };
              }
            }
          })
        });
        break;
      }
      case "assistant": {
        let text = "";
        let reasoning = "";
        const toolCalls = [];
        for (const part of content) {
          switch (part.type) {
            // groq supports reasoning for tool-calls in multi-turn conversations
            // https://github.com/vercel/ai/issues/7860
            case "reasoning": {
              reasoning += part.text;
              break;
            }
            case "text": {
              text += part.text;
              break;
            }
            case "tool-call": {
              toolCalls.push({
                id: part.toolCallId,
                type: "function",
                function: {
                  name: part.toolName,
                  arguments: JSON.stringify(part.input)
                }
              });
              break;
            }
          }
        }
        messages.push({
          role: "assistant",
          content: text,
          ...reasoning.length > 0 ? { reasoning } : null,
          ...toolCalls.length > 0 ? { tool_calls: toolCalls } : null
        });
        break;
      }
      case "tool": {
        for (const toolResponse of content) {
          if (toolResponse.type === "tool-approval-response") {
            continue;
          }
          const output = toolResponse.output;
          let contentValue;
          switch (output.type) {
            case "text":
            case "error-text":
              contentValue = output.value;
              break;
            case "execution-denied":
              contentValue = (_a = output.reason) != null ? _a : "Tool execution denied.";
              break;
            case "content":
            case "json":
            case "error-json":
              contentValue = JSON.stringify(output.value);
              break;
          }
          messages.push({
            role: "tool",
            tool_call_id: toolResponse.toolCallId,
            content: contentValue
          });
        }
        break;
      }
      default: {
        const _exhaustiveCheck = role;
        throw new Error(`Unsupported role: ${_exhaustiveCheck}`);
      }
    }
  }
  return messages;
}
function getResponseMetadata({
  id,
  model,
  created
}) {
  return {
    id: id != null ? id : void 0,
    modelId: model != null ? model : void 0,
    timestamp: created != null ? new Date(created * 1e3) : void 0
  };
}
var groqLanguageModelOptions = object({
  reasoningFormat: _enum(["parsed", "raw", "hidden"]).optional(),
  /**
   * Specifies the reasoning effort level for model inference.
   * @see https://console.groq.com/docs/reasoning#reasoning-effort
   */
  reasoningEffort: _enum(["none", "default", "low", "medium", "high"]).optional(),
  /**
   * Whether to enable parallel function calling during tool use. Default to true.
   */
  parallelToolCalls: boolean().optional(),
  /**
   * A unique identifier representing your end-user, which can help OpenAI to
   * monitor and detect abuse. Learn more.
   */
  user: string().optional(),
  /**
   * Whether to use structured outputs.
   *
   * @default true
   */
  structuredOutputs: boolean().optional(),
  /**
   * Whether to use strict JSON schema validation.
   * When true, the model uses constrained decoding to guarantee schema compliance.
   * Only used when structured outputs are enabled and a schema is provided.
   *
   * @default true
   */
  strictJsonSchema: boolean().optional(),
  /**
   * Service tier for the request.
   * - 'on_demand': Default tier with consistent performance and fairness
   * - 'performance': Prioritized tier for latency-sensitive workloads
   * - 'flex': Higher throughput tier optimized for workloads that can handle occasional request failures
   * - 'auto': Uses on_demand rate limits, then falls back to flex tier if exceeded
   *
   * @default 'on_demand'
   */
  serviceTier: _enum(["on_demand", "performance", "flex", "auto"]).optional()
});
var groqErrorDataSchema = object({
  error: object({
    message: string(),
    type: string()
  })
});
var groqFailedResponseHandler = createJsonErrorResponseHandler({
  errorSchema: groqErrorDataSchema,
  errorToMessage: (data) => data.error.message
});
var BROWSER_SEARCH_SUPPORTED_MODELS = [
  "openai/gpt-oss-20b",
  "openai/gpt-oss-120b"
];
function isBrowserSearchSupportedModel(modelId) {
  return BROWSER_SEARCH_SUPPORTED_MODELS.includes(modelId);
}
function getSupportedModelsString() {
  return BROWSER_SEARCH_SUPPORTED_MODELS.join(", ");
}
function prepareTools({
  tools,
  toolChoice,
  modelId
}) {
  tools = (tools == null ? void 0 : tools.length) ? tools : void 0;
  const toolWarnings = [];
  if (tools == null) {
    return { tools: void 0, toolChoice: void 0, toolWarnings };
  }
  const groqTools2 = [];
  for (const tool of tools) {
    if (tool.type === "provider") {
      if (tool.id === "groq.browser_search") {
        if (!isBrowserSearchSupportedModel(modelId)) {
          toolWarnings.push({
            type: "unsupported",
            feature: `provider-defined tool ${tool.id}`,
            details: `Browser search is only supported on the following models: ${getSupportedModelsString()}. Current model: ${modelId}`
          });
        } else {
          groqTools2.push({
            type: "browser_search"
          });
        }
      } else {
        toolWarnings.push({
          type: "unsupported",
          feature: `provider-defined tool ${tool.id}`
        });
      }
    } else {
      groqTools2.push({
        type: "function",
        function: {
          name: tool.name,
          description: tool.description,
          parameters: tool.inputSchema,
          ...tool.strict != null ? { strict: tool.strict } : {}
        }
      });
    }
  }
  if (toolChoice == null) {
    return { tools: groqTools2, toolChoice: void 0, toolWarnings };
  }
  const type = toolChoice.type;
  switch (type) {
    case "auto":
    case "none":
    case "required":
      return { tools: groqTools2, toolChoice: type, toolWarnings };
    case "tool":
      return {
        tools: groqTools2,
        toolChoice: {
          type: "function",
          function: {
            name: toolChoice.toolName
          }
        },
        toolWarnings
      };
    default: {
      const _exhaustiveCheck = type;
      throw new UnsupportedFunctionalityError({
        functionality: `tool choice type: ${_exhaustiveCheck}`
      });
    }
  }
}
function mapGroqFinishReason(finishReason) {
  switch (finishReason) {
    case "stop":
      return "stop";
    case "length":
      return "length";
    case "content_filter":
      return "content-filter";
    case "function_call":
    case "tool_calls":
      return "tool-calls";
    default:
      return "other";
  }
}
var GroqChatLanguageModel = class {
  constructor(modelId, config) {
    this.specificationVersion = "v3";
    this.supportedUrls = {
      "image/*": [/^https?:\/\/.*$/]
    };
    this.modelId = modelId;
    this.config = config;
  }
  get provider() {
    return this.config.provider;
  }
  async getArgs({
    prompt,
    maxOutputTokens,
    temperature,
    topP,
    topK,
    frequencyPenalty,
    presencePenalty,
    stopSequences,
    responseFormat,
    seed,
    stream,
    tools,
    toolChoice,
    providerOptions
  }) {
    var _a, _b, _c;
    const warnings = [];
    const groqOptions = await parseProviderOptions({
      provider: "groq",
      providerOptions,
      schema: groqLanguageModelOptions
    });
    const structuredOutputs = (_a = groqOptions == null ? void 0 : groqOptions.structuredOutputs) != null ? _a : true;
    const strictJsonSchema = (_b = groqOptions == null ? void 0 : groqOptions.strictJsonSchema) != null ? _b : true;
    if (topK != null) {
      warnings.push({ type: "unsupported", feature: "topK" });
    }
    if ((responseFormat == null ? void 0 : responseFormat.type) === "json" && responseFormat.schema != null && !structuredOutputs) {
      warnings.push({
        type: "unsupported",
        feature: "responseFormat",
        details: "JSON response format schema is only supported with structuredOutputs"
      });
    }
    const {
      tools: groqTools2,
      toolChoice: groqToolChoice,
      toolWarnings
    } = prepareTools({ tools, toolChoice, modelId: this.modelId });
    return {
      args: {
        // model id:
        model: this.modelId,
        // model specific settings:
        user: groqOptions == null ? void 0 : groqOptions.user,
        parallel_tool_calls: groqOptions == null ? void 0 : groqOptions.parallelToolCalls,
        // standardized settings:
        max_tokens: maxOutputTokens,
        temperature,
        top_p: topP,
        frequency_penalty: frequencyPenalty,
        presence_penalty: presencePenalty,
        stop: stopSequences,
        seed,
        // response format:
        response_format: (responseFormat == null ? void 0 : responseFormat.type) === "json" ? structuredOutputs && responseFormat.schema != null ? {
          type: "json_schema",
          json_schema: {
            schema: responseFormat.schema,
            strict: strictJsonSchema,
            name: (_c = responseFormat.name) != null ? _c : "response",
            description: responseFormat.description
          }
        } : { type: "json_object" } : void 0,
        // provider options:
        reasoning_format: groqOptions == null ? void 0 : groqOptions.reasoningFormat,
        reasoning_effort: groqOptions == null ? void 0 : groqOptions.reasoningEffort,
        service_tier: groqOptions == null ? void 0 : groqOptions.serviceTier,
        // messages:
        messages: convertToGroqChatMessages(prompt),
        // tools:
        tools: groqTools2,
        tool_choice: groqToolChoice
      },
      warnings: [...warnings, ...toolWarnings]
    };
  }
  async doGenerate(options) {
    var _a, _b;
    const { args, warnings } = await this.getArgs({
      ...options,
      stream: false
    });
    const body = JSON.stringify(args);
    const {
      responseHeaders,
      value: response,
      rawValue: rawResponse
    } = await postJsonToApi({
      url: this.config.url({
        path: "/chat/completions",
        modelId: this.modelId
      }),
      headers: combineHeaders(this.config.headers(), options.headers),
      body: args,
      failedResponseHandler: groqFailedResponseHandler,
      successfulResponseHandler: createJsonResponseHandler(
        groqChatResponseSchema
      ),
      abortSignal: options.abortSignal,
      fetch: this.config.fetch
    });
    const choice = response.choices[0];
    const content = [];
    const text = choice.message.content;
    if (text != null && text.length > 0) {
      content.push({ type: "text", text });
    }
    const reasoning = choice.message.reasoning;
    if (reasoning != null && reasoning.length > 0) {
      content.push({
        type: "reasoning",
        text: reasoning
      });
    }
    if (choice.message.tool_calls != null) {
      for (const toolCall of choice.message.tool_calls) {
        content.push({
          type: "tool-call",
          toolCallId: (_a = toolCall.id) != null ? _a : generateId(),
          toolName: toolCall.function.name,
          input: toolCall.function.arguments
        });
      }
    }
    return {
      content,
      finishReason: {
        unified: mapGroqFinishReason(choice.finish_reason),
        raw: (_b = choice.finish_reason) != null ? _b : void 0
      },
      usage: convertGroqUsage(response.usage),
      response: {
        ...getResponseMetadata(response),
        headers: responseHeaders,
        body: rawResponse
      },
      warnings,
      request: { body }
    };
  }
  async doStream(options) {
    const { args, warnings } = await this.getArgs({ ...options, stream: true });
    const body = JSON.stringify({ ...args, stream: true });
    const { responseHeaders, value: response } = await postJsonToApi({
      url: this.config.url({
        path: "/chat/completions",
        modelId: this.modelId
      }),
      headers: combineHeaders(this.config.headers(), options.headers),
      body: {
        ...args,
        stream: true
      },
      failedResponseHandler: groqFailedResponseHandler,
      successfulResponseHandler: createEventSourceResponseHandler(groqChatChunkSchema),
      abortSignal: options.abortSignal,
      fetch: this.config.fetch
    });
    const toolCalls = [];
    let finishReason = {
      unified: "other",
      raw: void 0
    };
    let usage = void 0;
    let isFirstChunk = true;
    let isActiveText = false;
    let isActiveReasoning = false;
    return {
      stream: response.pipeThrough(
        new TransformStream({
          start(controller) {
            controller.enqueue({ type: "stream-start", warnings });
          },
          transform(chunk, controller) {
            var _a, _b, _c, _d, _e, _f, _g, _h, _i, _j, _k, _l, _m;
            if (options.includeRawChunks) {
              controller.enqueue({ type: "raw", rawValue: chunk.rawValue });
            }
            if (!chunk.success) {
              finishReason = {
                unified: "error",
                raw: void 0
              };
              controller.enqueue({ type: "error", error: chunk.error });
              return;
            }
            const value = chunk.value;
            if ("error" in value) {
              finishReason = {
                unified: "error",
                raw: void 0
              };
              controller.enqueue({ type: "error", error: value.error });
              return;
            }
            if (isFirstChunk) {
              isFirstChunk = false;
              controller.enqueue({
                type: "response-metadata",
                ...getResponseMetadata(value)
              });
            }
            if (((_a = value.x_groq) == null ? void 0 : _a.usage) != null) {
              usage = value.x_groq.usage;
            }
            const choice = value.choices[0];
            if ((choice == null ? void 0 : choice.finish_reason) != null) {
              finishReason = {
                unified: mapGroqFinishReason(choice.finish_reason),
                raw: choice.finish_reason
              };
            }
            if ((choice == null ? void 0 : choice.delta) == null) {
              return;
            }
            const delta = choice.delta;
            if (delta.reasoning != null && delta.reasoning.length > 0) {
              if (!isActiveReasoning) {
                controller.enqueue({
                  type: "reasoning-start",
                  id: "reasoning-0"
                });
                isActiveReasoning = true;
              }
              controller.enqueue({
                type: "reasoning-delta",
                id: "reasoning-0",
                delta: delta.reasoning
              });
            }
            if (delta.content != null && delta.content.length > 0) {
              if (isActiveReasoning) {
                controller.enqueue({
                  type: "reasoning-end",
                  id: "reasoning-0"
                });
                isActiveReasoning = false;
              }
              if (!isActiveText) {
                controller.enqueue({ type: "text-start", id: "txt-0" });
                isActiveText = true;
              }
              controller.enqueue({
                type: "text-delta",
                id: "txt-0",
                delta: delta.content
              });
            }
            if (delta.tool_calls != null) {
              if (isActiveReasoning) {
                controller.enqueue({
                  type: "reasoning-end",
                  id: "reasoning-0"
                });
                isActiveReasoning = false;
              }
              for (const toolCallDelta of delta.tool_calls) {
                const index = toolCallDelta.index;
                if (toolCalls[index] == null) {
                  if (toolCallDelta.type !== "function") {
                    throw new InvalidResponseDataError({
                      data: toolCallDelta,
                      message: `Expected 'function' type.`
                    });
                  }
                  if (toolCallDelta.id == null) {
                    throw new InvalidResponseDataError({
                      data: toolCallDelta,
                      message: `Expected 'id' to be a string.`
                    });
                  }
                  if (((_b = toolCallDelta.function) == null ? void 0 : _b.name) == null) {
                    throw new InvalidResponseDataError({
                      data: toolCallDelta,
                      message: `Expected 'function.name' to be a string.`
                    });
                  }
                  controller.enqueue({
                    type: "tool-input-start",
                    id: toolCallDelta.id,
                    toolName: toolCallDelta.function.name
                  });
                  toolCalls[index] = {
                    id: toolCallDelta.id,
                    type: "function",
                    function: {
                      name: toolCallDelta.function.name,
                      arguments: (_c = toolCallDelta.function.arguments) != null ? _c : ""
                    },
                    hasFinished: false
                  };
                  const toolCall2 = toolCalls[index];
                  if (((_d = toolCall2.function) == null ? void 0 : _d.name) != null && ((_e = toolCall2.function) == null ? void 0 : _e.arguments) != null) {
                    if (toolCall2.function.arguments.length > 0) {
                      controller.enqueue({
                        type: "tool-input-delta",
                        id: toolCall2.id,
                        delta: toolCall2.function.arguments
                      });
                    }
                    if (isParsableJson(toolCall2.function.arguments)) {
                      controller.enqueue({
                        type: "tool-input-end",
                        id: toolCall2.id
                      });
                      controller.enqueue({
                        type: "tool-call",
                        toolCallId: (_f = toolCall2.id) != null ? _f : generateId(),
                        toolName: toolCall2.function.name,
                        input: toolCall2.function.arguments
                      });
                      toolCall2.hasFinished = true;
                    }
                  }
                  continue;
                }
                const toolCall = toolCalls[index];
                if (toolCall.hasFinished) {
                  continue;
                }
                if (((_g = toolCallDelta.function) == null ? void 0 : _g.arguments) != null) {
                  toolCall.function.arguments += (_i = (_h = toolCallDelta.function) == null ? void 0 : _h.arguments) != null ? _i : "";
                }
                controller.enqueue({
                  type: "tool-input-delta",
                  id: toolCall.id,
                  delta: (_j = toolCallDelta.function.arguments) != null ? _j : ""
                });
                if (((_k = toolCall.function) == null ? void 0 : _k.name) != null && ((_l = toolCall.function) == null ? void 0 : _l.arguments) != null && isParsableJson(toolCall.function.arguments)) {
                  controller.enqueue({
                    type: "tool-input-end",
                    id: toolCall.id
                  });
                  controller.enqueue({
                    type: "tool-call",
                    toolCallId: (_m = toolCall.id) != null ? _m : generateId(),
                    toolName: toolCall.function.name,
                    input: toolCall.function.arguments
                  });
                  toolCall.hasFinished = true;
                }
              }
            }
          },
          flush(controller) {
            if (isActiveReasoning) {
              controller.enqueue({ type: "reasoning-end", id: "reasoning-0" });
            }
            if (isActiveText) {
              controller.enqueue({ type: "text-end", id: "txt-0" });
            }
            controller.enqueue({
              type: "finish",
              finishReason,
              usage: convertGroqUsage(usage),
              ...{}
            });
          }
        })
      ),
      request: { body },
      response: { headers: responseHeaders }
    };
  }
};
var groqChatResponseSchema = object({
  id: string().nullish(),
  created: number().nullish(),
  model: string().nullish(),
  choices: array(
    object({
      message: object({
        content: string().nullish(),
        reasoning: string().nullish(),
        tool_calls: array(
          object({
            id: string().nullish(),
            type: literal("function"),
            function: object({
              name: string(),
              arguments: string()
            })
          })
        ).nullish()
      }),
      index: number(),
      finish_reason: string().nullish()
    })
  ),
  usage: object({
    prompt_tokens: number().nullish(),
    completion_tokens: number().nullish(),
    total_tokens: number().nullish(),
    prompt_tokens_details: object({
      cached_tokens: number().nullish()
    }).nullish(),
    completion_tokens_details: object({
      reasoning_tokens: number().nullish()
    }).nullish()
  }).nullish()
});
var groqChatChunkSchema = union([
  object({
    id: string().nullish(),
    created: number().nullish(),
    model: string().nullish(),
    choices: array(
      object({
        delta: object({
          content: string().nullish(),
          reasoning: string().nullish(),
          tool_calls: array(
            object({
              index: number(),
              id: string().nullish(),
              type: literal("function").optional(),
              function: object({
                name: string().nullish(),
                arguments: string().nullish()
              })
            })
          ).nullish()
        }).nullish(),
        finish_reason: string().nullable().optional(),
        index: number()
      })
    ),
    x_groq: object({
      usage: object({
        prompt_tokens: number().nullish(),
        completion_tokens: number().nullish(),
        total_tokens: number().nullish(),
        prompt_tokens_details: object({
          cached_tokens: number().nullish()
        }).nullish(),
        completion_tokens_details: object({
          reasoning_tokens: number().nullish()
        }).nullish()
      }).nullish()
    }).nullish()
  }),
  groqErrorDataSchema
]);
var groqTranscriptionModelOptions = lazySchema(
  () => zodSchema(
    object({
      language: string().nullish(),
      prompt: string().nullish(),
      responseFormat: string().nullish(),
      temperature: number().min(0).max(1).nullish(),
      timestampGranularities: array(string()).nullish()
    })
  )
);
var GroqTranscriptionModel = class {
  constructor(modelId, config) {
    this.modelId = modelId;
    this.config = config;
    this.specificationVersion = "v3";
  }
  get provider() {
    return this.config.provider;
  }
  async getArgs({
    audio,
    mediaType,
    providerOptions
  }) {
    var _a, _b, _c, _d, _e;
    const warnings = [];
    const groqOptions = await parseProviderOptions({
      provider: "groq",
      providerOptions,
      schema: groqTranscriptionModelOptions
    });
    const formData = new FormData();
    const blob = audio instanceof Uint8Array ? new Blob([audio]) : new Blob([convertBase64ToUint8Array(audio)]);
    formData.append("model", this.modelId);
    const fileExtension = mediaTypeToExtension(mediaType);
    formData.append(
      "file",
      new File([blob], "audio", { type: mediaType }),
      `audio.${fileExtension}`
    );
    if (groqOptions) {
      const transcriptionModelOptions = {
        language: (_a = groqOptions.language) != null ? _a : void 0,
        prompt: (_b = groqOptions.prompt) != null ? _b : void 0,
        response_format: (_c = groqOptions.responseFormat) != null ? _c : void 0,
        temperature: (_d = groqOptions.temperature) != null ? _d : void 0,
        timestamp_granularities: (_e = groqOptions.timestampGranularities) != null ? _e : void 0
      };
      for (const key in transcriptionModelOptions) {
        const value = transcriptionModelOptions[key];
        if (value !== void 0) {
          if (Array.isArray(value)) {
            for (const item of value) {
              formData.append(`${key}[]`, String(item));
            }
          } else {
            formData.append(key, String(value));
          }
        }
      }
    }
    return {
      formData,
      warnings
    };
  }
  async doGenerate(options) {
    var _a, _b, _c, _d, _e, _f, _g;
    const currentDate = (_c = (_b = (_a = this.config._internal) == null ? void 0 : _a.currentDate) == null ? void 0 : _b.call(_a)) != null ? _c : /* @__PURE__ */ new Date();
    const { formData, warnings } = await this.getArgs(options);
    const {
      value: response,
      responseHeaders,
      rawValue: rawResponse
    } = await postFormDataToApi({
      url: this.config.url({
        path: "/audio/transcriptions",
        modelId: this.modelId
      }),
      headers: combineHeaders(this.config.headers(), options.headers),
      formData,
      failedResponseHandler: groqFailedResponseHandler,
      successfulResponseHandler: createJsonResponseHandler(
        groqTranscriptionResponseSchema
      ),
      abortSignal: options.abortSignal,
      fetch: this.config.fetch
    });
    return {
      text: response.text,
      segments: (_e = (_d = response.segments) == null ? void 0 : _d.map((segment) => ({
        text: segment.text,
        startSecond: segment.start,
        endSecond: segment.end
      }))) != null ? _e : [],
      language: (_f = response.language) != null ? _f : void 0,
      durationInSeconds: (_g = response.duration) != null ? _g : void 0,
      warnings,
      response: {
        timestamp: currentDate,
        modelId: this.modelId,
        headers: responseHeaders,
        body: rawResponse
      }
    };
  }
};
var groqTranscriptionResponseSchema = object({
  text: string(),
  x_groq: object({
    id: string()
  }),
  // additional properties are returned when `response_format: 'verbose_json'` is
  task: string().nullish(),
  language: string().nullish(),
  duration: number().nullish(),
  segments: array(
    object({
      id: number(),
      seek: number(),
      start: number(),
      end: number(),
      text: string(),
      tokens: array(number()),
      temperature: number(),
      avg_logprob: number(),
      compression_ratio: number(),
      no_speech_prob: number()
    })
  ).nullish()
});
var browserSearch = createProviderToolFactory({
  id: "groq.browser_search",
  inputSchema: object({})
});
var groqTools = {
  browserSearch
};
var VERSION = "3.0.39";
function createGroq(options = {}) {
  var _a;
  const baseURL = (_a = withoutTrailingSlash(options.baseURL)) != null ? _a : "https://api.groq.com/openai/v1";
  const getHeaders = () => withUserAgentSuffix(
    {
      Authorization: `Bearer ${loadApiKey({
        apiKey: options.apiKey,
        environmentVariableName: "GROQ_API_KEY",
        description: "Groq"
      })}`,
      ...options.headers
    },
    `ai-sdk/groq/${VERSION}`
  );
  const createChatModel = (modelId) => new GroqChatLanguageModel(modelId, {
    provider: "groq.chat",
    url: ({ path }) => `${baseURL}${path}`,
    headers: getHeaders,
    fetch: options.fetch
  });
  const createLanguageModel = (modelId) => {
    if (new.target) {
      throw new Error(
        "The Groq model function cannot be called with the new keyword."
      );
    }
    return createChatModel(modelId);
  };
  const createTranscriptionModel = (modelId) => {
    return new GroqTranscriptionModel(modelId, {
      provider: "groq.transcription",
      url: ({ path }) => `${baseURL}${path}`,
      headers: getHeaders,
      fetch: options.fetch
    });
  };
  const provider = function(modelId) {
    return createLanguageModel(modelId);
  };
  provider.specificationVersion = "v3";
  provider.languageModel = createLanguageModel;
  provider.chat = createChatModel;
  provider.embeddingModel = (modelId) => {
    throw new NoSuchModelError({ modelId, modelType: "embeddingModel" });
  };
  provider.textEmbeddingModel = provider.embeddingModel;
  provider.imageModel = (modelId) => {
    throw new NoSuchModelError({ modelId, modelType: "imageModel" });
  };
  provider.transcription = createTranscriptionModel;
  provider.transcriptionModel = createTranscriptionModel;
  provider.tools = groqTools;
  return provider;
}
createGroq();
export {
  createGroq as c
};
