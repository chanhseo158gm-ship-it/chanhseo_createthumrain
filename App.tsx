
import React, { useState, useRef } from 'react';
import { CloudRain, Zap, Camera, Image as ImageIcon, Download, RefreshCw, Layers, Type } from 'lucide-react';
import { generateRainyScene } from './geminiService';
import { ThumbnailSettings } from './types';

const App: React.FC = () => {
  const [refImage, setRefImage] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [settings, setSettings] = useState<ThumbnailSettings>({
    title: 'DEEP SLEEP RAIN',
    subtitle: '10 HOURS NO ADS',
    textColor: '#ffffff',
    overlayOpacity: 30,
    showRainText: true,
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setRefImage(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGenerate = async () => {
    if (!refImage) return;
    setIsGenerating(true);
    setError(null);
    try {
      const newImage = await generateRainyScene(refImage);
      setGeneratedImage(newImage);
    } catch (err: any) {
      setError(err.message || 'Lỗi khi tạo ảnh. Vui lòng thử lại.');
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadImage = (withText: boolean) => {
    if (!generatedImage) return;

    if (!withText) {
      const link = document.createElement('a');
      link.href = generatedImage;
      link.download = 'rainy-background-no-text.png';
      link.click();
      return;
    }

    // Process with text using Canvas (HD Resolution 1280x720)
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = () => {
      canvas.width = 1280;
      canvas.height = 720;

      if (!ctx) return;

      // 1. Draw Background Image
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

      // 2. Draw Dark Overlay
      ctx.fillStyle = `rgba(0, 0, 0, ${settings.overlayOpacity / 100})`;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // 3. Draw Title
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = settings.textColor;
      ctx.font = 'bold 100px Inter, system-ui, sans-serif';
      ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
      ctx.shadowBlur = 20;
      ctx.fillText(settings.title, canvas.width / 2, canvas.height / 2 - 20);

      // 4. Draw Subtitle
      ctx.font = '500 36px Inter, system-ui, sans-serif';
      ctx.shadowBlur = 10;
      const subtitleY = canvas.height / 2 + 80;
      
      const textWidth = ctx.measureText(settings.subtitle).width;
      ctx.strokeStyle = `${settings.textColor}4D`;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(canvas.width / 2 - textWidth / 2 - 40, subtitleY - 40);
      ctx.lineTo(canvas.width / 2 + textWidth / 2 + 40, subtitleY - 40);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(canvas.width / 2 - textWidth / 2 - 40, subtitleY + 40);
      ctx.lineTo(canvas.width / 2 + textWidth / 2 + 40, subtitleY + 40);
      ctx.stroke();

      ctx.fillText(settings.subtitle, canvas.width / 2, subtitleY);

      // 5. Draw 4K Tag
      ctx.fillStyle = '#dc2626';
      ctx.shadowBlur = 0;
      const tagWidth = 140;
      const tagHeight = 40;
      ctx.fillRect(canvas.width - tagWidth - 40, canvas.height - tagHeight - 40, tagWidth, tagHeight);
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 20px Inter, sans-serif';
      ctx.fillText('4K ULTRA HD', canvas.width - tagWidth / 2 - 40, canvas.height - tagHeight / 2 - 40);

      const link = document.createElement('a');
      link.href = canvas.toDataURL('image/png');
      link.download = 'rainy-thumbnail-with-text.png';
      link.click();
    };
    img.src = generatedImage;
  };

  return (
    <div className="min-h-screen p-4 md:p-8 bg-slate-950 text-slate-100 flex flex-col items-center">
      <header className="max-w-4xl w-full text-center mb-12">
        <div className="flex justify-center mb-4">
          <div className="p-3 bg-blue-600/20 rounded-2xl ring-1 ring-blue-500/50">
            <CloudRain className="w-8 h-8 text-blue-400" />
          </div>
        </div>
        <h1 className="text-4xl font-bold tracking-tight mb-2">THUM RAIN - CHÁNH</h1>
        <p className="text-slate-400">Tạo hình nền và thumbnail tiếng mưa cực chill</p>
      </header>

      <main className="max-w-6xl w-full grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-4 space-y-6">
          <section className="glass-panel rounded-3xl p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Camera className="w-5 h-5" /> 1. Ảnh tham chiếu
            </h2>
            <div 
              onClick={() => fileInputRef.current?.click()}
              className={`aspect-video rounded-2xl border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-all ${refImage ? 'border-blue-500/50' : 'border-slate-700 hover:border-slate-500 bg-slate-900/50'}`}
            >
              {refImage ? (
                <img src={refImage} alt="Reference" className="w-full h-full object-cover rounded-2xl" />
              ) : (
                <div className="text-center p-4">
                  <ImageIcon className="w-10 h-10 text-slate-600 mx-auto mb-2" />
                  <p className="text-sm text-slate-500">Bấm để tải ảnh ngôi nhà</p>
                </div>
              )}
            </div>
            <input type="file" ref={fileInputRef} onChange={handleImageUpload} className="hidden" accept="image/*" />
            
            <button
              onClick={handleGenerate}
              disabled={!refImage || isGenerating}
              className={`w-full mt-6 py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all ${
                !refImage || isGenerating 
                ? 'bg-slate-800 text-slate-500 cursor-not-allowed' 
                : 'bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-900/20 active:scale-[0.98]'
              }`}
            >
              {isGenerating ? (
                <><RefreshCw className="w-5 h-5 animate-spin" />Đang mần, đợi tí hehe...</>
              ) : (
                <><Zap className="w-5 h-5 text-yellow-400" /> Tạo Background Sấm Sét</>
              )}
            </button>
            {error && <p className="text-red-400 text-xs mt-3 text-center">{error}</p>}
          </section>

          {generatedImage && (
            <section className="glass-panel rounded-3xl p-6">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Layers className="w-5 h-5" /> 2. Tùy chỉnh Thumbnail
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="text-xs text-slate-400 uppercase font-bold mb-1 block">Tiêu đề chính</label>
                  <input type="text" value={settings.title} onChange={(e) => setSettings({...settings, title: e.target.value})} className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 focus:ring-1 focus:ring-blue-500 outline-none" />
                </div>
                <div>
                  <label className="text-xs text-slate-400 uppercase font-bold mb-1 block">Phụ đề</label>
                  <input type="text" value={settings.subtitle} onChange={(e) => setSettings({...settings, subtitle: e.target.value})} className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 focus:ring-1 focus:ring-blue-500 outline-none" />
                </div>
                <div className="flex gap-4">
                  <div className="flex-1">
                    <label className="text-xs text-slate-400 uppercase font-bold mb-1 block">Màu chữ</label>
                    <input type="color" value={settings.textColor} onChange={(e) => setSettings({...settings, textColor: e.target.value})} className="w-full h-10 bg-slate-900 border border-slate-700 rounded-lg cursor-pointer" />
                  </div>
                  <div className="flex-1">
                    <label className="text-xs text-slate-400 uppercase font-bold mb-1 block">Độ tối nền (%)</label>
                    <input type="number" min="0" max="100" value={settings.overlayOpacity} onChange={(e) => setSettings({...settings, overlayOpacity: Number(e.target.value)})} className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 outline-none" />
                  </div>
                </div>
              </div>
            </section>
          )}
        </div>

        <div className="lg:col-span-8 flex flex-col">
          <div className="glass-panel rounded-3xl p-8 flex-1 flex flex-col items-center justify-center min-h-[400px]">
            {!generatedImage ? (
              <div className="text-center opacity-40">
                <CloudRain className="w-20 h-20 mx-auto mb-4" />
                <p className="text-lg">Hãy tải ảnh lên và bấm nút "Tạo"</p>
                <p className="text-sm italic">AI sẽ mở rộng góc nhìn và thêm sấm sét cực đẹp</p>
              </div>
            ) : (
              <div className="w-full">
                <h3 className="text-xs text-slate-400 uppercase font-bold tracking-widest mb-4 text-center">Preview YouTube Thumbnail (16:9)</h3>
                <div className="relative aspect-video w-full rounded-2xl overflow-hidden shadow-2xl border border-white/10 bg-black">
                  <img src={generatedImage} alt="Generated" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black" style={{ opacity: settings.overlayOpacity / 100 }}></div>
                  <div className="absolute inset-0 flex flex-col justify-center items-center text-center p-8 pointer-events-none">
                    <h1 className="text-4xl md:text-5xl lg:text-6xl font-black drop-shadow-2xl uppercase" style={{ color: settings.textColor }}>{settings.title}</h1>
                    <p className="mt-4 text-base md:text-lg lg:text-xl font-medium tracking-[0.2em] border-y border-white/30 py-2 px-6 backdrop-blur-sm bg-black/20" style={{ color: settings.textColor }}>{settings.subtitle}</p>
                  </div>
                  <div className="absolute bottom-4 right-4 bg-red-600 px-3 py-1 rounded text-[10px] font-bold tracking-tighter">4K ULTRA HD</div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-8">
                  <button 
                    onClick={() => downloadImage(false)}
                    className="flex items-center justify-center gap-2 px-6 py-4 bg-slate-800 text-slate-100 font-bold rounded-xl hover:bg-slate-700 transition-colors border border-slate-700"
                  >
                    <ImageIcon className="w-5 h-5 text-blue-400" /> Tải Ảnh Nền (Không chữ)
                  </button>
                  <button 
                    onClick={() => downloadImage(true)}
                    className="flex items-center justify-center gap-2 px-6 py-4 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-500 transition-all shadow-lg shadow-blue-900/40"
                  >
                    <Type className="w-5 h-5" /> Tải Thumbnail (Có chữ)
                  </button>
                </div>
                
                <div className="flex justify-center mt-6">
                  <button onClick={handleGenerate} className="flex items-center gap-2 text-slate-400 hover:text-white text-sm transition-colors">
                    <RefreshCw className="w-4 h-4" /> Thử góc nhìn khác
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      <footer className="mt-16 pb-8 text-center text-slate-500 text-sm">
        <p>&copy; 2024 Rainy Mood Studio • Powered by Gemini 2.5 Flash</p>
      </footer>
    </div>
  );
};

export default App;
