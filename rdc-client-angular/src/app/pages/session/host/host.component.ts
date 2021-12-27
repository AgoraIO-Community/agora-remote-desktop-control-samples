import { Component, OnInit } from '@angular/core';
import { Profile } from '../../../service/api/api.service';
import { EnginesService, RDCEngine } from '../../../service/engines/engines.service';

@Component({
  selector: 'app-host',
  templateUrl: './host.component.html',
  styleUrls: ['./host.component.css'],
})
export class HostComponent implements OnInit {
  userIdsUnderControl: number[] = [];
  rdcEngine?: RDCEngine;

  constructor(private enginesService: EnginesService) {}

  ngOnInit(): void {
    debugger;
    this.enginesService.rdcEngine.subscribe((rdcEngine) => {
      this.rdcEngine = rdcEngine;
    });
  }

  handleRequestControl(profile: Profile) {
    this.rdcEngine?.requestControl(profile.userId);
  }

  handleQuitControl(profile: Profile) {
    this.rdcEngine?.quitControl(profile.userId, profile.rdcRole);
  }
}
