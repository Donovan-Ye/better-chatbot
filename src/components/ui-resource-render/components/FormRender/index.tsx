import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "ui/select";
import { Input } from "ui/input";
import { Textarea } from "ui/textarea";
import { Checkbox } from "ui/checkbox";
import { Button } from "ui/button";
import { useMemo, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import z from "zod";
import { RenderComponentProps } from "..";

// Use a flexible type for form values
type FormValues = Record<string, string | boolean>;
const FormRender: React.FC<RenderComponentProps> = ({ parsedData }) => {
  // Create dynamic schema based on the parsed data
  const formSchema = useMemo(() => {
    if (!parsedData) return z.object({});

    const schemaFields: Record<string, z.ZodType<any, any>> = {};
    parsedData.fields.forEach((field) => {
      switch (field.type) {
        case "select":
        case "text":
        case "textarea":
          schemaFields[field.key] = z
            .string()
            .min(1, `${field.name} is required`);
          break;
        case "checkbox":
          schemaFields[field.key] = z.boolean();
          break;
      }
    });

    return z.object(schemaFields);
  }, [parsedData]);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema) as any,
    defaultValues:
      parsedData?.fields.reduce((acc, field) => {
        switch (field.type) {
          case "select":
          case "text":
          case "textarea":
            acc[field.key] = "";
            break;
          case "checkbox":
            acc[field.key] = false;
            break;
        }
        return acc;
      }, {} as FormValues) || {},
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const onSubmit = async (values: FormValues) => {
    setIsSubmitting(true);
    setSubmitSuccess(false);

    try {
      console.log("Form submitted:", values);
      // Handle form submission based on submitAction
      if (parsedData?.submitAction === "call-tool-again") {
        // Implement tool calling logic here
        console.log("Calling tool again with values:", values);
        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }

      setSubmitSuccess(true);
      setTimeout(() => setSubmitSuccess(false), 3000);
    } catch (error) {
      console.error("Form submission error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {parsedData.fields.map((field) => (
          <FormField
            key={field.key}
            control={form.control}
            name={field.key}
            render={({ field: formField }) => (
              <FormItem className="space-y-2">
                <FormLabel>{field.name}</FormLabel>

                <FormControl>
                  <div>
                    {field.type === "select" && (
                      <Select
                        onValueChange={formField.onChange}
                        defaultValue={formField.value as string}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder={`Select ${field.name}`} />
                        </SelectTrigger>
                        <SelectContent>
                          {field.options.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                    {field.type === "text" && (
                      <Input
                        placeholder={
                          field.placeholder ||
                          `Enter ${field.name.toLowerCase()}`
                        }
                        {...formField}
                        value={formField.value as string}
                      />
                    )}
                    {field.type === "textarea" && (
                      <Textarea
                        placeholder={
                          field.placeholder ||
                          `Enter ${field.name.toLowerCase()}`
                        }
                        {...formField}
                        value={formField.value as string}
                      />
                    )}
                    {field.type === "checkbox" && (
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id={field.key}
                          checked={formField.value as boolean}
                          onCheckedChange={formField.onChange}
                        />
                        <label
                          htmlFor={field.key}
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          {field.label}
                        </label>
                      </div>
                    )}
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        ))}
        <div className="flex justify-end">
          <Button type="submit" className="" disabled={isSubmitting}>
            {isSubmitting ? "提交中..." : "提交"}
          </Button>
        </div>
        {submitSuccess && (
          <div className="text-center text-green-600 text-sm">提交成功!</div>
        )}
      </form>
    </Form>
  );
};

export default FormRender;
