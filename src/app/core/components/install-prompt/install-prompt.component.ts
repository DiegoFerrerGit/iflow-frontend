import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PwaService } from '../../services/pwa.service';

@Component({
    selector: 'app-install-prompt',
    standalone: true,
    imports: [CommonModule],
    template: `
    <div *ngIf="pwaService.installPrompt$ | async" 
         class="fixed bottom-4 left-4 right-4 z-[9999] bg-slate-900 border border-slate-700 p-6 rounded-2xl shadow-2xl animate-in fade-in slide-in-from-bottom-8 duration-500">
      
      <div class="flex items-start gap-4">
        <div class="w-12 h-12 bg-primary/20 rounded-xl flex items-center justify-center shrink-0">
          <img src="assets/images/iflow-logo.svg" alt="App Icon" class="w-8 h-8">
        </div>
        
        <div class="flex-1 min-w-0">
          <h3 class="text-white font-bold text-lg mb-1">Instalar Iflow</h3>
          <p class="text-slate-400 text-sm leading-relaxed">
            Instala nuestra app para una mejor experiencia y acceso rápido desde tu pantalla de inicio.
          </p>
        </div>

        <button (click)="pwaService.dismissInstall()" class="text-slate-500 hover:text-white transition-colors">
          <span class="material-symbols-outlined">close</span>
        </button>
      </div>

      <!-- Android / Chrome / Brave -->
      <div *ngIf="!pwaService.isIOS" class="mt-4">
        <button (click)="pwaService.installPwa()" 
                class="w-full bg-white text-black font-semibold py-3 rounded-xl hover:bg-slate-200 transition-all flex items-center justify-center gap-2">
          <span class="material-symbols-outlined text-sm">download</span>
          Instalar App
        </button>
      </div>

      <!-- iOS / Safari -->
      <div *ngIf="pwaService.isIOS" class="mt-4 pt-4 border-t border-slate-800">
        <p class="text-xs text-slate-400 flex items-center gap-2 flex-wrap">
          Para instalar: Pulsa 
          <span class="bg-slate-800 px-2 py-1 rounded flex items-center border border-slate-700">
            <span class="material-symbols-outlined text-sm text-blue-400">ios_share</span>
          </span>
          y luego selecciona 
          <span class="font-bold text-white">"Añadir a la pantalla de inicio"</span>
        </p>
      </div>
    </div>
  `,
    styles: [`
    :host { display: block; }
  `]
})
export class InstallPromptComponent {
    public pwaService = inject(PwaService);
}
