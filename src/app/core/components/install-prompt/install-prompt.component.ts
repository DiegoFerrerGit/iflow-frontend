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

      <!-- iOS / Safari / Brave -->
      <div *ngIf="pwaService.isIOS" class="mt-4 pt-4 border-t border-slate-800">
        <p class="text-xs text-slate-400 mb-4">
          En iOS, la instalación es manual:
        </p>
        <div class="flex items-center gap-3 text-sm text-white bg-slate-800/50 p-3 rounded-xl border border-slate-700/50">
          <span class="material-symbols-outlined text-blue-400">ios_share</span>
          <span>Pulsa el botón de <b>compartir</b> en la barra de tu navegador</span>
        </div>
        <div class="mt-3 flex items-center gap-3 text-sm text-white bg-slate-800/50 p-3 rounded-xl border border-slate-700/50">
          <span class="material-symbols-outlined text-purple-400">add_box</span>
          <span>Selecciona <b>"Añadir a la pantalla de inicio"</b></span>
        </div>
        
        <button (click)="pwaService.dismissInstall()" 
                class="w-full mt-4 bg-slate-800 text-white font-medium py-2 rounded-lg border border-slate-700 hover:bg-slate-700 transition-colors">
          Entendido
        </button>
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
