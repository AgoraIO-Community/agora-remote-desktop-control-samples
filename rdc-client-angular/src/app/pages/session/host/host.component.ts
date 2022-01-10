import { Component, OnInit } from '@angular/core';
import { NzMessageService } from 'ng-zorro-antd/message';
import { RDCRemotelyPastingStatus, RDCRemotelyPastingCodes } from 'agora-rdc-core';
import { ProfilesService } from '../../../service/profile/profiles.service';
import { Profile } from '../../../service/api/api.service';
import { EnginesService, RDCEngine } from '../../../service/engines/engines.service';

const PASTE_REMOTELY_REASON: { [k: number]: string } = {
  [RDCRemotelyPastingCodes.CONCURRENCY_LIMIT_EXCEEDED]: 'concurrency limit exceeded.',
  [RDCRemotelyPastingCodes.SIZE_OVERFLOW]: 'max file size is 30MB.',
  [RDCRemotelyPastingCodes.TIMEOUT]: 'transmission timeout.',
  [RDCRemotelyPastingCodes.UNSUPPORTED_FILE_TYPE]: 'pasting folder is not supported.',
};

@Component({
  selector: 'app-host',
  templateUrl: './host.component.html',
  styleUrls: ['./host.component.css'],
})
export class HostComponent implements OnInit {
  profiles: Profile[] = [];
  userIdsUnderControl: string[] = [];
  pasting: boolean = false;

  get profilesUnderControl() {
    return this.profiles.filter((p) => this.userIdsUnderControl.includes(p.userId));
  }

  constructor(
    private enginesService: EnginesService,
    private profilesService: ProfilesService,
    private messageService: NzMessageService,
  ) {}

  ngOnInit(): void {
    this.profilesService.profiles.subscribe((profiles) => {
      this.profiles = profiles;
    });
    this.bindRDCEvents();
  }

  handleRequestControl(profile: Profile) {
    this.enginesService.rdcEngine?.requestControl(profile.userId);
    this.messageService.success(`Control request has been sent to ${name}.`);
  }

  handleQuitControl(profile: Profile) {
    const { rdcEngine } = this.enginesService;
    if (!rdcEngine) {
      return;
    }
    rdcEngine.quitControl(profile.userId, profile.rdcRole, profile.screenStreamId);
  }

  private bindRDCEvents() {
    const { rdcEngine } = this.enginesService;
    if (!rdcEngine) {
      return;
    }
    rdcEngine.on('rdc-request-control-authorized', this.handleRequestControlAuthorized);
    rdcEngine.on('rdc-request-control-unauthorized', this.handleRequestControlUnauthorized);
    rdcEngine.on('rdc-quit-control', this.handleQuitControlEvent);
    rdcEngine.on('rdc-remote-paste', this.handleRemotePaste);
  }

  private handleRequestControlAuthorized = (userId: string) => {
    this.userIdsUnderControl = [...this.userIdsUnderControl, userId];
  };

  private handleRequestControlUnauthorized = (userId: string) => {
    const profile = this.profiles.find((p) => p.userId === userId);
    if (profile) {
      this.messageService.warning(`${profile.name} is declined your request`);
    }
  };

  private handleQuitControlEvent = (userId: string) => {
    this.userIdsUnderControl = this.userIdsUnderControl.filter((userIdUC) => userIdUC !== userId);
  };

  private handleRemotePaste = (status: RDCRemotelyPastingStatus, code: RDCRemotelyPastingCodes) => {
    if (status === RDCRemotelyPastingStatus.STARTING && code === RDCRemotelyPastingCodes.SUCCEEDED) {
      this.pasting = true;
      return;
    }

    if (status === RDCRemotelyPastingStatus.SUCCEEDED && code === RDCRemotelyPastingCodes.SUCCEEDED) {
      this.pasting = false;
      this.messageService.success('File is pasted.');
      return;
    }

    if (status === RDCRemotelyPastingStatus.FAILED) {
      this.messageService.error(`Failed to pasting file, cause ${PASTE_REMOTELY_REASON[code as number]}`);
      this.pasting = false;
      return;
    }
  };
}
