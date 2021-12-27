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

  constructor(private enginesService: EnginesService) {}

  ngOnInit(): void {}

  handleRequestControl(profile: Profile) {
    this.enginesService.rdcEngine?.requestControl(profile.userId);
  }

  handleQuitControl(profile: Profile) {
    this.enginesService.rdcEngine?.quitControl(profile.userId, profile.rdcRole);
  }
}
