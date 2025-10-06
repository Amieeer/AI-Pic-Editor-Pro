import { useState } from "react";
import { ImageUpload } from "@/components/ImageUpload";
import { ImageEditor } from "@/components/ImageEditor";
import { Sparkles } from "lucide-react";
import heroBg from "@/assets/hero-bg.jpg";

const Index = () => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleImageSelect = (file: File) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      setSelectedImage(reader.result as string);
      setSelectedFile(file);
    };
    reader.readAsDataURL(file);
  };

  const handleReset = () => {
    setSelectedImage(null);
    setSelectedFile(null);
  };

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Background gradient mesh */}
      <div 
        className="fixed inset-0 opacity-30"
        style={{
          backgroundImage: `url(${heroBg})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          filter: 'blur(80px)',
        }}
      />
      <div className="fixed inset-0 bg-gradient-to-br from-background via-background/95 to-background/90" />

      {/* Content */}
      <div className="relative z-10">
        <div className="container mx-auto px-4 py-12 max-w-6xl">
          {/* Header */}
          <div className="text-center mb-12 space-y-4">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-4">
              <Sparkles className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-primary">Powered by Gemini AI</span>
            </div>
            <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent animate-fade-in">
              AI Photo Editor
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Transform your photos with natural language. Upload an image and describe how you want to edit it.
            </p>
          </div>

          {/* Main Editor */}
          <div className="max-w-4xl mx-auto">
            <div className="rounded-2xl border border-border/50 bg-card/50 backdrop-blur-sm p-8 shadow-2xl">
              {!selectedImage ? (
                <div className="space-y-4">
                  <h2 className="text-xl font-semibold text-center mb-6">
                    Get Started
                  </h2>
                  <ImageUpload onImageSelect={handleImageSelect} />
                </div>
              ) : (
                <ImageEditor
                  originalImage={selectedImage}
                  originalFile={selectedFile!}
                  onReset={handleReset}
                />
              )}
            </div>
          </div>

          {/* Features */}
          <div className="mt-16 grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {[
              {
                title: "Natural Language",
                description: "Just describe what you want - no complex tools needed",
              },
              {
                title: "Instant Preview",
                description: "See before and after side by side in real-time",
              },
              {
                title: "Edit History",
                description: "Undo changes and try different edits easily",
              },
            ].map((feature, i) => (
              <div
                key={i}
                className="p-6 rounded-xl bg-card/30 border border-border/30 backdrop-blur-sm hover:border-primary/30 transition-all"
              >
                <h3 className="font-semibold mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;