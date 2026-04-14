import { useToast } from "@/hooks/use-toast";

import { parseXMLToObject } from "../utils/parseXMLToObject";

type UseFileUploadProps = {
  onDataParsed: (data: Record<string, any>) => void;
};

export const usePopulateFromFileUpload = ({ onDataParsed }: UseFileUploadProps) => {
  const { toast } = useToast();

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      const file = event.target.files?.[0];
      if (!file) return;

      const fileName = file.name.toLowerCase();

      if (!fileName.endsWith(".json") && !fileName.endsWith(".xml")) {
        toast({
          title: "Invalid file type",
          description: "Please select a JSON or XML file",
          variant: "destructive",
        });
        return;
      }

      const fileContent = await file.text();
      let parsedData: Record<string, Record<string, any>>;

      if (fileName.endsWith(".json")) {
        parsedData = JSON.parse(fileContent);
      } else {
        // Parse XML
        parsedData = parseXMLToObject(fileContent);
      }

      onDataParsed(parsedData);

      toast({
        title: "File loaded successfully",
        description: `Form populated from ${file.name}`,
      });
    } catch (error) {
      console.error("Error parsing file:", error);
      toast({
        title: "Error parsing file",
        description: "Please check if the file format is correct",
        variant: "destructive",
      });
    } finally {
      event.target.value = "";
    }
  };

  return { handleFileChange };
};
