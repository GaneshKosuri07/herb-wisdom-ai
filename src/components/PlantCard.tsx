import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Leaf, Heart, Star } from "lucide-react";

interface Plant {
  id: string;
  name: string;
  scientificName?: string;
  benefits: string[];
  components: string[];
  description?: string;
  usageMethods?: string[];
  precautions?: string[];
}

interface PlantCardProps {
  plant: Plant;
  matchedBenefits?: string[];
}

export const PlantCard = ({ plant, matchedBenefits = [] }: PlantCardProps) => {
  return (
    <Card className="shadow-medium hover:shadow-strong transition-smooth border-secondary/50 bg-gradient-to-br from-card to-secondary/10">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <CardTitle className="text-lg font-serif text-primary flex items-center gap-2">
              <Leaf className="w-5 h-5 text-success" />
              {plant.name}
            </CardTitle>
            {plant.scientificName && (
              <CardDescription className="italic text-muted-foreground">
                {plant.scientificName}
              </CardDescription>
            )}
          </div>
          {matchedBenefits.length > 0 && (
            <div className="flex items-center gap-1 bg-accent/10 px-2 py-1 rounded-full">
              <Star className="w-3 h-3 text-accent" />
              <span className="text-xs font-medium text-accent-foreground">Match</span>
            </div>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {plant.description && (
          <p className="text-sm text-muted-foreground leading-relaxed">
            {plant.description}
          </p>
        )}

        <div className="space-y-3">
          <div>
            <h4 className="text-sm font-semibold text-foreground mb-2 flex items-center gap-1">
              <Heart className="w-4 h-4 text-success" />
              Health Benefits
            </h4>
            <div className="flex flex-wrap gap-1">
              {plant.benefits.map((benefit, index) => (
                <Badge 
                  key={index} 
                  variant={matchedBenefits.includes(benefit) ? "default" : "secondary"}
                  className={matchedBenefits.includes(benefit) ? "bg-success text-success-foreground" : ""}
                >
                  {benefit}
                </Badge>
              ))}
            </div>
          </div>

          {plant.components && plant.components.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold text-foreground mb-2">
                Active Components
              </h4>
              <div className="flex flex-wrap gap-1">
                {plant.components.map((component, index) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {component}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {plant.usageMethods && plant.usageMethods.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold text-foreground mb-2">
                Usage Methods
              </h4>
              <ul className="text-xs text-muted-foreground space-y-1">
                {plant.usageMethods.map((method, index) => (
                  <li key={index} className="flex items-start gap-1">
                    <span className="text-accent">•</span>
                    {method}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {plant.precautions && plant.precautions.length > 0 && (
            <div className="bg-warning/10 border border-warning/20 rounded-md p-2">
              <h4 className="text-xs font-semibold text-warning-foreground mb-1">
                Precautions
              </h4>
              <ul className="text-xs text-warning-foreground/80 space-y-1">
                {plant.precautions.map((precaution, index) => (
                  <li key={index} className="flex items-start gap-1">
                    <span>⚠️</span>
                    {precaution}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};