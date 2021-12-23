import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RDCRoleType } from 'agora-rdc-core';
import { HostOptions, ControlledOptions } from '../../interfaces';
import { LocalStorageService } from '../../service/local-storage/local-storage.service';
import { RESOLUTION_BITRATE } from '../../constants';
import { APIService } from 'src/app/service/api/api.service';
import { Router } from '@angular/router';
import { lastValueFrom } from 'rxjs';

const RESOLUTION_BITRATE_OPTS = Object.keys(RESOLUTION_BITRATE).map((k) => {
  const { width, height, bitrate } = RESOLUTION_BITRATE[k];
  return { value: k, label: `${width} x ${height}, ${bitrate}Kbps` };
});

const DEFAULT_HOST_OPTIONS: HostOptions = {
  mouseEventsThreshold: 30,
  keyboardEventsThreshold: 30,
  rtcEngineType: 'web',
};
const DEFAULT_CONTROLLED_OPTIONS: ControlledOptions = {
  resolutionBitrate: '1080p2000',
  rtcEngineType: 'web',
  frameRate: 60,
};

const HOST_OPTS_STORAGE_KEY = 'host-opts';
const CONTROLLED_OPTS_STORAGE_KEY = 'controlled-opts';

@Component({
  selector: 'rdc-landing',
  templateUrl: './landing.component.html',
  styleUrls: ['./landing.component.css'],
})
export class LandingComponent implements OnInit {
  landingForm!: FormGroup;
  hostOptsForm!: FormGroup;
  controlledOptsForm!: FormGroup;

  get roleOpts() {
    return [
      { label: 'Host', value: RDCRoleType.HOST },
      { label: 'Controlled', value: RDCRoleType.CONTROLLED },
    ];
  }

  get hostOptsVisible() {
    return this.role === RDCRoleType.HOST;
  }

  get controlledOptsVisible() {
    return this.role === RDCRoleType.CONTROLLED;
  }

  get resolutionBitrateOpts() {
    return RESOLUTION_BITRATE_OPTS;
  }

  role?: RDCRoleType;
  visible = false;

  constructor(
    private fb: FormBuilder,
    private storage: LocalStorageService,
    private api: APIService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.buildFormGroups();
    this.fillFields();
  }

  toggleVisible() {
    this.visible = !this.visible;
  }

  handleOk() {
    if (this.role === RDCRoleType.HOST && this.hostOptsForm.invalid) {
      this.validate(this.hostOptsForm);
      return;
    }
    if (this.role === RDCRoleType.CONTROLLED && this.controlledOptsForm.invalid) {
      this.validate(this.controlledOptsForm);
      return;
    }

    if (this.role === RDCRoleType.HOST && this.hostOptsForm.valid) {
      this.storage.set(HOST_OPTS_STORAGE_KEY, this.hostOptsForm.value);
    }
    if (this.role === RDCRoleType.CONTROLLED && this.controlledOptsForm.valid) {
      this.storage.set(CONTROLLED_OPTS_STORAGE_KEY, this.controlledOptsForm.value);
    }
    this.toggleVisible();
  }

  async handleJoin() {
    if (this.landingForm.invalid) {
      this.validate(this.landingForm);
      return;
    }

    if (this.role === RDCRoleType.HOST && this.hostOptsForm.invalid) {
      this.validate(this.hostOptsForm);
      this.toggleVisible();
      return;
    }

    if (this.role === RDCRoleType.CONTROLLED && this.controlledOptsForm.invalid) {
      this.validate(this.controlledOptsForm);
      this.toggleVisible();
      return;
    }

    const { userId } = await lastValueFrom(this.api.joinSession(this.landingForm.value));
    if (this.role === RDCRoleType.HOST) {
      this.router.navigateByUrl(`session/${userId}?opts=${window.btoa(JSON.stringify(this.hostOptsForm.value))}`);
    }

    if (this.role === RDCRoleType.CONTROLLED) {
      this.router.navigateByUrl(`session/${userId}?opts=${window.btoa(JSON.stringify(this.controlledOptsForm.value))}`);
    }
  }

  private buildFormGroups() {
    this.landingForm = this.fb.group({
      role: [null, [Validators.required]],
      channel: [null, [Validators.required]],
      name: [null, [Validators.required]],
    });
    this.hostOptsForm = this.fb.group({
      rtcEngineType: [null, [Validators.required]],
      mouseEventsThreshold: [null, [Validators.required]],
      keyboardEventsThreshold: [null, [Validators.required]],
    });
    this.controlledOptsForm = this.fb.group({
      rtcEngineType: [null, [Validators.required]],
      resolutionBitrate: [null, [Validators.required]],
      frameRate: [null, [Validators.required]],
    });
  }

  private fillFields() {
    const hostOpts = this.storage.get(HOST_OPTS_STORAGE_KEY) ?? DEFAULT_HOST_OPTIONS;
    const controlledOpts = this.storage.get(CONTROLLED_OPTS_STORAGE_KEY) ?? DEFAULT_CONTROLLED_OPTIONS;
    this.hostOptsForm.patchValue(hostOpts);
    this.controlledOptsForm.patchValue(controlledOpts);
  }

  private validate(fg: FormGroup) {
    Object.values(fg.controls).forEach((control) => {
      if (control.invalid) {
        control.markAsDirty();
        control.updateValueAndValidity({ onlySelf: true });
      }
    });
  }
}
