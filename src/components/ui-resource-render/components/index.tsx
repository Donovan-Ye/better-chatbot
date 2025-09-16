import { FC } from "react";
import { UIResourceParsedText } from "../types";
import FormRender from "./FormRender";

export interface RenderComponentProps {
  parsedData: UIResourceParsedText;
}

export const RenderComponentMap = new Map<
  UIResourceParsedText["type"],
  FC<RenderComponentProps>
>([["form", FormRender]]);
