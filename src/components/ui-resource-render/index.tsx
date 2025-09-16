import { useMemo, useState } from "react";
import { UIResource, UIResourceParsedTextSchema } from "./types";
import { isUIResource, parseText } from "./utils";
import { Alert, AlertDescription, AlertTitle } from "ui/alert";
import { Card, CardContent, CardHeader, CardTitle } from "ui/card";

import { ShieldAlertIcon } from "lucide-react";
import { RenderComponentMap } from "./components";

interface UIResourceRenderProps {
  resource: UIResource;
}

const UIResourceRender: React.FC<UIResourceRenderProps> = ({ resource }) => {
  const [error, setError] = useState<string | null>(null);

  const parsedData = useMemo(() => {
    try {
      return UIResourceParsedTextSchema.parse(
        parseText(resource.resource.text),
      );
    } catch (error: any) {
      setError(error.message);
      return null;
    }
  }, [resource.resource.text]);

  const RenderComponent = useMemo(
    () => (parsedData?.type ? RenderComponentMap.get(parsedData.type) : null),
    [parsedData],
  );

  if (!isUIResource(resource)) {
    return null;
  }

  if (!parsedData) {
    return (
      <Alert>
        <ShieldAlertIcon />
        <AlertTitle>UIResource is not parsable</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  if (!RenderComponent) {
    return (
      <Alert>
        <ShieldAlertIcon />
        <AlertTitle>
          This type of UIResource(type: {parsedData.type}) is not supported
        </AlertTitle>
      </Alert>
    );
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      {parsedData.title && (
        <CardHeader>
          <CardTitle>{parsedData.title}</CardTitle>
        </CardHeader>
      )}

      <CardContent>
        <RenderComponent parsedData={parsedData} />
      </CardContent>
    </Card>
  );
};

export default UIResourceRender;
