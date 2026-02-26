import { Component } from '@angular/core';
import { BannerComponent } from './components/banner/banner';

@Component({
  selector: 'app-odin',
  standalone: true,
  imports: [BannerComponent],
  templateUrl: './odin.html',
  styleUrl: './odin.scss',
})
export class OdinPageComponent { }
