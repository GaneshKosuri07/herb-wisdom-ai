-- Create plants table to store remedy data
CREATE TABLE public.plants (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    scientific_name TEXT,
    benefits TEXT[] NOT NULL DEFAULT '{}',
    components TEXT[] NOT NULL DEFAULT '{}',
    description TEXT,
    usage_methods TEXT[] NOT NULL DEFAULT '{}',
    precautions TEXT[] NOT NULL DEFAULT '{}',
    image_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security (making data publicly readable)
ALTER TABLE public.plants ENABLE ROW LEVEL SECURITY;

-- Create policy for public read access
CREATE POLICY "Plants are viewable by everyone" 
ON public.plants 
FOR SELECT 
USING (true);

-- Create policy for authenticated users to insert/update
CREATE POLICY "Authenticated users can insert plants" 
ON public.plants 
FOR INSERT 
WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update plants" 
ON public.plants 
FOR UPDATE 
USING (auth.uid() IS NOT NULL);

-- Create indexes for better search performance
CREATE INDEX idx_plants_name ON public.plants USING GIN(to_tsvector('english', name));
CREATE INDEX idx_plants_benefits ON public.plants USING GIN(benefits);
CREATE INDEX idx_plants_components ON public.plants USING GIN(components);
CREATE INDEX idx_plants_search ON public.plants USING GIN(to_tsvector('english', coalesce(name, '') || ' ' || coalesce(description, '') || ' ' || array_to_string(benefits, ' ') || ' ' || array_to_string(components, ' ')));

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_plants_updated_at
    BEFORE UPDATE ON public.plants
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();