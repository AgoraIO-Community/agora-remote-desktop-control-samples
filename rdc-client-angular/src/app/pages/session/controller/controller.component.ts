import { Component, ElementRef, HostListener, Input, AfterViewInit, ViewChild } from '@angular/core';
import { EnginesService } from 'src/app/service/engines/engines.service';

@Component({
  selector: 'app-controller',
  templateUrl: './controller.component.html',
  styleUrls: ['./controller.component.css'],
})
export class ControllerComponent implements AfterViewInit {
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
    rdcEngine.takeControl(this.userId, this.streamId, this.attachRef.nativeElement);
    rdcEngine.on('rdc-fullscreen-change', this.handleFullScreenChange);
  }

  toggleFullScreen() {
    const { rdcEngine } = this.enginesService;
    if (!rdcEngine) {
      return;
    }
    if (!this.isFullscreen && rdcEngine) {
      rdcEngine.requestFullscreen(this.attachRef.nativeElement);
      return;
    }
    rdcEngine.exitFullscreen();
  }

  @HostListener('window:resize', ['$event'])
  handleResize(event: any) {
    this.height = `${event.target.innerHeight - 56}px`;
    this.width = `${event.target.innerWidth}px`;
  }

  private handleFullScreenChange(isFullscreen: boolean) {
    this.isFullscreen = isFullscreen;
  }
}
