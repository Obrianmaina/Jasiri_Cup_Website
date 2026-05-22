import { Button } from '@/components/ui/Button';
import { ContactForm } from '@/components/contact/ContactForm';
import { AssetDownload } from '@/types/brand-os';

export function BrandQueries() {
  return (
    <section className="mt-16 sm:mt-24">
      <div className="max-w-3xl mx-auto text-center mb-8 sm:mb-10 px-4">
        <h2 className="text-2xl sm:text-3xl font-bold mb-3 sm:mb-4">Brand Queries</h2>
        <p className="text-slate-600 dark:text-slate-400 text-sm sm:text-lg leading-relaxed">
          Have questions about logo usage, color pairings, or need approval for a specific design? Reach out to our brand team.
        </p>
      </div>
      <div className="px-2 sm:px-0">
         <ContactForm />
      </div>
    </section>
  );
}

export function AssetDownloads({ downloads, token }: { downloads: AssetDownload[], token: string }) {
  if (!downloads || downloads.length === 0) return null;
  
  return (
    <div className="px-4 sm:px-6 md:px-12 mt-16 sm:mt-24">
      <footer className="max-w-6xl mx-auto bg-slate-900 dark:bg-slate-800 rounded-3xl p-6 sm:p-8 md:p-12 text-white flex flex-col md:flex-row justify-between items-center gap-8 shadow-xl">
        <div className="text-center md:text-left w-full md:w-auto">
          <h4 className="text-2xl sm:text-3xl font-bold mb-2">Downloadable Assets</h4>
          <p className="opacity-70 text-sm sm:text-lg">Official logos, templates, and typography packs.</p>
        </div>
        
        <div className="flex flex-col sm:flex-row flex-wrap justify-center md:justify-end gap-3 sm:gap-4 w-full md:w-auto">
          {downloads.map((asset, idx) => (
            <a key={idx} href={`/api/brand/download?asset=${asset.file}&token=${token}`} className="w-full sm:w-auto">
              <Button variant="outline" className="w-full sm:w-auto bg-white/10 border-white/20 hover:bg-white/20 text-white flex items-center justify-center gap-2 h-12 px-6">
                <span className="text-lg">{asset.icon}</span> {asset.name}
              </Button>
            </a>
          ))}
        </div>
      </footer>
    </div>
  );
}