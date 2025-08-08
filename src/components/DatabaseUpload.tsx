import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload, FileText, Check, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface DatabaseUploadProps {
  onDatabaseUpload: (plants: any[]) => void;
  isLoaded: boolean;
}

export const DatabaseUpload = ({ onDatabaseUpload, isLoaded }: DatabaseUploadProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const { toast } = useToast();

  const handleFileUpload = async (file: File) => {
    try {
      const text = await file.text();
      const data = JSON.parse(text);
      
      // Validate the data structure
      if (!Array.isArray(data)) {
        throw new Error("File must contain an array of plants");
      }

      // Basic validation of plant objects
      const requiredFields = ['name', 'benefits'];
      const isValid = data.every(plant => 
        requiredFields.every(field => field in plant)
      );

      if (!isValid) {
        throw new Error("Each plant must have at least 'name' and 'benefits' fields");
      }

      onDatabaseUpload(data);
      toast({
        title: "Database uploaded successfully!",
        description: `Loaded ${data.length} plants`,
        variant: "default",
      });
    } catch (error) {
      toast({
        title: "Error uploading database",
        description: error instanceof Error ? error.message : "Invalid JSON format",
        variant: "destructive",
      });
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = Array.from(e.dataTransfer.files);
    const jsonFile = files.find(file => file.type === "application/json" || file.name.endsWith('.json'));
    
    if (jsonFile) {
      handleFileUpload(jsonFile);
    } else {
      toast({
        title: "Invalid file type",
        description: "Please upload a JSON file",
        variant: "destructive",
      });
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  const generateSampleData = () => {
    const samplePlants = [
      {
        id: "sample-1",
        name: "Turmeric",
        scientificName: "Curcuma longa",
        description: "A golden spice with powerful anti-inflammatory properties",
        benefits: ["anti-inflammatory", "antioxidant", "pain relief", "digestive health", "immune support"],
        components: ["curcumin", "turmeric oil", "protein", "fiber"],
        usageMethods: ["Tea preparation", "Powder in meals", "Topical paste"],
        precautions: ["May interact with blood thinners", "Avoid high doses during pregnancy"]
      },
      {
        id: "sample-2",
        name: "Ginger",
        scientificName: "Zingiber officinale",
        description: "A warming root known for digestive and anti-nausea properties",
        benefits: ["nausea relief", "digestive aid", "anti-inflammatory", "circulation", "immune support"],
        components: ["gingerol", "shogaol", "zingerone"],
        usageMethods: ["Fresh tea", "Dried powder", "Essential oil"],
        precautions: ["May increase bleeding risk", "Limit intake with gallstones"]
      },
      {
        id: "sample-3",
        name: "Aloe Vera",
        scientificName: "Aloe barbadensis",
        description: "A succulent plant renowned for skin healing and soothing properties",
        benefits: ["skin healing", "burns relief", "digestive health", "hydration", "anti-inflammatory"],
        components: ["aloin", "polysaccharides", "amino acids", "vitamins"],
        usageMethods: ["Topical gel", "Juice (inner leaf)", "Supplements"],
        precautions: ["Avoid whole leaf preparations", "May cause digestive upset"]
      }
    ];

    onDatabaseUpload(samplePlants);
    toast({
      title: "Sample database loaded!",
      description: "Loaded 3 sample plants for testing",
      variant: "default",
    });
  };

  return (
    <Card className="shadow-medium border-secondary/50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-primary">
          {isLoaded ? (
            <Check className="w-5 h-5 text-success" />
          ) : (
            <FileText className="w-5 h-5" />
          )}
          Plant Database
        </CardTitle>
        <CardDescription>
          Upload a JSON file containing plant remedies data or use sample data to get started.
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {!isLoaded ? (
          <>
            <div
              className={`border-2 border-dashed rounded-lg p-6 text-center transition-smooth ${
                isDragging 
                  ? "border-primary bg-primary/5" 
                  : "border-secondary hover:border-primary/50 hover:bg-secondary/20"
              }`}
              onDrop={handleDrop}
              onDragOver={(e) => e.preventDefault()}
              onDragEnter={() => setIsDragging(true)}
              onDragLeave={() => setIsDragging(false)}
            >
              <Upload className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm text-muted-foreground mb-2">
                Drag and drop your JSON file here, or click to browse
              </p>
              <Label htmlFor="file-upload">
                <Button variant="outline" size="sm" className="cursor-pointer">
                  Browse Files
                </Button>
              </Label>
              <Input
                id="file-upload"
                type="file"
                accept=".json"
                onChange={handleFileChange}
                className="hidden"
              />
            </div>
            
            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-2">
                Don't have a database ready?
              </p>
              <Button variant="secondary" size="sm" onClick={generateSampleData}>
                Load Sample Data
              </Button>
            </div>
          </>
        ) : (
          <div className="flex items-center gap-2 p-4 bg-success/10 border border-success/20 rounded-lg">
            <Check className="w-5 h-5 text-success" />
            <span className="text-sm font-medium text-success-foreground">
              Database loaded successfully
            </span>
          </div>
        )}

        <div className="bg-muted/50 rounded-lg p-3">
          <div className="flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
            <div className="text-xs text-muted-foreground">
              <p className="font-medium mb-1">Expected JSON format:</p>
              <pre className="text-xs bg-background rounded p-2 overflow-x-auto">
{`[
  {
    "name": "Plant Name",
    "scientificName": "Scientific Name",
    "description": "Description",
    "benefits": ["benefit1", "benefit2"],
    "components": ["component1", "component2"],
    "usageMethods": ["method1", "method2"],
    "precautions": ["precaution1"]
  }
]`}
              </pre>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};