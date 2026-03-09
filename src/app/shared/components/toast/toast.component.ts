import { Component, Input, Output, EventEmitter, OnChanges, OnDestroy, SimpleChanges, ChangeDetectorRef, inject } from '@angular/core';

@Component({
    selector: 'app-toast',
    standalone: true,
    template: `
        <div
            class="toast-container"
            [class.toast-visible]="isVisible"
            [class.toast-error]="type === 'error'"
            [class.toast-success]="type === 'success'"
            [class.toast-warning]="type === 'warning'"
        >
            <div class="toast-icon">
                <span class="material-symbols-outlined">
                    {{ type === 'error' ? 'error' : type === 'success' ? 'check_circle' : 'warning' }}
                </span>
            </div>
            <p class="toast-message">{{ message }}</p>
            <button class="toast-close" (click)="dismiss()">
                <span class="material-symbols-outlined">close</span>
            </button>
        </div>
    `,
    styles: [`
        .toast-container {
            position: fixed;
            top: 12%;
            left: 50%;
            transform: translateX(-50%) translateY(-40px);
            z-index: 9999;
            display: flex;
            align-items: center;
            gap: 12px;
            padding: 14px 20px;
            border-radius: 12px;
            backdrop-filter: blur(16px);
            -webkit-backdrop-filter: blur(16px);
            border: 1px solid rgba(255, 255, 255, 0.06);
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
            min-width: 320px;
            max-width: 520px;
            opacity: 0;
            visibility: hidden;
            transition: transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1),
                        opacity 0.3s ease,
                        visibility 0.3s ease;
            pointer-events: none;
        }

        .toast-visible {
            transform: translateX(-50%) translateY(0);
            opacity: 1;
            visibility: visible;
            pointer-events: all;
        }

        .toast-error {
            background: rgba(239, 68, 68, 0.15);
            border-color: rgba(239, 68, 68, 0.25);
        }

        .toast-error .toast-icon span {
            color: #ef4444;
        }

        .toast-success {
            background: rgba(16, 185, 129, 0.15);
            border-color: rgba(16, 185, 129, 0.25);
        }

        .toast-success .toast-icon span {
            color: #10b981;
        }

        .toast-warning {
            background: rgba(245, 158, 11, 0.15);
            border-color: rgba(245, 158, 11, 0.25);
        }

        .toast-warning .toast-icon span {
            color: #f59e0b;
        }

        .toast-icon span {
            font-size: 22px;
        }

        .toast-message {
            flex: 1;
            margin: 0;
            font-size: 14px;
            font-weight: 500;
            color: #e2e8f0;
            line-height: 1.4;
        }

        .toast-close {
            background: none;
            border: none;
            cursor: pointer;
            padding: 4px;
            border-radius: 6px;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: background 0.2s ease;
            flex-shrink: 0;
        }

        .toast-close span {
            font-size: 18px;
            color: #94a3b8;
            transition: color 0.2s ease;
        }

        .toast-close:hover {
            background: rgba(255, 255, 255, 0.06);
        }

        .toast-close:hover span {
            color: #e2e8f0;
        }
    `]
})
export class ToastComponent implements OnChanges, OnDestroy {
    @Input() message = '';
    @Input() type: 'error' | 'success' | 'warning' = 'error';
    @Input() duration = 5000;
    @Input() show = false;
    @Output() closed = new EventEmitter<void>();

    isVisible = false;
    private autoCloseTimer: ReturnType<typeof setTimeout> | null = null;
    private cdr = inject(ChangeDetectorRef);

    ngOnChanges(changes: SimpleChanges): void {
        if (changes['show']) {
            if (this.show) {
                this.open();
            } else {
                this.isVisible = false;
                this.cdr.detectChanges();
            }
        }
    }

    ngOnDestroy(): void {
        this.clearTimer();
    }

    dismiss(): void {
        this.isVisible = false;
        this.cdr.detectChanges();
        this.clearTimer();
        setTimeout(() => this.closed.emit(), 400);
    }

    private open(): void {
        this.clearTimer();
        // Trigger in next tick so Angular renders the hidden state first
        setTimeout(() => {
            this.isVisible = true;
            this.cdr.detectChanges();
        }, 20);
        this.autoCloseTimer = setTimeout(() => this.dismiss(), this.duration);
    }

    private clearTimer(): void {
        if (this.autoCloseTimer) {
            clearTimeout(this.autoCloseTimer);
            this.autoCloseTimer = null;
        }
    }
}
