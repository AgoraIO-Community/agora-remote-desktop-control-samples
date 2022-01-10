import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { NzMessageService } from 'ng-zorro-antd/message';
import { RDCDisplay, RDCDisplayConfiguration, RDCRoleType } from 'agora-rdc-core';
import { ActivatedRoute } from '@angular/router';
import { EnginesService } from '../../../service/engines/engines.service';
import { ParametersService } from '../../../service/parameters/parameters.service';
import { Profile } from '../../../service/api/api.service';
import { ControlledOptions } from '../../../interfaces';
import { RESOLUTION_BITRATE } from '../../../constants';
import { ProfilesService } from 'src/app/service/profile/profiles.service';
import { NzModalService } from 'ng-zorro-antd/modal';

@Component({
  selector: 'app-controlled',
  templateUrl: './controlled.component.html',
  styleUrls: ['./controlled.component.css'],
})
export class ControlledComponent implements OnInit {
  userIdsUnderObserving: string[] = [];
  userIdControlledBy?: string;
  displays: RDCDisplay[] = [];
  visible: boolean = false;
  profiles: Profile[] = [];
  rdcDisplayConfiguration?: Partial<RDCDisplayConfiguration>;

  get profilesUnderObserving() {
    return this.profiles.filter((profile) => this.userIdsUnderObserving.includes(profile.userId));
  }

  @ViewChild('warnMessageTemplate', { read: TemplateRef })
  warnMessageTemplate!: TemplateRef<any>;

  get controlledByProfile() {
    const profile = this.profiles.find((profile) => profile.userId === this.userIdControlledBy);
    return profile;
  }

  get RDCRoleType() {
    return RDCRoleType;
  }

  constructor(
    private activatedRoute: ActivatedRoute,
    private parameterService: ParametersService,
    private enginesService: EnginesService,
    private profilesService: ProfilesService,
    private messageService: NzMessageService,
    private modalService: NzModalService,
  ) {}

  ngOnInit(): void {
    this.parameterService
      .getOptions<ControlledOptions>(this.activatedRoute)
      .then((options) => this.parseOptions(options));
    this.profilesService.profiles.subscribe((profiles) => (this.profiles = profiles));
    const { rdcEngine } = this.enginesService;
    if (!rdcEngine) {
      return;
    }
    rdcEngine.on('rdc-request-control', this.handleRequestControl);
    rdcEngine.on('rdc-quit-control', this.handleQuitControl);
  }

  handleObserve(profile: Profile) {
    this.userIdsUnderObserving = [...this.userIdsUnderObserving, profile.userId];
  }

  handleUnobserve(profile?: Profile) {
    const { rdcEngine } = this.enginesService;
    if (!rdcEngine || !profile) {
      return;
    }
    rdcEngine.unobserve(profile.userId, profile.screenStreamId);
    this.userIdsUnderObserving = this.userIdsUnderObserving.filter((id) => id !== profile.userId);
  }

  handleAuthorize(display: RDCDisplay) {
    const profile = this.profiles.find((profile) => profile.userId === this.userIdControlledBy);
    const { rdcEngine } = this.enginesService;
    const { userIdControlledBy } = this;
    if (!userIdControlledBy || !rdcEngine || !profile) {
      return;
    }
    rdcEngine.authorizeControl(userIdControlledBy, display, this.rdcDisplayConfiguration, true);
    this.visible = false;
    this.messageService.warning(this.warnMessageTemplate, { nzDuration: 0 });
  }

  declineRequest() {
    const { rdcEngine } = this.enginesService;
    if (!rdcEngine) {
      return;
    }
    const profile = this.profiles.find((profile) => {
      return profile.userId === this.userIdControlledBy;
    });
    if (!profile) {
      return;
    }
    this.visible = false;
    rdcEngine.unauthorizeControl(profile.userId);
    this.messageService.info(`You have been declined control request from ${profile.name}`);
    this.userIdControlledBy = undefined;
  }

  doubleConfirm(profile?: Profile) {
    if (!profile) {
      return;
    }
    this.modalService.confirm({
      nzTitle: 'Are you sure to quit control?',
      nzContent: `${profile.name} will not be able to control your computer anymore.`,
      nzOkText: 'Yes',
      nzCancelText: 'No',
      nzOnOk: () => {
        this.handleStopControl();
      },
    });
  }
  handleStopControl() {
    const profile = this.profiles.find((profile) => profile.userId === this.userIdControlledBy);
    const { rdcEngine } = this.enginesService;
    if (!rdcEngine || !profile) {
      return;
    }

    rdcEngine.quitControl(profile.userId, profile.rdcRole);
    this.messageService.remove();
    this.messageService.info(`You have stopped control by ${profile.name}.`);
    this.userIdControlledBy = undefined;
  }

  private handleRequestControl = async (userId: string) => {
    const { rdcEngine } = this.enginesService;
    if (!rdcEngine) {
      return;
    }
    this.displays = await rdcEngine.getDisplays();
    this.userIdControlledBy = userId;
    this.visible = true;
  };

  private handleQuitControl = (userId: string) => {
    const { rdcEngine } = this.enginesService;
    const { userIdControlledBy } = this;
    if (!rdcEngine || !userIdControlledBy) {
      return;
    }
    const profile = this.profiles.find((p) => p.userId === userId);
    if (!profile) {
      return;
    }
    rdcEngine.quitControl(userId, profile.rdcRole);
    this.messageService.remove();
    this.messageService.info(`${profile.name} is released control.`);
    this.userIdControlledBy = undefined;
  };

  private parseOptions(options: ControlledOptions) {
    const { resolutionBitrate, frameRate } = options;
    const configuration: Partial<RDCDisplayConfiguration> = { frameRate };
    if (resolutionBitrate) {
      const { width, height, bitrate } = RESOLUTION_BITRATE[resolutionBitrate];
      configuration.width = width;
      configuration.height = height;
      configuration.bitrate = bitrate;
    }
    this.rdcDisplayConfiguration = configuration;
  }
}
