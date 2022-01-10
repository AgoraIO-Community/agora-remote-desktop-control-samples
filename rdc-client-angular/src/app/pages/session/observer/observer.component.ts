import { Component, ElementRef, HostListener, Input, AfterViewInit, ViewChild } from '@angular/core';
import { EnginesService } from 'src/app/service/engines/engines.service';

@Component({
  selector: 'app-observer',
  templateUrl: './observer.component.html',
  styleUrls: ['./observer.component.css'],
})
export class ObserverComponent implements AfterViewInit {
  @Input('userId')
  userId!: string;

  @Input('streamId')
  streamId!: number;

  isFullscreen: boolean = false;

  @ViewChild('attachEl')
  attachRef!: ElementRef<HTMLInputElement>;

  width: string = `${window.innerWidth}px`;
  height: string = `${window.innerHeight - 56}px`;

  constructor(private enginesService: EnginesService) {}

  ngAfterViewInit(): void {
    const { rdcEngine } = this.enginesService;
    if (!rdcEngine) {
      return;
    }
    rdcEngine.observe(this.userId, this.streamId, this.attachRef.nativeElement);
  }

  @HostListener('window:resize', ['$event'])
  handleResize(event: any) {
    this.height = `${event.target.innerHeight - 56}px`;
    this.width = `${event.target.innerWidth}px`;
  }

}
