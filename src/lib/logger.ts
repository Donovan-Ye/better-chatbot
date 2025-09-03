import { createConsola, LogLevels } from "consola";
import { IS_DEV } from "./const";

const logger = createConsola({
  // level: IS_DEV ? LogLevels.debug : LogLevels.info,
  level: LogLevels.debug,
  defaults: {
    tag: "better-chatbot",
  },
});

export default logger;
