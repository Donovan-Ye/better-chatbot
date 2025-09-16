import z from "zod";

export const UI_RESOURCE_PREFIX = "ui-resource://";
export type URI = `${typeof UI_RESOURCE_PREFIX}${string}`;
export type MimeType = "application/json";
export type UIResource = {
  type: "resource";
  resource: {
    uri: URI;
    mimeType: MimeType;
    text: string;
    blob?: never;
    _meta?: Record<string, unknown>;
  };
};

const SelectFieldSchema = z.object({
  type: z.literal("select"),
  name: z.string(),
  key: z.string(),
  options: z.array(
    z.object({
      label: z.string(),
      value: z.string(),
    }),
  ),
});

const TextFieldSchema = z.object({
  type: z.literal("text"),
  name: z.string(),
  key: z.string(),
  placeholder: z.string().optional(),
});

const TextareaFieldSchema = z.object({
  type: z.literal("textarea"),
  name: z.string(),
  key: z.string(),
  placeholder: z.string().optional(),
});

const CheckboxFieldSchema = z.object({
  type: z.literal("checkbox"),
  name: z.string(),
  key: z.string(),
  label: z.string(),
});

export const UIResourceParsedTextSchema = z.object({
  type: z.literal("form"),
  title: z.string().optional(),
  fields: z.array(
    z.union([
      SelectFieldSchema,
      TextFieldSchema,
      TextareaFieldSchema,
      CheckboxFieldSchema,
    ]),
  ),
  submitAction: z.literal("call-tool-again"),
});

export type UIResourceParsedText = z.infer<typeof UIResourceParsedTextSchema>;
